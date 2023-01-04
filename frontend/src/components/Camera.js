import React from "react";
import { Input } from "antd";
import moment from "moment";

// EXIF parser: https://github.com/exif-js/exif-js
import EXIF from "exif-js";

/**
 * Based from https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
 *
 * Customized by: Christopher Lim
 */

const Camera = ({ form, disabled }) => {
  const handleCapture = (target) => {
    if (target.files) {
      if (target.files.length !== 0) {
        const file = target.files[0];

        // EXIF.getData(file);

        const current = moment();
        form.setFieldValue("image", file);
        form.setFieldValue("date", current);
        form.setFieldValue("time", current);
        getLocation();
      }
    }
  };

  const handleLocation = (position) => {
    form.setFieldValue("longitude", position.coords.longitude);
    form.setFieldValue("latitude", position.coords.latitude);
    form.setFieldValue("accuracy", position.coords.accuracy);
  };

  const getLocation = () => {
    // Options. See MDN for details.
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(handleLocation, null, options);
    }
  };

  return (
    <Input
      accept="image/*"
      capture="environment"
      type="file"
      onChange={(e) => handleCapture(e.target)}
      disabled={disabled}
    />
  );
};

export default Camera;
