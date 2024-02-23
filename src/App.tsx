import { useState } from 'react';
import Editor, { OnChangeEditor } from './components/editor/editor';
import { io } from 'socket.io-client';

export const socket = io('http://localhost:3000');

function App() {
  const [content, setContent] = useState({ blocks: [] });

  const handleEditorChange: OnChangeEditor = (api) => {
    api.saver.save().then(async (outputData) => {
      socket.emit('createNote', outputData);
    });
  };

  socket.on('noteCreated', (data) => {
    setContent(data);
  });

  return <Editor onChange={handleEditorChange} data={content} />;
}

export default App;
