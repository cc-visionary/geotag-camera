import React, { Component } from "react";

import Camera from "./Camera";

import "./App.css";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div id="app">
        <Camera />
      </div>
    );
  }
}
