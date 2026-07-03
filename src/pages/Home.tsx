import { Suspense, lazy } from 'react';
import Nav from '../components/site/Nav';
import Hero from '../components/site/Hero';
import Marquee from '../components/site/Marquee';
import Clients from '../components/site/Clients';
import Manifesto from '../components/site/Manifesto';
import WhyUs from '../components/site/WhyUs';
import SelectedWork from '../components/site/SelectedWork';
import About from '../components/site/About';
import Process from '../components/site/Process';
import Results from '../components/site/Results';
import Pricing from '../components/site/Pricing';
import Testimonials from '../components/site/Testimonials';
import Footer from '../components/site/Footer';

// Lazy-loaded: QuoteForm pulls in the Supabase client, which the Hero doesn't need at all.
// Keeping it off the initial bundle means less JS blocking first paint — it's the last
// section on the page anyway, so there's no visible cost to fetching it a beat later.
const QuoteForm = lazy(() => import('../components/site/QuoteForm'));

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Clients />
        <Manifesto />
        <WhyUs />
        <SelectedWork />
        <About />
        <Process />
        <Results />
        <Pricing />
        <Testimonials />
        <Suspense fallback={<div style={{ minHeight: 600 }} />}>
          <QuoteForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
