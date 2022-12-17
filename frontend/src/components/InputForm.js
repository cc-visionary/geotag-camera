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
  message,
} from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { green, red } from "@ant-design/colors";

import { Camera } from ".";
import { MetadataService, S3Service } from "../services";

import "../styles/components/InputForm.css";

const InputForm = () => {
  const [deviceType, setDeviceType] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [deviceOrientationPermission, setDeviceOrientationPermission] =
    useState(false);
  const [compass, setCompass] = useState(null);
  const [deviceOrientation, setDeviceOrientation] = useState(null);
  const [exif, setExif] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    setDeviceType(getDeviceType());
    form.setFieldsValue({
      weather: "Sunny",
    });
  }, []);

  /**
   * Triggered when user requests permission to access camera of device
   */
  const requestCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        stream.getVideoTracks().forEach(function (track) {
          setCameraPermission(true);
          track.stop();
        });
      })
      .catch(() => message.error("Device does not support camera..."));
  };

  /**
   * Triggered when user requests permission to access geolocation of device
   */
  const requestLocation = () => {
    if (!navigator.geolocation) {
      message.error("Device does not support geolocation");
      return;
    }
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
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
            message.error(
              "Device Orientation has to be allowed to get the compass direction!"
            );
          }
        })
        .catch(() => message.error("Device does not support device orientation..."));
    } else message.error("Device does not support device orientation...");
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

  /**
   * Extract device type based on User Agent
   * @returns type of device
   */
  const getDeviceType = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/i.test(ua)) {
      return "Android";
    }
    if (/windows phone/i.test(ua)) {
      return "Windows Phone";
    } else if (
      /ipad|iphone|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    ) {
      return "iOS";
    }
    return "Desktop";
  };

  const onFinish = (values) => {
    /** TODO:
     *    1. work on validating range of values
     *    2. detect if facing river or not
     *    3. detect if near river or not
     *    4. other checks
     */
    const directory = "data_gathering";
    const fileType = values["image"].name.split(".")[1];
    const fileName = Math.random().toString(16).slice(2) + `.${fileType}`;

    S3Service.getPresignedURL(directory + "/" + fileName, fileType)
      .then((result) => {
        // retrieves the URL
        const { presigned_url } = result.data;

        S3Service.uploadImage(presigned_url, values["image"])
          .then(() => {
            const metadata = {
              filename: fileName,
              datetime: values["date"].toISOString(),
              description: values["description"],
              weather: values["weather"],
              longitude: values["longitude"],
              latitude: values["latitude"],
              compass: values["compass"],
            };

            MetadataService.addMetadata(metadata)
              .then((r) => {
                form.resetFields();
              })
              .catch((err) => message.error(err.response.data.error.message));
          })
          .catch(() => message.error("Error uploading image to S3"));
      })
      .catch(() => message.error("Error generating pre-signed URL for S3"));
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
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col md={12} sm={24}>
            <Form.Item label="Permissions">
              <Button
                onClick={() => requestCamera()}
                icon={
                  cameraPermission ? (
                    <CheckCircleOutlined />
                  ) : (
                    <CloseCircleOutlined />
                  )
                }
                type="primary"
                style={{
                  background: cameraPermission ? green.primary : red.primary,
                }}
                disabled={cameraPermission}
              >
                Camera
              </Button>
              <Button
                onClick={() => requestLocation()}
                icon={
                  locationPermission ? (
                    <CheckCircleOutlined />
                  ) : (
                    <CloseCircleOutlined />
                  )
                }
                type="primary"
                style={{
                  background: locationPermission ? green.primary : red.primary,
                }}
                disabled={locationPermission}
              >
                Location
              </Button>
              <Button
                onClick={() => requestDeviceOrientation()}
                icon={
                  deviceOrientationPermission ? (
                    <CheckCircleOutlined />
                  ) : (
                    <CloseCircleOutlined />
                  )
                }
                type="primary"
                style={{
                  background: deviceOrientationPermission
                    ? green.primary
                    : red.primary,
                }}
                disabled={deviceOrientationPermission}
              >
                Orientation
              </Button>
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item label="Date and Time">
              <Input.Group compact>
                <Form.Item
                  name="date"
                  rules={[{ required: true, message: "Date is required" }]}
                >
                  <DatePicker disabled />
                </Form.Item>
                <Form.Item
                  name="time"
                  rules={[{ required: true, message: "Time is required" }]}
                >
                  <TimePicker disabled />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col md={12} sm={24}>
            <Form.Item
              label="Image"
              name="image"
              rules={[{ required: true, message: "Image is required" }]}
            >
              <Camera
                alpha={deviceOrientation ? deviceOrientation[0] : null}
                form={form}
                disabled={
                  !(
                    cameraPermission &&
                    locationPermission &&
                    deviceOrientationPermission
                  ) && deviceType !== "Android"
                }
              />
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item label="Geolocation Coordinates">
              <Input.Group compact>
                <Form.Item
                  name="longitude"
                  rules={[{ required: true, message: "Longitude is required" }]}
                >
                  <Input placeholder="Longitude" disabled />
                </Form.Item>
                <Form.Item
                  name="latitude"
                  rules={[{ required: true, message: "Latitude is required" }]}
                >
                  <Input placeholder="Latitude" disabled />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col md={12} sm={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Description is required" }]}
            >
              <Input placeholder="Enter description of location" />
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item
              label="Compass Direction"
              name="compass"
              // rules={[{ required: true, message: "Compass is required" }]}
            >
              <Input
                style={{ width: "75%" }}
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
            <Form.Item
              label="Weather"
              name="weather"
              rules={[{ required: true, message: "Weather is required" }]}
            >
              <Select defaultValue="Cloudy">
                <Select.Option value="Cloudy">Cloudy</Select.Option>
                <Select.Option value="Sunny">Sunny</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item label="Submit">
              <Button type="primary" htmlType="submit">
                Upload
              </Button>
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
              </div>
            ))}
        </div>
      </Form>
    </div>
  );
};

export default InputForm;
