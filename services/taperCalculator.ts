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
  startDate: string,
  targetEndDate?: string
): TaperPlan => {
  const details = BENZO_DETAILS[medication];
  
  // 1. Calculate Starting Diazepam Equivalent
  const startingDiazepamEq = currentDose * details.diazepamEquivalence;
  
  const steps: TaperStep[] = [];
  let currentValium = startingDiazepamEq;
  let weekCount = 0;

  // Custom Logic Variables
  let customWeeklyReduction = 0;
  let initDuration = 14;

  if (speed === TaperSpeed.CUSTOM && targetEndDate) {
    const start = new Date(startDate);
    const end = new Date(targetEndDate);
    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Adjust stabilization duration based on total timeline
    if (totalDays < 28) initDuration = 0; // Skip stabilization if timeline is very short
    else if (totalDays < 60) initDuration = 7; // Shorten to 1 week if timeline is medium
    // else default 14

    // Calculate linear reduction
    // Available days for tapering after stabilization
    const taperingDays = Math.max(1, totalDays - initDuration);
    // Assume 7-day steps for custom linear taper
    const weeks = taperingDays / 7;
    customWeeklyReduction = startingDiazepamEq / weeks;
  }

  // Initial State (Stabilization)
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
  
  const isDirectTaper = medication === BenzoType.DIAZEPAM;

  // We limit the loop to avoid infinite loops in edge cases
  let safetyValve = 0;
  
  while (currentValium > 0 && safetyValve < 150) {
    // Determine duration based on speed
    // Custom defaults to 7 days per step for smoother linear decline
    const stepDuration = speed === TaperSpeed.SLOW ? 14 : 7;
    weekCount += (speed === TaperSpeed.SLOW ? 2 : 1); 
    safetyValve++;

    let reductionAmount = 0;

    if (speed === TaperSpeed.CUSTOM) {
        reductionAmount = customWeeklyReduction;
        // Safety clamp to ensure we don't stall if calculation was weird
        if (reductionAmount < 0.1) reductionAmount = 0.1;
    } else if (speed === TaperSpeed.FAST) {
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

    if (nextDose <= 0.1) { // Floating point epsilon safety
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