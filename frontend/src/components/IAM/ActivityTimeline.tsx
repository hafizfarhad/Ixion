import React from 'react';

export interface ActivityItem {
  id: string | number;
  user: string;
  action: string;
  resource: string;
  time: string;
  status: 'success' | 'warning' | 'danger' | 'info';
  details?: string;
  icon?: React.ReactNode;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  title?: string;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  title = "Activity Timeline",
  maxItems = 5,
  showViewAll = true,
  onViewAll
}) => {
  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'success': return 'bg-green-500';
      case 'danger': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Show only the first maxItems activities
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
      <div className="p-4 border-b border-[#3d3d3d] flex justify-between items-center">
        <h2 className="font-semibold text-lg">{title}</h2>
        {showViewAll && activities.length > maxItems && (
          <button 
            onClick={onViewAll} 
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            View All
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {displayedActivities.map((activity) => (
            <div key={activity.id} className="flex">
              {/* Status dot with line */}
              <div className="relative mr-4 flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(activity.status)} z-10`}></div>
                {/* Vertical line connecting dots */}
                {displayedActivities.indexOf(activity) !== displayedActivities.length - 1 && (
                  <div className="w-px bg-[#3d3d3d] h-full absolute top-3 bottom-0"></div>
                )}
              </div>
              
              {/* Activity content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center mb-1">
                  <span className="font-medium text-white">{activity.user}</span>
                  <span className="text-gray-400 text-xs ml-2">{activity.time}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-300">{activity.action} </span>
                  <span className="text-white font-medium">{activity.resource}</span>
                </div>
                {activity.details && (
                  <div className="mt-1 text-xs text-gray-400">
                    {activity.details}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-4 text-gray-400">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;