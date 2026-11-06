import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../src/App.jsx';
import '../src/style.css';
createRoot(document.getElementById('root')).render(<App extraPage={path => path === '/test/protected' ? <h1>Protected test page</h1> : null} />);
