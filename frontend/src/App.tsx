import { RouterProvider } from 'react-router-dom';
import { router } from './routes/teacherRoutes';
import './App.css';

/** The complete application router. Authentication is not exposed by the backend yet. */
export default function App() {
  return <RouterProvider router={router} />;
}
