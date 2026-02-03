import { useState } from 'react';
import { Clock, TrendingUp, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const RecentUpdates = ({ updates }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedUpdates = showAll ? updates : updates.slice(0, 5);
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'info':
        return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 hover:bg-emerald-500/20';
      case 'warning':
        return 'bg-yellow-500/10 hover:bg-yellow-500/20';
      case 'info':
        return 'bg-blue-500/10 hover:bg-blue-500/20';
      case 'trend':
        return 'bg-purple-500/10 hover:bg-purple-500/20';
      default:
        return 'bg-muted/50 hover:bg-muted';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Recent Updates</h3>
        {updates.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayedUpdates.length > 0 ? (
          displayedUpdates.map((update, index) => (
            <div
              key={index}
              className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${getBgColor(update.type)}`}
            >
              <div className="shrink-0 mt-1">
                {getIcon(update.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-1">
                  {update.title}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  {update.description}
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(update.timestamp)}
                  </span>
                  {update.category && (
                    <span className="text-xs bg-background/50 border border-border px-2 py-1 rounded-full text-foreground">
                      {update.category}
                    </span>
                  )}
                </div>
              </div>

              {update.value && (
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold text-foreground">
                    {update.value}
                  </p>
                  {update.change && (
                    <p className={`text-xs font-semibold ${update.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                      }`}>
                      {update.change}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>No recent updates available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentUpdates;