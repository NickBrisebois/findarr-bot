import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { WebConfig } from './WebConfig';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <React.StrictMode>
    <WebConfig />
  </React.StrictMode>,
  document.getElementById('root')
);
