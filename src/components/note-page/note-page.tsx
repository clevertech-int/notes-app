import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { socket } from '@notes/data';
import { Editor, NoteList, NotePeek, OnChangeEditor, Sidebar } from '@notes/components';
import styles from './note-page.module.less';
import cn from 'classnames';
import { Col, Row } from 'antd';
import { OutputData } from '@editorjs/editorjs';
import { TNote, TNoteContent, TTag } from '@notes/types';

type TContent = OutputData & { noteId: string };

export function NotePage() {
  const { noteId } = useParams();

  const [content, setContent] = useState<TContent | undefined>();
  const [peekedNotes, setPeekedNotes] = useState<TNoteContent[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);
  const [notes, setNotes] = useState<TNote[]>([]);

  const [tagsItems, setTagsItems] = useState<TTag[]>([]);
  useEffect(() => {
    socket.emit('findAllNotes', (data: any) => {
      setNotes(data);
    });
  }, []);

  useEffect(() => {
    if (noteId) {
      socket.emit('findOneNote', noteId, (data: TContent) => {
        setContent(data);
      });

      socket.on('noteUpdated', (data: TContent) => {
        if (data.noteId === noteId) {
          setContent(data);
        }
      });
    }

    socket.on('noteCreated', (data: TNote) => {
      console.log([...notes, data]);
      setNotes([...notes, data]);
    });
  }, [noteId, notes]);

  const handleEditorChange: OnChangeEditor = useCallback(
    async (api) => {
      if (noteId) {
        const outputData = await api.saver.save();
        const newContent = { noteId, ...outputData };
        socket.emit('updateNote', newContent);
      }
    },
    [noteId],
  );

  const peekNote = async (id: string) => {
    const note: TNoteContent = await socket.emitWithAck('findOneNote', id);
    setPeekedNotes((current) => {
      const newPeeked = [...current];
      const index = newPeeked.findIndex((n) => note.noteId === n.noteId);
      if (index !== -1) {
        newPeeked.splice(index, 1);
      } else {
        newPeeked.push(note);
        setExpandedNotes((expanded) => [...expanded, note.noteId]);
      }
      return newPeeked;
    });
  };

  const handleExpandedNotes = (key: string | string[]) => {
    if (Array.isArray(key)) {
      setExpandedNotes(key);
    }
  };

  return (
    <Row wrap={false} gutter={16} className={styles.container}>
      <Sidebar id="notes-list" title="List of notes" side="left">
        <NoteList notes={notes} peekedNotes={peekedNotes} peekNote={peekNote} />
      </Sidebar>
      <Col flex={1}>
        <Row className={styles.content} wrap={false}>
          <Col flex={1} className={styles.section}>
            {noteId && content?.noteId === noteId ? (
              <Editor onChange={handleEditorChange} data={content} setTagsItems={setTagsItems} />
            ) : (
              <div className={styles.unselectedNoteMessage}>
                <p>Select a note beside</p>
              </div>
            )}
          </Col>
          <Col className={cn(styles.section, styles.tags)} id="refs">
            {tagsItems.map((item, i) => (
              <div key={item.noteId + i} className={styles.tagItem}>
                <Link to={`/notes/${item.noteId}`}>{item.noteId}</Link>
                <div dangerouslySetInnerHTML={{ __html: item.body }} />
              </div>
            ))}
          </Col>
        </Row>
      </Col>
      <Sidebar id="notes-peek" title="Notes peek" side="right">
        <NotePeek
          peekedNotes={peekedNotes}
          peekNote={peekNote}
          activeKey={expandedNotes}
          handleExpandedNotes={handleExpandedNotes}
          setTagsItems={setTagsItems}
        />
      </Sidebar>
    </Row>
  );
}

export default NotePage;
