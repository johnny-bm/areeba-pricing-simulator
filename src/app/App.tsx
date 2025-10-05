import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '../shared/components/ui/sonner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AppRouter } from './router';
import { AppProviders } from './providers';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <AppRouter />
          <Toaster />
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
