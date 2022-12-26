const AWS = require("aws-sdk");
const sharp = require("sharp");

AWS.config.update({
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

exports.handler = async (event) => {
  console.log(event);
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    for (const event of body.Records) {
      const {
        s3: {
          bucket: {
            name: Bucket
          },
          object: {
            key: Key
          }
        }
      } = event;

      if (!Key?.startsWith("original/")) {
        continue;
      }
  
      const {
        Body
      } = await s3.getObject({
        Bucket,
        Key
      }).promise();

      const resizedImage = await sharp(Body)
        .resize(100, 100)
        .jpeg()
        .toBuffer();

      await s3.putObject({
        Bucket,
        Key: Key.replace(/^original/, "resized"),
        Body: resizedImage
      }).promise();
    }
  }
}