import Nav from '../components/site/Nav';
import Hero from '../components/site/Hero';
import Marquee from '../components/site/Marquee';
import Manifesto from '../components/site/Manifesto';
import WhyUs from '../components/site/WhyUs';
import SelectedWork from '../components/site/SelectedWork';
import Results from '../components/site/Results';
import Testimonials from '../components/site/Testimonials';
import QuoteForm from '../components/site/QuoteForm';
import Footer from '../components/site/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Manifesto />
        <WhyUs />
        <SelectedWork />
        <Results />
        <Testimonials />
        <QuoteForm />
      </main>
      <Footer />
    </>
  );
}
