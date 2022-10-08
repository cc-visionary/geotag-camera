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

  render() {
    const { alpha, beta, gamma } = this.state;

    return (
      <div id="app">
        <Camera />
      </div>
    );
  }
}
