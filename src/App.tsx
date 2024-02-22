import Editor, { OnChangeEditor } from './components/editor/editor';

function App() {
  const handleEditorChange: OnChangeEditor = (api) => {
    api.saver.save().then(async (outputData) => {
      console.log(outputData);
      await fetch('http://localhost:3002/block', {
        method: 'POST',
        body: JSON.stringify(outputData),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
    });
  };

  return <Editor onChange={handleEditorChange} />;
}

export default App;
