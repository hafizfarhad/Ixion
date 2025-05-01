import React from 'react';
import { StatsCardProps } from '@/types';

export default function StatsCard({ 
  title, 
  value, 
  type = 'default', 
  icon, 
  trend, 
  period = 'since last month'
}: StatsCardProps) {
  const getValueColor = () => {
    switch(type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getIconBackground = () => {
    switch(type) {
      case 'success': return 'bg-green-400/10 text-green-400';
      case 'warning': return 'bg-yellow-400/10 text-yellow-400';
      case 'danger': return 'bg-red-400/10 text-red-400';
      default: return 'bg-purple-400/10 text-purple-400';
    }
  };

  const getTrendColor = (isUpward: boolean) => {
    if (type === 'danger') {
      return isUpward ? 'text-red-400' : 'text-green-400';
    }
    return isUpward ? 'text-green-400' : 'text-red-400';
  };

  const getTrendIcon = (isUpward: boolean) => {
    return isUpward ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  };

  // Default icon if none provided
  const defaultIcon = () => {
    switch(type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'danger':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
    }
  };

  return (
    <div className="stat-card flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className={`p-2 rounded-full ${getIconBackground()}`}>
          {icon || defaultIcon()}
        </div>
      </div>

      <div className="mt-auto">
        <p className={`text-2xl font-bold ${getValueColor()}`}>{value}</p>
        
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`mr-1 ${getTrendColor(trend.isUpward)}`}>
              {getTrendIcon(trend.isUpward)}
            </span>
            <span className={`text-xs ${getTrendColor(trend.isUpward)}`}>
              {trend.value}%
            </span>
            <span className="text-xs text-gray-500 ml-1">{period}</span>
          </div>
        )}
      </div>
    </div>
  );
}