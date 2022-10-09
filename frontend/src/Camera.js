import React, { useEffect, useState } from "react";

/**
 * Based from https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
 *
 * Customized by: Christopher Lim
 */

const Camera = () => {
  const [isGeolocationAvailable, setIsGeolocationAvailable] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [coords, setCoords] = useState(false);
  const [output, setOutput] = useState(null);
  const [degree, setDegree] = useState(null);
  const [deviceType, setDeviceType] = useState("Desktop");

  useEffect(() => {
    getDevice();
  }, []);

  const handleCapture = (target) => {
    if (target.files) {
      if (target.files.length !== 0) {
        const file = target.files[0];
        const newUrl = URL.createObjectURL(file);

        setImageSrc(newUrl);

        getLocation();
      }
    }
  };

  const getDevice = () => {
    let hasTouchScreen = false;
    if ("maxTouchPoints" in navigator) {
      hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ("msMaxTouchPoints" in navigator) {
      hasTouchScreen = navigator.msMaxTouchPoints > 0;
    } else {
      const mQ = window.matchMedia && matchMedia("(pointer:coarse)");
      if (mQ && mQ.media === "(pointer:coarse)") {
        hasTouchScreen = !!mQ.matches;
      } else if ("orientation" in window) {
        hasTouchScreen = true; // deprecated, but good fallback
      } else {
        // Only as a last resort, fall back to user agent sniffing
        var UA = navigator.userAgent;
        hasTouchScreen =
          /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
          /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
      }
    }
    if (hasTouchScreen) {
      setDeviceType("Mobile");
    } else {
      setDeviceType("Desktop");
    }
  };

  const handleOrientation = (event) => {
    const { alpha } = event;
    const compass = event.webkitCompassHeading || Math.abs(alpha - 360);

    setDegree(compass);
  };

  const handleLocation = (position) => {
    setCoords(position.coords);
    setOutput(`Successfully extracted location`);

    startCompass();
  };

  const errors = (err) => {
    setOutput(`ERROR(${err.code}): ${err.message}`);
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
      setIsGeolocationAvailable(true);
    } else {
      setIsGeolocationAvailable(false);
    }
  };

  const startCompass = () => {
    if (deviceType === "Mobile") {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            window.addEventListener(
              "deviceorientation",
              handleOrientation,
              true
            );
            window.removeEventListener(
              "deviceorientation",
              handleOrientation,
              true
            );
          } else {
            alert("Has to be allowed!");
          }
        })
        .catch(() => alert("Not supported"));
    } else {
      alert("Not Supported");
    }
  };

  return (
    <div>
      <p>Device Type: {deviceType}</p>
      <image src={imageSrc} alt='No Uploaded Image' />
      <input
        accept="image/*"
        id="icon-button-file"
        type="file"
        capture="environment"
        onChange={(e) => handleCapture(e.target)}
      />
      {coords ? (
        <div>
          <h4>Coords:</h4>
          <p>
            {coords.longitude}, {coords.longitude}
          </p>
        </div>
      ) : (
        <div>Coords not available</div>
      )}
      {degree ? (
        <div>
          <h4>Degree:</h4>
          <p>{degree}</p>
        </div>
      ) : (
        <div>Compass direction not available</div>
      )}

      <div>{output}</div>
    </div>
  );
};

export default Camera;
