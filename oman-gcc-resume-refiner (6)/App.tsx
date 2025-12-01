import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { generateProfessionalCV } from './services/geminiService';
import { ResumeResult, UserInfo } from './types';

const App: React.FC = () => {
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '',
    company: '',
    jobTitle: '',
    phone: '',
    email: '',
    linkedin: '',
    location: '',
    university: '',
    degree: '',
    gpa: '',
    languages: '',
    softSkills: '',
    hardSkills: '',
    certifications: ''
  });

  const handleGenerate = async (rawText: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Pass both userInfo and rawText to the service
      const generatedData = await generateProfessionalCV(userInfo, rawText);
      setResult(generatedData);
    } catch (err) {
      setError("Failed to generate CV content. Please check your connection and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserInfoChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Input & Controls (30%) - Hidden on Print */}
        <div id="input-column" className="w-full lg:w-[30%] h-full bg-white border-r border-slate-200 flex flex-col overflow-y-auto z-10 shadow-lg lg:shadow-none no-print">
           {error && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H5.045c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          <InputSection 
            onGenerate={handleGenerate} 
            isLoading={isLoading} 
            userInfo={userInfo}
            onUserInfoChange={handleUserInfoChange}
          />
        </div>

        {/* Right Column: Live Preview (70%) - Full Width on Print */}
        <div id="preview-column" className="w-full lg:w-[70%] h-full bg-slate-100 overflow-y-auto relative flex flex-col items-center">
          <OutputSection 
            result={result} 
            isLoading={isLoading} 
            userInfo={userInfo}
          />
        </div>
      </main>
    </div>
  );
};

export default App;