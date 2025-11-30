export interface RefinedProfile {
  fullName: string;
  jobTitle: string;
  location: string;
  university: string;
  degree: string;
  languages: string;
}

export interface ResumeResult {
  summary: string;
  bulletPoints: string[];
  refinedProfile?: RefinedProfile;
}

export interface ProcessingState {
  isLoading: boolean;
  error: string | null;
  hasResult: boolean;
}

export interface UserInfo {
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
  linkedin: string;
  location: string;
  university: string;
  degree: string;
  gpa: string;
  languages: string;
}