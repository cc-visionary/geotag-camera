import React, { Component } from "react";

import { Navbar, Stepper, InputForm } from '../components'

import "../styles/pages/App.css";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div>
        <div id="app">
          <Navbar />
          {/* <Stepper /> */}
          <InputForm />
        </div>
      </div>
    );
  }
}
