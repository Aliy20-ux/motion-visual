import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import SmoothScroll from './components/layout/SmoothScroll';
import CustomCursor from './components/layout/CustomCursor';
import Home from './pages/Home';

const ease = [0.16, 1, 0.3, 1] as const;

// Lazy-loaded: Admin isn't needed for the homepage and pulls in the whole Supabase client —
// keeping it out of the initial bundle means less JS to download/parse before the Hero
// (and its video) can render on first load.
const Admin = lazy(() => import('./pages/Admin'));

// Shared fade wrapper for every route — AnimatePresence only animates a transition when
// the thing it's presenting actually has initial/animate/exit props; without this, routes
// swapped instantly regardless of the AnimatePresence around them.
function PageFade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageFade><Home /></PageFade>} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <PageFade><Admin /></PageFade>
            </Suspense>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <Suspense fallback={null}>
              <PageFade><Admin /></PageFade>
            </Suspense>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <CustomCursor />
        <AnimatedRoutes />

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
