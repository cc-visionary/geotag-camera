import React from "react";

// EXIF parser: https://github.com/exif-js/exif-js
import EXIF from "exif-js";

import Webcam from "react-webcam";

/**
 * Based from https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
 *
 * Customized by: Christopher Lim
 */

const Camera = ({
  setTimestamp,
  setImage,
  setLongitude,
  setLatitude,
  compassValue,
  setCompass,
  disabled,
}) => {
  const handleCapture = (target) => {
    if (target.files) {
      if (target.files.length !== 0) {
        const file = target.files[0];
        console.log(file)
        const newUrl = URL.createObjectURL(file);

        EXIF.getData(file, () => setImage(newUrl, EXIF.getAllTags(file)));

        const isoFormat = new Date().toISOString();
        setTimestamp(isoFormat.slice(0, isoFormat.length - 1));
        setCompass(compassValue);
        getLocation();
      }
    }
  };

  const handleLocation = (position) => {
    setLongitude(position.coords.longitude);
    setLatitude(position.coords.latitude);
  };

  const errors = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  };

  const getLocation = () => {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };
    if ("geolocation" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then(function (result) {
          if (result.state === "granted") {
            //If granted then you can directly call your function here
            navigator.geolocation.getCurrentPosition(handleLocation);
          } else if (result.state === "prompt") {
            navigator.geolocation.getCurrentPosition(
              handleLocation,
              errors,
              options
            );
          } else if (result.state === "denied") {
            //If denied then you have to show instructions to enable location
            console.log(result.state);
          }
          result.onchange = function () {
            console.log(result.state);
          };
        });
    }
  };

  return (
    <input
      accept="image/*;capture=camera"
      id="icon-button-file"
      type="file"
      capture="environment"
      onChange={(e) => handleCapture(e.target)}
      // disabled={disabled}
    />
  );
};

export default Camera;
