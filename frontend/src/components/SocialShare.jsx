import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Link, Check } from 'lucide-react';
import { Button } from './ui/button';

const SocialShare = ({ jobTitle, jobUrl, companyName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = jobUrl || window.location.href;
  const shareText = `Check out this job opportunity: ${jobTitle} at ${companyName}`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 min-w-48">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Share this job</h4>
          
          <div className="space-y-2">
            <button
              onClick={() => handleShare('linkedin')}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-left"
            >
              <Linkedin className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700 dark:text-gray-300">LinkedIn</span>
            </button>
            
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-left"
            >
              <Twitter className="h-5 w-5 text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">Twitter</span>
            </button>
            
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-left"
            >
              <Facebook className="h-5 w-5 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Facebook</span>
            </button>
            
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-left"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Link className="h-5 w-5 text-gray-500" />
              )}
              <span className="text-gray-700 dark:text-gray-300">
                {copied ? 'Copied!' : 'Copy Link'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialShare;