import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { AnalyticsEvent } from "../models/analytics.model.js";
import { cacheUtils } from "../config/redis.js";

class JobRecommendationEngine {
  constructor() {
    this.weights = {
      skills: 0.3,
      location: 0.15,
      experience: 0.2,
      salary: 0.15,
      jobType: 0.1,
      recentActivity: 0.1
    };
  }

  // Main recommendation function
  async getRecommendations(userId, limit = 10) {
    try {
      // Check cache first
      const cacheKey = `job_recommendations:${userId}`;
      const cached = await cacheUtils.get(cacheKey);
      if (cached) {
        return cached;
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user preferences and history
      const userProfile = await this.buildUserProfile(userId);
      
      // Get available jobs (excluding already applied)
      const appliedJobIds = await this.getAppliedJobIds(userId);
      const availableJobs = await Job.find({
        _id: { $nin: appliedJobIds },
        isActive: true
      }).populate('company', 'name location');

      // Calculate scores for each job
      const scoredJobs = await Promise.all(
        availableJobs.map(async (job) => {
          const score = await this.calculateJobScore(userProfile, job);
          return {
            job,
            score,
            matchReasons: this.getMatchReasons(userProfile, job, score)
          };
        })
      );

      // Sort by score and get top recommendations
      const recommendations = scoredJobs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Cache for 1 hour
      await cacheUtils.set(cacheKey, recommendations, 3600);

      return recommendations;
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      throw error;
    }
  }

  // Build comprehensive user profile
  async buildUserProfile(userId) {
    const user = await User.findById(userId);
    
    // Get user's application history
    const applications = await Application.find({ applicant: userId })
      .populate('job', 'title description requirements location salaryFrom salaryTo jobType company')
      .sort({ createdAt: -1 })
      .limit(50);

    // Get user's search and view history
    const searchHistory = await AnalyticsEvent.find({
      user: userId,
      eventType: { $in: ['job_search', 'job_view'] }
    }).sort({ createdAt: -1 }).limit(100);

    return {
      user,
      skills: user.profile.skills || [],
      experience: user.profile.experience || {},
      location: user.profile.location || '',
      careerPreferences: user.profile.careerPreferences || {},
      applications,
      searchHistory,
      // Extract patterns from user behavior
      preferredJobTypes: this.extractJobTypePreferences(applications),
      preferredCompanies: this.extractCompanyPreferences(applications),
      preferredSkills: this.extractSkillPreferences(applications, searchHistory),
      salaryRange: this.extractSalaryPreferences(applications, user.profile.careerPreferences)
    };
  }

  // Calculate job score based on user profile
  async calculateJobScore(userProfile, job) {
    let totalScore = 0;

    // Skills matching (30% weight)
    const skillsScore = this.calculateSkillsScore(userProfile.skills, job.requirements);
    totalScore += skillsScore * this.weights.skills;

    // Location matching (15% weight)
    const locationScore = this.calculateLocationScore(userProfile.location, job.location);
    totalScore += locationScore * this.weights.location;

    // Experience matching (20% weight)
    const experienceScore = this.calculateExperienceScore(userProfile.experience, job.experienceLevel);
    totalScore += experienceScore * this.weights.experience;

    // Salary matching (15% weight)
    const salaryScore = this.calculateSalaryScore(userProfile.salaryRange, {
      min: job.salaryFrom,
      max: job.salaryTo
    });
    totalScore += salaryScore * this.weights.salary;

    // Job type matching (10% weight)
    const jobTypeScore = this.calculateJobTypeScore(userProfile.preferredJobTypes, job.jobType);
    totalScore += jobTypeScore * this.weights.jobType;

    // Recent activity bonus (10% weight)
    const activityScore = this.calculateActivityScore(userProfile, job);
    totalScore += activityScore * this.weights.recentActivity;

    return Math.min(totalScore, 1); // Cap at 1.0
  }

  // Skills matching algorithm
  calculateSkillsScore(userSkills, jobRequirements) {
    if (!userSkills.length || !jobRequirements) return 0;

    const jobSkills = this.extractSkillsFromText(jobRequirements.toLowerCase());
    const userSkillsLower = userSkills.map(skill => skill.toLowerCase());

    let matchCount = 0;
    let totalWeight = 0;

    jobSkills.forEach(jobSkill => {
      const weight = this.getSkillWeight(jobSkill);
      totalWeight += weight;

      // Exact match
      if (userSkillsLower.includes(jobSkill)) {
        matchCount += weight;
      } else {
        // Partial match (contains)
        const partialMatch = userSkillsLower.some(userSkill => 
          userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
        );
        if (partialMatch) {
          matchCount += weight * 0.7; // 70% score for partial match
        }
      }
    });

    return totalWeight > 0 ? matchCount / totalWeight : 0;
  }

  // Extract skills from job description text
  extractSkillsFromText(text) {
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue.js',
      'html', 'css', 'typescript', 'php', 'c++', 'c#', 'ruby', 'go', 'rust',
      'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'git', 'linux', 'agile', 'scrum', 'devops',
      'machine learning', 'ai', 'data science', 'blockchain', 'cybersecurity'
    ];

    return commonSkills.filter(skill => text.includes(skill));
  }

