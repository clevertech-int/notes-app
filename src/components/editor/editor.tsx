import { useEffect, useState } from 'react';
import EditorJS, {
  API,
  BlockAPI,
  BlockMutationEvent,
  OutputData,
  ToolConstructable,
  ToolSettings,
} from '@editorjs/editorjs';
import { editorConfig } from './config/editor-tools';
import DragDrop from 'editorjs-drag-drop';
import CustomUndo from './config/plugins/CustomUndo/CustomUndo';

import './editor.module.less';
import { mentionsService, socket } from '@notes/data';
import isEqualWith from 'lodash/isEqualWith';

export type OnChangeEditor = (api: API, event: BlockMutationEvent | BlockMutationEvent[]) => void;

export interface UseEditorProps {
  data?: OutputData;
  onChange: OnChangeEditor;
  placeholder?: string;
}

export function Editor({ data, onChange, placeholder = 'Type your text here' }: UseEditorProps) {
  const [editorJS, setEditorJS] = useState<EditorJS | null>(null);
  const [locked, setLocked] = useState(-1);

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
            mentionsService.init(editor as any);
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
    if (editorJS) {
      const editorElement = document.getElementById('editorjs');

      const focusIn = async () => {
        await editorJS.isReady;
        const focusIndex = editorJS.blocks.getCurrentBlockIndex();
        if (focusIndex >= 0) {
          socket.emit('lock', focusIndex);
          setLocked(focusIndex);
        }
      };
      const focusOut = async () => {
        if (locked >= 0) {
          socket.emit('unlock', locked);
          setLocked(-1);
        }
      };

      editorElement?.addEventListener('focusin', focusIn);
      editorElement?.addEventListener('focusout', focusOut);

      return () => {
        editorElement?.removeEventListener('focusin', focusIn);
        editorElement?.removeEventListener('focusout', focusOut);
      };
    }
  }, [editorJS, locked]);

  useEffect(() => {
    const renderData = async () => {
      if (editorJS) {
        await editorJS.isReady;
        if (data) {
          const currentData = await editorJS.save();

          if (isEqualWith(currentData.blocks, data.blocks)) {
            return;
          }

          // Delete blocks
          currentData.blocks.forEach((block, index) => {
            if (!data.blocks.some((b) => b.id === block.id)) {
              editorJS.blocks.delete(index);
            }
          });

          // Move and add blocks
          let currentBlock: BlockAPI | null = null;
          for (const [i, block] of data.blocks.entries()) {
            if (block.id) {
              currentBlock = editorJS.blocks.getById(block.id);

              if (currentBlock) {
                const index = editorJS.blocks.getBlockIndex(currentBlock.id);

                const currentBlockData = currentData.blocks.find((b) => b.id === block.id)?.data;
                if (!isEqualWith(currentBlockData, block.data) && index !== locked) {
                  await editorJS.blocks.update(currentBlock.id, block.data);
                }

                if (index !== i) {
                  editorJS.blocks.move(index, i);
                }
              } else {
                currentBlock = editorJS.blocks.insert(
                  block.type,
                  block.data,
                  undefined,
                  i,
                  false,
                  false,
                  block.id,
                );
              }
            }
          }
        }
      }
    };

    renderData();
  }, [editorJS, data, locked]);

  return <div id="editorjs" />;
}

export default Editor;
