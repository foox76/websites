import React from 'react';
import { ResumeResult, UserInfo } from '../types';

interface OutputSectionProps {
  result: ResumeResult | null;
  isLoading: boolean;
  userInfo: UserInfo;
}

declare const html2pdf: any;

export const OutputSection: React.FC<OutputSectionProps> = ({ result, isLoading, userInfo }) => {
  
  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-preview');
    // Use refined name if available for filename
    const filename = (result?.refinedProfile?.fullName || userInfo.fullName || 'resume').replace(/\s+/g, '_');

    const opt = {
      margin: 0,
      filename: `${filename}_CV.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (element && typeof html2pdf !== 'undefined') {
      html2pdf().set(opt).from(element).save();
    } else {
      alert("PDF generation library not loaded.");
    }
  };

  // --- Data Logic: Prefer Refined/Corrected Data over Raw Input ---
  const displayFullName = result?.refinedProfile?.fullName || userInfo.fullName || "Your Name";
  const displayJobTitle = result?.refinedProfile?.jobTitle || userInfo.jobTitle || "Current Job Title";
  
  // Note: Phone, Email, LinkedIn, GPA are not auto-corrected by AI as they are strict data, 
  // but Location, Uni, Degree, Languages are corrected.
  const displayLocation = result?.refinedProfile?.location || userInfo.location;
  const displayUniversity = result?.refinedProfile?.university || userInfo.university;
  const displayDegree = result?.refinedProfile?.degree || userInfo.degree;
  const displayLanguages = result?.refinedProfile?.languages || userInfo.languages;

  const placeholderSummary = "Your professional summary will appear here. It will be concise, impactful, and tailored for the GCC market, highlighting your key strengths and career objectives.";
  const placeholderBullets = [
    "Achievements and key responsibilities will appear here as bullet points.",
    "Strong action verbs will be used to start each point.",
    "Quantifiable results (e.g., 'Increased efficiency by 20%') will be prioritized.",
    "HSE and compliance standards relevant to the region will be emphasized."
  ];

  const displaySummary = result?.summary || placeholderSummary;
  const displayBullets = result?.bulletPoints || placeholderBullets;

  const isEmpty = !result && !userInfo.fullName;

  // Contact Items: Only show if value exists (non-empty)
  // We use userInfo for phone/email/linkedin as they are directly from input
  const contactItems = [
    { label: "Mobile", value: userInfo.phone },
    { label: "Email", value: userInfo.email },
    { label: "Location", value: displayLocation },
    { label: "LinkedIn", value: userInfo.linkedin },
  ].filter(item => item.value && item.value.trim() !== "");

  return (
    <div className="w-full h-full flex flex-col items-center">
      
      {/* Toolbar */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
        <h3 className="font-semibold text-slate-700">Live Preview</h3>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Scrollable Canvas Area */}
      <div className="flex-1 w-full overflow-y-auto p-8 flex justify-center bg-slate-100">
        
        {/* A4 Page Container */}
        <div 
          id="resume-preview" 
          className={`bg-white shadow-2xl transition-all duration-500 w-[210mm] min-h-[297mm] p-[20mm] relative flex flex-col ${isLoading ? 'blur-[1px]' : ''}`}
        >
          
          {/* Loading Overlay inside the paper */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                 <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-emerald-800 font-medium animate-pulse">Refining Resume...</p>
              </div>
            </div>
          )}

          {/* Header */}
          <header className="border-b-2 border-slate-800 pb-6 mb-8 text-center">
            <h1 className="text-4xl font-bold text-slate-900 uppercase tracking-tight mb-2">
              {displayFullName}
            </h1>
            <h2 className="text-xl font-medium text-emerald-800 mb-4">
              {displayJobTitle}
            </h2>
            
            {/* Contact Details Bar - Centered & Balanced */}
            <div className="flex flex-wrap gap-y-1 text-sm text-slate-600 items-center justify-center">
              {contactItems.length > 0 ? (
                contactItems.map((item, index) => (
                  <div key={item.label} className="flex items-center">
                    {index > 0 && (
                      <span className="mx-3 text-slate-300 select-none">|</span>
                    )}
                    <span className="font-bold text-slate-800 mr-1.5">{item.label}:</span>
                    <span className="text-slate-600">{item.value}</span>
                  </div>
                ))
              ) : (
                // Only show placeholder if specifically no data is entered AND no result (initial state)
                isEmpty && (
                  <span className="text-slate-400 italic">Contact details will appear here</span>
                )
              )}
            </div>
          </header>

          {/* Main Content */}
          <div className="space-y-8 flex-1">
            
            {/* Summary Section */}
            <section>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
                Professional Summary
              </h3>
              <p className={`text-justify leading-relaxed text-slate-700 ${!result && 'text-slate-400 italic'}`}>
                {displaySummary}
              </p>
            </section>

            {/* Experience Section */}
            <section>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
                Experience
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-baseline mb-2">
                   <h4 className="font-bold text-slate-800 text-lg">
                    {displayJobTitle}
                   </h4>
                   <span className="text-slate-500 text-sm italic">Date - Present</span>
                </div>
                
                <ul className="list-disc list-outside ml-4 space-y-2">
                  {displayBullets.map((point, i) => (
                    <li key={i} className={`pl-1 leading-relaxed text-slate-700 ${!result && 'text-slate-400 italic'}`}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

             {/* Education Section */}
             <section>
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
                Education
              </h3>
               <div className="text-slate-700">
                {(displayUniversity || displayDegree || !isEmpty) ? (
                   <div className="flex flex-col">
                     <span className="font-bold text-slate-800">{displayUniversity || "Sultan Qaboos University"}</span>
                     <div className="flex gap-2 text-sm mt-0.5">
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

             {/* Languages & Skills Grid */}
             <div className="grid grid-cols-2 gap-8">
               
               {/* Languages */}
               <section>
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
                  Languages
                </h3>
                 <div className={`text-slate-700 ${(!displayLanguages && isEmpty) && 'text-slate-400 italic'}`}>
                  {displayLanguages || "Arabic (Native), English (Professional)"}
                 </div>
               </section>

                {/* Key Skills */}
               <section>
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
                  Key Skills
                </h3>
                <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                  <span className="bg-slate-100 px-2 py-1 rounded">Strategic Planning</span>
                  <span className="bg-slate-100 px-2 py-1 rounded">HSE Compliance</span>
                  <span className="bg-slate-100 px-2 py-1 rounded">Project Management</span>
                </div>
               </section>

             </div>

          </div>
          
          {/* Footer Decoration */}
           <div className="mt-auto pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
             Generated by MuscatCV Refiner
           </div>
        </div>
      </div>
    </div>
  );
};