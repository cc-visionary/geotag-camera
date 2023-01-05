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
  Spin,
  InputNumber,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { green, red } from "@ant-design/colors";

import { Camera } from ".";
import { MetadataService, S3Service } from "../services";

import "../styles/components/InputForm.css";

const InputForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [deviceType, setDeviceType] = useState(null);

  // permissions are set to false by default
  const [cameraPermission, setCameraPermission] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [deviceOrientationPermission, setDeviceOrientationPermission] =
    useState(false);

  // 0 - not taking a picture | 1 - tracking compass
  const [isTakingCompass, setIsTakingCompass] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    setIsLoading(false);
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
    if ("geolocation" in navigator) {
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
    } else message.error("Device does not support geolocation");
  };

  /**
   * Triggered when user requests permission to access orientation of device
   */
  const requestDeviceOrientation = () => {
    // start compass
    if (deviceType === "Android") {
      window.addEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true
      );
      setDeviceOrientationPermission(true);
    } else message.error("Device is not supported...");
  };

  /**
   * Handles Device Orientation
   * - Updates alpha value (compass)
   */
  const handleOrientation = (event) => {
    const { alpha, webkitCompassHeading } = event;
    const compass = webkitCompassHeading || Math.abs(alpha - 360);

    console.log(compass);
    if(isTakingCompass) form.setFieldValue("compass", compass);
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
    setIsLoading(true);

    const directory = "data_gathering";
    const fileType = values["image"].name.split(".")[1];
    const fileName = Math.random().toString(16).slice(2) + `.${fileType}`;

    S3Service.getPresignedURL(directory + "/" + fileName, fileType)
      .then((result) => {
        // retrieves the pre-signed URLs to be able to upload the image (securely)
        const { presigned_url } = result.data;

        S3Service.uploadImage(presigned_url, values["image"])
          .then(() => {
            // if successful, upload the metadata to mongodb
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
                form.setFieldsValue({
                  weather: "Sunny",
                });
                message.success("Image has successfully been uploaded");
                setIsLoading(false);
              })
              .catch((err) => {
                message.error(err.response.data.error.message);
                setIsLoading(false);
              });
          })
          .catch(() => {
            message.error("Error uploading image to S3");
            setIsLoading(false);
          });
      })
      .catch(() => {
        message.error("Error generating pre-signed URL for S3");
        setIsLoading(false);
      });
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
      <Spin
        spinning={isLoading}
        indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />}
        tip="Uploading"
        size="large"
      >
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
                    background: locationPermission
                      ? green.primary
                      : red.primary,
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
                  form={form}
                  disabled={
                    !(
                      cameraPermission &&
                      locationPermission &&
                      deviceOrientationPermission &&
                      deviceType === "Android"
                    )
                  }
                />
              </Form.Item>
            </Col>
            <Col md={12} sm={24}>
              <Form.Item label="Geolocation Coordinates">
                <Input.Group compact>
                  <Form.Item
                    name="longitude"
                    rules={[
                      { required: true, message: "Longitude is required" },
                    ]}
                  >
                    <Input placeholder="Longitude" disabled />
                  </Form.Item>
                  <Form.Item
                    name="latitude"
                    rules={[
                      { required: true, message: "Latitude is required" },
                    ]}
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
              <Form.Item label="Compass Direction">
                <Input.Group compact>
                  <Form.Item
                    name="compass"
                    rules={[
                      {
                        required: true,
                        message: "Compass Direction is required",
                      },
                    ]}
                  >
                    <InputNumber placeholder="Degrees" min={0} max={359.9} disabled />
                  </Form.Item>
                  <Button
                    onClick={() => setIsTakingCompass(!isTakingCompass)}
                    disabled={!deviceOrientationPermission}
                  >
                    {isTakingCompass ? "Stop" : "Start"}
                  </Button>
                </Input.Group>
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
        </Form>
      </Spin>
    </div>
  );
};

export default InputForm;
