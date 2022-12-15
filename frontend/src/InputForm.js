import React, { useState, useRef, useEffect } from "react";

// EXIF parser: https://github.com/exif-js/exif-js
import EXIF from "exif-js";

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
  const [camera, setCamera] = useState(null);
  const [exif, setExif] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    getDevice();
  }, []);

  const requestCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const track = stream.getVideoTracks()[0];
      let imageCapture = new ImageCapture(track);
      imageCapture.takePhoto().then((blob) => {
        const newFile = new File([blob], "MyJPEG.jpg", { type: "image/jpeg" });
        EXIF.getData(newFile, () => {
          console.log(Object.entries(EXIF.getAllTags(newFile)).length);
          setExif(EXIF.getAllTags(newFile));
        });
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

  const requestMagnetometer = () => {
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
    const { alpha } = event;
    const compass = event.webkitCompassHeading || Math.abs(alpha - 360);

    setDeviceOrientationPermission(true);
    setCompassValue(compass);
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

  const setCapturedImage = (img, exif) => {
    setImage(img);
    setExif(exif);
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
            <span className="clickable" onClick={() => requestMagnetometer()}>
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
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {exif &&
          Object.entries(exif).map(([key, val]) => (
            <div style={{ margin: "5px" }}>
              {key}:{" "}
              {typeof val == "object"
                ? val.toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" })
                : val}{" "}
              |
            </div>
          ))}
      </div>
      <button onClick={() => handleUpload()} className="upload-button">
        Upload
      </button>
    </div>
  );
};

export default InputForm;
