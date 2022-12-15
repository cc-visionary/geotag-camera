import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  TimePicker,
} from "antd";

import { Camera } from ".";

import { ImageService } from "../services";

import "../styles/components/InputForm.css";

const InputForm = () => {
  const [deviceType, setDeviceType] = useState(null);
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
  const [deviceOrientation, setDeviceOrientation] = useState(null);
  const [exif, setExif] = useState(null);

  useEffect(() => {
    setDeviceType(getDeviceType());
  }, []);

  /**
   * Triggered when user requests permission to access camera of device
   */
  const requestCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      stream.getVideoTracks().forEach(function (track) {
        setCameraPermission(true);
        track.stop();
      });
    });
  };

  /**
   * Triggered when user requests permission to access geolocation of device
   */
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

  /**
   * Triggered when user requests permission to access orientation of device
   */
  const requestDeviceOrientation = () => {
    // start compass
    if (deviceType === "Android") {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            setDeviceOrientationPermission(true);
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
    }
  };

  /**
   * Handles Device Orientation
   * - Updates alpha, beta, and gamma values
   */
  const handleOrientation = (event) => {
    const { alpha, beta, gamma } = event;
    const compass = event.webkitCompassHeading || Math.abs(alpha - 360);

    setDeviceOrientation([compass, beta, gamma]);
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
    return true;
  };

  /**
   * Extract device type based on User Agent
   * @returns type of device
   */
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) {
      return "Android";
    } else if (
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    ) {
      return "iOS";
    }
    return "Desktop";
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
      };

      ImageService.addImage(data).then((result) => {});
    }
  };

  return (
    <div id="input-form">
      {!deviceType || deviceType !== "Android" ? (
        <Alert
          message={`Detected device is ${deviceType}, has to be an Android`}
          banner
          type="error"
        />
      ) : null}
      <Form layout="vertical">
        <Row gutter={[16, 16]}>
          <Col md={12} sm={24}>
            <Form.Item label="Permissions">
              <Button onClick={() => requestCamera()}>Camera</Button>
              <Button onClick={() => requestLocation()}>Location</Button>
              <Button onClick={() => requestDeviceOrientation()}>
                Orientation
              </Button>
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item label="Date and Time" required>
              <DatePicker disabled />
              <TimePicker disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col md={12} sm={24}>
            <Form.Item label="Image" required>
              <Camera
                deviceType={deviceType}
                setTimestamp={setTimestamp}
                setImage={setCapturedImage}
                setLongitude={setLongitude}
                setLatitude={setLatitude}
                alpha={deviceOrientation ? deviceOrientation[0] : null}
                setCompass={setCompass}
                disabled={
                  !(
                    cameraPermission &&
                    locationPermission &&
                    deviceOrientationPermission
                  ) && deviceType === "Android"
                }
              />
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item label="Geolocation Coordinates" required>
              <Input.Group compact>
                <Input
                  style={{ width: "50%" }}
                  placeholder="Longitude"
                  value={longitude}
                  disabled
                />
                <Input
                  style={{ width: "50%" }}
                  placeholder="Latitude"
                  value={latitude}
                  disabled
                />
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col md={12} sm={24}>
            <Form.Item label="Description" required>
              <Input
                placeholder="Enter description of location"
                value={locationDescription}
                onChange={(val) => setLocationDescription(val)}
              />
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item label="Compass Direction" required>
              <Input
              style={{width: '75%'}}
                placeholder="Degrees"
                value={compass}
                disabled={true}
              />
              degrees
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col md={12} sm={24}> 
            <Form.Item label="Weather" required>
              <Select value={weather} onChange={(val) => setWeather(val)}>
                <Select.Option value="Cloudy">Cloudy</Select.Option>
                <Select.Option value="Sunny">Sunny</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item label="Submit">
                <Button type="primary" onClick={() => handleUpload()} >Upload</Button>
            </Form.Item>
          </Col>
        </Row>
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
      </Form>
    </div>
  );
};

export default InputForm;
