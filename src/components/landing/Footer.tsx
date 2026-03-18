import { Instagram, Youtube, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="py-12 border-t border-white/10"
      style={{ backgroundColor: "#171717" }}
    >
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          
          <div>
            <div className="text-2xl font-bold text-white mb-4">
              SupplyDesk
            </div>
            <div className="flex items-center space-x-2 text-white/70">
              <span>📧</span>
              <span>support@supplydesk.com</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Links</h4>
            <div className="space-y-2 text-white/70">
              <div>
                <a href="#how-it-works" className="hover:text-purple-500 transition-colors">
                  How it works
                </a>
              </div>
              <div>
                <a href="#about" className="hover:text-purple-500 transition-colors">
                  About us
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-purple-500 transition-colors">
                  AI Powered Solutions
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-purple-500 transition-colors">
                  Real Results
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <div className="space-y-2 text-white/70">
              <div>
                <a href="#" className="hover:text-purple-500 transition-colors">
                  About us
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-purple-500 transition-colors">
                  Terms & Conditions
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-purple-500 transition-colors">
                  Privacy Policy
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-purple-500 transition-colors">
                  FAQ's
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Follow us on</h4>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors cursor-pointer">
                <Instagram className="w-5 h-5" />
              </div>

              <div className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors cursor-pointer">
                <Youtube className="w-5 h-5" />
              </div>

              <div className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors cursor-pointer">
                <Facebook className="w-5 h-5" />
              </div>

              <div className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors cursor-pointer">
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