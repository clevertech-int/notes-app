import { useEffect, useState } from 'react';
import EditorJS, {
  API,
  BlockMutationEvent,
  OutputData,
  ToolConstructable,
  ToolSettings,
} from '@editorjs/editorjs';
import { editorConfig } from './config/editor-tools';
import DragDrop from 'editorjs-drag-drop';
import CustomUndo from './config/plugins/CustomUndo/CustomUndo';

import './editor.module.less';
import { mentionsService } from '../../services';

export type OnChangeEditor = (api: API, event: BlockMutationEvent | BlockMutationEvent[]) => void;

export interface UseEditorProps {
  data?: OutputData;
  onChange: OnChangeEditor;
  placeholder?: string;
}

export function Editor({ data, onChange, placeholder = 'Type your text here' }: UseEditorProps) {
  const [editorJS, setEditorJS] = useState<EditorJS | null>(null);

  useEffect(() => {
    setEditorJS((prev) => {
      if (!prev) {
        const editor = new EditorJS({
          holder: 'editorjs',
          onChange,
          placeholder,
          tools: editorConfig as unknown as {
            [toolName: string]: ToolConstructable | ToolSettings;
          },
          autofocus: true,
          minHeight: 100,
          onReady: () => {
            mentionsService.init(editor);
            new CustomUndo({ editor });
            new DragDrop(editor, '2px dashed rgba(87, 103, 161, 0.5)');
          },
        });

        return editor;
      }

      return prev;
    });
  }, [onChange, placeholder]);

  useEffect(() => {
    const renderData = async () => {
      if (editorJS) {
        await editorJS.isReady;
        if (data) {
          await editorJS.render(data);
        } else {
          await editorJS.clear();
        }
      }
    };

    renderData();
  }, [editorJS, data]);

  return <div id="editorjs" />;
}

export default Editor;
