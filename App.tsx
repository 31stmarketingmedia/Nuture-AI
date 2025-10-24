import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ActivityCard from './components/ActivityCard';
import { generateActivities } from './services/geminiService';
import { Activity } from './types';
import { SKILL_OPTIONS } from './constants';

const App: React.FC = () => {
  const [ageYears, setAgeYears] = useState<string>('0');
  const [ageMonths, setAgeMonths] = useState<string>('9');
  const [skill, setSkill] = useState<string>(SKILL_OPTIONS[0].value);
  const [specialNeeds, setSpecialNeeds] = useState<string>('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setActivities([]);

    try {
      const result = await generateActivities(ageYears, ageMonths, skill, specialNeeds);
      setActivities(result);
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
    } finally {
      setIsLoading(false);
    }
  };

  const WelcomeMessage = () => (
    <div className="text-center p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-200 mt-8">
        <h2 className="text-2xl font-extrabold text-brand-primary mb-2">Welcome to Nurture AI!</h2>
        <p className="text-text-medium max-w-2xl mx-auto">
            Ready to discover fun and engaging activities tailored to your child's development?
            Just enter their age, select a skill, add any special considerations, and let our AI create a personalized plan!
        </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-light font-sans text-text-dark">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <section id="input-section" className="mb-8 md:mb-12">
            <InputForm
                ageYears={ageYears}
                setAgeYears={setAgeYears}
                ageMonths={ageMonths}
                setAgeMonths={setAgeMonths}
                skill={skill}
                setSkill={setSkill}
                specialNeeds={specialNeeds}
                setSpecialNeeds={setSpecialNeeds}
                onSubmit={handleGenerate}
                isLoading={isLoading}
            />
        </section>

        <section id="results-section">
            {error && (
                <div className="text-center p-6 bg-red-100 border-2 border-red-300 text-red-800 rounded-lg">
                    <h3 className="font-bold">Oops! Something went wrong.</h3>
                    <p>{error}</p>
                </div>
            )}

            {!hasSearched && !isLoading && <WelcomeMessage />}

            {isLoading && (
                 <div className="text-center text-text-medium py-12">
                    <p className="text-xl font-bold text-brand-secondary">Our AI is crafting the perfect activities...</p>
                    <p className="mt-1">This might take a moment. Great things are coming!</p>
                </div>
            )}
            
            {!isLoading && activities.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {activities.map((activity, index) => (
                        <ActivityCard key={index} activity={activity} />
                    ))}
                </div>
            )}
            
            {hasSearched && !isLoading && activities.length === 0 && !error && (
                 <div className="text-center p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-200 mt-8">
                    <h2 className="text-2xl font-extrabold text-brand-primary mb-2">No Activities Found</h2>
                    <p className="text-text-medium max-w-2xl mx-auto">
                        We couldn't generate activities for these details. Please try adjusting the age or skill and try again.
                    </p>
                </div>
            )}
        </section>
      </main>
      <footer className="text-center py-6 text-sm text-gray-500">
        <p>Powered by Gemini. Designed for happy parents.</p>
      </footer>
    </div>
  );
};

export default App;