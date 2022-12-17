// import module `mongoose`
const mongoose = require("mongoose");

const { Schema } = mongoose;

// defines the schema for collection `metadatas`
const MetadataSchema = new Schema({
  filename: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  weather: {
    type: String,
    required: true,
  },
  datetime: {
    type: String,
    required: true,
  },
  longitude: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  latitude: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  alpha: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  beta: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  gamma: {
    type: Schema.Types.Decimal128,
    required: true,
  },
});

/*
  exports a mongoose.model object based on `MetadataSchema` (defined above)
  when another script exports from this file
  This model executes CRUD operations
  to collection `metadatas` -> plural of the argument `Metadata`
*/
module.exports = mongoose.model("Metadata", MetadataSchema);
