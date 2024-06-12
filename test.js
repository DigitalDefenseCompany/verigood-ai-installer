const { suite } = require("uvu");
const assert = require("uvu/assert");

const nock = require("nock");
nock.disableNetConnect();

const { Probot, ProbotOctokit } = require("probot");

const app = require("./app");

// Load fixtures
const installationCreatedPayload = require("./fixtures/installation.created.json");
const installationRepositoriesAddedPayload = require("./fixtures/installation_repositories.added.json");
const issuesOpenedPayload = require("./fixtures/issues.opened.json");

/** @type {import('probot').Probot */
let probot;
const test = suite("app");

test.before.each(() => {
  probot = new Probot({
    // simple authentication as alternative to appId/privateKey
    githubToken: "test",
    // disable logs
    logLevel: "warn",
    // disable request throttling and retries
    Octokit: ProbotOctokit.defaults({
      throttle: { enabled: false },
      retry: { enabled: false },
    }),
  });
  console.log("Loading the app");
  probot.load(app);
});

test("receives issues.opened event", async function () {
  const mock = nock("https://api.github.com")
    .post(
      "/repos/probot/example-google-cloud-function/issues/1/comments",
      (requestBody) => {
        console.log("Mock intercepted issues.opened:", requestBody);
        assert.equal(requestBody, { body: "Hello, World!" });
        return true;
      }
    )
    .reply(201, {});

  await probot.receive({
    name: "issues",
    id: "1",
    payload: issuesOpenedPayload,
  });

  assert.equal(mock.activeMocks(), []);
});

test("receives installation.created event and creates workflow file", async function () {
  const mock = nock("https://api.github.com")
    .post("/app/installations/1/access_tokens", (body) => {
      console.log("Mock intercepted access token request:", body);
      return true;
    })
    .reply(200, { token: "test" })
    .put(
      "/repos/example-owner/example-repo/contents/.github/workflows/ai-powered-formal-verification.yml",
      (body) => {
        const content = Buffer.from(body.content, "base64").toString();
        console.log("Mock intercepted workflow file creation:", content);
        assert.ok(content.includes("name: AI-Powered Formal Verification"));
        return true;
      }
    )
    .reply(201, {});

  await probot.receive({
    name: "installation",
    id: "1",
    payload: installationCreatedPayload,
  });

  console.log("Pending mocks:", mock.pendingMocks());
  assert.equal(mock.pendingMocks(), []);
});

test("receives installation_repositories.added event and creates workflow file", async function () {
  const mock = nock("https://api.github.com")
    .post("/app/installations/1/access_tokens", (body) => {
      console.log("Mock intercepted access token request:", body);
      return true;
    })
    .reply(200, { token: "test" })
    .put(
      "/repos/example-owner/example-repo/contents/.github/workflows/ai-powered-formal-verification.yml",
      (body) => {
        const content = Buffer.from(body.content, "base64").toString();
        console.log("Mock intercepted workflow file creation:", content);
        assert.ok(content.includes("name: AI-Powered Formal Verification"));
        return true;
      }
    )
    .reply(201, {});

  await probot.receive({
    name: "installation_repositories",
    id: "1",
    payload: installationRepositoriesAddedPayload,
  });

  console.log("Pending mocks:", mock.pendingMocks());
  assert.equal(mock.pendingMocks(), []);
});

test.run();
