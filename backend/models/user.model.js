import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "recruiter"],
      required: true,
    },
    profile: {
      bio: { type: String },
      skills: [{ type: String }],
      resume: { type: String },
      resumeOriginalName: { type: String },
      company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
      profilePhoto: {
        type: String,
        default: "",
      },
      // Enhanced profile fields
      location: { type: String },
      experience: { 
        level: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'] },
        years: { type: Number }
      },
      education: [{
        institution: { type: String },
        degree: { type: String },
        field: { type: String },
        startYear: { type: Number },
        endYear: { type: Number },
        current: { type: Boolean, default: false }
      }],
      projects: [{
        title: { type: String },
        description: { type: String },
        technologies: [{ type: String }],
        link: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        current: { type: Boolean, default: false }
      }],
      socialLinks: {
        linkedin: { type: String },
        github: { type: String },
        portfolio: { type: String },
        twitter: { type: String }
      },
      careerPreferences: {
        desiredRoles: [{ type: String }],
        preferredLocations: [{ type: String }],
        salaryExpectation: {
          min: { type: Number },
          max: { type: Number },
          currency: { type: String, default: 'KSH' }
        },
        workType: [{ type: String, enum: ['Remote', 'On-site', 'Hybrid'] }],
        availability: { type: String, enum: ['Immediately', 'In 2 weeks', 'In 1 month', 'In 3 months'] }
      },
      achievements: [{
        title: { type: String },
        issuer: { type: String },
        date: { type: Date },
        description: { type: String },
        credentialUrl: { type: String }
      }],
      skillAssessments: [{
        skill: { type: String },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
        verified: { type: Boolean, default: false },
        assessmentDate: { type: Date }
      }],
      profileViews: { type: Number, default: 0 },
      profileCompleteness: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: Date.now }
    },
  },
  { timestamps: true }
);
export const User = mongoose.model("User", UserSchema);
