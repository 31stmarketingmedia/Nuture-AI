import React, { useState, useEffect } from 'react';
import { Activity, Plan } from '../types';
import { generatePlan } from '../services/geminiService';

interface PlannerProps {
    selectedActivities: Activity[];
    ageYears: string;
    ageMonths: string;
    specialNeeds: string;
    onBack: () => void;
}

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const Planner: React.FC<PlannerProps> = ({ selectedActivities, ageYears, ageMonths, specialNeeds, onBack }) => {
    const [plan, setPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeneratePlan = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generatePlan(selectedActivities, ageYears, ageMonths, specialNeeds);
            setPlan(result);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while creating the plan.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    // Auto-generate plan when component mounts if activities are present
    useEffect(() => {
        if(selectedActivities.length > 0) {
            handleGeneratePlan();
        }
    }, [selectedActivities]);


    if (selectedActivities.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-extrabold text-brand-primary mb-2">No Activities Selected</h2>
                <p className="text-text-medium max-w-2xl mx-auto mb-4">
                    Please go back and select some activities to build your plan.
                </p>
                <button
                    onClick={onBack}
                    className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-accent-coral hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-coral"
                >
                    &larr; Back to Activities
                </button>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-extrabold text-brand-primary mb-2">3. Your AI-Generated Daily Plan</h2>
                <p className="text-text-medium max-w-2xl mx-auto">Here's a sample schedule to inspire your day. Feel free to adapt it!</p>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                {isLoading && (
                     <div className="text-center text-text-medium py-12">
                         <svg className="animate-spin h-10 w-10 text-brand-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-xl font-bold text-brand-secondary">Building your perfect day...</p>
                        <p className="mt-1">The AI is organizing the activities into a schedule.</p>
                    </div>
                )}
                {error && (
                    <div className="text-center p-6 bg-red-100 border-2 border-red-300 text-red-800 rounded-lg">
                        <h3 className="font-bold">Oops! Could not create a plan.</h3>
                        <p>{error}</p>
                        <button onClick={handleGeneratePlan} className="mt-4 px-4 py-2 bg-red-600 text-white font-bold rounded-lg">
                            Try Again
                        </button>
                    </div>
                )}
                {plan && !isLoading && (
                    <div className="space-y-6">
                        <h3 className="text-center text-2xl font-bold text-text-dark">{plan.title}</h3>
                        <div className="flow-root">
                             <ul className="-mb-8">
                                {plan.schedule.map((slot, index) => (
                                    <li key={index}>
                                        <div className="relative pb-8">
                                            {index !== plan.schedule.length - 1 ? (
                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                            ) : null}
                                            <div className="relative flex items-start space-x-4">
                                                <div>
                                                    <span className="h-8 w-8 rounded-full bg-brand-secondary flex items-center justify-center ring-8 ring-white text-white">
                                                       <ClockIcon />
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div>
                                                        <p className="text-sm font-bold text-text-dark">{slot.time}</p>
                                                        <h4 className="text-lg font-extrabold text-brand-primary">{slot.activityName}</h4>
                                                    </div>
                                                    <div className="mt-1 text-sm text-text-medium">
                                                        <p>{slot.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Planner;
