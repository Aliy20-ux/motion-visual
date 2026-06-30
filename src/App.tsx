import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import SmoothScroll from './components/layout/SmoothScroll';
import CustomCursor from './components/layout/CustomCursor';
import Home from './pages/Home';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <CustomCursor />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<Admin />} />
          </Routes>
        </AnimatePresence>
      </SmoothScroll>
    </BrowserRouter>
  );
}
