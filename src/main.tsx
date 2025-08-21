import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { clearEnrollmentRateLimiting } from "./utils/clearRateLimiting";

// Clear any existing rate limiting on app start
clearEnrollmentRateLimiting();

createRoot(document.getElementById("root")!).render(<App />);
