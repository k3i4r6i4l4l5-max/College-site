import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { DATA_SOURCE } from '../shared/api/client';
import { setMockHandler } from '../shared/api/request';
import { applySettings, readSettings } from '../entities/user';
import './styles.css';

async function start() {
  if (DATA_SOURCE === 'mock') {
    const { mockRequest } = await import('./mockBackend');
    setMockHandler(mockRequest);
  }
  applySettings(readSettings());
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <HashRouter><App /></HashRouter>
    </React.StrictMode>,
  );
}

start();
