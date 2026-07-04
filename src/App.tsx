import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'motion/react';
import SmoothScroll from './components/layout/SmoothScroll';
import CustomCursor from './components/layout/CustomCursor';
import Home from './pages/Home';

const ease = [0.16, 1, 0.3, 1] as const;

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <CustomCursor />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>

        {/* Global fade-in on first load — sits above everything (including Nav) so the
            whole site appears as one deliberate reveal, not a hard cut once assets resolve. */}
        <motion.div
          className="fixed inset-0 z-[999] pointer-events-none"
          style={{ background: '#0A0A0B' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.05 }}
        />
      </SmoothScroll>
    </BrowserRouter>
  );
}
