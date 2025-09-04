import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Brain, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock, 
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  ExternalLink,
  RefreshCw,
  Lightbulb,
  Target,
  BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AIJobRecommendations = () => {
  const { user } = useSelector(state => state.auth);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [trendingJobs, setTrendingJobs] = useState([]);

  useEffect(() => {
    fetchRecommendations();
    fetchTrendingJobs();
  }, []);

  const fetchRecommendations = async (refresh = false) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/recommendations?${refresh ? 'refresh=true' : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/trending`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrendingJobs(data.trendingJobs);
      }
    } catch (error) {
      console.error('Error fetching trending jobs:', error);
    }
  };

  const fetchExplanation = async (jobId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/recommendations/${jobId}/explanation`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setExplanation(data);
      }
    } catch (error) {
      console.error('Error fetching explanation:', error);
    }
  };

  const submitFeedback = async (jobId, rating, actionTaken) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobId,
          rating,
          actionTaken
        })
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.9) return 'Excellent Match';
    if (score >= 0.8) return 'Great Match';
    if (score >= 0.7) return 'Good Match';
    if (score >= 0.6) return 'Fair Match';
    return 'Weak Match';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Job Recommendations</h1>
            <p className="text-gray-600">Personalized job matches powered by machine learning</p>
          </div>
        </div>
        
        <Button 
          onClick={() => fetchRecommendations(true)}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{recommendations.length}</p>
                    <p className="text-sm text-gray-600">Recommendations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {recommendations.length > 0 ? Math.round(recommendations[0].score * 100) : 0}%
                    </p>
                    <p className="text-sm text-gray-600">Top Match Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{trendingJobs.length}</p>
                    <p className="text-sm text-gray-600">Trending Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              Personalized for You
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">Generating AI recommendations...</p>
              </div>
            ) : recommendations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    No recommendations yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Complete your profile and apply to jobs to get personalized recommendations
                  </p>
                  <Button onClick={() => fetchRecommendations(true)}>
                    Generate Recommendations
                  </Button>
                </CardContent>
              </Card>
            ) : (
              recommendations.map((recommendation) => (
                <Card 
                  key={recommendation.job._id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {recommendation.job.title}
                          </h3>
                          <Badge className={`${getScoreColor(recommendation.score)} bg-opacity-10 text-xs`}>
                            {Math.round(recommendation.score * 100)}% Match
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{recommendation.job.company?.name}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {recommendation.job.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${recommendation.job.salaryFrom?.toLocaleString()} - ${recommendation.job.salaryTo?.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDistanceToNow(new Date(recommendation.job.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {recommendation.job.description}
                        </p>
                        
                        {/* Match Reasons */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {recommendation.matchReasons.map((reason, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {reason.message}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Match Score Progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Match Score</span>
                            <span className={`font-medium ${getScoreColor(recommendation.score)}`}>
                              {getScoreLabel(recommendation.score)}
                            </span>
                          </div>
                          <Progress value={recommendation.score * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm"
                          onClick={() => {
                            submitFeedback(recommendation.job._id, 5, 'viewed');
                            // Navigate to job details
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Job
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedJob(recommendation.job._id);
                            fetchExplanation(recommendation.job._id);
                          }}
                        >
                          Why This Job?
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => submitFeedback(recommendation.job._id, 4, 'saved')}
                        >
                          <Bookmark className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => submitFeedback(recommendation.job._id, 5, 'liked')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => submitFeedback(recommendation.job._id, 1, 'disliked')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Trending Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendingJobs.slice(0, 5).map((trending) => (
                <div key={trending.job._id} className="p-3 border rounded-lg hover:bg-gray-50">
                  <h4 className="font-medium text-sm mb-1">{trending.job.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{trending.job.company?.name}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {trending.trendingMetrics.viewCount} views
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Trending
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Match Explanation */}
          {explanation && selectedJob && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-600" />
                  Why This Match?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-4">
                  <div className={`text-3xl font-bold ${getScoreColor(explanation.score)}`}>
                    {Math.round(explanation.score * 100)}%
                  </div>
                  <p className="text-sm text-gray-600">{getScoreLabel(explanation.score)}</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Skills Match</span>
                      <span className="font-medium">{Math.round(explanation.breakdown.skillsMatch * 100)}%</span>
                    </div>
                    <Progress value={explanation.breakdown.skillsMatch * 100} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Experience Level</span>
                      <span className="font-medium">{Math.round(explanation.breakdown.experienceMatch * 100)}%</span>
                    </div>
                    <Progress value={explanation.breakdown.experienceMatch * 100} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Location</span>
                      <span className="font-medium">{Math.round(explanation.breakdown.locationMatch * 100)}%</span>
                    </div>
                    <Progress value={explanation.breakdown.locationMatch * 100} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Salary Range</span>
                      <span className="font-medium">{Math.round(explanation.breakdown.salaryMatch * 100)}%</span>
                    </div>
                    <Progress value={explanation.breakdown.salaryMatch * 100} className="h-1" />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Key Factors</h4>
                  <ul className="space-y-1">
                    {explanation.matchReasons.map((reason, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <Star className="w-3 h-3 mr-1 mt-0.5 text-yellow-500" />
                        {reason.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-600 mb-2">Based on your activity:</p>
                <ul className="space-y-1 text-xs text-gray-500">
                  <li>• Most interested in React development roles</li>
                  <li>• Prefers remote or hybrid positions</li>
                  <li>• Active in fintech and startup sectors</li>
                  <li>• Salary range: $80K - $120K</li>
                </ul>
              </div>
              
              <Button size="sm" variant="outline" className="w-full">
                Update Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIJobRecommendations;