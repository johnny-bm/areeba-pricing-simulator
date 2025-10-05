import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { EXTERNAL_URLS } from '../config/api';
import { CreditCard, ArrowRight, Calculator, Zap } from 'lucide-react';
import { UserProfileHeader } from './UserProfileHeader';
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
  onSelectSimulator: (simulatorId: string) => void;
  onOpenAdmin?: () => void;
  onLogout: () => void;
}

export function SimulatorLanding({ onSelectSimulator, onOpenAdmin, onLogout }: SimulatorLandingProps) {
  const simulators: SimulatorOption[] = [
    {
      id: 'issuing-simulator',
      title: 'Issuing & Processing',
      description: 'Calculate costs for card issuing, payment processing, hosting, and transaction fees with detailed configuration options.',
      icon: <CreditCard className="h-8 w-8" />,
      available: true
    },
    {
      id: 'acquiring-simulator',
      title: 'Acquiring Solutions',
      description: 'Price merchant acquisition services, payment acceptance, and settlement solutions.',
      icon: <Calculator className="h-8 w-8" />,
      available: false,
      comingSoon: true
    },
    {
      id: 'digital-banking-simulator',
      title: 'Digital Banking',
      description: 'Estimate costs for digital banking platform implementation and ongoing operations.',
      icon: <Zap className="h-8 w-8" />,
      available: false,
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
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
          {simulators.map((simulator) => (
            <Card 
              key={simulator.id} 
              className={`relative transition-all duration-200 ${
                simulator.available 
                  ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => simulator.available && onSelectSimulator(simulator.id)}
            >
              {simulator.comingSoon && (
                <div className="absolute top-3 right-3 bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    simulator.available 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {simulator.icon}
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
                  disabled={!simulator.available}
                  variant={simulator.available ? "default" : "secondary"}
                >
                  {simulator.available ? (
                    <>
                      Start Simulation
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    'Coming Soon'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-xl mb-6">Why Use Our Pricing Simulators?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="text-sm">Accurate Pricing</h3>
              <p className="text-xs text-muted-foreground">
                Get precise cost estimates based on your specific configuration and usage patterns
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-sm">Real-time Updates</h3>
              <p className="text-xs text-muted-foreground">
                See cost changes instantly as you modify your configuration parameters
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-sm">Comprehensive Coverage</h3>
              <p className="text-xs text-muted-foreground">
                Cover all aspects of your payment solution from setup to ongoing operations
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            <p>areeba © {new Date().getFullYear()}. All Rights Reserved.</p>
            <div className="flex justify-center gap-4 mt-2">
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
        </footer>
      </div>
    </div>
  );
}