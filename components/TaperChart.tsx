import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TaperStep, BenzoType } from '../types';
import { BENZO_DETAILS } from '../constants';

interface Props {
  steps: TaperStep[];
  medication?: BenzoType; // Optional to prevent breaking if not passed immediately, but generally required
}

export const TaperChart: React.FC<Props> = (props) => {
  const { steps, medication = BenzoType.DIAZEPAM } = props;
  
  const isCrossover = medication !== BenzoType.DIAZEPAM;
  const medDetails = BENZO_DETAILS[medication];

  // Transform steps into a time-series based on durationDays
  const data = useMemo(() => {
    let accumulatedDays = 0;
    const points = steps.map(step => {
      // Calculate equivalent for the original med to plot on same axis (Diazepam Eq)
      const originalEq = isCrossover 
        ? step.originalMedDose * (medDetails?.diazepamEquivalence || 0)
        : 0;

      const point = {
        day: accumulatedDays,
        diazepam: step.diazepamDose,
        originalEq: originalEq,
        originalRaw: step.originalMedDose,
        label: `Week ${step.week}`
      };
      accumulatedDays += step.durationDays;
      return point;
    });

    // Add final point to represent the end of the last step
    points.push({
        day: accumulatedDays,
        diazepam: 0,
        originalEq: 0,
        originalRaw: 0,
        label: 'Finish'
    });

    return points;
  }, [steps, medication, isCrossover, medDetails]);

  return (
    <div className="h-[250px] sm:h-[400px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorDiazepam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="4 4" 
            stroke="#64748b" 
            strokeOpacity={0.1} 
            vertical={true}
          />
          <XAxis 
            dataKey="day" 
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            type="number"
            domain={['dataMin', 'dataMax']}
            dy={10}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            width={40}
            label={{ 
              value: 'Diazepam Eq (mg)', 
              angle: -90, 
              position: 'insideLeft', 
              style: { fill: '#94a3b8', fontSize: 10, textAnchor: 'middle' } 
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px'
            }}
            formatter={(value: number, name: string, props: any) => {
                if (name === 'Diazepam') return [`${value} mg`, name];
                // Show raw dose for original med even though graph plots equivalent
                if (name === medDetails.name) return [`${props.payload.originalRaw} mg`, name];
                return [value, name];
            }}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
          />
          
          {/* Original Medication Area (Only if crossover) */}
          {isCrossover && (
             <Area 
                type="stepAfter" 
                dataKey="originalEq" 
                name={medDetails.name}
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorOriginal)" 
                animationDuration={1500}
                stackId="1" // Stacked to show substitution effect (Constant Total Load during crossover)
              />
          )}

          {/* Diazepam Area */}
          <Area 
            type="stepAfter" 
            dataKey="diazepam" 
            name="Diazepam"
            stroke="#0d9488" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorDiazepam)" 
            animationDuration={1500}
            stackId="1"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};