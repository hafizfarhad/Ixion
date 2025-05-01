import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

interface RiskScoreProps {
  score: number;
  previousScore?: number;
  threshold: {
    low: number;
    medium: number;
    high: number;
  };
  title?: string;
}

const RiskScoreGauge: React.FC<RiskScoreProps> = ({ 
  score, 
  previousScore, 
  threshold,
  title = "Risk Score"
}) => {
  const getColor = (value: number) => {
    if (value <= threshold.low) return '#4ade80'; // green-400
    if (value <= threshold.medium) return '#facc15'; // yellow-400
    return '#f87171'; // red-400
  };

  const data = [
    {
      name: 'Risk Score',
      value: score,
      fill: getColor(score),
    },
  ];

  if (previousScore !== undefined) {
    data.unshift({
      name: 'Previous',
      value: previousScore,
      fill: '#6b7280', // gray-500
    });
  }

  return (
    <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
      <div className="p-4 border-b border-[#3d3d3d]">
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>
      <div className="p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="30%" 
              outerRadius="100%" 
              barSize={20} 
              data={data}
              startAngle={180} 
              endAngle={0}
            >
              <RadialBar
                background
                dataKey="value"
                cornerRadius={5}
                max={100}
              />
              <Tooltip
                formatter={(value) => [`${value}`, 'Risk Score']}
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '4px' }}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold fill-white"
              >
                {score}
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-green-400 text-sm">Low Risk ({threshold.low})</span>
          <span className="text-yellow-400 text-sm">Medium ({threshold.medium})</span>
          <span className="text-red-400 text-sm">High Risk (100)</span>
        </div>
      </div>
    </div>
  );
};

export default RiskScoreGauge;