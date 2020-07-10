const s3 = require("../db/S3.config");

module.exports = (Key) => {
  s3.deleteObject(
    {
      Bucket: "bbcodetaskmanagerapi",
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
