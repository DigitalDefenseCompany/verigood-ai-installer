const { readFileSync } = require("fs");
const { join } = require("path");

/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  console.log("Yay! The app was loaded!");

  app.on("installation.created", async (context) => {
    console.log("Handling installation.created event");
    const installationId = context.payload.installation.id;
    console.log(`Handling installation.created event for installation id: ${installationId}`);

    // Simulate some work here
    console.log("Fetching repositories...");
    // Add more logging to ensure we reach this point
    console.log("Installation created event processed successfully.");
  });

  app.on("installation_repositories.added", async (context) => {
    console.log("Handling installation_repositories.added event");
    const repositories = context.payload.repositories_added;
    console.log(`Handling installation_repositories.added event for repositories: ${JSON.stringify(repositories)}`);

    // Simulate some work here
    console.log("Adding repositories...");
    // Add more logging to ensure we reach this point
    console.log("Repositories added event processed successfully.");
  });

  app.on("issues.opened", async (context) => {
    console.log("Handling issues.opened event");
    return context.octokit.issues.createComment(
      context.issue({ body: "Hello, World!" })
    );
  });
};
