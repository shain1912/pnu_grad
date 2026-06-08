import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './fonts.js'; // 로컬 번들 폰트(폐쇄망 대응) — CSS 보다 먼저
import './tailwind.css'; // 변형용 Tailwind + 레이어 순서 고정 — styles.css 보다 먼저 import
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
