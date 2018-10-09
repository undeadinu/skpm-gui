import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import configureStore from './store';

import App from './components/App';
import NodeProvider from './components/NodeProvider';
import DevTools from './components/DevTools';

import './global-styles';

const store = configureStore();

const root = document.getElementById('root');

ReactDOM.render(
  <Provider store={store}>
    <DragDropContextProvider backend={HTML5Backend}>
      <NodeProvider>
        <Fragment>
          <App />
          <DevTools />
        </Fragment>
      </NodeProvider>
    </DragDropContextProvider>
  </Provider>,
  root
);
