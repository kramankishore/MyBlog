const express = require("express");
const app = express();

const router = express.Router();
const bodyParser = require("body-parser");

const blogContent = require("./api/routes/blogContent");

/*
var swaggerUI = require("swagger-ui-express"),
  swaggerDocument = require("./api/swagger/swagger.json");

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use("/api/v1", router);
*/

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

app.use("/blogContent", blogContent);

module.exports = app;
