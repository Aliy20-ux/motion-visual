import { Suspense, lazy, useEffect } from 'react';
import Nav from '../components/site/Nav';
import Hero from '../components/site/Hero';
import Marquee from '../components/site/Marquee';
import Clients from '../components/site/Clients';
import Manifesto from '../components/site/Manifesto';
import WhyUs from '../components/site/WhyUs';
import SelectedWork from '../components/site/SelectedWork';
import Testimonials from '../components/site/Testimonials';
import About from '../components/site/About';
import Process from '../components/site/Process';
import Pricing from '../components/site/Pricing';
import AddOns from '../components/site/AddOns';
import FAQ from '../components/site/FAQ';
import Footer from '../components/site/Footer';
import AssistantGate from '../components/site/AssistantGate';
import WhenNear from '../components/site/WhenNear';
import { scrollToTarget } from '../lib/smoothScroll';

// Lazy-loaded, and only mounted when the visitor scrolls near (WhenNear): QuoteForm pulls in the Supabase client, which the Hero doesn't need at all.
// Keeping it off the initial bundle means less JS blocking first paint — it's the last
// section on the page anyway, so there's no visible cost to fetching it a beat later.
const QuoteForm = lazy(() => import('../components/site/QuoteForm'));
// Same reason: the Flagship enquiry shares the quote form's fields and Supabase client.
const Flagship = lazy(() => import('../components/site/Flagship'));

export default function Home() {
  // Opening the page at /#quote or /#flagship: the sections render after the browser's own jump has already run, so do it ourselves.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.length < 2) return undefined;
    const t = setTimeout(() => {
      try {
        scrollToTarget(hash);
      } catch {
        // a hash that isn't a valid selector: nothing to scroll to
      }
    }, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <Marquee />
        <Clients />
        <Manifesto />
        <WhyUs />
        <SelectedWork />
        <Testimonials />
        <About />
        <Process />
        <Pricing />
        <AddOns />
        <WhenNear id="flagship" heights={[1500, 1311, 980]}>
          <Suspense fallback={<div style={{ minHeight: 600 }} />}>
            <Flagship />
          </Suspense>
        </WhenNear>
        <FAQ />
        <WhenNear id="quote" heights={[1400, 1261, 940]}>
          <Suspense fallback={<div style={{ minHeight: 600 }} />}>
            <QuoteForm />
          </Suspense>
        </WhenNear>
      </main>
      <Footer />
      <AssistantGate />
    </>
  );
}
