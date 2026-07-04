import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// --scroll-progress is set by SmoothScroll.tsx, which already branches on device type
// (Lenis's own scroll callback on desktop, a plain scroll listener on touch/reduced-motion) —
// this used to duplicate that with a third, always-on listener computing the same value.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
