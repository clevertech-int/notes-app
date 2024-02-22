import EditorJS from '@editorjs/editorjs';
import CustomUndo from './CustomUndo';

describe('CustomUndo', () => {
  let editor: EditorJS;
  let customUndo: CustomUndo;

  beforeEach(async () => {
    const matchMedia = vitest.spyOn(window, 'matchMedia');
    matchMedia.mockImplementation(() => ({ matches: false } as MediaQueryList));

    const holder = document.createElement('div');
    holder.id = 'editorjs';
    document.body.appendChild(holder);

    editor = new EditorJS({ holder: 'editorjs' });
    await editor.isReady;
    customUndo = new CustomUndo({ editor });
  });

  afterEach(() => {
    const holderDiv = document.getElementById('editorjs');
    if (holderDiv) {
      holderDiv.remove();
    }
  });

  it('should save editor data to history on registerChange', () => {
    const editorSave = vitest.spyOn(editor, 'save');

    customUndo.registerChange();

    expect(editorSave).toHaveBeenCalled();
  });

  it('should insert previous state from history when undo is called', async () => {
    const history = [
      [{ type: 'paragraph', data: { text: 'State 1' } }],
      [{ type: 'paragraph', data: { text: 'State 2' } }],
    ];

    customUndo.history = history;
    customUndo.position = 1;

    customUndo.insertBlocks = vitest.fn();

    await customUndo.undo();

    expect(customUndo.insertBlocks).toHaveBeenCalledWith(history[0]);
  });

  it('should insert next state from history when redo is called', async () => {
    const history = [
      [{ type: 'paragraph', data: { text: 'State 1' } }],
      [{ type: 'paragraph', data: { text: 'State 2' } }],
    ];

    customUndo.history = history;
    customUndo.position = 0;

    customUndo.insertBlocks = vitest.fn();

    await customUndo.redo();

    expect(customUndo.insertBlocks).toHaveBeenCalledWith(history[1]);
  });

  it('should truncate history when it exceeds the maximum of history length', () => {
    for (let i = 0; i < customUndo.maxHistoryLength + 1; i++) {
      customUndo.save([{ type: 'paragraph', data: { text: `Block ${i}` } }]);
    }

    expect(customUndo.history.length).toBe(customUndo.maxHistoryLength);
  });

  it('should do nothing when there is no next state in history', async () => {
    const blocksRender = vitest.spyOn(customUndo.editor.blocks, 'render');
    await customUndo.redo();

    expect(blocksRender).not.toHaveBeenCalled();
  });

  it('should do nothing when there is no previous state in history', async () => {
    const blocksRender = vitest.spyOn(customUndo.editor.blocks, 'render');
    await customUndo.undo();

    expect(blocksRender).not.toHaveBeenCalled();
  });

  it('should not save history after undo or redo', async () => {
    vitest.spyOn(editor, 'save');

    await customUndo.undo();
    expect(editor.save).not.toHaveBeenCalled();

    await customUndo.redo();
    expect(editor.save).not.toHaveBeenCalled();
  });

  it('should trigger undo method when undo shortcut is pressed', () => {
    vitest.spyOn(customUndo, 'undo');

    const event = new KeyboardEvent('keydown', { key: 'Z', code: 'KeyZ', ctrlKey: true });
    document.getElementById('editorjs')?.dispatchEvent(event);

    expect(customUndo.undo).toHaveBeenCalled();
  });

  it('should trigger redo method when redo shortcut is pressed', () => {
    vitest.spyOn(customUndo, 'redo');

    const event = new KeyboardEvent('keydown', { key: 'Y', code: 'KeyY', ctrlKey: true });
    document.getElementById('editorjs')?.dispatchEvent(event);

    expect(customUndo.redo).toHaveBeenCalled();
  });
});
