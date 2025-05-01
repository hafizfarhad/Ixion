import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface UserStatusProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  title?: string;
}

const UserStatusWidget: React.FC<UserStatusProps> = ({ data, title = "User Status Distribution" }) => {
  return (
    <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
      <div className="p-4 border-b border-[#3d3d3d]">
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>
      <div className="p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} users`, name]}
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '4px' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: item.color }}></div>
              <span className="text-white text-sm">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserStatusWidget;