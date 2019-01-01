const express = require("express");
const app = express();

const router = express.Router();
const bodyParser = require("body-parser");

const blogImages = require("./api/routes/blogImages");
const blogContent = require("./api/routes/blogContent");
const userManagement = require("./api/routes/userManagement");

var swaggerUI = require("swagger-ui-express"),
  swaggerDocument = require("./api/swagger/swagger.json");

app.use("/blogSwagger-test", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use("/blogSwagger/v1", router);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enabling CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    return res.status(200).json({});
  }
  next();
});

app.use("/blogImages", blogImages);
app.use("/blogContent", blogContent);
app.use("/userManagement", userManagement);

module.exports = app;
