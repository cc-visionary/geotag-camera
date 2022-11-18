import React, { useState, useRef, useEffect } from "react";

import Camera from "./Camera";

import ImageService from "./services/ImageService";

import "./InputForm.css";

const InputForm = () => {
  const [deviceType, setDeviceType] = useState("Desktop");
  const [cameraPermission, setCameraPermission] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [deviceOrientationPermission, setDeviceOrientationPermission] =
    useState(false);
  const [timestamp, setTimestamp] = useState(null);
  const [image, setImage] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [compass, setCompass] = useState(null);
  const [locationDescription, setLocationDescription] = useState("");
  const [weather, setWeather] = useState("Cloudy");
  const [cameraType, setCameraType] = useState("Smartphone");
  const [maskingPoints, setMaskingPoints] = useState([]);
  const [compassValue, setCompassValue] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    getDevice();
  }, []);

  const requestCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      stream.getVideoTracks().forEach(function (track) {
        track.stop();
        setCameraPermission(true);
      });
    });
  };

  const requestLocation = () => {
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      console.log(result.state);
      if (result.state === "prompt") {
        navigator.geolocation.getCurrentPosition(
          // Success function
          (result) => {
            setLocationPermission(true);
          },
          // Error function
          null,
          // Options. See MDN for details.
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }
    });
  };

  const requestDeviceOrientation = () => {
    // start compass
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
            alert(
              "Device Orientation has to be allowed to get the compass direction!"
            );
          }
        })
        .catch(() => alert("Does not support device orientation..."));
    } else {
      window.addEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true
      );
    }
  };

  const handleOrientation = (event) => {
    const { absolute, alpha, beta, gamma } = event;

    if (absolute === true && alpha !== null) {
      // Convert degrees to radians
      var alphaRad = alpha * (Math.PI / 180);
      var betaRad = beta * (Math.PI / 180);
      var gammaRad = gamma * (Math.PI / 180);

      // Calculate equation components
      var cA = Math.cos(alphaRad);
      var sA = Math.sin(alphaRad);
      var cB = Math.cos(betaRad);
      var sB = Math.sin(betaRad);
      var cG = Math.cos(gammaRad);
      var sG = Math.sin(gammaRad);

      // Calculate A, B, C rotation components
      var rA = -cA * sG - sA * sB * cG;
      var rB = -sA * sG + cA * sB * cG;
      var rC = -cB * cG;

      // Calculate compass heading
      var compassHeading = Math.atan(rA / rB);

      // Convert from half unit circle to whole unit circle
      if (rB < 0) {
        compassHeading += Math.PI;
      } else if (rA < 0) {
        compassHeading += 2 * Math.PI;
      }

      // Convert radians to degrees
      compassHeading *= 180 / Math.PI;

      setCompass(compassHeading);
    } else setCompass(null);
    
    setDeviceOrientationPermission(true);
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

  const setCapturedImage = (img) => {
    const im = new Image();
    im.src = img;

    im.onload = function () {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = im.width;
      canvas.height = im.height;

      ctx.drawImage(im, 0, 0);
    };
    setImage(img);
    setMaskingPoints([]);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const xPos = e.clientX - canvas.getBoundingClientRect().x;
    const yPos = e.clientY - canvas.getBoundingClientRect().y;
    const currentHeight =
      canvas.getBoundingClientRect().bottom -
      canvas.getBoundingClientRect().top;
    const currentWidth =
      canvas.getBoundingClientRect().right -
      canvas.getBoundingClientRect().left;
    const hRatio = canvas.height / currentHeight;
    const wRatio = canvas.width / currentWidth;
    const scaledX = xPos * wRatio;
    const scaledY = yPos * hRatio;
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(scaledX - 25, scaledY - 25, 50, 50);
    setMaskingPoints([...maskingPoints, [xPos * wRatio, yPos * hRatio]]);
  };

  const undoMask = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const im = new Image();
    im.src = image;

    im.onload = () => {
      canvas.width = im.width;
      canvas.height = im.height;

      ctx.drawImage(im, 0, 0);
    };

    ctx.fillStyle = "rgb(255, 0, 0)";
    for (let i = 0; i < maskingPoints.length - 1; i++)
      ctx.fillRect(maskingPoints[i][0] - 25, maskingPoints[i][1] - 25, 50, 50);

    setMaskingPoints(maskingPoints.slice(0, maskingPoints.length - 1));
  };

  const clearMasks = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const im = new Image();
    im.src = image;

    im.onload = () => {
      canvas.width = im.width;
      canvas.height = im.height;

      ctx.drawImage(im, 0, 0);
    };
    setMaskingPoints([]);
  };

  const drawPoly = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.moveTo(maskingPoints[0][0], maskingPoints[0][1]);
    for (let i = 1; i < maskingPoints.length; i++)
      ctx.lineTo(maskingPoints[i][0], maskingPoints[i][1]);
    ctx.closePath();
    ctx.fill();
  };

  const validateFields = () => {
    if (image === null) {
      alert("Image cannot be empty...");
      return false;
    }
    if (locationDescription === null || locationDescription === "") {
      alert("Location description cannot be empty...");
      return false;
    }
    if (weather === null || weather === "") {
      alert("Weather cannot be empty...");
      return false;
    }
    if (timestamp === null || timestamp === "") {
      alert("Timestamp cannot be empty...");
      return false;
    }
    if (longitude === null || longitude < 0) {
      alert("Longitude cannot be empty...");
      return false;
    }
    if (latitude === null || latitude < 0) {
      alert("Latitude cannot be empty...");
      return false;
    }
    if (compass === null || compass < 0 || compass > 360) {
      alert("Compass can only be between 0 and 360...");
      return false;
    }
    if (cameraType === null || cameraType === "") {
      alert("Camera type cannot be empty...");
      return false;
    }
    if (maskingPoints.length < 3) {
      alert("Masking points has to be atleast 3...");
      return false;
    }
    return true;
  };

  const handleUpload = () => {
    if (validateFields()) {
      const data = {
        image,
        locationDescription,
        weather,
        timestamp,
        longitude,
        latitude,
        compass,
        cameraType,
        maskingPoints,
      };

      ImageService.addImage(data).then((result) => {});
    }
  };

  return (
    <div id="input-form">
      <div className="input">
        <label>Permissions</label>
        <div className="input-area">
          <div>
            ({cameraPermission ? "/" : "X"}){" "}
            <span className="clickable" onClick={() => requestCamera()}>
              Camera
            </span>
          </div>
          <div>
            ({locationPermission ? "/" : "X"}){" "}
            <span className="clickable" onClick={() => requestLocation()}>
              Location
            </span>
          </div>
          <div>
            ({deviceOrientationPermission ? "/" : "X"}){" "}
            <span
              className="clickable"
              onClick={() => requestDeviceOrientation()}
            >
              Magnetometer
            </span>
          </div>
        </div>
      </div>
      <div className="input">
        <label>Timestamp</label>
        <div className="input-area">
          <input
            onChange={(e) => setTimestamp(e.target.value)}
            value={timestamp}
            type="datetime-local"
            placeholder="Enter Date and Time"
          />
        </div>
      </div>
      <div className="input">
        <label>Image Capture</label>
        <div className="input-area">
          <Camera
            deviceType={deviceType}
            setTimestamp={setTimestamp}
            setImage={setCapturedImage}
            setLongitude={setLongitude}
            setLatitude={setLatitude}
            compassValue={compassValue}
            setCompass={setCompass}
            disabled={
              !(
                cameraPermission &&
                locationPermission &&
                deviceOrientationPermission
              ) && deviceType === "Mobile"
            }
          />
        </div>
      </div>
      <div className="input">
        <label>Geolocation Coordinates</label>
        <div className="input-area">
          <input
            min={0}
            value={longitude}
            type="number"
            placeholder="Enter longitude"
            onChange={(e) => setLongitude(e.target.value)}
          />
          <span>,</span>
          <input
            min={0}
            value={latitude}
            type="number"
            placeholder="Enter latitude"
            onChange={(e) => setLatitude(e.target.value)}
          />
        </div>
      </div>
      <div className="input">
        <label>Location Description</label>
        <div className="input-area">
          <input
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
            placeholder="Enter description of location"
          />
        </div>
      </div>
      <div className="input">
        <label>Compass Direction</label>
        <div className="input-area">
          <input
            min={0}
            max={360}
            value={compass}
            type="number"
            placeholder="Enter degrees"
            onChange={(e) => setCompass(e.target.value)}
          />
          <span>degrees</span>
        </div>
      </div>
      <div className="input">
        <label>Weather</label>
        <div className="input-area">
          <select value={weather}>
            <option value="Cloudy">Cloudy</option>
          </select>
        </div>
      </div>
      <div className="input">
        <label>Camera Type</label>
        <div className="input-area">
          <select value={cameraType}>
            <option value="Smartphone">Smartphone</option>
          </select>
        </div>
      </div>
      <div className="input">
        <label>
          Segment River
          <button onClick={() => undoMask()} disabled={!image}>
            Undo
          </button>
          <button onClick={() => clearMasks()} disabled={!image}>
            Clear
          </button>
          <button
            onClick={() => drawPoly()}
            disabled={maskingPoints.length < 3 || !image}
          >
            Draw
          </button>
        </label>
        <div className="input-area">
          <canvas
            width={0}
            height={0}
            ref={canvasRef}
            onClick={(e) => handleCanvasClick(e)}
          />
        </div>
      </div>
      <div className="input">
        <label>Masking Points ({maskingPoints.length})</label>
        <div
          className="input-area"
          style={{ flexDirection: "column", alignItems: "flex-start" }}
        >
          {maskingPoints.map((val, i) => (
            <div>
              <span>Point {i + 1}: </span>
              <input value={val[0]} placeholder="Enter x" disabled />
              <span>,</span>
              <input value={val[1]} placeholder="Enter y" disabled />
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => handleUpload()} className="upload-button">
        Upload
      </button>
    </div>
  );
};

export default InputForm;
