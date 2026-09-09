import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, MotionConfig } from 'motion/react';
import SmoothScroll from './components/layout/SmoothScroll';
import CustomCursor from './components/layout/CustomCursor';
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

const ease = [0.16, 1, 0.3, 1] as const;

export default function App() {
  return (
    <BrowserRouter>
      {/* reducedMotion="user": the CSS kill-switch in index.css only reaches CSS
          animations — Motion drives inline styles from JS and ignores it. This makes
          every transform animation snap to its end state for reduced-motion users
          while opacity fades (which aid comprehension) still play. */}
      <a href="#main-content" className="skip-link">Skip to content</a>
      <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <CustomCursor />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
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
      </MotionConfig>
    </BrowserRouter>
  );
}
