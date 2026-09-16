import { Navigation } from "@/components/navigation/navigation";
import { Hero } from "@/components/sections/hero";
import { Journey } from "@/components/sections/journey";
import { Build } from "@/components/sections/build";
import { Projects } from "@/components/sections/projects";
import { Capabilities } from "@/components/sections/capabilities";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/navigation/footer";

export default function Home() {
  return <div className="portfolio-shell"><Navigation /><main id="main-content"><Hero /><Journey /><Build /><Projects /><Capabilities /><Contact /></main><Footer /></div>;
}
