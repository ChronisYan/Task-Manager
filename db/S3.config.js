const aws = require("aws-sdk");
require("dotenv").config();

// S3 config
aws.config.update({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

module.exports = new aws.S3({});
