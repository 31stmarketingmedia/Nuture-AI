import React, { useState } from 'react';
import { Activity } from '../types';

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

interface ActivityCardProps {
    activity: Activity;
    onAddToPlan: (activity: Activity) => void;
    isSelected: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onAddToPlan, isSelected }) => {
    const [openSection, setOpenSection] = useState<string | null>('benefit');

    const toggleSection = (section: string) => {
        setOpenSection(prev => prev === section ? null : section);
    };

    // Fix: Refactor Section props to a type alias to avoid potential type inference issues.
    // Fix: Made children optional to resolve TS error.
    type SectionProps = { title: string; id: string; children?: React.ReactNode; };

    const Section = ({ title, id, children }: SectionProps) => (
        <div className="border-t border-gray-200">
            <button
                onClick={() => toggleSection(id)}
                className="w-full flex justify-between items-center text-left py-3 px-4"
                aria-expanded={openSection === id}
                aria-controls={`section-content-${id}`}
            >
                <h4 className="font-bold text-text-dark">{title}</h4>
                <svg
                    className={`h-5 w-5 text-gray-500 transform transition-transform ${openSection === id ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {openSection === id && (
                <div id={`section-content-${id}`} className="px-4 pb-4 text-sm text-text-medium">
                    {children}
                </div>
            )}
        </div>
    );


    return (
        <div className={`bg-white rounded-2xl shadow-lg overflow-hidden border-4 transition-all duration-300 ${isSelected ? 'border-accent-coral' : 'border-transparent'}`}>
            <div className="p-4">
                <h3 className="text-xl font-extrabold text-text-dark mb-1">{activity.name}</h3>
                <p className="text-text-medium text-sm font-semibold">{activity.description}</p>
            </div>
            
            <div className="bg-gray-50">
                <Section title="Why This Helps" id="benefit">
                    <p>{activity.developmentalBenefit}</p>
                </Section>
                
                {activity.materials && activity.materials.length > 0 && (
                    <Section title="What You'll Need" id="materials">
                        <ul className="list-disc list-inside space-y-1">
                            {activity.materials.map((material, index) => <li key={index}>{material}</li>)}
                        </ul>
                    </Section>
                )}

                <Section title="How to Do It" id="instructions">
                    <ol className="list-decimal list-inside space-y-2">
                        {activity.instructions.map((instruction, index) => <li key={index}>{instruction}</li>)}
                    </ol>
                </Section>
            </div>

            <div className="p-4 bg-white">
                <button
                    onClick={() => onAddToPlan(activity)}
                    className={`w-full flex justify-center items-center px-4 py-2 border text-base font-bold rounded-lg shadow-sm transition-colors duration-200 ${
                        isSelected 
                        ? 'bg-accent-coral text-white border-accent-coral' 
                        : 'bg-white text-accent-coral border-accent-coral hover:bg-accent-coral hover:text-white'
                    }`}
                >
                    {isSelected ? (
                        <>
                            <CheckIcon />
                            <span className="ml-2">Added to Plan</span>
                        </>
                    ) : (
                        <span>+ Add to Plan</span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ActivityCard;