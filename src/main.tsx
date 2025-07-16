import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Apply a Tailwind class to confirm it's working (optional visual test)
const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.className = 'bg-gray-100 min-h-screen'; // 👈 optional test styling
}

createRoot(rootElement!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
