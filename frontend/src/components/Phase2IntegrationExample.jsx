import React, { useEffect } from "react";
import { AdvancedFilterCard } from "./AdvancedFilterCard";
import { NotificationCenter } from "./NotificationCenter";
import { EnhancedProfile } from "./EnhancedProfile";
import { useAnalytics } from "../utils/analytics";
import { useSelector } from "react-redux";

// Example component showing how the new Phase 2 features work together
const Phase2IntegrationExample = () => {
  const analytics = useAnalytics();
  const { user } = useSelector(store => store.auth);

  useEffect(() => {
    // Track page view when component mounts
    analytics.trackPageView('/phase2-demo');
    
    // Example: Track that user viewed the Phase 2 features
    if (user) {
      analytics.trackEvent('feature_demo_view', {
        features: ['advanced_filtering', 'notifications', 'enhanced_profile', 'analytics'],
        userId: user.id
      });
    }
  }, [analytics, user]);

  const handleFilterChange = (filters) => {
    // Track when users interact with advanced filters
    analytics.trackFilterUse(filters);
    console.log('Filters applied:', filters);
  };

  const handleJobView = (jobId) => {
    // Track job views for analytics
    analytics.trackJobView(jobId, 'Sample Job Title', 'sample-company-id');
    console.log('Job viewed:', jobId);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🚀 Phase 2 Features Showcase
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Experience the enhanced Kazi Haven with advanced filtering, real-time notifications, 
          comprehensive user profiles, and powerful analytics integration.
        </p>
      </div>

      {/* Navigation Header with Notifications */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">KaziHaven Dashboard</h2>
            <span className="text-sm text-gray-500">Welcome back, {user?.fullName || 'Guest'}!</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification Center Integration */}
            <NotificationCenter />
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Advanced Filtering Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Smart Job Filters</h3>
            <AdvancedFilterCard onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Job Search Results with Analytics */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
            <h3 className="text-xl font-semibold mb-4">Job Search Results</h3>
            <div className="space-y-4">
              {/* Sample Job Cards with Analytics Tracking */}
              {[1, 2, 3].map((jobId) => (
                <div 
                  key={jobId}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleJobView(`job-${jobId}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-lg">Software Engineer {jobId}</h4>
                      <p className="text-gray-600 dark:text-gray-400">Sample Company {jobId}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        📍 Nairobi • 💰 KSH 150,000 - 250,000 • ⏰ 2 days ago
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          analytics.trackJobBookmark(`job-${jobId}`, 'bookmark');
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ❤️
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          analytics.trackJobShare(`job-${jobId}`, 'copy-link');
                        }}
                        className="text-gray-400 hover:text-blue-500"
                      >
                        🔗
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-xs">
                      React
                    </span>
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs">
                      Node.js
                    </span>
                    <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded text-xs">
                      Full-time
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Dashboard Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
            <h3 className="text-xl font-semibold mb-4">Your Activity Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Jobs Viewed</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">8</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Applications Sent</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Profile Views</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Profile Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold mb-4">Your Enhanced Profile</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your profile is now enhanced with skills assessments, projects, achievements, and career preferences.
          Complete your profile to get better job matches!
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">85%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Profile Complete</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">6</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Skills Added</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">3</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Projects Listed</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">2</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
            </div>
          </div>
          <button 
            onClick={() => {
              analytics.trackPageView('/profile/edit');
              // Navigate to enhanced profile page
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Edit Enhanced Profile
          </button>
        </div>
      </div>

      {/* Feature Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">✨ Phase 2 Features Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl mb-2">🔍</div>
            <h4 className="font-medium mb-1">Advanced Filtering</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Salary ranges, experience levels, company size, and saved searches
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl mb-2">🔔</div>
            <h4 className="font-medium mb-1">Smart Notifications</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time job matches, application updates, and custom preferences
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl mb-2">👤</div>
            <h4 className="font-medium mb-1">Enhanced Profiles</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Skills assessments, projects, achievements, and career preferences
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-medium mb-1">Analytics Integration</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              User behavior tracking, job performance metrics, and insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase2IntegrationExample;