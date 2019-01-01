const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const authModule = require("../middleware/auth");
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
router.post("/saveArticleById", authModule, (req, res, next) => {
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
// Makes an entry into the ArticleData table.
// Makes an entry into the ArticleMetaData table.
// To do:
// Delete the entry from ArticleInProgressData table.
// Delete the entry from ArticleInProgressMetaData table.
router.post("/submitArticleById", authModule, (req, res, next) => {
  console.log("Received POST Request to SAVE article by article id.");

  var articleIdInput = req.body.articleId;
  var articleTag = req.body.articleTag;
  var title = req.body.title;
  var content = req.body.content;

  // Validations

  if (articleIdInput === undefined || articleIdInput.trim() == "") {
    res.status(400).json({
      message: "Error: Could not find articleId."
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

      // Copy article meta data from ArticleInProgressMetaData table to ArticleMetaData table.

      var table2 = "ArticleInProgressMetaData";

      var params2 = {
        TableName: table2,
        Key: {
          articleId: articleIdInput
        }
      };

      docClient.get(params2, function(err, data) {
        if (err) {
          console.error(
            "Unable to read item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
          res.status(500).json({
            message:
              "Error: Could not get article in progress meta data from Database!",
            details: err
          });
        } else {
          console.log(
            "Success: Get Article in progress meta data:",
            JSON.stringify(data, null, 2)
          );

          var articleInProgressMetaData = data.Item;

          // Write articleInProgressMetaData into ArticleMetaData Table.

          var table3 = "ArticleMetaData";

          var params3 = {
            TableName: table3,
            Key: {
              articleId: articleIdInput
            },
            UpdateExpression: "set groupTag = :g, preferenceInGroup=:p",
            ExpressionAttributeValues: {
              ":g": articleInProgressMetaData.groupTag,
              ":p": articleInProgressMetaData.preference
            },
            ReturnValues: "UPDATED_NEW"
          };

          docClient.update(params3, function(err, data) {
            if (err) {
              console.error(
                "Unable to read item. Error JSON:",
                JSON.stringify(err, null, 2)
              );
              res.status(500).json({
                message: "Error: Could not update meta data in Database!",
                details: err
              });
            } else {
              console.log(
                "Success: Updated article meta data:",
                JSON.stringify(data, null, 2)
              );

              // Delete the entry from ArticleInProgressMetaData table and ArticleInProgressData table

              // 1. Delete the entry from ArticleInProgressMetaData table
              var table4 = "ArticleInProgressMetaData";

              var params4 = {
                TableName: table4,
                Key: {
                  articleId: articleIdInput
                }
              };

              docClient.delete(params4, function(err, data) {
                if (err) {
                  console.error(
                    "Unable to read item. Error JSON:",
                    JSON.stringify(err, null, 2)
                  );
                  res.status(500).json({
                    message:
                      "Error: Could not delete article in progress meta data in Database!",
                    details: err
                  });
                } else {
                  console.log(
                    "Success: Deleted article in progress meta data:",
                    JSON.stringify(data, null, 2)
                  );

                  // 2. Delete the entry ArticleInProgressData table
                  var table5 = "ArticleInProgressData";

                  var params5 = {
                    TableName: table5,
                    Key: {
                      articleId: articleIdInput
                    }
                  };

                  docClient.delete(params5, function(err, data) {
                    if (err) {
                      console.error(
                        "Unable to read item. Error JSON:",
                        JSON.stringify(err, null, 2)
                      );
                      res.status(500).json({
                        message:
                          "Error: Could not delete article in progress data in Database!",
                        details: err
                      });
                    } else {
                      console.log(
                        "Success: Deleted article in progress data:",
                        JSON.stringify(data, null, 2)
                      );

                      res.status(200).json({
                        message: "Article submitted successfully!",
                        articleId: articleIdInput
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

// To create new article.
// Input:
// Group tag
// Article tag
// This api does the following:
// - Generates a random article id
// - Creates article meta data with the generated article id, group tag and preference in group
// - Creates article data with the generated article id and the provided article tag
// - Returns back the created article data.

router.post("/createNewArticle", authModule, (req, res, next) => {
  console.log("Received POST Request to create new article metadata.");

  var groupTag = req.query.groupTag;
  var articleTag = req.query.articleTag;

  // Validations

  if (groupTag === undefined || groupTag.trim() == "") {
    res.status(400).json({
      message: "Error: groupTag not found."
    });
  }

  if (articleTag === undefined || articleTag.trim() == "") {
    res.status(400).json({
      message: "Error: articleTag not found."
    });
  }

  // Creating a random generated article id.
  var articleIdGenerated = Math.random()
    .toString(36)
    .substring(2);

  // Getting the current preference and incrementing it by 1.

  var table = "ArticleInProgressMetaData";

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
        message: "Error: Could not read article meta data from Database!",
        details: err
      });
    } else {
      console.log(
        "Success: Get Article In Progress Meta Data:",
        JSON.stringify(data, null, 2)
      );

      var articleInProgressMetaData = data;

      var filteredArticleInProgressMetaData = _.where(
        articleInProgressMetaData.Items,
        {
          groupTag: groupTag
        }
      );

      var preference = filteredArticleInProgressMetaData.length + 1;

      var table2 = "ArticleInProgressMetaData";

      var params2 = {
        TableName: table2,
        Key: {
          articleId: articleIdGenerated
        },
        UpdateExpression: "set groupTag=:g, preference=:p",
        ExpressionAttributeValues: {
          ":g": groupTag,
          ":p": preference
        },
        ReturnValues: "UPDATED_NEW"
      };

      console.log("Updating the item...");
      docClient.update(params2, function(err, data) {
        if (err) {
          console.error(
            "Unable to update item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
          res.status(500).json({
            message: "Error: Could not save the article meta data in database.",
            details: err
          });
        } else {
          console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));

          // Adding an entry into the ArticleInProgressData table with the generated articleId and the input articleTag
          var table3 = "ArticleInProgressData";

          var params3 = {
            TableName: table3,
            Key: {
              articleId: articleIdGenerated
            },
            UpdateExpression: "set articleTag=:a, title=:t, content=:c",
            ExpressionAttributeValues: {
              ":a": articleTag,
              ":t": " ",
              ":c": " "
            },
            ReturnValues: "UPDATED_NEW"
          };

          console.log("Updating the item...");
          docClient.update(params3, function(err, data) {
            if (err) {
              console.error(
                "Unable to update item. Error JSON:",
                JSON.stringify(err, null, 2)
              );
              res.status(500).json({
                message:
                  "Error: Could not save the article meta data in database.",
                details: err
              });
            } else {
              console.log(
                "UpdateItem succeeded:",
                JSON.stringify(data, null, 2)
              );

              res.status(200).json({
                message: "Article created successfully!",
                articleId: articleIdGenerated,
                articleData: data.Attributes
              });
            }
          });
        }
      });
    }
  });
});

module.exports = router;
