import React from "react";

import './Stepper.css';

const Stepper = () => {
  return (
    <div id="stepper">
      <div class="steps">
        <div class="back">Back</div>
        <div class="step">
          <p>1. Input</p>
          <hr />
        </div>
        <div class="step">
          <p>2. Feature Extraction</p>
          <hr />
        </div>
        <div class="step">
          <p>3. Results</p>
          <hr />
        </div>
      </div>
      <hr />
    </div>
  );
};

export default Stepper;
