import React from 'react';
import { Activity } from '../types';

const MaterialIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-pink" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.25 2.75a.75.75 0 00-1.5 0v1.5c0 .414.336.75.75.75s.75-.336.75-.75v-1.5zM15 5.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM19.25 9a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM17.25 10.5a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z" />
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v13.5C2 21.43 3.57 23 5.5 23H17a2 2 0 002-2V6a2 2 0 00-2-2H4zm13.25 4a.75.75 0 000-1.5H6.75a.75.75 0 000 1.5h10.5z" clipRule="evenodd" />
    </svg>
);

const InstructionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-secondary" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 4h7v5h5v11H6V4zm2 4h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" clipRule="evenodd" />
    </svg>
);

const BenefitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-yellow" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.25a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5a.75.75 0 01.75-.75zM7.5 6a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zM14 5.25a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5a.75.75 0 01.75-.75zM16.5 9a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zM9 12.25a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" opacity=".5"/>
        <path fillRule="evenodd" d="M12 8.25a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5a.75.75 0 01.75-.75zM10.291 16.54a4.002 4.002 0 01-3.235-2.025.75.75 0 011.3-.73 2.5 2.5 0 004.088 1.265.75.75 0 011.3.73 4.002 4.002 0 01-3.235 2.025C10.26 17.75 10 18.5 10 19.25a.75.75 0 01-1.5 0c0-.75-.26-1.5-.418-2.122a4.002 4.002 0 01-.48-1.527c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .616-.14 1.205-.403 1.737a.75.75 0 01-1.313-.707A2.5 2.5 0 0013.5 14a2.5 2.5 0 00-2.5 2.5c0 .085.006.168.016.25a.75.75 0 01-1.49.155A4.002 4.002 0 0110.291 16.54z" clipRule="evenodd"/>
    </svg>
);


interface ActivityCardProps {
    activity: Activity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl border-2 border-gray-100 flex flex-col">
      <div className="p-6 border-b-4 border-brand-primary">
        <h3 className="text-xl font-extrabold text-text-dark mb-1">{activity.name}</h3>
        <p className="text-text-medium text-sm font-semibold">{activity.description}</p>
      </div>
      <div className="p-6 bg-gray-50 flex-grow space-y-6">
        <div className="p-4 rounded-lg bg-yellow-100/50 border-2 border-accent-yellow/30">
            <div className="flex items-center mb-2">
                <BenefitIcon />
                <h4 className="font-extrabold text-text-dark ml-2">Why This Helps</h4>
            </div>
            <p className="text-text-medium text-sm pl-8">{activity.developmentalBenefit}</p>
        </div>
        
        {activity.materials && activity.materials.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
                <MaterialIcon />
                <h4 className="font-extrabold text-text-dark ml-2">What You'll Need</h4>
            </div>
            <ul className="list-disc list-inside text-text-medium space-y-1 text-sm pl-8">
              {activity.materials.map((material, index) => (
                <li key={index}>{material}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
            <div className="flex items-center mb-2">
                <InstructionIcon />
                <h4 className="font-extrabold text-text-dark ml-2">How to Do It</h4>
            </div>
          <ol className="list-decimal list-inside text-text-medium space-y-2 text-sm pl-8">
            {activity.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;