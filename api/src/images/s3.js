import AWS from "aws-sdk";
import Sharp from "sharp";
import { createWriteStream } from "fs";
import { v4 as uuidv4 } from 'uuid';
import mkdirp from "mkdirp";

const UPLOAD_DIR = `./uploads`;

// Ensure upload directory exists.
mkdirp.sync(UPLOAD_DIR);

const storeUpload = async (upload) => {
  const { createReadStream, filename, mimetype } = await upload;
  const stream = createReadStream();
  const id = uuidv4();
	const ext = filename.split('.').pop();
  const path = `${UPLOAD_DIR}/${id}.${ext}`;
	let content = Buffer.from([]);

  // Store the file in the filesystem.
  await new Promise((resolve, reject) => {
    // Create a stream to which the upload will be written.
    const writeStream = createWriteStream(path);

    // When the upload is fully written, resolve the promise.
    writeStream.on('finish', resolve);

    // If there's an error writing the file, remove the partially written file
    // and reject the promise.
    writeStream.on('error', (error) => {
      unlink(path, () => {
        reject(error);
      });
    });

    // In Node.js <= v13, errors are not automatically propagated between piped
    // streams. If there is an error receiving the upload, destroy the write
    // stream with the corresponding error.
    stream.on('error', (error) => writeStream.destroy(error));
		stream.on('data', buf => {
			content = Buffer.concat([content, buf]);
		});

    // Pipe the upload into the write stream.
    stream.pipe(writeStream);
  });

	const file = { id, filename, mimetype, path, content, ext };

  return file;
};

class S3 {
  constructor() {
    // Amazon SES configuration
    this.config = {
      // current version of Amazon S3 API (see: https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html)
      apiVersion: "2006-03-01",
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      region: process.env.AWS_S3_REGION
    };

    this.s3 = new AWS.S3(this.config);
  }

  upload(uploaded_filled) {
    return new Promise(async (resolve, reject) => {
			const { id, content, filename, ext, mimetype } = await storeUpload(uploaded_filled);

			const keyBase = `graph_starter/images/sources/${id.substring(0, 3)}/${id.substring(3, 6)}/${id.substring(6, 9)}`
			
      // upload file
      let params = {
        Body: content,
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${keyBase}/original/${id}.${ext}`,
				ACL: 'public-read',
        ContentType: mimetype,
      };

			let sizes = {
				medium: {width: 300, height: 300},
				thumb: {width: 50, height: 50},
			};

      this.s3.putObject(params, (e, d) => {
        if (e) {
          reject(e);
        }

        // check if we should create resized copy of uploaded file
				Object.keys(sizes).forEach(size => {
          let width = sizes[size].width;
          let height = sizes[size].height;

          // resize image and upload to S3
          // won't be creating any temporary files
          Sharp(content)
            .resize(width, height)
            .toBuffer()
            .then(buffer => {
              params.Body = buffer;
              params.Key = `${keyBase}/${size}/${id}.${ext}`;

              this.s3.putObject(params, (e, d) => {
                if (e) {
                  reject(e);
                }
              });
            })
            .catch(e => reject(e));
        });

        resolve({
          key_base: keyBase,
          s3_url: `${keyBase}/original/${id}.${ext}`,
          source_file_name: `${id}.${ext}`,
          uuid: String(id),
          source_file_ext: ext,
          source_updated_at: String(new Date())
        });
      });
    });
  }
}

export default new S3();
