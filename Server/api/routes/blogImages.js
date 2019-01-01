const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const authModule = require("../middleware/auth");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploadedImages");
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

// POST request to upload a new image.
var upload = multer({ storage: storage });
router.post("/uploadImage", authModule, upload.single("file"), function(
  req,
  res,
  next
) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any

  console.log("Received uploadImage POST Request");

  var fileData = req.file;
  console.log(fileData);
  var locationValue = "/blogContent/getUploadedImage?id=" + req.file.filename;
  //var locationValue = "/blogContent/getUploadedImage";
  /*
  var locationValue = path.join(
    __dirname,
    "./uploadedImages/" + req.file.filename
  );*/
  res.status(200).json({
    location: locationValue
  });
});

// To fetch an image from uploaded images.
router.get("/getUploadedImage", (req, res, next) => {
  console.log("Received uploaded image GET Request");
  console.log(req.query);
  var filename = req.query.id;
  var fileContent;
  var filepath = "../../uploadedImages/" + filename;
  var absolutePath = path.join(__dirname, filepath);
  console.log(absolutePath);
  if (fs.existsSync(absolutePath)) {
    console.log("File found");
    // Read the file.
    var fileContent = fs.readFileSync(absolutePath);
    console.log("Image Data:");
    console.log(fileContent);

    res.sendFile(absolutePath);
  } else {
    console.log("file not found");
    res.status(404).json({
      message: "Image file not found!"
    });
  }
});
module.exports = router;
