import { BenzoType, TaperPlan, TaperSpeed, TaperStep, Metabolism } from '../types';
import { BENZO_DETAILS } from '../constants';

const roundDose = (num: number): number => {
  // Round to nearest reasonable pill fraction (e.g. 0.125 or 0.5 or 1)
  return Math.round(num * 100) / 100;
};

export const calculateTaperSchedule = (
  medication: BenzoType,
  currentDose: number,
  speed: TaperSpeed,
  age: number,
  metabolism: Metabolism,
  yearsUsing: number,
  startDate: string,
  targetEndDate?: string
): TaperPlan => {
  const details = BENZO_DETAILS[medication];
  const steps: TaperStep[] = [];
  
  // 1. Calculate Starting Diazepam Equivalent
  const fullDiazepamEq = currentDose * details.diazepamEquivalence;
  const isDirectTaper = medication === BenzoType.DIAZEPAM;
  
  let currentValium = isDirectTaper ? currentDose : 0;
  let currentOriginalMed = isDirectTaper ? 0 : currentDose;
  let weekCount = 0;
  let stepCounter = 0;
  let globalDayCounter = 1;

  // --- DETERMINE BASELINE DURATION BASED ON BIOLOGY ---
  // Ashton Manual: Older patients metabolize less efficiently. 
  // Slow metabolizers need more time between cuts.
  let baseStepDuration = 7; // Default 1 week
  
  if (speed === TaperSpeed.SLOW) {
      baseStepDuration = 14;
  } else if (age > 65 || metabolism === 'slow') {
      // Force slower duration for vulnerable groups
      baseStepDuration = 14; 
  } else if (metabolism === 'fast') {
      // Removed redundant check for speed !== TaperSpeed.SLOW as it is handled in the first if block
      baseStepDuration = 7;
  }

  // --- STAGE 1: CROSSOVER (If not Diazepam) ---
  if (!isDirectTaper) {
      const crossoverWeeks = 4;
      const weeklySubstitutionRate = 0.25; // 25% per step

      for (let i = 1; i <= crossoverWeeks; i++) {
          weekCount++;
          stepCounter++;
          
          const percentNew = Math.min(1, i * weeklySubstitutionRate);
          const percentOld = 1 - percentNew;

          const stepOriginalDose = roundDose(currentDose * percentOld);
          const stepValiumDose = roundDose(fullDiazepamEq * percentNew);

          steps.push({
            id: `step-${stepCounter}`,
            week: weekCount,
            phase: percentNew === 1 ? 'stabilize' : 'crossover',
            originalMedDose: stepOriginalDose,
            diazepamDose: stepValiumDose,
            totalDiazepamEq: fullDiazepamEq,
            isCompleted: false,
            completedDays: new Array(7).fill(false), // Crossover usually done in 1-week intervals regardless of age
            durationDays: 7,
            globalDayStart: globalDayCounter,
            notes: percentNew === 1 
                ? 'Full substitution complete. Stabilize here before reducing.' 
                : `Substitute ${Math.round(percentNew * 100)}% of daily dose with Diazepam.`
          });
          globalDayCounter += 7;
      }
      currentValium = fullDiazepamEq;
  } else {
      // Initial Stabilization
      const initDuration = 14;
      steps.push({
        id: `step-init`,
        week: 0,
        phase: 'stabilize',
        originalMedDose: 0,
        diazepamDose: currentDose,
        totalDiazepamEq: currentDose,
        isCompleted: false,
        completedDays: new Array(initDuration).fill(false),
        durationDays: initDuration,
        globalDayStart: globalDayCounter,
        notes: 'Stabilization phase'
      });
      currentValium = currentDose;
      globalDayCounter += initDuration;
  }

  // --- STAGE 2: REDUCTION ---
  
  // Custom Logic Variables
  let customWeeklyReduction = 0;

  if (speed === TaperSpeed.CUSTOM && targetEndDate) {
    const start = new Date(startDate);
    start.setDate(start.getDate() + (globalDayCounter - 1)); // Adjust for crossover/stabilization
    
    const end = new Date(targetEndDate);
    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const weeks = totalDays / 7;
    customWeeklyReduction = currentValium / weeks;
  }

  let safetyValve = 0;
  
  while (currentValium > 0 && safetyValve < 150) {
    // Determine duration based on speed
    weekCount += (baseStepDuration / 7); 
    stepCounter++;
    safetyValve++;

    let reductionAmount = 0;

    if (speed === TaperSpeed.CUSTOM) {
        reductionAmount = customWeeklyReduction;
        if (reductionAmount < 0.1) reductionAmount = 0.1;
    } else if (speed === TaperSpeed.ASHTON) {
        // STRICT ASHTON SCHEDULE
        if (currentValium >= 50) reductionAmount = 5;
        else if (currentValium >= 20) reductionAmount = 2;
        else if (currentValium >= 10) reductionAmount = 1;
        else if (currentValium >= 5) reductionAmount = 0.5;
        else reductionAmount = 0.5; 

        // Modifer: Long term usage (> 5 years) suggests being more conservative
        // If they have been using for > 10 years, we might hold the floor higher or cut slightly less aggressively
        // But mainly we rely on durationDays for safety.

    } else if (speed === TaperSpeed.MODERATE) {
        // ~10% reduction of current dose
        reductionAmount = currentValium * 0.10;
        
        // Floor reduction for very low doses
        if (reductionAmount < 0.25) reductionAmount = 0.25; 
        if (currentValium <= 1) reductionAmount = 0.125; // Micro taper at end
    } else {
        // Slow ~5% reduction
        reductionAmount = currentValium * 0.05;
        if (reductionAmount < 0.125) reductionAmount = 0.125;
    }

    const nextDose = currentValium - reductionAmount;

    // Jumping off point
    if (nextDose <= 0.05) { 
      currentValium = 0;
    } else {
      currentValium = nextDose;
    }

    steps.push({
      id: `step-${stepCounter}`,
      week: Math.ceil(weekCount),
      phase: currentValium === 0 ? 'jump' : 'reduction',
      originalMedDose: 0, 
      diazepamDose: roundDose(currentValium),
      totalDiazepamEq: roundDose(currentValium),
      isCompleted: false,
      completedDays: new Array(baseStepDuration).fill(false),
      durationDays: baseStepDuration,
      globalDayStart: globalDayCounter,
      notes: currentValium === 0 ? 'Completion / Jumping off' : undefined
    });

    globalDayCounter += baseStepDuration;
  }

  return {
    medication,
    startDose: currentDose,
    startDate,
    speed,
    age,
    metabolism,
    yearsUsing,
    steps,
    isDiazepamCrossOver: !isDirectTaper
  };
};