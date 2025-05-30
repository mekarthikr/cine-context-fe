import { BrowserRouter } from 'react-router';
import Home from './component/home/home';
import MovieDetailsPage from './component/movie/movie';
import { AppRoutes } from './routes/routes';

export default function App() {
  return (
    <AppRoutes/>
  );
}
