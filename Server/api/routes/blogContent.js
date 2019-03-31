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

/*****************************
To Get all article groups and articles map.
Inputs:
- None
Actions:
- Reads all content from GroupData table.
- Reads all content from ArticleMetaData table.
- For every group, the metadata of all the articles (finished data) belonging to that group is appended.
- This appended list is returned back.
********************************/

router.get("/getArticleMap", (req, res, next) => {
  // Get all article groups.
  var table = "GroupData";

  var params = {
    TableName: table
  };

  docClient.scan(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to read item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      return res.status(500).json({
        message: "Error: Could not read article group data from Database!",
        details: err
      });
    } else {
      console.log(
        "Success: Get Article Group Data:",
        JSON.stringify(data, null, 2)
      );
      var groupData = data;

      console.log(groupData);

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
          return res.status(500).json({
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

          for (var i = 0; i < groupData.Items.length; i++) {
            var groupObj = groupData.Items[i];
            var groupTag = groupObj.groupTag;

            console.log("Group Tag:", groupTag);
            console.log("Article Meta Data:", articleMetaData);
            // Fetching the article data for each article group.
            var filteredArticleMetaData = _.where(articleMetaData.Items, {
              groupTag: groupTag
            });
            console.log(
              "Filetered Article Meta Data:",
              filteredArticleMetaData
            );
            let filteredFinishedArticleMetaData = {};
            filteredFinishedArticleMetaData.articleId =
              filteredArticleMetaData.articleId;
            filteredFinishedArticleMetaData.articleTag =
              filteredArticleMetaData.articleTag;
            filteredFinishedArticleMetaData.groupTag =
              filteredArticleMetaData.groupTag;
            filteredFinishedArticleMetaData.preferenceInGroup =
              filteredArticleMetaData.preferenceInGroup;

            groupObj["articleMetaData"] = filteredFinishedArticleMetaData;
            articleGroupMap.push(groupObj);
          }

          return res.status(200).json({
            result: articleGroupMap
          });
        }
      });
    }
  });
});

/*****************************
To Get all article groups and articles map for Admin.
Inputs:
- Header: Authorization
Actions:
- Reads all content from GroupData table.
- Reads all content from ArticleMetaData table.
- For every group, the metadata of all the articles (in progress data) belonging to that group is appended.
- This appended list is returned back.
********************************/

router.get("/getArticleMapForAdmin", authModule, (req, res, next) => {
  // Get all article groups.
  var table = "GroupData";

  var params = {
    TableName: table
  };

  docClient.scan(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to read item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      return res.status(500).json({
        message: "Error: Could not read article group data from Database!",
        details: err
      });
    } else {
      console.log(
        "Success: Get Article Group Data:",
        JSON.stringify(data, null, 2)
      );
      var groupData = data;

      console.log(groupData);

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
          return res.status(500).json({
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

          for (var i = 0; i < groupData.Items.length; i++) {
            var groupObj = groupData.Items[i];
            var groupTag = groupObj.groupTag;

            console.log("Group Tag:", groupTag);
            console.log("Article Meta Data:", articleMetaData);
            // Fetching the article data for each article group.
            var filteredArticleMetaData = _.where(articleMetaData.Items, {
              groupTag: groupTag
            });
            console.log(
              "Filetered Article Meta Data:",
              filteredArticleMetaData
            );

            let filteredInProgressArticleMetaData = {};
            filteredInProgressArticleMetaData.articleId =
              filteredArticleMetaData.articleId;
            filteredInProgressArticleMetaData.draftArticleTag =
              filteredArticleMetaData.articleTag;
            filteredInProgressArticleMetaData.groupTag =
              filteredArticleMetaData.groupTag;
            filteredInProgressArticleMetaData.preferenceInGroup =
              filteredArticleMetaData.preferenceInGroup;

            groupObj["articleMetaData"] = filteredInProgressArticleMetaData;

            articleGroupMap.push(groupObj);
          }

          return res.status(200).json({
            result: articleGroupMap
          });
        }
      });
    }
  });
});

// To Get article details by article id.
// API open for all.
// Gets only the finished (submitted) article data.
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
      return res.status(500).json({
        message: "Error: Could not get article data from Database!",
        details: err
      });
    } else {
      if (data.isSubmit === false) {
        console.error("The requested article is not yet submitted by Admin.");
        return res.status(404).json({
          message: "Error: Article does not exist!"
        });
      }

      console.log("Success: Get Article Data:", JSON.stringify(data, null, 2));
      let finishedData = {};
      finishedData.articleId = data.articleId;
      finishedData.title = data.title;
      finishedData.content = data.content;
      return res.status(200).json({
        articleData: finishedData
      });
    }
  });
});

// To Get article details by article id for Admin.
// API not open for all.
// Gets only the In progress (saved) article data.
router.get("/getArticleByIdForAdmin", authModule, (req, res, next) => {
  console.log("Received Request to GET article by article id for Admin.");

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
      return res.status(500).json({
        message: "Error: Could not get article data from Database!",
        details: err
      });
    } else {
      console.log("Success: Get Article Data:", JSON.stringify(data, null, 2));
      return res.status(200).json({
        articleData: data
      });
    }
  });
});

