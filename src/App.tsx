
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import './i18n';

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <div className="App">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
