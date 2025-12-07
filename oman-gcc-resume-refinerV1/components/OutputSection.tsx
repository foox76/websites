import React from 'react';
import { ResumeResult, UserInfo, LayoutMode } from '../types';

interface OutputSectionProps {
  result: ResumeResult | null;
  isLoading: boolean;
  userInfo: UserInfo;
  layoutMode: LayoutMode;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ result, isLoading, userInfo, layoutMode }) => {

  const handlePrint = () => {
    const originalTitle = document.title;
    const filename = (result?.refinedProfile?.fullName || userInfo.fullName || 'Resume').replace(/\s+/g, '_');
    document.title = `${filename}_CV`;

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  // --- Data Logic ---
  const displayFullName = result?.refinedProfile?.fullName || userInfo.fullName || "Your Name";
  const displayJobTitle = result?.refinedProfile?.jobTitle || userInfo.jobTitle || "Current Job Title";
  const displayLocation = result?.refinedProfile?.location || userInfo.location;
  const displayUniversity = result?.refinedProfile?.university || userInfo.university;
  const displayDegree = result?.refinedProfile?.degree || userInfo.degree;
  const displayLanguages = result?.refinedProfile?.languages || userInfo.languages;

  const refinedCertifications = result?.refinedProfile?.certifications;
  const inputCertifications = userInfo.certifications ? userInfo.certifications.split('\n').map(c => c.trim()).filter(c => c.length > 0) : [];
  const displayCertifications = (refinedCertifications && refinedCertifications.length > 0) ? refinedCertifications : inputCertifications;

  const refinedSoftSkills = result?.refinedProfile?.softSkills;
  const inputSoftSkills = userInfo.softSkills ? userInfo.softSkills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  const displaySoftSkills = (refinedSoftSkills && refinedSoftSkills.length > 0) ? refinedSoftSkills : inputSoftSkills;

  const refinedHardSkills = result?.refinedProfile?.hardSkills || [];
  // Use input hard skills if result is null/empty but user provided them, otherwise wait for result
  const inputHardSkills = userInfo.hardSkills ? userInfo.hardSkills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  const displayHardSkills = (refinedHardSkills.length > 0) ? refinedHardSkills : inputHardSkills;

  const displayAcademicModules = userInfo.academicModules ? userInfo.academicModules.split('\n').map(m => m.trim()).filter(m => m.length > 0) : [];

  const placeholderSummary = "Your professional summary will appear here. It will be concise, impactful, and tailored for the GCC market.";
  const displaySummary = result?.summary || placeholderSummary;

  const isEmpty = !result && !userInfo.fullName;

  const contactItems = [
    { label: "Mobile", value: userInfo.phone },
    { label: "Email", value: userInfo.email },
    { label: "Location", value: displayLocation },
    { label: "LinkedIn", value: userInfo.linkedin },
  ].filter(item => item.value && item.value.trim() !== "");

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

  // --- Layout Logic ---
  const getLayoutClasses = () => {
    switch (layoutMode) {
      case 'expanded':
        return {
          container: 'p-[12mm] min-h-[297mm]', // Standard A4 padding
          textBase: 'text-sm', // Larger text
          textSmall: 'text-xs',
          headerMargin: 'mb-4',
          sectionSpacing: 'space-y-6',
          leading: 'leading-relaxed',
          gridGap: 'gap-6'
        };
      case 'detailed':
        return {
          container: 'p-[12mm] min-h-[297mm]',
          textBase: 'text-base', // Even larger
          textSmall: 'text-sm',
          headerMargin: 'mb-6',
          sectionSpacing: 'space-y-8',
          leading: 'leading-loose',
          gridGap: 'gap-8'
        };
      case 'compact':
      default:
        return {
          container: 'p-[10mm] min-h-[297mm]', // Tight padding
          textBase: 'text-[10px]', // Small text
          textSmall: 'text-[9px]',
          headerMargin: 'mb-2',
          sectionSpacing: 'space-y-3.5',
          leading: 'leading-snug',
          gridGap: 'gap-4'
        };
    }
  };

  const layout = getLayoutClasses();

  return (
    <div className="w-full h-full flex flex-col items-center">

      {/* Toolbar */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20 no-print toolbar">
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
      <div id="preview-scroll-container" className="flex-1 w-full overflow-y-auto p-8 flex justify-center bg-slate-100">

        {/* A4 Page Container */}
        <div
          id="resume-preview"
          className={`bg-white shadow-2xl transition-all duration-500 w-[210mm] relative flex flex-col mode-${layoutMode} ${layout.container} ${isLoading ? 'blur-[1px]' : ''}`}
        >

          {/* Loading Overlay */}
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

          {/* Header */}
          <header className={`border-b-2 border-slate-800 pb-3 ${layout.headerMargin} print-header-border`}>
            <div className={`flex items-center ${userInfo.photo ? 'justify-between text-left' : 'justify-center text-center'}`}>

              {/* Text Container */}
              <div className={userInfo.photo ? 'flex-1' : 'w-full'}>
                <h1 className={`print-name font-bold text-slate-900 uppercase tracking-tight mb-0.5 ${layoutMode === 'detailed' ? 'text-4xl' : layoutMode === 'expanded' ? 'text-3xl' : 'text-2xl'}`}>
                  {displayFullName}
                </h1>
                <h2 className={`print-job-title font-medium text-emerald-800 mb-1.5 ${layoutMode === 'detailed' ? 'text-xl' : layoutMode === 'expanded' ? 'text-lg' : 'text-base'}`}>
                  {displayJobTitle}
                </h2>

                <div className={`flex flex-wrap gap-y-0.5 text-slate-600 ${userInfo.photo ? 'justify-start' : 'justify-center'} ${layout.textBase}`}>
                  {contactItems.length > 0 ? (
                    contactItems.map((item, index) => (
                      <div key={item.label} className="print-meta flex items-center">
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
              </div>

              {/* Photo */}
              {userInfo.photo && (
                <div className="ml-6 shrink-0 print-photo-container">
                  <img
                    src={userInfo.photo}
                    alt="Profile"
                    className="w-[35mm] h-[45mm] object-cover rounded shadow-md print-photo border border-slate-200"
                  />
                </div>
              )}
            </div>
          </header>

          <div className={`flex-1 ${layout.sectionSpacing}`}>

            {/* Summary */}
            <section>
              <h3 className={`print-section-header font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 ${layoutMode === 'detailed' ? 'text-sm' : layoutMode === 'expanded' ? 'text-xs' : 'text-[11px]'}`}>
                Professional Summary
              </h3>
              <p className={`print-body-text text-justify text-slate-700 ${layout.leading} ${layout.textBase} ${!result && 'text-slate-400 italic'}`}>
                {displaySummary}
              </p>
            </section>

            {/* Experience */}
            <section>
              <h3 className={`print-section-header font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 ${layoutMode === 'detailed' ? 'text-sm' : layoutMode === 'expanded' ? 'text-xs' : 'text-[11px]'}`}>
                Experience
              </h3>

              <div className={layoutMode === 'detailed' ? 'space-y-6' : layoutMode === 'expanded' ? 'space-y-4' : 'space-y-2.5'}>
                {experienceData.map((job, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={`print-job-row font-bold text-slate-800 ${layoutMode === 'detailed' ? 'text-base' : layoutMode === 'expanded' ? 'text-sm' : 'text-xs'}`}>
                        <span className="print-job-role">{job.jobTitle}</span> <span className="text-slate-400 mx-1 font-light">|</span> <span className="print-company font-bold">{job.company}</span>
                      </h4>
                      <span className={`print-date text-slate-500 italic whitespace-nowrap ${layout.textSmall}`}>{job.startDate} - {job.endDate}</span>
                    </div>

                    <ul className={`list-disc list-outside ml-3 space-y-0.5 ${layout.leading}`}>
                      {job.bulletPoints.map((point, i) => (
                        <li key={i} className={`print-body-text pl-1 text-slate-700 ${layout.textBase} ${!result && 'text-slate-400 italic'}`}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <h3 className={`print-section-header font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 ${layoutMode === 'detailed' ? 'text-sm' : layoutMode === 'expanded' ? 'text-xs' : 'text-[11px]'}`}>
                Education
              </h3>
              <div className={`text-slate-700 ${layout.textBase}`}>
                {(displayUniversity || displayDegree || !isEmpty) ? (
                  <div className="flex flex-col">
                    <span className="print-university font-bold text-slate-800">{displayUniversity || "Sultan Qaboos University"}</span>
                    <div className={`flex flex-wrap gap-x-2 mt-0.5 ${layout.textBase}`}>
                      <span className="print-degree italic">{displayDegree || "Bachelor of Engineering"}</span>
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

              {/* Academic Modules (Optional) */}
              {displayAcademicModules.length > 0 && (
                <div className="mt-2">
                  <h4 className={`font-semibold text-slate-800 mb-1 ${layout.textBase}`}>Key Modules:</h4>
                  <div className={`flex flex-wrap gap-1.5 text-slate-700 ${layout.textBase}`}>
                    {displayAcademicModules.map((module, i) => (
                      <span key={i} className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{module}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Grid */}
            <div className={`grid grid-cols-2 ${layout.gridGap}`}>

              {/* Left Col */}
              <div className={layoutMode === 'detailed' ? 'space-y-6' : 'space-y-3'}>
                <section>
                  <h3 className={`print-section-header font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 ${layoutMode === 'detailed' ? 'text-sm' : layoutMode === 'expanded' ? 'text-xs' : 'text-[11px]'}`}>
                    Certifications & Courses
                  </h3>
                  <ul className={`list-disc list-outside ml-3 space-y-0.5 ${layout.leading}`}>
                    {displayCertifications.length > 0 ? (
                      displayCertifications.map((cert, i) => (
                        <li key={i} className={`print-body-text text-slate-700 ${layout.textBase}`}>{cert}</li>
                      ))
                    ) : (
                      <li className={`text-slate-400 italic list-none ml-0 ${layout.textBase}`}>e.g. PMP, Six Sigma</li>
                    )}
                  </ul>
                </section>

                <section>
                  <h3 className={`print-section-header font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 ${layoutMode === 'detailed' ? 'text-sm' : layoutMode === 'expanded' ? 'text-xs' : 'text-[11px]'}`}>
                    Languages
                  </h3>
                  <div className={`print-body-text text-slate-700 ${layout.textBase} ${(!displayLanguages && isEmpty) && 'text-slate-400 italic'}`}>
                    {displayLanguages || "Arabic (Native), English (Professional)"}
                  </div>
                </section>
              </div>

              {/* Right Col */}
              <div className={layoutMode === 'detailed' ? 'space-y-6' : 'space-y-3'}>
                <section>
                  <h3 className={`print-section-header font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 ${layoutMode === 'detailed' ? 'text-sm' : layoutMode === 'expanded' ? 'text-xs' : 'text-[11px]'}`}>
                    Key Skills (Hard)
                  </h3>
                  <div className={`flex flex-wrap gap-1.5 text-slate-700 ${layout.textBase}`}>
                    {displayHardSkills.length > 0 ? (
                      displayHardSkills.map((skill, index) => (
                        <span key={index} className="print-skill-tag bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 leading-none">{skill}</span>
                      ))
                    ) : (
                      <span className={`text-slate-400 italic ${layout.textBase}`}>Technical skills inferred from input</span>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className={`print-section-header font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 ${layoutMode === 'detailed' ? 'text-sm' : layoutMode === 'expanded' ? 'text-xs' : 'text-[11px]'}`}>
                    Soft Skills
                  </h3>
                  <div className={`flex flex-wrap gap-1.5 text-slate-700 ${layout.textBase}`}>
                    {displaySoftSkills.length > 0 ? (
                      displaySoftSkills.map((skill, index) => (
                        <span key={index} className="print-skill-tag bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 leading-none">{skill}</span>
                      ))
                    ) : (
                      <span className={`text-slate-400 italic ${layout.textBase}`}>e.g. Leadership, Teamwork</span>
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