// Fix: Add window declaration for SpeechRecognition API to fix TypeScript errors.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onend: () => void;
  onerror: (event: any) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

import React, { useState, useEffect, useRef } from 'react';
import { SKILL_OPTIONS } from '../constants';

// --- VoiceInput Component defined in the same file ---
const MicIcon = ({ isListening }: { isListening: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isListening ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
    </svg>
);

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  targetId: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, targetId }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        onTranscript(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition not supported by this browser.");
      setIsSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch(e) {
        console.error("Error starting speech recognition:", e);
      }
    }
  };
  
  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className="absolute inset-y-0 right-0 flex items-center pr-3 z-10"
      aria-label={`Dictate for ${targetId}`}
      title={`Dictate for ${targetId}`}
    >
      {isListening ? (
         <div className="relative flex items-center justify-center h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <MicIcon isListening={true} />
        </div>
      ) : (
         <MicIcon isListening={false} />
      )}
    </button>
  );
};

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

  const handleSkillTranscript = (transcript: string) => {
      const normalizedTranscript = transcript.toLowerCase().replace(/[.&]/g, '').trim();
      const foundOption = SKILL_OPTIONS.find(option =>
          option.label.toLowerCase().replace(/[.&]/g, '').includes(normalizedTranscript)
      );
      if (foundOption) {
          setSkill(foundOption.value);
      } else {
          console.warn(`No skill match found for: "${transcript}"`);
      }
  };

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
                    <div className="relative">
                        <input
                            id="ageYears"
                            type="number"
                            value={ageYears}
                            onChange={(e) => setAgeYears(e.target.value)}
                            placeholder="e.g., 1"
                            className="w-full px-4 py-3 pr-12 bg-white text-text-dark placeholder:text-gray-400 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow transition duration-150 ease-in-out"
                            required
                            min="0"
                            max="12"
                        />
                        <VoiceInput targetId="ageYears" onTranscript={setAgeYears} />
                    </div>
                </div>
                 <div>
                    <label htmlFor="ageMonths" className="block text-sm font-bold text-text-dark mb-2">Months</label>
                    <div className="relative">
                        <input
                            id="ageMonths"
                            type="number"
                            value={ageMonths}
                            onChange={(e) => setAgeMonths(e.target.value)}
                            placeholder="e.g., 6"
                            className="w-full px-4 py-3 pr-12 bg-white text-text-dark placeholder:text-gray-400 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow transition duration-150 ease-in-out"
                            required
                            min="0"
                            max="11"
                        />
                        <VoiceInput targetId="ageMonths" onTranscript={setAgeMonths} />
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="skill" className="block text-sm font-bold text-text-dark mb-2">Developmental Skill to Focus On</label>
                <div className="relative">
                    <select
                        id="skill"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        className="w-full px-4 py-3 pr-12 bg-white text-text-dark border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow transition duration-150 ease-in-out appearance-none"
                        required
                    >
                        {SKILL_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <VoiceInput targetId="skill" onTranscript={handleSkillTranscript} />
                </div>
            </div>
            <div>
                 <label htmlFor="specialNeeds" className="block text-sm font-bold text-text-dark mb-2">Special Needs or Considerations (Optional)</label>
                 <div className="relative">
                    <textarea
                        id="specialNeeds"
                        value={specialNeeds}
                        onChange={(e) => setSpecialNeeds(e.target.value)}
                        placeholder="e.g., visually impaired, uses sign language, has difficulty with fine motor skills..."
                        className="w-full px-4 py-3 pr-12 bg-white text-text-dark placeholder:text-gray-400 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow transition duration-150 ease-in-out"
                        rows={2}
                    />
                    <VoiceInput 
                        targetId="specialNeeds" 
                        onTranscript={(transcript) => setSpecialNeeds(prev => (prev.trim() ? prev.trim() + ' ' : '') + transcript)} 
                    />
                 </div>
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