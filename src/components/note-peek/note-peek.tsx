import { useEffect } from 'react';
import { convertContentToHtml, socket } from '@notes/data';
import styles from './note-peek.module.less';
import { Button, Col, Collapse, Row, Tooltip, Typography } from 'antd';
import { IconEdit, IconX } from '@tabler/icons-react';
import { TNoteContent, TTag } from '@notes/types';
import { useNavigate, useParams } from 'react-router-dom';

const { Text } = Typography;

export interface NotePeekProps {
  peekedNotes: TNoteContent[];
  peekNote: (id: string) => Promise<void>;
  activeKey: string[];
  handleExpandedNotes: (key: string | string[]) => void;
  setTagsItems: (items: TTag[]) => void;
}

export function NotePeek({
  peekedNotes,
  peekNote,
  activeKey,
  handleExpandedNotes,
  setTagsItems,
}: NotePeekProps) {
  const navigate = useNavigate();
  const { noteId: currentNote } = useParams();

  useEffect(() => {
    const tags = document.querySelectorAll('a[rel="tag"]');

    const listener = async (e: any) => {
      e.preventDefault();
      const id = (e.target as HTMLAnchorElement).href.replace('http://localhost:5173/notes/', '');
      const items: TTag[] = await socket.emitWithAck('searchNoteBlocks', { uuid: id });
      setTagsItems(items);
    };

    tags.forEach((tag) => {
      tag.addEventListener('click', listener);
    });

    return () => {
      tags.forEach((tag) => {
        tag.removeEventListener('click', listener);
      });
    };
  }, [peekedNotes, setTagsItems]);

  const goToNote =
    (noteId: string): React.MouseEventHandler<HTMLElement> =>
    (e) => {
      e.stopPropagation();
      navigate(`/notes/${noteId}`);
      peekNote(noteId);
      if (
        currentNote &&
        currentNote !== noteId &&
        !peekedNotes.some((n) => n.noteId === currentNote)
      ) {
        peekNote(currentNote);
      }
    };

  const handlePeek =
    (noteId: string): React.MouseEventHandler<HTMLElement> =>
    (e) => {
      e.stopPropagation();
      peekNote(noteId);
    };

  return (
    <div className={styles.peekList}>
      <Collapse
        size="small"
        activeKey={activeKey}
        onChange={handleExpandedNotes}
        className={styles.peekCollapse}
        items={peekedNotes.map((note) => ({
          key: note.noteId,
          label: (
            <Row wrap={false} justify="space-between" align="middle">
              <Text>{note.noteId}</Text>
              <Col>
                <Row wrap={false} align="middle">
                  <Tooltip title="Edit note" placement="left">
                    <Button type="link" onClick={goToNote(note.noteId)}>
                      <IconEdit size={16} />
                    </Button>
                  </Tooltip>
                  <Button type="link" onClick={handlePeek(note.noteId)}>
                    <IconX size={16} />
                  </Button>
                </Row>
              </Col>
            </Row>
          ),
          children: <div dangerouslySetInnerHTML={{ __html: convertContentToHtml(note.blocks) }} />,
          className: styles.peekCard,
        }))}
      />
    </div>
  );
}

export default NotePeek;
