import React, { useEffect, useState } from "react";

/**
 * Based from https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
 *
 * Customized by: Christopher Lim
 */

const Camera = ({
  setImage,
  setLongitude,
  setLatitude,
  compassValue,
  setCompass,
  disabled,
}) => {
  useEffect(() => {
    setCompass(compassValue);
    console.log(compassValue);
  }, [compassValue]);

  const handleCapture = (target) => {
    if (target.files) {
      if (target.files.length !== 0) {
        const file = target.files[0];
        const newUrl = URL.createObjectURL(file);

        setImage(newUrl);
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
            console.log(result.state);
            //If granted then you can directly call your function here
            navigator.geolocation.getCurrentPosition(handleLocation);
          } else if (result.state === "prompt") {
            navigator.geolocation.getCurrentPosition(
              handleLocation,
              errors,
              options
            );
            console.log(result.state);
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
      accept="image/*"
      id="icon-button-file"
      type="file"
      capture="environment"
      onChange={(e) => handleCapture(e.target)}
      disabled={disabled}
    />
  );
};

export default Camera;
