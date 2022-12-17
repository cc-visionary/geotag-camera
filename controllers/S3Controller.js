const aws = require("aws-sdk");

// import helper function defaultCallback from `../helpers/defaultCallback`
const defaultCallback = require("../helpers/defaultCallback");

aws.config.update({
  accessKeyId: "AKIAWIZJYQWTR7KKIPDO",
  secretAccessKey: "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",
});

const S3_BUCKET = "riverimages";
const REGION = "ap-east-1";
const URL_EXPIRATION_TIME = 60; // in seconds

const myBucket = new aws.S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
});

const S3Controller = {
  generatePreSignedPutUrl: (req, res) => {
    const { fileName, fileType } = req.body;
    myBucket.getSignedUrl(
      "putObject",
      {
        Key: fileName,
        ContentType: fileType,
        Expires: URL_EXPIRATION_TIME,
      },
      (err, url) => {
        if(err) res.status(401).json(err);
        else res.status(200).json({
          presigned_url: url,
        });
      }
    );
  }
};

/*
    exports the object `S3Controller` (defined above)
    when another script exports from this file
*/
module.exports = S3Controller;
