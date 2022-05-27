import dotenv from "dotenv";
const ImageKit = require("imagekit");
var fs = require('fs');
dotenv.config();

const ImageService = (function () {
  class ImageServiceClass {
    constructor() {
      this.imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
      });
    }

    upload(file, uuid) {
      return this.imagekit.upload({
        file, //required
        fileName : uuid, //required
      })
    }
    delete(fileId) {
      return this.imagekit.deleteFile(fileId)
    }
  }

  let instance;
  return {
    getInstance: function () {
      if (instance == null) {
        instance = new ImageServiceClass();
        // Hide the constructor so the returned object can't be new'd...
        instance.constructor = null;
      }
      return instance;
    }
  };
})();

export async function uploadImage(file, uuid) {
  return ImageService.getInstance().upload(file, uuid)
}

export async function deleteImage(fileId) {
  return ImageService.getInstance().delete(fileId)
}
