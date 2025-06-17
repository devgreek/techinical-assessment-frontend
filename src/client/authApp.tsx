import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './components/App';
import './authStyles.css';

// This is a standalone entry point for the auth app
// It can be used outside of the notebook renderer context
const root = document.getElementById('root');

if (root) {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    root
  );
}
