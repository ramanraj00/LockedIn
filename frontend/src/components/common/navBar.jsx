import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600"
        >
          Placement Portal
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>

          <Link
            to="/drives"
            className="hover:text-blue-600"
          >
            Placement Drives
          </Link>

          <Link
            to="/companies"
            className="hover:text-blue-600"
          >
            Companies
          </Link>

          <Link
            to="/about"
            className="hover:text-blue-600"
          >
            About
          </Link>

          <Link
            to="/contact"
            className="hover:text-blue-600"
          >
            Contact
          </Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden gap-3 md:flex">
          <Button variant="outline">
            Login
          </Button>

          <Button>
            Register
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right">
            <div className="mt-8 flex flex-col gap-6">

              <Link to="/">Home</Link>

              <Link to="/drives">
                Placement Drives
              </Link>

              <Link to="/companies">
                Companies
              </Link>

              <Link to="/about">
                About
              </Link>

              <Link to="/contact">
                Contact
              </Link>

              <Button variant="outline">
                Login
              </Button>

              <Button>
                Register
              </Button>

            </div>
          </SheetContent>
        </Sheet>

      </div>
    </nav>
  );
}

export default Navbar;