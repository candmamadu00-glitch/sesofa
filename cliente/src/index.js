import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // Importamos o arquivo
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// MUDANÇA AQUI: Alteramos para .register() para permitir a instalação e modo offline
serviceWorkerRegistration.register();

// Se quiser medir performance:
reportWebVitals();