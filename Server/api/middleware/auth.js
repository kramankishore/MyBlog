const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

var BlogKeysPath = process.env.BlogKeysPath;
var JWTKeyPath = path.join(BlogKeysPath, "JWT_Key\\jwt_key.json");
var jwtKeyFile = JSON.parse(fs.readFileSync(JWTKeyPath));
var jwtKey = jwtKeyFile.key;

module.exports = (req, res, next) => {
  try {
    console.log("Verifying JWT.");
    // Token is received in the headers with the key "Authorization."
    // Conventionally, token is sent with a prefix of Bearer.
    // So, Bearer <token>
    // Splitting the string to remove Bearer and extract the token.
    var token = req.headers.authorization.split(" ")[1];
    console.log("Token Received:");
    console.log(token);
    const decoded = jwt.verify(token, jwtKey);
    req.userData = decoded;
    next();
  } catch (error) {
    console.log("JWT Verification failed.");
    return res.status(409).json({
      message: "Auth failed."
    });
  }
};
