import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Intro } from "@/components/Intro";
import { Features } from "@/components/Features";
import { Process } from "@/components/Process";
import { Checklist } from "@/components/Checklist";
import { Stats } from "@/components/Stats";
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
        <Checklist />
        <Stats />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
