import { Github, Twitter, Globe, Mail, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 py-10 mt-12 text-sm">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Section */}
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">About KaziHaven</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            KaziHaven is your go-to platform for discovering career opportunities, connecting with employers, and taking your professional journey to the next level.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/jobs" className="hover:text-blue-500 text-gray-600 dark:text-gray-400">Find Jobs</a></li>
            <li><a href="/companies" className="hover:text-blue-500 text-gray-600 dark:text-gray-400">Top Companies</a></li>
            <li><a href="/about" className="hover:text-blue-500 text-gray-600 dark:text-gray-400">About Us</a></li>
            <li><a href="/contact" className="hover:text-blue-500 text-gray-600 dark:text-gray-400">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Contact</h3>
          <ul className="text-gray-600 dark:text-gray-400 space-y-1">
            <li>Email: <a href="mailto:info@kazihaven.com" className="hover:text-blue-500">info@kazihaven.com</a></li>
            <li>Location: Nairobi, Kenya</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Follow Us</h3>
          <div className="flex gap-4 mt-2">
            <a href="https://marklewis-verse-folio.vercel.app/" className="hover:text-blue-500 text-gray-600 dark:text-gray-400"><Globe size={20} /></a>
            <a href="mailto:ngondimarklewis@gmail.com" className="hover:text-red-500 text-gray-600 dark:text-gray-400"><Mail size={20} /></a>
            <a href="https://x.com/LewiiiTheG" className="hover:text-blue-400 text-gray-600 dark:text-gray-400"><Twitter size={20} /></a>
            <a href="#" className="hover:text-blue-700 text-gray-600 dark:text-gray-400"><Linkedin size={20} /></a>
            <a href="https://github.com/lewiii254" className="hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-400"><Github size={20} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-8 border-t pt-4 border-gray-300 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
        © {currentYear} Marklewis Mutugi • KaziHaven. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
