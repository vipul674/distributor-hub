import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LoginSignupDialog from "./LoginSignupDialog";

const LandingNavigation = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed top-0 w-full z-50 backdrop-blur-md border-b-md border-border/50"
        style={{ padding: "25px 0 0 10px" }}
      >
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-foreground">
              SupplyDesk
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#how-it-works"
                className="text-foreground hover:text-primary transition-colors"
              >
                How it works
              </a>
              <a
                href="#about"
                className="text-foreground hover:text-primary transition-colors"
              >
                About us
              </a>
            </div>

            <Button
              variant="nav"
              size="default"
              className="px-6"
              onClick={() => setAuthOpen(true)}
            >
              Login/Signup
            </Button>
          </div>
        </div>
      </nav>
      <LoginSignupDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default LandingNavigation;
