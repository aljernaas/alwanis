
import { RouteObject } from 'react-router-dom';
import HomePage from '../pages/home/page';
import SettingsPage from '../pages/settings/page';
import CalendarPage from '../pages/calendar/page';
import ShiftSystemPage from '../pages/shift-system/page';
import NotesPage from '../pages/notes/page';
import ChartsPage from '../pages/charts/page';
import NotFound from '../pages/NotFound';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/settings',
    element: <SettingsPage />
  },
  {
    path: '/calendar',
    element: <CalendarPage />
  },
  {
    path: '/shift-system',
    element: <ShiftSystemPage />
  },
  {
    path: '/notes',
    element: <NotesPage />
  },
  {
    path: '/charts',
    element: <ChartsPage />
  },
  {
    path: '*',
    element: <NotFound />
  }
];

export default routes;
