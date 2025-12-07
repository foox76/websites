import React, { useState } from 'react';
import { UserInfo, LayoutMode } from '../types';

interface InputSectionProps {
  onGenerate: (text: string) => void;
  isLoading: boolean;
  userInfo: UserInfo;
  onUserInfoChange: (field: keyof UserInfo, value: string) => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  onGenerate,
  isLoading,
  userInfo,
  onUserInfoChange,
  layoutMode,
  onLayoutModeChange
}) => {
  const [inputText, setInputText] = useState('');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUserInfoChange('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    onUserInfoChange('photo', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onGenerate(inputText);
    }
  };

  const handleClear = () => {
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </span>
          Resume Details
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your details and paste your rough notes below.
        </p>

        {/* Layout Mode Selector */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">CV Layout Mode</label>
          <div className="relative">
            <select
              value={layoutMode}
              onChange={(e) => onLayoutModeChange(e.target.value as LayoutMode)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 pr-8"
            >
              <option value="compact">Compact (1 Page)</option>
              <option value="expanded">Expanded (2 Pages)</option>
              <option value="detailed">Detailed (3 Pages)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

        {/* Personal Details Section */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Personal Information</label>

          {/* Photo Upload */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
            {userInfo.photo ? (
              <div className="relative group">
                <img src={userInfo.photo} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-900 mb-1">
                Profile Photo <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  {userInfo.photo ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>
          </div>

          <input
            type="text"
            placeholder="Full Name"
            value={userInfo.fullName}
            onChange={(e) => onUserInfoChange('fullName', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
          />
          <input
            type="text"
            placeholder="Job Title (e.g., Senior Process Engineer)"
            value={userInfo.jobTitle}
            onChange={(e) => onUserInfoChange('jobTitle', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
          />
          <input
            type="text"
            placeholder="Company / Organization Name"
            value={userInfo.company}
            onChange={(e) => onUserInfoChange('company', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
          />
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Contact Details</label>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              placeholder="Phone Number"
              value={userInfo.phone}
              onChange={(e) => onUserInfoChange('phone', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={userInfo.email}
              onChange={(e) => onUserInfoChange('email', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
            <input
              type="text"
              placeholder="LinkedIn URL"
              value={userInfo.linkedin}
              onChange={(e) => onUserInfoChange('linkedin', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
            <input
              type="text"
              placeholder="Location (e.g. Muscat, Oman)"
              value={userInfo.location}
              onChange={(e) => onUserInfoChange('location', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Education */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Education</label>
          <input
            type="text"
            placeholder="University Name"
            value={userInfo.university}
            onChange={(e) => onUserInfoChange('university', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
          />
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Degree"
              value={userInfo.degree}
              onChange={(e) => onUserInfoChange('degree', e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
            <input
              type="text"
              placeholder="GPA"
              value={userInfo.gpa}
              onChange={(e) => onUserInfoChange('gpa', e.target.value)}
              className="w-1/3 px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
          </div>
          <textarea
            placeholder="Certifications & Courses (e.g., PMP, Google Data Analytics, Six Sigma Green Belt)"
            value={userInfo.certifications}
            onChange={(e) => onUserInfoChange('certifications', e.target.value)}
            className="w-full p-4 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none transition-all text-sm h-24"
          />
          <textarea
            placeholder="Academic Modules / Subjects (Optional - e.g. Supply Chain Management, Operations Research)"
            value={userInfo.academicModules}
            onChange={(e) => onUserInfoChange('academicModules', e.target.value)}
            className="w-full p-4 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none transition-all text-sm h-24"
          />
        </div>

        {/* Languages & Skills */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Skills & Languages</label>
          <input
            type="text"
            placeholder="Languages (e.g. Arabic, English)"
            value={userInfo.languages}
            onChange={(e) => onUserInfoChange('languages', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm mb-3"
          />
          <input
            type="text"
            placeholder="Soft Skills (e.g., Teamwork, Leadership)"
            value={userInfo.softSkills}
            onChange={(e) => onUserInfoChange('softSkills', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm mb-3"
          />
          <input
            type="text"
            placeholder="Hard Skills / Technical (e.g., Python, SAP)"
            value={userInfo.hardSkills}
            onChange={(e) => onUserInfoChange('hardSkills', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100"></div>

        {/* Notes Input Section */}
        <div className="space-y-2 flex-1 flex flex-col">
          <label className="block text-sm font-semibold text-slate-700">Experience Notes</label>
          <p className="text-xs text-slate-400">
            Paste messy notes. We'll fix grammar & format for GCC standards.
          </p>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="- worked at pdo as engineer
- then moved to omantel as manager..."
            className="w-full flex-1 min-h-[150px] p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none transition-all font-mono text-sm leading-relaxed text-slate-700 bg-slate-50 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading || (!inputText && !userInfo.fullName)}
            className="px-4 py-2.5 rounded-lg text-slate-500 font-medium hover:bg-slate-100 text-sm transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !inputText.trim()}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-white font-semibold shadow-lg shadow-emerald-600/20 transition-all text-sm
              ${isLoading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 hover:shadow-emerald-700/30 active:scale-[0.98]'
              }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Refining...</span>
              </>
            ) : (
              <>
                <span>Refine Resume</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};