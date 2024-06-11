const { createNodeMiddleware, createProbot } = require("probot");
const app = require("./lib/app.js");

exports.probotApp = createNodeMiddleware(app, { probot: createProbot() });