// import module `mongoose`
const mongoose = require("mongoose");

const { Schema } = mongoose;

// defines the schema for collection `images`
const ImageSchema = new Schema({
  image: {
    data: Schema.Types.Buffer,
    contentType: String,
  },
  locationDescription: String,
  weather: String,
  timestamp: String,
  longitude: Schema.Types.Decimal128,
  latitude: Schema.Types.Decimal128,
  compass: Schema.Types.Decimal128,
  cameraType: String,
  maskingPoints: Schema.Types.Array,
});

/*
  exports a mongoose.model object based on `ImageSchema` (defined above)
  when another script exports from this file
  This model executes CRUD operations
  to collection `images` -> plural of the argument `Image`
*/
module.exports = mongoose.model("Image", ImageSchema);
