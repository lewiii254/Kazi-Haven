import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Link as LinkIcon,
  Plus,
  X,
  Save,
  Github,
  Linkedin,
  Globe,
  Twitter,
  Calendar,
  Target,
  DollarSign
} from "lucide-react";
import { useSelector } from "react-redux";

const EnhancedProfile = () => {
  const { user } = useSelector(store => store.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    ...user?.profile,
    location: user?.profile?.location || "",
    experience: user?.profile?.experience || { level: "", years: 0 },
    education: user?.profile?.education || [],
    projects: user?.profile?.projects || [],
    socialLinks: user?.profile?.socialLinks || {},
    careerPreferences: user?.profile?.careerPreferences || {},
    achievements: user?.profile?.achievements || [],
    skillAssessments: user?.profile?.skillAssessments || []
  });

  const [newSkill, setNewSkill] = useState("");
  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    field: "",
    startYear: "",
    endYear: "",
    current: false
  });
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: [],
    link: "",
    startDate: "",
    endDate: "",
    current: false
  });
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    issuer: "",
    date: "",
    description: "",
    credentialUrl: ""
  });

  const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
  // const workTypes = ['Remote', 'On-site', 'Hybrid']; // Will be used in future features
  const availabilityOptions = ['Immediately', 'In 2 weeks', 'In 1 month', 'In 3 months'];

  const handleProfileUpdate = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedUpdate = (section, field, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
      handleProfileUpdate('skills', [...(profile.skills || []), newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    handleProfileUpdate('skills', profile.skills?.filter(skill => skill !== skillToRemove));
  };

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      handleProfileUpdate('education', [...profile.education, { ...newEducation, id: Date.now() }]);
      setNewEducation({
        institution: "",
        degree: "",
        field: "",
        startYear: "",
        endYear: "",
        current: false
      });
    }
  };

  const removeEducation = (id) => {
    handleProfileUpdate('education', profile.education.filter(edu => edu.id !== id));
  };

  const addProject = () => {
    if (newProject.title && newProject.description) {
      const projectToAdd = {
        ...newProject,
        id: Date.now(),
        technologies: newProject.technologies.filter(tech => tech.trim())
      };
      handleProfileUpdate('projects', [...profile.projects, projectToAdd]);
      setNewProject({
        title: "",
        description: "",
        technologies: [],
        link: "",
        startDate: "",
        endDate: "",
        current: false
      });
    }
  };

  const removeProject = (id) => {
    handleProfileUpdate('projects', profile.projects.filter(project => project.id !== id));
  };

  const addAchievement = () => {
    if (newAchievement.title && newAchievement.issuer) {
      handleProfileUpdate('achievements', [...profile.achievements, { ...newAchievement, id: Date.now() }]);
      setNewAchievement({
        title: "",
        issuer: "",
        date: "",
        description: "",
        credentialUrl: ""
      });
    }
  };

  const removeAchievement = (id) => {
    handleProfileUpdate('achievements', profile.achievements.filter(achievement => achievement.id !== id));
  };

  const saveProfile = async () => {
    // Implementation for saving profile
    console.log("Saving profile:", profile);
    setIsEditing(false);
  };

  const calculateCompleteness = () => {
    let completed = 0;
    const total = 10;

    if (profile.bio) completed++;
    if (profile.skills?.length > 0) completed++;
    if (profile.location) completed++;
    if (profile.experience?.level) completed++;
    if (profile.education?.length > 0) completed++;
    if (profile.projects?.length > 0) completed++;
    if (Object.keys(profile.socialLinks || {}).length > 0) completed++;
    if (profile.careerPreferences?.desiredRoles?.length > 0) completed++;
    if (profile.achievements?.length > 0) completed++;
    if (profile.resume) completed++;

    return Math.round((completed / total) * 100);
  };

  const completeness = calculateCompleteness();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {user?.profile?.profilePhoto ? (
                <img 
                  src={user.profile.profilePhoto} 
                  alt="Profile" 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.fullName}</h1>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm">
                  {completeness}% Complete
                </div>
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${completeness}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
            className="flex items-center gap-2"
          >
            {isEditing ? <Save className="h-4 w-4" /> : <User className="h-4 w-4" />}
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Basic Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                className="mt-1"
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {profile.bio || "No bio added yet"}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={profile.location || ""}
                  onChange={(e) => handleProfileUpdate('location', e.target.value)}
                  placeholder="Your location"
                />
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {profile.location || "No location added"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Experience Level */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Experience
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="experience-level">Experience Level</Label>
            {isEditing ? (
              <select
                id="experience-level"
                value={profile.experience?.level || ""}
                onChange={(e) => handleNestedUpdate('experience', 'level', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="">Select level</option>
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {profile.experience?.level || "Not specified"}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="experience-years">Years of Experience</Label>
            {isEditing ? (
              <Input
                id="experience-years"
                type="number"
                value={profile.experience?.years || ""}
                onChange={(e) => handleNestedUpdate('experience', 'years', parseInt(e.target.value) || 0)}
                placeholder="Years"
                className="mt-1"
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {profile.experience?.years || 0} years
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Skills</h2>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile.skills?.map((skill, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {skill}
                {isEditing && (
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
          
          {isEditing && (
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Social Links
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
            { key: 'github', label: 'GitHub', icon: Github },
            { key: 'portfolio', label: 'Portfolio', icon: Globe },
            { key: 'twitter', label: 'Twitter', icon: Twitter }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key}>
              <Label htmlFor={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </Label>
              {isEditing ? (
                <Input
                  id={key}
                  value={profile.socialLinks?.[key] || ""}
                  onChange={(e) => handleNestedUpdate('socialLinks', key, e.target.value)}
                  placeholder={`Your ${label} URL`}
                  className="mt-1"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {profile.socialLinks?.[key] ? (
                    <a 
                      href={profile.socialLinks[key]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.socialLinks[key]}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Career Preferences */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Career Preferences
        </h2>
        
        <div className="space-y-4">
          <div>
            <Label>Salary Expectation (KSH)</Label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  type="number"
                  value={profile.careerPreferences?.salaryExpectation?.min || ""}
                  onChange={(e) => handleNestedUpdate('careerPreferences', 'salaryExpectation', {
                    ...profile.careerPreferences?.salaryExpectation,
                    min: parseInt(e.target.value) || 0
                  })}
                  placeholder="Minimum"
                />
                <Input
                  type="number"
                  value={profile.careerPreferences?.salaryExpectation?.max || ""}
                  onChange={(e) => handleNestedUpdate('careerPreferences', 'salaryExpectation', {
                    ...profile.careerPreferences?.salaryExpectation,
                    max: parseInt(e.target.value) || 0
                  })}
                  placeholder="Maximum"
                />
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {profile.careerPreferences?.salaryExpectation?.min && profile.careerPreferences?.salaryExpectation?.max
                  ? `KSH ${profile.careerPreferences.salaryExpectation.min.toLocaleString()} - ${profile.careerPreferences.salaryExpectation.max.toLocaleString()}`
                  : "Not specified"
                }
              </p>
            )}
          </div>
          
          <div>
            <Label>Availability</Label>
            {isEditing ? (
              <select
                value={profile.careerPreferences?.availability || ""}
                onChange={(e) => handleNestedUpdate('careerPreferences', 'availability', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="">Select availability</option>
                {availabilityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {profile.careerPreferences?.availability || "Not specified"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Education
        </h2>
        
        <div className="space-y-4">
          {profile.education?.map((edu, index) => (
            <div key={edu.id || index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{edu.degree} in {edu.field}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    {edu.startYear} - {edu.current ? 'Present' : edu.endYear}
                  </p>
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(edu.id)}
                    className="text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {isEditing && (
            <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <h3 className="font-medium mb-3">Add Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Institution"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                />
                <Input
                  placeholder="Degree"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                />
                <Input
                  placeholder="Field of Study"
                  value={newEducation.field}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Start Year"
                    value={newEducation.startYear}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, startYear: e.target.value }))}
                  />
                  {!newEducation.current && (
                    <Input
                      type="number"
                      placeholder="End Year"
                      value={newEducation.endYear}
                      onChange={(e) => setNewEducation(prev => ({ ...prev, endYear: e.target.value }))}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="current-education"
                    checked={newEducation.current}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, current: e.target.checked }))}
                  />
                  <Label htmlFor="current-education">Currently studying</Label>
                </div>
              </div>
              <Button onClick={addEducation} className="mt-3" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Education
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Projects
        </h2>
        
        <div className="space-y-4">
          {profile.projects?.map((project, index) => (
            <div key={project.id || index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
                  {project.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                    >
                      View Project
                    </a>
                  )}
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(project.id)}
                    className="text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {isEditing && (
            <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <h3 className="font-medium mb-3">Add Project</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Project Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                />
                <Input
                  placeholder="Technologies (comma separated)"
                  value={newProject.technologies.join(', ')}
                  onChange={(e) => setNewProject(prev => ({ 
                    ...prev, 
                    technologies: e.target.value.split(',').map(tech => tech.trim()).filter(Boolean)
                  }))}
                />
                <Input
                  placeholder="Project Link (optional)"
                  value={newProject.link}
                  onChange={(e) => setNewProject(prev => ({ ...prev, link: e.target.value }))}
                />
              </div>
              <Button onClick={addProject} className="mt-3" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Project
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5" />
          Achievements & Certifications
        </h2>
        
        <div className="space-y-4">
          {profile.achievements?.map((achievement, index) => (
            <div key={achievement.id || index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{achievement.issuer}</p>
                  {achievement.description && (
                    <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                  )}
                  {achievement.date && (
                    <p className="text-sm text-gray-500">
                      Earned: {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  )}
                  {achievement.credentialUrl && (
                    <a 
                      href={achievement.credentialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Credential
                    </a>
                  )}
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAchievement(achievement.id)}
                    className="text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {isEditing && (
            <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <h3 className="font-medium mb-3">Add Achievement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Achievement Title"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                />
                <Input
                  placeholder="Issuing Organization"
                  value={newAchievement.issuer}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, issuer: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="Date Earned"
                  value={newAchievement.date}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, date: e.target.value }))}
                />
                <Input
                  placeholder="Credential URL (optional)"
                  value={newAchievement.credentialUrl}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, credentialUrl: e.target.value }))}
                />
                <div className="md:col-span-2">
                  <Textarea
                    placeholder="Description (optional)"
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={addAchievement} className="mt-3" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Achievement
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfile;