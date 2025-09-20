import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Import CSS here
import "./assets/css/style.css"
import { Toaster } from "react-hot-toast";

ReactDOM.render(
  <React.StrictMode>
    <App />
    <Toaster position="top-center" />

  </React.StrictMode>,

  document.getElementById('root')
);