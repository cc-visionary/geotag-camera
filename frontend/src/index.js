import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './pages';

import 'antd/dist/reset.css';
import './styles/index.css';

window.Buffer = window.Buffer || require("buffer").Buffer;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);