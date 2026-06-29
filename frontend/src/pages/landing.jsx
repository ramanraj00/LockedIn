import Navbar from "../components/common/Navbar";
import Hero from "../components/hero/hero";
import InteractiveDropdownDashboard from "../components/dropwdown/dropdownCrad";
import PerformanceDashboard from "@/components/dropwdown/feature";
import StatSection from "../components/dropwdown/StatSection";

function Landing() {
  return (
    /* MAIN WRAPPER - SINGLE CONTINUOUS BACKGROUND */ 
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0f1026] via-[#17193b] to-[#2c3599] relative overflow-hidden">
      
      {/* FIXED BLUR EFFECTS - ONCE FOR ENTIRE PAGE */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[15%] -left-[10%] w-[500px] h-[500px] bg-indigo-500/15 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-purple-500/10 blur-[140px]" />
      </div>
      
      {/* HERO SECTION - TRANSPARENT */}
      <div className="relative z-10 w-full">
        <Navbar />
        <Hero />
      </div>
      
      {/* ⚡ NEXT SECTION - SAME TRANSPARENT BACKGROUND */}
      <div className="relative z-10 w-full">
       
        {/* YAHAN SE GEOMETRIC GRID PATTERN WALA DIV REMOVE KAR DIYA HAI */}
        
        {/* 👇 YAHAN GAP 3-4rem (gap-10 and gap-24) LAGA HAI 👇 */}
        <div className="relative z-20 w-full pt-8 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-10 sm:gap-24">
          <InteractiveDropdownDashboard /> 
          <StatSection/>
          <PerformanceDashboard />
        </div>
        
      </div>
    </div>
  );
}

export default Landing;