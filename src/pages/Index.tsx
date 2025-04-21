
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Pricing from "@/components/home/Pricing";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";
import Contact from "@/components/home/Contact";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <div id="features"><Features /></div>
        <div id="pricing"><Pricing /></div>
        <Testimonials />
        <FAQ />
        <div id="contact"><Contact /></div>
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
