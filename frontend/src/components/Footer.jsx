import { Facebook, Twitter, Github, Globe } from "lucide-react";
import SocialHandles from "./SocialHandles";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-6">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Marklewis Mutugi. All rights reserved.
        </p>
        <SocialHandles />
      </div>
    </footer>
  );
};

export default Footer;