  // Get skill importance weight
  getSkillWeight(skill) {
    const highImportanceSkills = ['javascript', 'python', 'react', 'node.js', 'sql'];
    const mediumImportanceSkills = ['html', 'css', 'git', 'agile'];
    
    if (highImportanceSkills.includes(skill)) return 1.0;
    if (mediumImportanceSkills.includes(skill)) return 0.7;
    return 0.5;
  }

  // Location matching
  calculateLocationScore(userLocation, jobLocation) {
    if (!userLocation || !jobLocation) return 0.5; // Neutral score

    const userLoc = userLocation.toLowerCase();
    const jobLoc = jobLocation.toLowerCase();

    // Exact match
    if (userLoc === jobLoc) return 1.0;

    // City match
    if (userLoc.includes(jobLoc) || jobLoc.includes(userLoc)) return 0.8;

    // Remote work bonus
    if (jobLoc.includes('remote')) return 0.9;

    return 0.3; // Different locations
  }

  // Experience level matching
  calculateExperienceScore(userExperience, jobExperienceLevel) {
    if (!userExperience.level || !jobExperienceLevel) return 0.5;

    const experienceLevels = {
      'entry': 1,
      'mid': 2,
      'senior': 3,
      'lead': 4,
      'executive': 5
    };

    const userLevel = experienceLevels[userExperience.level.toLowerCase()] || 2;
    const jobLevel = experienceLevels[jobExperienceLevel.toLowerCase()] || 2;

    const difference = Math.abs(userLevel - jobLevel);
    
    if (difference === 0) return 1.0;
    if (difference === 1) return 0.8;
    if (difference === 2) return 0.6;
    return 0.3;
  }

  // Salary matching
  calculateSalaryScore(userSalaryRange, jobSalaryRange) {
    if (!userSalaryRange.min || !jobSalaryRange.min) return 0.5;

    const userMin = userSalaryRange.min;
    const userMax = userSalaryRange.max || userMin * 1.5;
    const jobMin = jobSalaryRange.min;
    const jobMax = jobSalaryRange.max || jobMin * 1.2;

    // Check if ranges overlap
    if (jobMax >= userMin && jobMin <= userMax) {
      // Calculate overlap percentage
      const overlapStart = Math.max(userMin, jobMin);
      const overlapEnd = Math.min(userMax, jobMax);
      const overlapSize = overlapEnd - overlapStart;
      const userRangeSize = userMax - userMin;
      
      return Math.min(overlapSize / userRangeSize, 1.0);
    }

    // No overlap - calculate distance penalty
    if (jobMax < userMin) {
      const gap = userMin - jobMax;
      return Math.max(0, 1 - (gap / userMin));
    }

    return 0.5; // Job pays more than expected
  }

  // Job type matching
  calculateJobTypeScore(preferredJobTypes, jobType) {
    if (!preferredJobTypes.length || !jobType) return 0.5;

    const jobTypeLower = jobType.toLowerCase();
    const match = preferredJobTypes.some(type => 
      type.toLowerCase() === jobTypeLower
    );

    return match ? 1.0 : 0.3;
  }

