import React, { Component } from "react";

import Camera from "./Camera";

import "./App.css";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alpha: null,
      beta: null,
      gama: null,
    };
  }

  componentDidMount = () => {
    // https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (e) => {
        this.setState({ alpha: e.alpha, beta: e.beta, gamma: e.gamma });
      }, true);
    } else {
      alert("Sorry, your browser doesn't support Device Orientation");
    }
  };

  render() {
    const { alpha, beta, gamma } = this.state;

    return (
      <div id="app">
        <Camera />
        {alpha && beta && gamma ? (
          <div>
            <h4>Orientation</h4>
            <p>Alpha: {alpha}</p>
            <p>Beta: {beta}</p>
            <p>Gamma: {gamma}</p>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  }
}
