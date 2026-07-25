import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Intro } from "@/components/Intro";
import { Features } from "@/components/Features";
import { Process } from "@/components/Process";
import { InstallationPricing } from "@/components/InstallationPricing";
import { LawnCalculator } from "@/components/LawnCalculator";
import { MowerAdvisor } from "@/components/MowerAdvisor";
import { Checklist } from "@/components/Checklist";
import { Feilsoking } from "@/components/Feilsoking";
import { Testimonials } from "@/components/Testimonials";
import { Stats } from "@/components/Stats";
import { Faq } from "@/components/Faq";
import { Booking } from "@/components/Booking";
import { Cta } from "@/components/Cta";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Intro />
        <Features />
        <Process />
        <InstallationPricing />
        <LawnCalculator />
        <MowerAdvisor />
        <Checklist />
        <Feilsoking />
        <Testimonials />
        <Stats />
        <Faq />
        <Booking />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
