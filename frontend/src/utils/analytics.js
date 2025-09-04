// Analytics tracking utility
import axios from 'axios';

const ANALYTICS_API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

class AnalyticsTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupPageTracking();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setupPageTracking() {
    // Track page views automatically
    if (typeof window !== 'undefined') {
      // Track initial page load
      this.trackPageView(window.location.pathname);

      // Track page changes (for SPAs)
      let lastUrl = location.href;
      new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          this.trackPageView(window.location.pathname);
        }
      }).observe(document, { subtree: true, childList: true });
    }
  }

  async trackEvent(eventType, eventData = {}, deviceInfo = null, location = null) {
    try {
      const payload = {
        eventType,
        eventData: {
          ...eventData,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          path: window.location.pathname
        },
        deviceInfo: deviceInfo || this.getDeviceInfo(),
        location: location || await this.getLocationInfo()
      };

      await axios.post(
        `${ANALYTICS_API}/api/analytics/track`,
        payload,
        {
          headers: {
            'X-Session-ID': this.sessionId,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
      // Don't throw errors for analytics failures
    }
  }

  getDeviceInfo() {
    if (typeof window === 'undefined') return {};

    const userAgent = navigator.userAgent;
    let deviceType = 'desktop';
    let browser = 'unknown';
    let os = 'unknown';

    // Detect device type
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      deviceType = 'mobile';
    }

    // Detect browser
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // Detect OS
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return { type: deviceType, browser, os };
  }

  async getLocationInfo() {
    // For privacy reasons, we'll only get basic location info
    // In a production app, you might use a geolocation service
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city,
        coordinates: {
          lat: data.latitude,
          lng: data.longitude
        }
      };
    } catch {
      return { country: 'Unknown', city: 'Unknown' };
    }
  }

  // Specific tracking methods
  trackPageView(page) {
    this.trackEvent('page_view', { page });
  }

  trackJobView(jobId, jobTitle, companyId) {
    this.trackEvent('job_view', { 
      job: jobId, 
      jobTitle,
      company: companyId 
    });
  }

  trackJobSearch(query, filters = {}) {
    this.trackEvent('job_search', { 
      searchQuery: query,
      filters 
    });
  }

  trackJobApplication(jobId, applicationId) {
    this.trackEvent('job_apply', { 
      job: jobId,
      application: applicationId 
    });
  }

  trackProfileView(profileUserId) {
    this.trackEvent('profile_view', { 
      profileUser: profileUserId 
    });
  }

  trackCompanyView(companyId, companyName) {
    this.trackEvent('company_view', { 
      company: companyId,
      companyName 
    });
  }

  trackFilterUse(filters) {
    this.trackEvent('filter_use', { filters });
  }

  trackJobBookmark(jobId, action = 'bookmark') {
    this.trackEvent('bookmark_job', { 
      job: jobId,
      action // 'bookmark' or 'unbookmark'
    });
  }

  trackJobShare(jobId, platform) {
    this.trackEvent('share_job', { 
      job: jobId,
      platform 
    });
  }

  trackUserSignup(userId, method = 'email') {
    this.trackEvent('user_signup', { 
      userId,
      method 
    });
  }

  trackUserLogin(userId, method = 'email') {
    this.trackEvent('user_login', { 
      userId,
      method 
    });
  }

  trackJobPost(jobId, companyId) {
    this.trackEvent('job_post', { 
      job: jobId,
      company: companyId 
    });
  }

  trackApplicationStatusChange(applicationId, oldStatus, newStatus) {
    this.trackEvent('application_status_change', { 
      application: applicationId,
      oldStatus,
      newStatus 
    });
  }

  // Time tracking
  startTimeTracking(page) {
    this.pageStartTime = Date.now();
    this.currentPage = page;
  }

  endTimeTracking() {
    if (this.pageStartTime && this.currentPage) {
      const duration = Math.round((Date.now() - this.pageStartTime) / 1000);
      this.trackEvent('page_view', { 
        page: this.currentPage,
        duration 
      });
    }
  }
}

// Create singleton instance
const analytics = new AnalyticsTracker();

// React hook for easy usage
export const useAnalytics = () => {
  return {
    trackPageView: (page) => analytics.trackPageView(page),
    trackJobView: (jobId, jobTitle, companyId) => analytics.trackJobView(jobId, jobTitle, companyId),
    trackJobSearch: (query, filters) => analytics.trackJobSearch(query, filters),
    trackJobApplication: (jobId, applicationId) => analytics.trackJobApplication(jobId, applicationId),
    trackProfileView: (userId) => analytics.trackProfileView(userId),
    trackCompanyView: (companyId, companyName) => analytics.trackCompanyView(companyId, companyName),
    trackFilterUse: (filters) => analytics.trackFilterUse(filters),
    trackJobBookmark: (jobId, action) => analytics.trackJobBookmark(jobId, action),
    trackJobShare: (jobId, platform) => analytics.trackJobShare(jobId, platform),
    trackUserSignup: (userId, method) => analytics.trackUserSignup(userId, method),
    trackUserLogin: (userId, method) => analytics.trackUserLogin(userId, method),
    trackJobPost: (jobId, companyId) => analytics.trackJobPost(jobId, companyId),
    trackApplicationStatusChange: (appId, oldStatus, newStatus) => 
      analytics.trackApplicationStatusChange(appId, oldStatus, newStatus),
    startTimeTracking: (page) => analytics.startTimeTracking(page),
    endTimeTracking: () => analytics.endTimeTracking()
  };
};

export default analytics;