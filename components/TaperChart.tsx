import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TaperStep } from '../types';

interface Props {
  steps: TaperStep[];
}

export const TaperChart: React.FC<Props> = ({ steps }) => {
  // Transform steps into a time-series based on durationDays
  const data = useMemo(() => {
    let accumulatedDays = 0;
    const points = steps.map(step => {
      const point = {
        day: accumulatedDays,
        dose: step.diazepamDose,
        label: `Week ${step.week}`
      };
      accumulatedDays += step.durationDays;
      return point;
    });

    // Add final point to represent the end of the last step
    points.push({
        day: accumulatedDays,
        dose: 0, 
        label: 'Finish'
    });

    return points;
  }, [steps]);

  return (
    <div className="h-[400px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 30,
          }}
        >
          <defs>
            <linearGradient id="colorDose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
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
            tick={{ fill: '#64748b', fontSize: 12 }}
            label={{ value: 'Days', position: 'insideBottomRight', offset: -10, fill: '#94a3b8' }}
            type="number"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            label={{ value: 'Dose (mg)', angle: -90, position: 'insideLeft', fill: '#94a3b8', dy: 40 }}
            width={40}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            itemStyle={{ color: '#0f766e' }}
            formatter={(value: number) => [`${value} mg`, 'Diazepam Eq.']}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Area 
            type="stepAfter" 
            dataKey="dose" 
            stroke="#0d9488" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorDose)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};