import Navbar from "../components/common/Navbar";
import Hero from "../components/hero/hero";
import InteractiveDropdownDashboard from "../components/dropwdown/dropdownCrad";
import PerformanceDashboard  from "@/components/dropwdown/feature";

function Landing() {
  return (
    /* 🔥 MAIN WRAPPER - SINGLE CONTINUOUS BACKGROUND */
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0f1026] via-[#17193b] to-[#2c3599] relative overflow-hidden">
      
      {/* FIXED BLUR EFFECTS - ONCE FOR ENTIRE PAGE */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[15%] -left-[10%] w-[500px] h-[500px] bg-indigo-500/15 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-purple-500/10 blur-[140px]" />
      </div>

      {/* 🎯 HERO SECTION - TRANSPARENT */}
      <div className="relative z-10 w-full">
        <Navbar />
        <Hero />
      </div>

      {/* ⚡ NEXT SECTION - SAME TRANSPARENT BACKGROUND */}
      <div className="relative z-10 w-full ">
        
        {/* Grid pattern - Optional overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_95%)] pointer-events-none" />

        {/* 👇 YAHAN GAP 3-4rem (gap-12 and gap-16) LAGA DIYA HAI 👇 */}
        <div className="relative z-20 w-full pt-8 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-12 sm:gap-24">
          
          <InteractiveDropdownDashboard />
          
          <PerformanceDashboard/>
          
        </div>
        
      </div>

    </div>
  );
}

export default Landing;