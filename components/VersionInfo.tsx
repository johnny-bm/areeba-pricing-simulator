import { useState } from 'react';
import { VERSION_INFO, getVersionString, getSimpleVersion } from '../utils/version';

interface VersionInfoProps {
  simple?: boolean;
  onClick?: () => void;
}

export function VersionInfo({ simple = true, onClick }: VersionInfoProps) {
  const [showDetailed, setShowDetailed] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowDetailed(!showDetailed);
    }
  };

  if (simple && !showDetailed) {
    return (
      <span 
        className="cursor-pointer hover:text-foreground transition-colors" 
        onClick={handleClick}
        title="Click for version details"
      >
        {getSimpleVersion()}
      </span>
    );
  }

  return (
    <div className="text-xs space-y-1">
      <div 
        className="cursor-pointer hover:text-foreground transition-colors font-medium" 
        onClick={handleClick}
      >
        {getVersionString()}
      </div>
      {showDetailed && (
        <div className="text-muted-foreground space-y-0.5">
          <div>Build: {VERSION_INFO.build}</div>
          <div>Updated: {new Date(VERSION_INFO.timestamp).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}