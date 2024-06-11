# verigood-ai-installer

> A GitHub App built with [Probot](https://github.com/probot/probot) that Github App for VeriGood.ai installer

## Local setup

Install dependencies

```
npm install
```

Start the server

```
npm start
```

Follow the instructions to register a new GitHub app.

## Deployment

The app is continuously deployed to Google Cloud using the [`setup-gcloud` GitHub Action](https://github.com/google-github-actions/setup-gcloud). See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) for the deployment workflow.

## Gotchas

- There seems to be some weird issue with the nodejs20 runtime in GCP Cloud Functions. The app works fine in local but fails in GCP. So we explicitely set the runtime to nodejs18 during deployment.
- There seems to be an issue with the latest version of `probot` package on GCP Cloud Functions. So we have to use the older version of the package, i.e. probot12.

## License

[ISC](LICENSE) © 2024 Saurabh Chalke
