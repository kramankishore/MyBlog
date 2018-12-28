const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
var _ = require("underscore");

var AWS = require("aws-sdk");
var BlogKeysPath = process.env.BlogKeysPath;
var dynamoDBRWKeyPath = path.join(
  BlogKeysPath,
  "DynamoDB_RW\\credentials.json"
);

AWS.config.loadFromPath(dynamoDBRWKeyPath);

//var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

// To Get all article groups and articles map.
router.get("/getArticleMap", (req, res, next) => {
  // Get all article groups.
  var table = "ArticleGroupData";

  var params = {
    TableName: table
  };

  docClient.scan(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to read item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).json({
        message: "Error: Could not read article group data from Database!",
        details: err
      });
    } else {
      console.log(
        "Success: Get Article Group Data:",
        JSON.stringify(data, null, 2)
      );
      var articleGroupData = data;

      console.log(articleGroupData);

      // Get Article Metadata.

      var table2 = "ArticleMetaData";

      var params2 = {
        TableName: table2
      };

      docClient.scan(params2, function(err, data) {
        if (err) {
          console.error(
            "Unable to read item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
          res.status(500).json({
            message: "Error: Could not read article meta data from Database!",
            details: err
          });
        } else {
          console.log(
            "Success: Get Article Meta Data:",
            JSON.stringify(data, null, 2)
          );

          var articleMetaData = data;

          var articleGroupMap = [];

          for (var i = 0; i < articleGroupData.Items.length; i++) {
            var articleGroupObj = articleGroupData.Items[i];
            var articleGroupTag = articleGroupObj.groupTag;

            console.log("Article Group Tag:", articleGroupTag);
            console.log("Article Meta Data:", articleMetaData);
            // Fetching the article data for each article group.
            var filteredArticleMetaData = _.where(articleMetaData.Items, {
              groupTag: articleGroupTag
            });
            console.log(
              "Filetered Article Meta Data:",
              filteredArticleMetaData
            );
            articleGroupObj["articleMetaData"] = filteredArticleMetaData;
            articleGroupMap.push(articleGroupObj);
          }

          res.status(200).json({
            result: articleGroupMap
          });
        }
      });
    }
  });
});

// To Get article details by article id.
router.get("/getArticleById", (req, res, next) => {
  console.log("Received Request to GET article by article id.");

  var articleIdInput = req.query.id;

  // Get Article Metadata.

  var table = "ArticleData";

  var params = {
    TableName: table,
    Key: {
      articleId: articleIdInput
    }
  };

  docClient.get(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to read item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).json({
        message: "Error: Could not get article data from Database!",
        details: err
      });
    } else {
      console.log("Success: Get Article Data:", JSON.stringify(data, null, 2));
      res.status(200).json({
        articleData: data
      });
    }
  });
});

// To Save article details by article id.
router.post("/saveArticleById", (req, res, next) => {
  console.log("Received POST Request to SAVE article by article id.");

  var articleIdInput = req.body.articleId;
  var articleTag = req.body.articleTag;
  var title = req.body.title;
  var content = req.body.content;

  // Validations

  if (articleIdInput === undefined || articleIdInput.trim() == "") {
    res.status(400).json({
      message: "Error: Invalid Article ID."
    });
  }

  if (
    articleTag === undefined ||
    title === undefined ||
    content === undefined
  ) {
    res.status(400).json({
      message: "Error: Invalid 'articleTag', 'title' or 'content' input."
    });
  }

  var table = "ArticleInProgressData";

  var params = {
    TableName: table,
    Key: {
      articleId: articleIdInput
    },
    UpdateExpression: "set articleTag = :a, title=:t, content=:c",
    ExpressionAttributeValues: {
      ":a": articleTag,
      ":t": title,
      ":c": content
    },
    ReturnValues: "UPDATED_NEW"
  };

  console.log("Updating the item...");
  docClient.update(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).json({
        message: "Error: Could not save the article details in database.",
        details: err
      });
    } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      res.status(200).json({
        message: "Article saved successfully!",
        articleId: articleIdInput
      });
    }
  });
});

// To Submit article details by article id.
router.post("/submitArticleById", (req, res, next) => {
  console.log("Received POST Request to SAVE article by article id.");

  var articleIdInput = req.body.articleId;
  var articleTag = req.body.articleTag;
  var title = req.body.title;
  var content = req.body.content;

  // Validations

  if (articleIdInput === undefined || articleIdInput.trim() == "") {
    res.status(400).json({
      message: "Error: Invalid Article ID."
    });
  }

  if (
    articleTag === undefined ||
    title === undefined ||
    content === undefined
  ) {
    res.status(400).json({
      message: "Error: Invalid 'articleTag', 'title' or 'content' input."
    });
  }

  var table = "ArticleData";

  var params = {
    TableName: table,
    Key: {
      articleId: articleIdInput
    },
    UpdateExpression: "set articleTag = :a, title=:t, content=:c",
    ExpressionAttributeValues: {
      ":a": articleTag,
      ":t": title,
      ":c": content
    },
    ReturnValues: "UPDATED_NEW"
  };

  console.log("Updating the item...");
  docClient.update(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).json({
        message: "Error: Could not save the article details in database.",
        details: err
      });
    } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      res.status(200).json({
        message: "Article saved successfully!",
        articleId: articleIdInput
      });
    }
  });
});

module.exports = router;