  // Activity-based scoring
  calculateActivityScore(userProfile, job) {
    let score = 0.5; // Base score

    // Recent similar job views
    const recentViews = userProfile.searchHistory.filter(event => 
      event.eventType === 'job_view' && 
      event.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    );

    recentViews.forEach(view => {
      if (view.eventData.job && view.eventData.job.toString() === job._id.toString()) {
        score += 0.1; // Viewed this job before
      }
    });

    // Recent searches matching job
    const recentSearches = userProfile.searchHistory.filter(event => 
      event.eventType === 'job_search' && 
      event.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    recentSearches.forEach(search => {
      if (search.eventData.searchQuery) {
        const query = search.eventData.searchQuery.toLowerCase();
        const jobTitle = job.title.toLowerCase();
        const jobDescription = job.description.toLowerCase();

        if (jobTitle.includes(query) || jobDescription.includes(query)) {
          score += 0.15; // Search terms match job
        }
      }
    });

    return Math.min(score, 1.0);
  }

  // Extract user preferences from history
  extractJobTypePreferences(applications) {
    const types = {};
    applications.forEach(app => {
      if (app.job?.jobType) {
        types[app.job.jobType] = (types[app.job.jobType] || 0) + 1;
      }
    });

    return Object.entries(types)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }

  extractCompanyPreferences(applications) {
    const companies = {};
    applications.forEach(app => {
      if (app.job?.company) {
        const companyId = app.job.company.toString();
        companies[companyId] = (companies[companyId] || 0) + 1;
      }
    });

    return Object.keys(companies);
  }

  extractSkillPreferences(applications, searchHistory) {
    const skills = new Set();

    // From applications
    applications.forEach(app => {
      if (app.job?.requirements) {
        const jobSkills = this.extractSkillsFromText(app.job.requirements.toLowerCase());
        jobSkills.forEach(skill => skills.add(skill));
      }
    });

    // From search history
    searchHistory.forEach(search => {
      if (search.eventData.searchQuery) {
        const query = search.eventData.searchQuery.toLowerCase();
        const querySkills = this.extractSkillsFromText(query);
        querySkills.forEach(skill => skills.add(skill));
      }
    });

    return Array.from(skills);
  }

  extractSalaryPreferences(applications, careerPreferences) {
    const salaries = applications
      .filter(app => app.job?.salaryFrom)
      .map(app => ({
        min: app.job.salaryFrom,
        max: app.job.salaryTo || app.job.salaryFrom * 1.2
      }));

    if (careerPreferences?.salaryExpectation) {
      return careerPreferences.salaryExpectation;
    }

    if (salaries.length > 0) {
      const avgMin = salaries.reduce((sum, s) => sum + s.min, 0) / salaries.length;
      const avgMax = salaries.reduce((sum, s) => sum + s.max, 0) / salaries.length;
      return { min: avgMin, max: avgMax };
    }

    return { min: 0, max: 1000000 }; // Default range
  }

  // Get match reasons for explanation
  getMatchReasons(userProfile, job, score) {
    const reasons = [];

    // Skills match
    const skillsScore = this.calculateSkillsScore(userProfile.skills, job.requirements);
    if (skillsScore > 0.7) {
      reasons.push({
        type: 'skills',
        message: 'Strong skills match',
        score: skillsScore
      });
    }

    // Location match
    const locationScore = this.calculateLocationScore(userProfile.location, job.location);
    if (locationScore > 0.8) {
      reasons.push({
        type: 'location',
        message: 'Location preference match',
        score: locationScore
      });
    }

    // Experience match
    const experienceScore = this.calculateExperienceScore(userProfile.experience, job.experienceLevel);
    if (experienceScore > 0.8) {
      reasons.push({
        type: 'experience',
        message: 'Experience level match',
        score: experienceScore
      });
    }

    // Salary match
    const salaryScore = this.calculateSalaryScore(userProfile.salaryRange, {
      min: job.salaryFrom,
      max: job.salaryTo
    });
    if (salaryScore > 0.7) {
      reasons.push({
        type: 'salary',
        message: 'Salary expectation match',
        score: salaryScore
      });
    }

    return reasons;
  }

  // Get applied job IDs for a user
  async getAppliedJobIds(userId) {
    const applications = await Application.find({ applicant: userId }).select('job');
    return applications.map(app => app.job);
  }

  // Clear user recommendations cache
  async clearUserCache(userId) {
    await cacheUtils.del(`job_recommendations:${userId}`);
  }

  // Batch process recommendations for multiple users
  async batchGenerateRecommendations(userIds) {
    const results = {};
    
    for (const userId of userIds) {
      try {
        results[userId] = await this.getRecommendations(userId);
      } catch (error) {
        console.error(`Error generating recommendations for user ${userId}:`, error);
        results[userId] = [];
      }
    }

    return results;
  }
}

export default new JobRecommendationEngine();