const s3 = require("../db/S3.config");
const constants = require("./constants");

module.exports = (Key) => {
  s3.deleteObject(
    {
      Bucket: constants.BUCKET,
      Key,
    },
    function (error, data) {
      if (error) {
        throw error;
      } else {
        return data;
      }
    }
  );
};
