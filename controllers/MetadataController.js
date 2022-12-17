// import module from `../models/database.js`
const db = require("../models/database.js");

// import MetadataSchema from `../models/MetadataModel.js`
const Metadata = require("../models/MetadataModel");

// import helper function defaultCallback from `../helpers/defaultCallback`
const defaultCallback = require("../helpers/defaultCallback");
const { response } = require("express");

const MetadataController = {
  addMetadata: (req, res) => {
    const {
      filename,
      description,
      weather,
      datetime,
      longitude,
      latitude,
      alpha,
      beta,
      gamma
    } = req.body;

    const img = {
      filename,
      description,
      weather,
      datetime,
      longitude,
      latitude,
      alpha,
      beta,
      gamma
    };

    db.insertOne(Metadata, img, (result) => defaultCallback(res, result));
  },
  getAllMetadatas: (req, res) => {
    db.findMany(Metadata, {}, (result) => defaultCallback(res, result));
  },
};

/*
    exports the object `MetadataController` (defined above)
    when another script exports from this file
*/
module.exports = MetadataController;
