import { BenzoType, TaperPlan, TaperSpeed, TaperStep } from '../types';
import { BENZO_DETAILS } from '../constants';

const roundDose = (num: number): number => {
  // Round to nearest reasonable pill fraction (e.g. 0.125 or 0.5 or 1)
  // For safety/readability, we round to 2 decimal places generally
  return Math.round(num * 100) / 100;
};

export const calculateTaperSchedule = (
  medication: BenzoType,
  currentDose: number,
  speed: TaperSpeed,
  startDate: string
): TaperPlan => {
  const details = BENZO_DETAILS[medication];
  
  // 1. Calculate Starting Diazepam Equivalent
  const startingDiazepamEq = currentDose * details.diazepamEquivalence;
  
  const steps: TaperStep[] = [];
  let currentValium = startingDiazepamEq;
  let weekCount = 0;

  // Initial State (Stabilization) - usually 1-2 weeks
  const initDuration = 14; 
  steps.push({
    id: `step-init`,
    week: 0,
    originalMedDose: currentDose,
    diazepamDose: roundDose(currentValium),
    isCompleted: false,
    completedDays: new Array(initDuration).fill(false),
    durationDays: initDuration,
    notes: 'Stabilization phase'
  });

  // 2. Determine Reduction Rate
  // Ashton generally recommends 1mg drops every 1-2 weeks if dose < 20mg
  // Or 5-10% reductions.
  
  const isDirectTaper = medication === BenzoType.DIAZEPAM;

  // We limit the loop to avoid infinite loops in edge cases
  let safetyValve = 0;
  
  while (currentValium > 0 && safetyValve < 150) {
    // Determine duration based on speed
    const stepDuration = speed === TaperSpeed.SLOW ? 14 : 7;
    weekCount += (speed === TaperSpeed.SLOW ? 2 : 1); 
    safetyValve++;

    let reductionAmount = 0;

    if (speed === TaperSpeed.FAST) {
        // "Standard" Ashton Logic approximation
        if (currentValium > 40) reductionAmount = 5;       // Drop 5mg
        else if (currentValium > 20) reductionAmount = 2;  // Drop 2mg
        else if (currentValium > 10) reductionAmount = 1;  // Drop 1mg
        else if (currentValium > 5) reductionAmount = 0.5; // Drop 0.5mg
        else reductionAmount = 0.5;                        // Final tapering
    } else if (speed === TaperSpeed.MODERATE) {
        // ~10% reduction of current dose
        reductionAmount = currentValium * 0.10;
        // Enforce minimum floor for reduction so we don't Zeno's paradox forever
        if (reductionAmount < 0.5) reductionAmount = 0.5;
    } else {
        // Slow ~5% reduction
        reductionAmount = currentValium * 0.05;
        if (reductionAmount < 0.25) reductionAmount = 0.25;
    }

    const nextDose = currentValium - reductionAmount;

    if (nextDose <= 0) {
      currentValium = 0;
    } else {
      currentValium = nextDose;
    }

    steps.push({
      id: `step-${safetyValve}`,
      week: weekCount,
      // If we aren't crossing over, we back-calculate the original med dose for reference
      originalMedDose: roundDose(currentValium / details.diazepamEquivalence),
      diazepamDose: roundDose(currentValium),
      isCompleted: false,
      completedDays: new Array(stepDuration).fill(false),
      durationDays: stepDuration
    });
  }

  return {
    medication,
    startDose: currentDose,
    startDate,
    speed,
    steps,
    isDiazepamCrossOver: !isDirectTaper // In this simplified app, we assume everyone maps to the Valium scale for the chart
  };
};