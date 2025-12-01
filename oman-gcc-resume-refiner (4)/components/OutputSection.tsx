import React from 'react';
import { ResumeResult, UserInfo } from '../types';

interface OutputSectionProps {
  result: ResumeResult | null;
  isLoading: boolean;
  userInfo: UserInfo;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ result, isLoading, userInfo }) => {
  
  const handlePrint = () => {
    // Set document title temporarily for the PDF filename
    const originalTitle = document.title;
    const filename = (result?.refinedProfile?.fullName || userInfo.fullName || 'Resume').replace(/\s+/g, '_');
    document.title = `${filename}_CV`;
    
    window.print();

    // Revert title after print dialog closes (timeout ensures browser captures it)
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  // --- Data Logic ---
  const displayFullName = result?.refinedProfile?.fullName || userInfo.fullName || "Your Name";
  const displayJobTitle = result?.refinedProfile?.jobTitle || userInfo.jobTitle || "Current Job Title";
  
  // Note: Phone, Email, LinkedIn are not auto-corrected by AI.
  const displayLocation = result?.refinedProfile?.location || userInfo.location;
  const displayUniversity = result?.refinedProfile?.university || userInfo.university;
  const displayDegree = result?.refinedProfile?.degree || userInfo.degree;
  const displayLanguages = result?.refinedProfile?.languages || userInfo.languages;
  
  // Certifications Logic
  const refinedCertifications = result?.refinedProfile?.certifications;
  const inputCertifications = userInfo.certifications ? userInfo.certifications.split('\n').map(c => c.trim()).filter(c => c.length > 0) : [];
  const displayCertifications = (refinedCertifications && refinedCertifications.length > 0) ? refinedCertifications : inputCertifications;

  // Soft Skills Logic
  const refinedSoftSkills = result?.refinedProfile?.softSkills;
  const inputSoftSkills = userInfo.softSkills ? userInfo.softSkills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  const displaySoftSkills = (refinedSoftSkills && refinedSoftSkills.length > 0) ? refinedSoftSkills : inputSoftSkills;

  // Hard Skills Logic (Refined takes precedence, but if manually entered, AI should have used it)
  const refinedHardSkills = result?.refinedProfile?.hardSkills || [];

  const placeholderSummary = "Your professional summary will appear here. It will be concise, impactful, and tailored for the GCC market.";
  const displaySummary = result?.summary || placeholderSummary;
  
  const isEmpty = !result && !userInfo.fullName;

  // Contact Items
  const contactItems = [
    { label: "Mobile", value: userInfo.phone },
    { label: "Email", value: userInfo.email },
    { label: "Location", value: displayLocation },
    { label: "LinkedIn", value: userInfo.linkedin },
  ].filter(item => item.value && item.value.trim() !== "");

  // Fallback for Experience if result is null
  // If result is present, we use result.experience array.
  // If user hasn't generated yet, we show a placeholder block.
  const experienceData = result?.experience || [
    {
      jobTitle: userInfo.jobTitle || "Job Title",
      company: userInfo.company || "Company Name",
      startDate: "Date",
      endDate: "Present",
      bulletPoints: [
        "Achievements and key responsibilities will appear here.",
        "Strong action verbs will be used to start each point.",
        "Quantifiable results will be highlighted.",
      ]
    }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center">
      
      {/* Toolbar - Hidden in Print */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20 no-print">
        <h3 className="font-semibold text-slate-700">Live Preview</h3>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Print / Save as PDF
        </button>
      </div>

      {/* Scrollable Canvas Area */}
      <div className="flex-1 w-full overflow-y-auto p-8 flex justify-center bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
        
        {/* A4 Page Container - Compact Mode: p-[15mm] */}
        {/* Added print:w-[210mm] print:p-[15mm] to strictly enforce print dimensions */}
        <div 
          id="resume-preview" 
          className={`bg-white shadow-2xl transition-all duration-500 w-[210mm] min-h-[297mm] p-[15mm] print:w-[210mm] print:p-[15mm] relative flex flex-col ${isLoading ? 'blur-[1px]' : ''}`}
        >
          
          {/* Loading Overlay inside the paper - hidden on print */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center no-print">
              <div className="flex flex-col items-center gap-3">
                 <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-emerald-800 font-medium animate-pulse">Refining Resume...</p>
              </div>
            </div>
          )}

          {/* Header - Compact: smaller margins */}
          <header className="border-b-2 border-slate-800 pb-4 mb-5 text-center">
            <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight mb-1">
              {displayFullName}
            </h1>
            <h2 className="text-lg font-medium text-emerald-800 mb-2">
              {displayJobTitle}
            </h2>
            
            {/* Contact Details Bar - Smaller Text */}
            <div className="flex flex-wrap gap-y-1 text-xs text-slate-600 items-center justify-center">
              {contactItems.length > 0 ? (
                contactItems.map((item, index) => (
                  <div key={item.label} className="flex items-center">
                    {index > 0 && (
                      <span className="mx-2 text-slate-300 select-none">|</span>
                    )}
                    <span className="font-bold text-slate-800 mr-1">{item.label}:</span>
                    <span className="text-slate-600">{item.value}</span>
                  </div>
                ))
              ) : (
                isEmpty && (
                  <span className="text-slate-400 italic">Contact details will appear here</span>
                )
              )}
            </div>
          </header>

          {/* Main Content - Compact Spacing (space-y-5) */}
          <div className="space-y-5 flex-1">
            
            {/* Summary Section */}
            <section>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                Professional Summary
              </h3>
              <p className={`text-justify leading-snug text-xs text-slate-700 ${!result && 'text-slate-400 italic'}`}>
                {displaySummary}
              </p>
            </section>

            {/* Experience Section - Multi-Job Support */}
            <section>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                Experience
              </h3>
              
              <div className="space-y-3">
                {experienceData.map((job, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-1">
                       <h4 className="font-bold text-slate-800 text-sm">
                        {job.jobTitle} <span className="text-slate-400 mx-1 font-light">|</span> <span className="font-bold">{job.company}</span>
                       </h4>
                       <span className="text-slate-500 text-[10px] italic whitespace-nowrap">{job.startDate} - {job.endDate}</span>
                    </div>
                    
                    <ul className="list-disc list-outside ml-3 space-y-1">
                      {job.bulletPoints.map((point, i) => (
                        <li key={i} className={`pl-1 leading-snug text-xs text-slate-700 ${!result && 'text-slate-400 italic'}`}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

             {/* Education Section */}
             <section>
               <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                Education
              </h3>
               <div className="text-slate-700 text-xs">
                {(displayUniversity || displayDegree || !isEmpty) ? (
                   <div className="flex flex-col">
                     <span className="font-bold text-slate-800">{displayUniversity || "Sultan Qaboos University"}</span>
                     <div className="flex flex-wrap gap-x-2 text-[11px] mt-0.5">
                       <span className="italic">{displayDegree || "Bachelor of Engineering"}</span>
                       {userInfo.gpa && (
                         <>
                           <span className="text-slate-400">|</span>
                           <span>GPA: {userInfo.gpa}</span>
                         </>
                       )}
                     </div>
                   </div>
                ) : (
                  <div className="text-slate-400 italic">
                     Degree | University Name | GPA (Optional)
                  </div>
                )}
               </div>
             </section>

             {/* Languages & Skills Grid - Compact Gap - FORCE 2 COLS ON PRINT */}
             <div className="grid grid-cols-2 gap-6 print:grid-cols-2">
               
               {/* Left Col: Certifications & Languages */}
               <div className="space-y-4">
                 <section>
                   <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                    Certifications & Courses
                  </h3>
                   <ul className="list-disc list-outside ml-3 space-y-0.5">
                      {displayCertifications.length > 0 ? (
                         displayCertifications.map((cert, i) => (
                            <li key={i} className="text-slate-700 text-[10px] leading-tight">{cert}</li>
                         ))
                      ) : (
                         <li className="text-slate-400 italic list-none ml-0 text-xs">e.g. PMP, Six Sigma</li>
                      )}
                   </ul>
                 </section>

                 <section>
                   <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                    Languages
                  </h3>
                   <div className={`text-slate-700 text-xs ${(!displayLanguages && isEmpty) && 'text-slate-400 italic'}`}>
                    {displayLanguages || "Arabic (Native), English (Professional)"}
                   </div>
                 </section>
               </div>

                {/* Right Col: Skills */}
               <div className="space-y-4">
                 <section>
                   <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                    Key Skills (Hard)
                  </h3>
                  <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-700">
                    {refinedHardSkills.length > 0 ? (
                      refinedHardSkills.map((skill, index) => (
                         <span key={index} className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{skill}</span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-xs">Technical skills inferred from input</span>
                    )}
                  </div>
                 </section>

                 <section>
                   <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                    Soft Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-700">
                    {displaySoftSkills.length > 0 ? (
                      displaySoftSkills.map((skill, index) => (
                         <span key={index} className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{skill}</span>
                      ))
                    ) : (
                       <span className="text-slate-400 italic text-xs">e.g. Leadership, Teamwork</span>
                    )}
                  </div>
                 </section>
               </div>

             </div>

          </div>
          
        </div>
      </div>
    </div>
  );
};