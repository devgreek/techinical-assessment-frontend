import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import './authStyles.css';

import { Provider } from 'react-redux';
import { store } from './store';
import App from './components/App';

// ----------------------------------------------------------------------------
// This is the entrypoint to the notebook renderer's webview client-side code.
// This contains some boilerplate that calls the `render()` function when new
// output is available. You probably don't need to change this code; put your
// rendering logic inside of the `render()` function.
// ----------------------------------------------------------------------------

export const activate = (context: unknown) => {
	return {
		// Render our Redux auth app
		render: (
			<Provider store={store}>
				<App />
			</Provider>
		)
	};
};
