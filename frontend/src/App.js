import React, { Component } from "react";

import Navbar from "./Navbar";
import Stepper from "./Stepper";
import InputForm from "./InputForm";

import "./App.css";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {

    return (
      <div id="app">
        <hr className="v-left" />
        <hr className="v-right" />
        <hr className="h-top" />
        <hr className="h-bottom" />
        <Navbar />
        <Stepper />
        <InputForm />
      </div>
    );
  }
}
