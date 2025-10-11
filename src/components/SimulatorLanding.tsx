import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { EXTERNAL_URLS } from '../config/api';
import { ArrowRight, CreditCard, Calculator, Zap, Shield } from 'lucide-react';
import { UserProfileHeader } from './UserProfileHeader';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { Simulator } from '../types/simulator';
import { SimulatorApi } from '../utils/simulatorApi';
import { SIMULATOR_ICON_MAP } from '../utils/icons';
import WordMarkRed from '../imports/WordMarkRed';

interface SimulatorOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  comingSoon?: boolean;
}

interface SimulatorLandingProps {
  onSelectSimulator?: (simulatorId: string) => void;
  onOpenAdmin?: () => void;
  onLogout: () => void;
}

export function SimulatorLanding({ onSelectSimulator, onOpenAdmin, onLogout }: SimulatorLandingProps) {
  const navigate = useNavigate();
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // Load simulators from database
  useEffect(() => {
    const loadSimulators = async () => {
      try {
        console.log('Loading simulators...');
        setIsLoading(true);
        const data = await SimulatorApi.loadSimulators();
        console.log('Simulators loaded:', data);
        setSimulators(data);
      } catch (error) {
        console.error('Failed to load simulators:', error);
        // Fallback to empty array on error
        setSimulators([]);
      } finally {
        console.log('Loading complete');
        setIsLoading(false);
      }
    };

    loadSimulators();
  }, []);

  // Cleanup navigating state when component unmounts
  useEffect(() => {
    return () => {
      setNavigatingTo(null);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 relative">
            {/* User Profile Header */}
            <div className="absolute top-0 right-0">
              <UserProfileHeader onLogout={onLogout} />
            </div>
            
            <div className="w-32 h-8 mx-auto mb-6">
              <WordMarkRed />
            </div>
            <h1 className="text-3xl mb-4">Pricing Simulators</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Select a pricing simulator to configure and calculate costs for your payment solutions
            </p>
          </div>

          {/* Simulator Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                {/* Loading skeleton */}
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-muted rounded-lg"></div>
                      </div>
                      <div className="h-6 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded mb-1"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-10 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Loading text */}
                <div className="col-span-full text-center py-8">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <div className="text-sm">
                      <div style={{ color: 'red', fontWeight: 'bold', fontSize: '16px' }}>Loading simulators...</div>
                      <div style={{ color: 'blue', fontSize: '14px' }}>Fetching services and pricing data</div>
                    </div>
                  </div>
                </div>
              </>
            ) : simulators.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Simulators Available</h3>
                  <p className="text-sm">Simulators will appear here once they are configured.</p>
                </div>
              </div>
            ) : (
              simulators.map((simulator) => (
                <Card 
                  key={simulator.id} 
                  className={`relative transition-all duration-200 ${
                    simulator.isAvailable 
                      ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' 
                      : 'opacity-60 cursor-not-allowed'
                  } ${navigatingTo === simulator.urlSlug ? 'opacity-75' : ''}`}
                  onClick={() => {
                    if (simulator.isAvailable) {
                      console.log('Navigating to simulator:', simulator.urlSlug);
                      setNavigatingTo(simulator.urlSlug);
                      
                      // Add a small delay to show the loading state
                      setTimeout(() => {
                        console.log('Actually navigating now...');
                        if (onSelectSimulator) {
                          onSelectSimulator(simulator.urlSlug);
                        } else {
                          navigate(`/admin/${simulator.urlSlug}/dashboard`);
                        }
                        // Reset navigating state after navigation
                        setTimeout(() => setNavigatingTo(null), 1000);
                      }, 500);
                    }
                  }}
                >
                  {simulator.comingSoon && (
                    <div className="absolute top-3 right-3 bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                      Coming Soon
                    </div>
                  )}
                  
                  {navigatingTo === simulator.urlSlug && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="flex flex-col items-center gap-3 text-sm">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <div className="text-center">
                          <div style={{ color: 'hsl(var(--foreground))', fontWeight: '500' }}>Loading simulator...</div>
                          <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>Preparing services and pricing data</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        simulator.isAvailable 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {SIMULATOR_ICON_MAP[simulator.iconName] || <CreditCard className="h-8 w-8" />}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{simulator.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {simulator.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Button 
                      className="w-full" 
                      disabled={!simulator.isAvailable}
                      variant={simulator.isAvailable ? "default" : "secondary"}
                    >
                      {simulator.isAvailable ? (
                        <>
                          {simulator.ctaText}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        simulator.ctaText
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <p>areeba © {new Date().getFullYear()}. All Rights Reserved.</p>
            <div className="flex gap-4">
              <a 
                href={EXTERNAL_URLS.AREEBA_PRIVACY} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline"
              >
                Privacy
              </a>
              <a 
                href={EXTERNAL_URLS.AREEBA_WEBSITE} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline"
              >
                About areeba
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}