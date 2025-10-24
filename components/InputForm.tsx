import React from 'react';
import { SKILL_OPTIONS } from '../constants';

interface InputFormProps {
  ageYears: string;
  setAgeYears: (age: string) => void;
  ageMonths: string;
  setAgeMonths: (age: string) => void;
  skill: string;
  setSkill: (skill: string) => void;
  specialNeeds: string;
  setSpecialNeeds: (needs: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ 
    ageYears, setAgeYears, ageMonths, setAgeMonths, skill, setSkill, specialNeeds, setSpecialNeeds, onSubmit, isLoading 
}) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-gray-200">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
            <div className="col-span-1">
                <label htmlFor="ageYears" className="block text-sm font-bold text-text-dark mb-2">Years</label>
                <input
                    id="ageYears"
                    type="number"
                    value={ageYears}
                    onChange={(e) => setAgeYears(e.target.value)}
                    placeholder="e.g., 1"
                    className="w-full px-4 py-3 bg-white text-text-dark placeholder:text-gray-400 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow transition duration-150 ease-in-out"
                    required
                    min="0"
                    max="12"
                />
            </div>
             <div className="col-span-1">
                <label htmlFor="ageMonths" className="block text-sm font-bold text-text-dark mb-2">Months</label>
                <input
                    id="ageMonths"
                    type="number"
                    value={ageMonths}
                    onChange={(e) => setAgeMonths(e.target.value)}
                    placeholder="e.g., 6"
                    className="w-full px-4 py-3 bg-white text-text-dark placeholder:text-gray-400 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow transition duration-150 ease-in-out"
                    required
                    min="0"
                    max="11"
                />
            </div>
            <div className="col-span-1 md:col-span-2">
                <label htmlFor="skill" className="block text-sm font-bold text-text-dark mb-2">Developmental Skill</label>
                <select
                    id="skill"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-text-dark border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow transition duration-150 ease-in-out"
                    required
                >
                    {SKILL_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <div className="col-span-1 md:col-span-1">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-brand-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform duration-150 ease-in-out hover:scale-105"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : 'Get Activities!'}
                </button>
            </div>
            <div className="col-span-full">
                 <label htmlFor="specialNeeds" className="block text-sm font-bold text-text-dark mb-2">Special Needs (Optional)</label>
                 <textarea
                    id="specialNeeds"
                    value={specialNeeds}
                    onChange={(e) => setSpecialNeeds(e.target.value)}
                    placeholder="e.g., child is visually impaired, uses sign language, has difficulty with fine motor skills..."
                    className="w-full px-4 py-3 bg-white text-text-dark placeholder:text-gray-400 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow transition duration-150 ease-in-out"
                    rows={2}
                 />
            </div>
        </form>
    </div>
  );
};

export default InputForm;