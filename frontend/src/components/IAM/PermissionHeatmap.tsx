import React from 'react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Rectangle, ScatterChart, Cell } from 'recharts';

interface PermissionUsageProps {
  data: Array<{
    role: string;
    permission: string;
    value: number;
  }>;
  roles: string[];
  permissions: string[];
  title?: string;
}

const PermissionHeatmap: React.FC<PermissionUsageProps> = ({ 
  data, 
  roles, 
  permissions,
  title = "Permission Usage By Role" 
}) => {
  // Color scale function
  const getColor = (value: number) => {
    if (value <= 0) return '#333';
    if (value < 0.3) return '#2563eb'; // blue-600
    if (value < 0.6) return '#7c3aed'; // purple-600
    return '#c026d3'; // fuchsia-600
  };

  // Convert our data to a format that works with ScatterChart
  const formattedData = data.map(item => ({
    x: roles.indexOf(item.role),
    y: permissions.indexOf(item.permission),
    z: item.value * 50,  // Scale for visual size
    role: item.role,
    permission: item.permission,
    value: item.value
  }));
  
  // Create custom ticks for axes
  const xTicks = roles.map((_, index) => index);
  const yTicks = permissions.map((_, index) => index);
  
  return (
    <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
      <div className="p-4 border-b border-[#3d3d3d]">
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>
      <div className="p-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Role" 
                tick={{ fill: '#e5e7eb' }}
                tickLine={{ stroke: '#525252' }}
                axisLine={{ stroke: '#525252' }}
                ticks={xTicks}
                tickFormatter={(value) => roles[value] || ''}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Permission" 
                tick={{ fill: '#e5e7eb' }}
                tickLine={{ stroke: '#525252' }}
                axisLine={{ stroke: '#525252' }}
                ticks={yTicks}
                tickFormatter={(value) => permissions[value] || ''}
              />
              <Tooltip
                formatter={(value, name, props) => {
                  if (name === 'z') {
                    const dataPoint = props.payload;
                    return [`Value: ${dataPoint.value}`, `${dataPoint.role} - ${dataPoint.permission}`];
                  }
                  return [value, name];
                }}
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '4px' }}
              />
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(entry.value)}
                />
              ))}
              {formattedData.map((entry, index) => (
                <Rectangle
                  key={`rect-${index}`}
                  x={entry.x - 0.45}
                  y={entry.y - 0.45}
                  width={0.9}
                  height={0.9}
                  fill={getColor(entry.value)}
                  stroke="#3d3d3d"
                  strokeWidth={1}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-between mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: '#333' }}></div>
            <span className="text-white text-sm">No Access</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: '#2563eb' }}></div>
            <span className="text-white text-sm">Low Usage</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: '#7c3aed' }}></div>
            <span className="text-white text-sm">Medium Usage</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: '#c026d3' }}></div>
            <span className="text-white text-sm">High Usage</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionHeatmap;