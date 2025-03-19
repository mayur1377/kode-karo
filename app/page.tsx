import HomeComponent from "../app/components/Home";
import Header from "./components/Header";
import { SiteFooter } from "./components/SiteFooter";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <div className="flex items-center justify-center">
        <HomeComponent />
      </div>
      <SiteFooter />
    </div>
  );
}
