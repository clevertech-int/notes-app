import { useEffect, useState } from 'react';
import Editor, { OnChangeEditor } from './components/editor/editor';
import { socket } from './data';

function App() {
  const [content, setContent] = useState({ blocks: [] });

  const handleEditorChange: OnChangeEditor = (api) => {
    api.saver.save().then(async (outputData) => {
      socket.emit('createNote', { noteId: 'note-1', ...outputData });
    });
  };

  useEffect(() => {
    socket.emit('findOneNote', 'note-1', (data: any) => {
      setContent(data);
    });
    socket.on('noteCreated', (data) => {
      setContent(data);
    });
  }, []);

  return <Editor onChange={handleEditorChange} data={content} />;
}

export default App;
