import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '@notes/data';
import { Editor, NoteList, OnChangeEditor, Sidebar } from '@notes/components';
import styles from './note-page.module.less';
import cn from 'classnames';
import { Button, Col, Collapse, Row, Typography } from 'antd';
import { IconX } from '@tabler/icons-react';
import { OutputData } from '@editorjs/editorjs';

const { Text } = Typography;

const notes = [
  { id: 'note-1', author: 'anonymous' },
  { id: 'note-2', author: 'anonymous' },
  { id: 'note-3', author: 'anonymous' },
  { id: 'note-4', author: 'anonymous' },
];
const peekedNotes = [
  { id: 'note-1', author: 'anonymous' },
  { id: 'note-4', author: 'anonymous' },
];

type TContent = OutputData & { noteId: string };

export function NotePage() {
  const { noteId } = useParams();

  const [content, setContent] = useState<TContent | undefined>();

  useEffect(() => {
    if (noteId) {
      socket.emit('findOneNote', noteId, (data: TContent) => {
        setContent(data);
      });

      socket.on('noteCreated', (data: TContent) => {
        if (data.noteId === noteId) {
          setContent(data);
        }
      });
    }
  }, [noteId]);

  const handleEditorChange: OnChangeEditor = useCallback(
    async (api) => {
      if (noteId) {
        const outputData = await api.saver.save();
        const newContent = { noteId, ...outputData };
        socket.emit('createNote', newContent);
      }
    },
    [noteId],
  );

  return (
    <Row wrap={false} gutter={16} className={styles.container}>
      <Sidebar id="notes-list" title="List of notes" side="left">
        <NoteList notes={notes} peekedNotes={peekedNotes} />
      </Sidebar>
      <Col flex={1}>
        <Row className={styles.content} wrap={false}>
          <Col flex={1} className={styles.section}>
            {noteId && content?.noteId === noteId ? (
              <Editor onChange={handleEditorChange} data={content} />
            ) : (
              <div className={styles.unselectedNoteMessage}>
                <p>Select a note beside</p>
              </div>
            )}
          </Col>
          <Col className={cn(styles.section, styles.tags)} id="refs">
            Tags
          </Col>
        </Row>
      </Col>
      <Sidebar id="notes-peek" title="Notes peek" side="right">
        <div className={styles.peekList}>
          <Collapse
            size="small"
            defaultActiveKey={peekedNotes.map((note) => note.id)}
            className={styles.peekCollapse}
            items={peekedNotes.map((note) => ({
              key: note.id,
              label: (
                <Row wrap={false} justify="space-between" align="middle">
                  <Text>{note.id}</Text>
                  <Button type="link" onClick={(e) => e.stopPropagation()}>
                    <IconX size={16} />
                  </Button>
                </Row>
              ),
              children: <Text>That is the mocked note content.</Text>,
              className: styles.peekCard,
            }))}
          />
        </div>
      </Sidebar>
    </Row>
  );
}

export default NotePage;
