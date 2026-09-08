import { Shell } from './components/Shell';
import { useRoute } from './lib/router';
import { StoreProvider } from './store/store';
import { Archive } from './pages/Archive';
import { Areas } from './pages/Areas';
import { Compass } from './pages/Compass';
import { Journal } from './pages/Journal';
import { Projects } from './pages/Projects';
import { Season } from './pages/Season';
import { Today } from './pages/Today';
import { Week } from './pages/Week';

function Router() {
  const { route, param } = useRoute();

  return (
    <Shell active={route}>
      {route === 'heute' && <Today />}
      {route === 'kompass' && <Compass />}
      {route === 'saison' && <Season />}
      {route === 'bereiche' && <Areas param={param} />}
      {route === 'projekte' && <Projects />}
      {route === 'woche' && <Week />}
      {route === 'journal' && <Journal />}
      {route === 'archiv' && <Archive />}
    </Shell>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
}
