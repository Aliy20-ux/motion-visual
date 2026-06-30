import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Drive the CSS scroll-progress bar via a custom property (no React needed)
function initScrollProgress() {
  const update = () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    document.documentElement.style.setProperty('--scroll-progress', String(pct));
  };
  window.addEventListener('scroll', update, { passive: true });
}
initScrollProgress();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
