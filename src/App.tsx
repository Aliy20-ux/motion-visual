import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import SmoothScroll from './components/layout/SmoothScroll';
import CustomCursor from './components/layout/CustomCursor';
import Home from './pages/Home';

// Lazy-loaded: Admin isn't needed for the homepage and pulls in the whole Supabase client —
// keeping it out of the initial bundle means less JS to download/parse before the Hero
// (and its video) can render on first load.
const Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <CustomCursor />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/admin"
              element={
                <Suspense fallback={null}>
                  <Admin />
                </Suspense>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <Suspense fallback={null}>
                  <Admin />
                </Suspense>
              }
            />
          </Routes>
        </AnimatePresence>
      </SmoothScroll>
    </BrowserRouter>
  );
}
