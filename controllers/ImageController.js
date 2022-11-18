// import module from `../models/database.js`
const db = require("../models/database.js");

// import ImageSchema from `../models/ImageModel.js`
const Image = require("../models/ImageModel");

// import helper function defaultCallback from `../helpers/defaultCallback`
const defaultCallback = require("../helpers/defaultCallback");
const { response } = require("express");

const ImageController = {
  addImage: (req, res) => {
    const {
      image,
      locationDescription,
      weather,
      timestamp,
      longitude,
      latitude,
      compass,
      cameraType,
      maskingPoints,
    } = req.body;

    const img = {
      image,
      locationDescription,
      weather,
      timestamp,
      longitude,
      latitude,
      compass,
      cameraType,
      maskingPoints,
    }

    db.insertOne(Image, img, (result) => defaultCallback(res, result));
  },
  getAllImages: (req, res) => {
    db.findMany(Image, {}, (result) => defaultCallback(res, result));
  }
};

/*
    exports the object `ImageController` (defined above)
    when another script exports from this file
*/
module.exports = ImageController;
