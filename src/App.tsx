import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { NotePage } from '@notes/components';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/notes" />} />
        <Route path="/notes" element={<NotePage />}>
          <Route path="/notes/:noteId" element={<NotePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
