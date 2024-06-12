const { readFileSync } = require("fs");
const { join } = require("path");

/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  console.log("Yay! The app was loaded!");

  const handleRepositories = async (context, repositories) => {
    const installationId = context.payload.installation.id;
    console.log(
      `Processing repositories for installation id: ${installationId}`
    );

    try {
      const octokit = await app.auth(installationId);
      console.log("Authenticated with GitHub API");

      for (const repo of repositories) {
        const [owner, repoName] = repo.full_name.split("/");
        console.log(`Processing repository: ${owner}/${repoName}`);

        // Read the workflow file content
        const workflowPath = join(
          __dirname,
          "workflow-files/ai-powered-formal-verification.yml"
        );
        console.log(`Reading workflow file from: ${workflowPath}`);
        const workflowContent = readFileSync(workflowPath, "utf8");
        console.log(
          `Workflow file content: ${workflowContent
            .substring(0, 100)
            .replace(/\n/g, "")}`
        );

        // Check if the file already exists
        let sha = null;
        try {
          const { data: existingFile } = await octokit.repos.getContent({
            owner,
            repo: repoName,
            path: ".github/workflows/ai-powered-formal-verification.yml",
          });
          sha = existingFile.sha;
          console.log(`Existing file SHA: ${sha}`);
        } catch (error) {
          if (error.status === 404) {
            console.log(
              `File does not exist in ${owner}/${repoName}, creating a new one.`
            );
          } else {
            console.error(
              `Error checking if file exists in ${owner}/${repoName}: ${error.status} ${error.message}`
            );
            console.error(
              `Error details: ${JSON.stringify(error.response.data)}`
            );
            continue;
          }
        }

        // Create or update the workflow file in the repository
        try {
          const response = await octokit.repos.createOrUpdateFileContents({
            owner,
            repo: repoName,
            path: ".github/workflows/ai-powered-formal-verification.yml",
            message: "Add AI-powered formal verification workflow",
            content: Buffer.from(workflowContent).toString("base64"),
            committer: {
              name: "github-actions[bot]",
              email: "github-actions[bot]@users.noreply.github.com",
            },
            author: {
              name: "github-actions[bot]",
              email: "github-actions[bot]@users.noreply.github.com",
            },
            sha: sha,
          });

          console.log(
            `Workflow file created or updated in ${owner}/${repoName}: ${response.data.content.html_url}`
          );
        } catch (error) {
          console.error(
            `Error creating or updating file in ${owner}/${repoName}: ${error.status} ${error.response.data.message}`
          );
          console.error(
            `Error details: ${JSON.stringify(error.response.data)}`
          );
        }
      }
    } catch (error) {
      console.error(
        `Error processing repositories: ${error.status} ${error.message}`
      );
      console.error(`Error details: ${JSON.stringify(error.response.data)}`);
    }
  };

  app.on("installation.created", async (context) => {
    console.log("Handling installation.created event");
    const installationId = context.payload.installation.id;
    console.log(
      `Handling installation.created event for installation id: ${installationId}`
    );

    try {
      const octokit = await app.auth(installationId);
      console.log("Authenticated with GitHub API");

      // Fetch the list of repositories for the installation
      const { data: repositories } =
        await octokit.apps.listReposAccessibleToInstallation({
          installation_id: installationId,
        });
      console.log(
        `Repositories accessible to installation: ${JSON.stringify(
          repositories.repositories
        )}`
      );

      await handleRepositories(context, repositories.repositories);
    } catch (error) {
      console.error(
        `Error during installation.created event: ${error.status} ${error.message}`
      );
      console.error(`Error details: ${JSON.stringify(error.response.data)}`);
    }
  });

  app.on("installation_repositories.added", async (context) => {
    console.log("Handling installation_repositories.added event");
    const repositories = context.payload.repositories_added;
    console.log(
      `Handling installation_repositories.added event for repositories: ${JSON.stringify(
        repositories
      )}`
    );
    await handleRepositories(context, repositories);
  });

  app.on("issues.opened", async (context) => {
    console.log("Handling issues.opened event");
    return context.octokit.issues.createComment(
      context.issue({ body: "Hello, World!" })
    );
  });
};
