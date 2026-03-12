import { Instagram, Youtube, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="py-12 border-t border-border/50"
      style={{ backgroundColor: "#171717" }}
    >
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold text-foreground mb-4">
              SupplyDesk
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span>📧</span>
              <span>support@supplydesk.com</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Links</h4>
            <div className="space-y-2 text-muted-foreground">
              <div>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  How it works
                </a>
              </div>
              <div>
                <a href="#about" className="hover:text-foreground transition-colors">
                  About us
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-foreground transition-colors">
                  AI Powered Solutions
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-foreground transition-colors">
                  Real Results
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <div className="space-y-2 text-muted-foreground">
              <div>
                <a href="#" className="hover:text-foreground transition-colors">
                  About us
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms & Conditions
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-foreground transition-colors">
                  FAQ's
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Follow us on</h4>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                <Instagram className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                <Youtube className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                <Facebook className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                <Twitter className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
