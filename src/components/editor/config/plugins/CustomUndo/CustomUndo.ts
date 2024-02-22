import EditorJS, { OutputBlockData } from '@editorjs/editorjs';
import Observer from './observer';
import isEqual from 'lodash/isEqual';

export default class CustomUndo {
  public editor: EditorJS;
  public shouldSaveHistory: boolean;
  public position: number;
  public history: OutputBlockData[][];
  public maxHistoryLength: number;
  public shortcuts: { undo: string[]; redo: string[] };

  constructor({ editor }: { editor: EditorJS }) {
    this.editor = editor;
    this.shouldSaveHistory = true;
    this.history = [];
    this.position = 0;
    this.maxHistoryLength = 100;
    this.shortcuts = {
      undo: ['CMD+Z'],
      redo: ['CMD+Y', 'CMD+SHIFT+Z'],
    };

    const observer = new Observer(() => this.registerChange());
    observer.setMutationObserver();

    this.setEventListeners();
  }

  registerChange(): void {
    if (this.editor && this.editor.save && this.shouldSaveHistory) {
      this.editor
        .save()
        .then((savedData) => {
          if (this.editorDidUpdate(savedData.blocks)) {
            this.save(savedData.blocks);
          }
        })
        .catch((error) => {
          console.error('Error saving data:', error);
        });
    }
    this.shouldSaveHistory = true;
  }

  editorDidUpdate(newData: OutputBlockData[]): boolean {
    const state = this.history[this.position];
    if (!newData.length) return false;
    if (newData.length !== state?.length) return true;

    return !isEqual(state, newData);
  }

  save(state: OutputBlockData[]): void {
    if (this.position + 1 >= this.maxHistoryLength) {
      this.truncate();
    }
    this.position = Math.min(this.position, this.history.length - 1);

    this.history = this.history.slice(0, this.position + 1);

    this.history.push(state);
    this.position += 1;
  }

  truncate() {
    this.history.splice(this.position - this.maxHistoryLength);
  }

  checkPressedKeys(e: KeyboardEvent, keys: string[]): boolean {
    const commands = keys.slice(0, -1);
    const [lastKey] = keys.slice(-1);

    let isPressed = true;
    if (
      (commands.includes('CMD') && !e.ctrlKey && !e.metaKey) ||
      (!commands.includes('CMD') && e.ctrlKey && e.metaKey)
    ) {
      isPressed = false;
    }
    if ((commands.includes('ALT') && !e.altKey) || (!commands.includes('ALT') && e.altKey)) {
      isPressed = false;
    }
    if (
      (commands.includes('SHIFT') && !e.shiftKey) ||
      (!commands.includes('SHIFT') && e.shiftKey)
    ) {
      isPressed = false;
    }

    const getRawKey = (code: string) => code.replace('Key', '').toLowerCase();
    if (e.key !== lastKey?.toLowerCase() && getRawKey(e.code) !== lastKey?.toLowerCase()) {
      isPressed = false;
    }

    return isPressed;
  }

  setEventListeners(): void {
    const holder = document.getElementById('editorjs');

    const { undo, redo } = this.shortcuts;
    const keysUndo = undo.map((undoShortcut) => undoShortcut.replace(/ /g, '').split('+'));
    const keysRedo = redo.map((redoShortcut) => redoShortcut.replace(/ /g, '').split('+'));

    const pressedKeys = (e: KeyboardEvent, shortcuts: string[][]): boolean => {
      return shortcuts.some((keys) => this.checkPressedKeys(e, keys));
    };

    const handleUndo = (e: KeyboardEvent) => {
      if (pressedKeys(e, keysUndo)) {
        e.preventDefault();
        this.undo();
      }
    };

    const handleRedo = (e: KeyboardEvent) => {
      if (pressedKeys(e, keysRedo)) {
        e.preventDefault();
        this.redo();
      }
    };

    const handleDestroy = () => {
      holder?.removeEventListener('keydown', handleUndo);
      holder?.removeEventListener('keydown', handleRedo);
    };

    holder?.addEventListener('keydown', handleUndo);
    holder?.addEventListener('keydown', handleRedo);
    holder?.addEventListener('destroy', handleDestroy);
  }

  async insertBlocks(state?: OutputBlockData[]): Promise<void> {
    this.shouldSaveHistory = false;
    await this.editor.blocks.clear();
    if (state) {
      await this.editor.blocks.render({ blocks: state });
      this.editor.caret.setToLastBlock('end');
    }
  }

  async undo() {
    if (this.position >= 0) {
      this.position -= 1;
      await this.insertBlocks(this.history[this.position]);
    }
  }

  async redo() {
    if (this.history[this.position + 1]) {
      this.position += 1;
      await this.insertBlocks(this.history[this.position]);
    }
  }
}
