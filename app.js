const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log("Yay! The app was loaded!");

  // Log the value of __dirname
  app.log.info(`__dirname: ${__dirname}`);

  app.on("installation.created", async (context) => {
    const installationId = context.payload.installation.id;
    const repositories = context.payload.repositories;

    for (const repo of repositories) {
      const owner = repo.owner.login;
      const repoName = repo.name;

      const octokit = await app.auth(installationId);

      // Read the workflow file content
      const workflowContent = readFileSync(join(__dirname, 'workflow-files/ai-powered-formal-verification.yml'), 'utf8');

      // Create the workflow file in the repository
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo: repoName,
        path: '.github/workflows/ai-powered-formal-verification.yml',
        message: 'Add AI-powered formal verification workflow',
        content: Buffer.from(workflowContent).toString('base64'),
        committer: {
          name: 'github-actions[bot]',
          email: 'github-actions[bot]@users.noreply.github.com',
        },
        author: {
          name: 'github-actions[bot]',
          email: 'github-actions[bot]@users.noreply.github.com',
        },
      });
    }
  });

  app.on("issues.opened", async (context) => {
    return context.octokit.issues.createComment(
      context.issue({ body: "Hello, World!" })
    );
  });
};
