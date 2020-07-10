const aws = require("aws-sdk");
require("dotenv").config();

// S3 config
aws.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
});
module.exports = new aws.S3({});
