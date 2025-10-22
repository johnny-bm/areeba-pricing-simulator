import { Toaster } from '../components/ui/sonner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AppRouter } from './router';
import { OptimizedAppRouter } from './OptimizedRouter';
import { AppProviders } from './providers';

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <OptimizedAppRouter />
        <Toaster 
          position="top-center"
          richColors
          closeButton
        />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
