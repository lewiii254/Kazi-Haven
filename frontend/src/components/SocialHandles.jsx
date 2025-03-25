import React from "react";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { FiGlobe } from "react-icons/fi";

const SocialHandles = () => {
  return (
    <div className="flex space-x-4">
      <a
        href="https://lewiii254.github.io/Portfolio/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl hover:text-blue-500 transition"
      >
        <FiGlobe />
      </a>
      <a
        href="mailto:ngondimarklewis@gmail.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl hover:text-blue-500 transition"
      >
        <IoMdMail />
      </a>
      <a
        href="https://x.com/LewiiiTheG"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl hover:text-blue-400 transition"
      >
        <FaTwitter />
      </a>
      <a
        href="https://www.linkedin.com/in/marklewis-ngondi254/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl hover:text-blue-600 transition"
      >
        <FaLinkedin />
      </a>
      <a
        href="https://github.com/lewiii254"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl hover:text-gray-400 transition"
      >
        <FaGithub />
      </a>
    </div>
  );
};

export default SocialHandles;
