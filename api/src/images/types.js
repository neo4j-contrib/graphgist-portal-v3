const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export const Image = {
  source_url: (obj, args, context, info) => {
    const {
      uuid,
      source_file_name,
      source_updated_at,
      source = null,
      url = null
    } = obj.source_url.properties;
    if (source === 'imagekit') return url;
    const size = "medium";
    const partitions = uuid
      .match(/.{9}/g)[0]
      .match(/.{1,3}/g)
      .join("/");
    return `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/graph_starter/images/sources/${partitions}/${size}/${source_file_name}?${source_updated_at}`;
  },
};
