export interface RefinedProfile {
  fullName: string;
  jobTitle: string;
  company: string;
  location: string;
  university: string;
  degree: string;
  languages: string;
  certifications: string[];
  softSkills: string[];
  hardSkills: string[];
}

export interface ExperienceEntry {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  bulletPoints: string[];
}

export interface ResumeResult {
  summary: string;
  experience: ExperienceEntry[];
  refinedProfile?: RefinedProfile;
}

export interface ProcessingState {
  isLoading: boolean;
  error: string | null;
  hasResult: boolean;
}

export interface UserInfo {
  fullName: string;
  company: string;
  jobTitle: string;
  phone: string;
  email: string;
  linkedin: string;
  location: string;
  university: string;
  degree: string;
  gpa: string;
  languages: string;
  softSkills: string;
  hardSkills: string;
  certifications: string;
  academicModules: string;
  photo?: string | null;
}

export type LayoutMode = 'compact' | 'expanded' | 'detailed';