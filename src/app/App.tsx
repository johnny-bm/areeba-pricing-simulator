import { Toaster } from '../shared/components/ui/sonner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AppRouter } from './router';
import { AppProviders } from './providers';

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
        <Toaster />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
