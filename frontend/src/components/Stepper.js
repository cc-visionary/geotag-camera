import { Steps } from "antd";
import React from "react";

import "../styles/components/Stepper.css";

const Stepper = () => {
  return (
    <Steps
      current={0}
      items={[
        { title: "Input" },
        { title: "Feature Extraction" },
        { title: "Results" },
      ]}
    />
  );
};

export default Stepper;
