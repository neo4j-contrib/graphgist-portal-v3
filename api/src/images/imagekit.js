import dotenv from "dotenv";
const ImageKit = require("imagekit");
var fs = require('fs');
dotenv.config();

const imagekit = new ImageKit({
  publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export async function uploadImage(file, uuid) {
  return imagekit.upload({
      file, //required
      fileName : uuid, //required
  })
}

export async function deleteImage(fileId) {
  return imagekit.deleteFile(fileId)
}