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
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center mb-6">
             <h2 className="text-2xl font-extrabold text-brand-primary mb-2">1. Tell Us About Your Child</h2>
            <p className="text-text-medium max-w-2xl mx-auto">
                Provide a few details to help our AI find the perfect activities.
            </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
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
                 <div>
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
            </div>
            <div>
                <label htmlFor="skill" className="block text-sm font-bold text-text-dark mb-2">Developmental Skill to Focus On</label>
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
            <div>
                 <label htmlFor="specialNeeds" className="block text-sm font-bold text-text-dark mb-2">Special Needs or Considerations (Optional)</label>
                 <textarea
                    id="specialNeeds"
                    value={specialNeeds}
                    onChange={(e) => setSpecialNeeds(e.target.value)}
                    placeholder="e.g., visually impaired, uses sign language, has difficulty with fine motor skills..."
                    className="w-full px-4 py-3 bg-white text-text-dark placeholder:text-gray-400 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow transition duration-150 ease-in-out"
                    rows={2}
                 />
            </div>
             <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-4 py-4 border border-transparent text-lg font-bold rounded-lg shadow-sm text-white bg-accent-coral hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-coral disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform duration-150 ease-in-out hover:scale-105"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Finding Activities...
                        </>
                    ) : 'Find Activities'}
                </button>
            </div>
        </form>
    </div>
  );
};

export default InputForm;