// To Save article details by article id.
router.post("/saveArticleById", authModule, (req, res, next) => {
  console.log("Received POST Request to SAVE article by article id.");

  var articleIdInput = req.body.articleId;
  var draftArticleTag = req.body.draftArticleTag;
  var draftTitle = req.body.draftTitle;
  var draftContent = req.body.draftContent;

  // Validations

  if (articleIdInput === undefined || articleIdInput.trim() == "") {
    return res.status(400).json({
      message: "Error: Could not find articleId."
    });
  }

  if (
    draftArticleTag === undefined ||
    draftTitle === undefined ||
    draftContent === undefined
  ) {
    return res.status(400).json({
      message: "Error: Invalid 'articleTag', 'title' or 'draftContent' input."
    });
  }

  var table = "ArticleData";

  var params = {
    TableName: table,
    Key: {
      articleId: articleIdInput
    },
    UpdateExpression: "set draftTitle=:t, draftContent=:c",
    ExpressionAttributeValues: {
      ":t": draftTitle,
      ":c": draftContent
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
      return res.status(500).json({
        message: "Error: Could not save the article details in database.",
        details: err
      });
    } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));

      // Update articleTag in ArticleMetaData table.

      var table2 = "ArticleMetaData";

      var params2 = {
        TableName: table2,
        Key: {
          articleId: articleIdInput
        },
        UpdateExpression: "set draftArticleTag=:a",
        ExpressionAttributeValues: {
          ":a": draftArticleTag
        },
        ReturnValues: "UPDATED_NEW"
      };
    }

    // Update the ArticleMetaData table.
    docClient.update(params2, function(err, data) {
      if (err) {
        console.error(
          "Unable to update item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
        return res.status(500).json({
          message:
            "Error: Could not save the draft article tag in article meta data table.",
          details: err
        });
      } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      }
    });
  });
});

// To Submit article details by article id.
// Makes an entry into the ArticleData table.
// Makes an entry into the ArticleMetaData table.
// To do:
// Delete the entry from ArticleInProgressData table.
// Delete the entry from ArticleInProgressMetaData table.
router.post("/submitArticleById", authModule, (req, res, next) => {
  console.log("Received POST Request to SUBMIT article by article id.");

  var articleIdInput = req.body.articleId;
  var articleTag = req.body.articleTag;
  var title = req.body.title;
  var content = req.body.content;

  // Validations

  if (articleIdInput === undefined || articleIdInput.trim() == "") {
    return res.status(400).json({
      message: "Error: Could not find articleId."
    });
  }

  if (
    articleTag === undefined ||
    title === undefined ||
    content === undefined
  ) {
    return res.status(400).json({
      message: "Error: Invalid 'articleTag', 'title' or 'content' input."
    });
  }

  var table = "ArticleData";

  var params = {
    TableName: table,
    Key: {
      articleId: articleIdInput
    },
    UpdateExpression: "set title=:t, content=:c, isSubmit=:i",
    ExpressionAttributeValues: {
      ":t": title,
      ":c": content,
      ":i": true
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
      return res.status(500).json({
        message: "Error: Could not save the article details in database.",
        details: err
      });
    } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));

      // Update articleTag in ArticleMetaData table.

      var table2 = "ArticleMetaData";

      var params2 = {
        TableName: table2,
        Key: {
          articleId: articleIdInput
        },
        UpdateExpression: "set articleTag=:a",
        ExpressionAttributeValues: {
          ":a": articleTag
        },
        ReturnValues: "UPDATED_NEW"
      };
    }

    // Update the ArticleMetaData table.
    docClient.update(params2, function(err, data) {
      if (err) {
        console.error(
          "Unable to update item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
        return res.status(500).json({
          message:
            "Error: Could not save the article tag in article meta data table.",
          details: err
        });
      } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      }
    });
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
    return res.status(400).json({
      message: "Error: groupTag not found."
    });
  }

  if (articleTag === undefined || articleTag.trim() == "") {
    return res.status(400).json({
      message: "Error: articleTag not found."
    });
  }

  // Creating a random generated article id.
  var articleIdGenerated = Math.random()
    .toString(36)
    .substring(2);

  // Getting the current preference and incrementing it by 1.

  var table = "ArticleMetaData";

  var params = {
    TableName: table
  };

  docClient.scan(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to read item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      return res.status(500).json({
        message: "Error: Could not read article meta data from Database!",
        details: err
      });
    } else {
      console.log(
        "Success: Get Article In Progress Meta Data:",
        JSON.stringify(data, null, 2)
      );

      var articleMetaData = data;

      var filteredArticleMetaData = _.where(articleMetaData.Items, {
        groupTag: groupTag
      });

      var preference = filteredArticleMetaData.length + 1;

      var table2 = "ArticleMetaData";

      var params2 = {
        TableName: table2,
        Key: {
          articleId: articleIdGenerated
        },
        UpdateExpression: "set groupTag=:g, articleTag=:a, preference=:p",
        ExpressionAttributeValues: {
          ":g": groupTag,
          ":a": articleTag,
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
          return res.status(500).json({
            message: "Error: Could not save the article meta data in database.",
            details: err
          });
        } else {
          console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));

          // Adding an entry into the ArticleInProgressData table with the generated articleId and the input articleTag
          var table3 = "ArticleData";

          var params3 = {
            TableName: table3,
            Key: {
              articleId: articleIdGenerated
            },
            UpdateExpression:
              "set articleTag=:a, title=:t, content=:c, draftContent=:d, isSubmit=:i",
            ExpressionAttributeValues: {
              ":a": articleTag,
              ":t": " ",
              ":c": " ",
              ":d": " ",
              ":i": false
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
              return res.status(500).json({
                message:
                  "Error: Could not save the article meta data in database.",
                details: err
              });
            } else {
              console.log(
                "UpdateItem succeeded:",
                JSON.stringify(data, null, 2)
              );

              return res.status(200).json({
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
