export interface Activity {
  name: string;
  description: string;
  materials: string[];
  instructions: string[];
  developmentalBenefit: string;
}

export interface TimeSlot {
  time: string;
  activityName: string;
  description: string;
}

export interface Plan {
  title: string;
  schedule: TimeSlot[];
}
