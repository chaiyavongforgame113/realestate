import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { PropertyTypes } from "@/components/property-types";
import { FeaturedListings } from "@/components/featured-listings";
import { PopularAreas } from "@/components/popular-areas";
import { WhyAI } from "@/components/why-ai";
import { AgentCTA } from "@/components/agent-cta";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <PropertyTypes />
      <FeaturedListings />
      <PopularAreas />
      <WhyAI />
      <AgentCTA />
      <Footer />
    </main>
  );
}
