import React from 'react';
import { EXTERNAL_URLS } from '../../config/api';
import { VersionInfo } from '../VersionInfo';

export interface FooterProps {
  showVersionInfo?: boolean;
  className?: string;
}

export function Footer({
  showVersionInfo = true,
  className = ''
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t bg-card mt-12 ${className}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>areeba © {currentYear}. All Rights Reserved.</span>
            {showVersionInfo && <VersionInfo simple={true} />}
          </div>
          <div className="flex items-center gap-4">
            <a 
              href={EXTERNAL_URLS.AREEBA_PRIVACY} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a 
              href={EXTERNAL_URLS.AREEBA_WEBSITE} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              About areeba
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}