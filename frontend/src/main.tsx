import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import './styles/tokens.css';
import './styles/globals.css';
import './styles/prose.css';
import './styles/experience.css';
import './styles/solutions.css';
export const createRoot = ViteReactSSG({ routes });
