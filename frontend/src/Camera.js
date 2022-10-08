import React, { useEffect, useState } from "react";

const Camera = () => {
  const [isGeolocationAvailable, setIsGeolocationAvailable] = useState(false);
  const [coords, setCoords] = useState(false);
  const [output, setOutput] = useState(null);
  const [degree, setDegree] = useState(null);
  const [deviceType, setDeviceType] = useState("Desktop");

  useEffect(() => {
    getDevice();
    getLocation();
  }, []);

  const handleCapture = (target) => {
    if (target.files) {
      if (target.files.length !== 0) {
        const file = target.files[0];
        const newUrl = URL.createObjectURL(file);
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
    const { absolute, alpha, beta, gamma } = event;
    const compass = event.webkitCompassHeading || Math.abs(alpha - 360);

    setOutput(`Compass Direction: ${compass}`);
  };

  const calcDegreeToPoint = (latitude, longitude) => {
    // Qibla geolocation
    const point = {
      lat: 21.422487,
      lng: 39.826206,
    };

    const phiK = (point.lat * Math.PI) / 180.0;
    const lambdaK = (point.lng * Math.PI) / 180.0;
    const phi = (latitude * Math.PI) / 180.0;
    const lambda = (longitude * Math.PI) / 180.0;
    const psi =
      (180.0 / Math.PI) *
      Math.atan2(
        Math.sin(lambdaK - lambda),
        Math.cos(phi) * Math.tan(phiK) -
          Math.sin(phi) * Math.cos(lambdaK - lambda)
      );
    return Math.round(psi);
  };

  const handleLocation = (position) => {
    const { latitude, longitude } = position.coords;
    let pointDegree = calcDegreeToPoint(latitude, longitude);

    if (pointDegree < 0) {
      pointDegree = pointDegree + 360;
    }

    setCoords([latitude, longitude]);
    setDegree(pointDegree);
    setOutput(`Successfully extracted location`);
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

    if (deviceType !== "Mobile") {
      window.addEventListener(
        "deviceorientationabsolute",
        handleLocation,
        true
      );
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
          } else {
            alert("Has to be allowed!");
          }
        })
        .catch(() => alert("Not supported"));
    } else {
      alert('Not Supported')
    }
  };

  return isGeolocationAvailable ? (
    coords ? (
      <div>
        <p>Device Type: {deviceType}</p>
        <p>User Agent: {navigator.userAgent}</p>
        <input
          accept="image/*"
          id="icon-button-file"
          type="file"
          capture="environment"
          onChange={(e) => handleCapture(e.target)}
        />
        <h4>Coords:</h4>
        <p>
          {coords[0]}, {coords[1]}
        </p>
        <h4>Degree:</h4>
        <p>{degree}</p>
        <button onClick={() => startCompass()}>Start Compass</button>
        <div>{output}</div>
      </div>
    ) : (
      <div>
        <h4>Geolocation is not enabled</h4>
        <button onClick={() => getLocation()}>Try Again</button>
        <div>{output}</div>
      </div>
    )
  ) : (
    <div>
      <h4>Geolocation is not available on your device</h4>
        <div>{output}</div>
    </div>
  );
};

export default Camera;
