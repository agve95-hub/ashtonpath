import { BenzoType, BenzoData } from './types';

// Approximate equivalents to 10mg Diazepam according to Ashton
export const BENZO_DETAILS: Record<BenzoType, BenzoData> = {
  [BenzoType.ALPRAZOLAM]: {
    name: 'Alprazolam',
    halfLife: '6-12 hrs',
    diazepamEquivalence: 20 // 0.5mg Xanax ~= 10mg Valium -> 1mg Xanax = 20mg Valium
  },
  [BenzoType.CLONAZEPAM]: {
    name: 'Clonazepam',
    halfLife: '18-50 hrs',
    diazepamEquivalence: 20 // 0.5mg Klonopin ~= 10mg Valium -> 1mg Klonopin = 20mg Valium
  },
  [BenzoType.DIAZEPAM]: {
    name: 'Diazepam',
    halfLife: '20-100 hrs',
    diazepamEquivalence: 1 // 1:1
  },
  [BenzoType.LORAZEPAM]: {
    name: 'Lorazepam',
    halfLife: '10-20 hrs',
    diazepamEquivalence: 10 // 1mg Ativan ~= 10mg Valium
  },
  [BenzoType.TEMAZEPAM]: {
    name: 'Temazepam',
    halfLife: '8-22 hrs',
    diazepamEquivalence: 0.5 // 20mg Temazepam ~= 10mg Valium -> 1mg Temazepam = 0.5mg Valium
  },
  [BenzoType.CHLORDIAZEPOXIDE]: {
    name: 'Chlordiazepoxide',
    halfLife: '5-30 hrs',
    diazepamEquivalence: 0.4 // 25mg Librium ~= 10mg Valium -> 1mg Librium = 0.4mg Valium
  }
};

export const DISCLAIMER_TEXT = `
This application is for informational and educational purposes only. 
It is NOT a medical device and does NOT provide medical advice. 

Benzodiazepine withdrawal can be dangerous and potentially life-threatening if done too quickly. 
The schedules generated here are mathematical approximations based on the Ashton Manual principles 
but must be reviewed and supervised by a qualified healthcare professional.

Never stop taking benzodiazepines abruptly.
`;
