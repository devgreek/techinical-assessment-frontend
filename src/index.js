import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './client/store';
import App from './client/components/App';
import './client/authStyles.css';

// This is the entry point for React Scripts
// It renders our auth application in the root div
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
