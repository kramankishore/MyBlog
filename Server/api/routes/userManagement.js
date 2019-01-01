const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
var _ = require("underscore");

var AWS = require("aws-sdk");
var BlogKeysPath = process.env.BlogKeysPath;
var dynamoDBRWKeyPath = path.join(
  BlogKeysPath,
  "DynamoDB_RW\\credentials.json"
);

AWS.config.loadFromPath(dynamoDBRWKeyPath);

var JWTKeyPath = path.join(BlogKeysPath, "JWT_Key\\jwt_key.json");
var jwtKeyFile = JSON.parse(fs.readFileSync(JWTKeyPath));
var jwtKey = jwtKeyFile.key;

//var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

// To Sign up a new user.
/*
router.post("/signup", (req, res, next) => {
  // Checking if the user already exists.
  var table = "UserDetails";
  var params = {
    TableName: table,
    ProjectionExpression: "#uid",
    KeyConditionExpression: "#uid = :uidval",
    ExpressionAttributeNames: {
      "#uid": "Id"
    },
    ExpressionAttributeValues: {
      ":uidval": req.body.email
    }
  };

  docClient.query(params, function(err, data) {
    if (err) {
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
      return res.status(500).json({
        message: "error: Could not sign up.",
        details: err
      });
    } else {
      console.log("Query succeeded.");
      if (data.Items.length >= 1) {
        return res.status(409).json({
          message: "User already exists."
        });
      } else {
        // Hashing the user password.
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            // Adding the user details to the table.
            var table2 = "UserDetails";

            var params2 = {
              TableName: table2,
              Key: {
                Id: req.body.email
              },
              UpdateExpression: "set passhash=:p, userRole=:r",
              ExpressionAttributeValues: {
                ":p": hash,
                ":r": "Admin"
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
                  message: "error: Could not sign up.",
                  details: err
                });
              } else {
                console.log(
                  "UpdateItem succeeded:",
                  JSON.stringify(data, null, 2)
                );

                return res.status(200).json({
                  message: "Signed up successfully!"
                });
              }
            });
          }
        });
      }
    }
  });
});
*/
router.post("/login", (req, res, next) => {
  // Fetching user details.
  var table = "UserDetails";
  var params = {
    TableName: table,
    ProjectionExpression: "#uid, passhash, userRole",
    KeyConditionExpression: "#uid = :uidval",
    ExpressionAttributeNames: {
      "#uid": "Id"
    },
    ExpressionAttributeValues: {
      ":uidval": req.body.email
    }
  };

  docClient.query(params, function(err, data) {
    if (err) {
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
      return res.status(500).json({
        message: "error: Could not login.",
        details: err
      });
    } else {
      console.log("Query succeeded.");
      if (data.Items.length < 1) {
        console.log("User ID not found!");
        return res.status(409).json({
          message: "Auth failed."
        });
      } else {
        console.log("User ID found!");
        var userDetails = data.Items[0];
        console.log("User Details:");
        console.log(userDetails);
        bcrypt.compare(
          req.body.password,
          userDetails.passhash,
          (error, result) => {
            if (error) {
              console.log("Error in Bcrypt compare:", error);
              return res.status(409).json({
                message: "Auth failed."
              });
            }
            if (result) {
              // Return jwt token when Auth is successful.
              // Add jwt verification for all write apis.
              // Remove the signup code.

              // Generating jwt
              console.log("Generating jwt:", jwtKey);
              const token = jwt.sign(
                {
                  email: userDetails.email
                },
                jwtKey, // JWT Secet Key
                {
                  expiresIn: "1h"
                }
              );

              // Auth successful
              console.log("Auth Success!");
              return res.status(200).json({
                message: "Auth Success.",
                token: token
              });
            }
            console.log("Auth failed.");
            console.log("Bcrypt compare result:", result);
            return res.status(409).json({
              message: "Auth failed."
            });
          }
        );
      }
    }
  });
});

module.exports = router;
