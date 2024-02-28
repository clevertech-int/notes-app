import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row, Typography } from 'antd';
import { TNote } from '@notes/types';
import styles from './note-card.module.less';
import cn from 'classnames';
import { IconPinned, IconPinnedFilled } from '@tabler/icons-react';

const { Text } = Typography;

export interface NoteCardProps {
  note: TNote;
  pinned?: boolean;
  peekNote: (id: string) => Promise<void>;
}

export function NoteCard({ note, pinned, peekNote }: NoteCardProps) {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const handlePeek: React.MouseEventHandler<HTMLElement> = (e) => {
    e.stopPropagation();
    peekNote(note.id);
  };

  const isSelectedNote = noteId === note.id;

  return (
    <Row
      wrap={false}
      justify="space-between"
      align="middle"
      className={cn(styles.card, { [styles.selected]: isSelectedNote })}
      onClick={() => !isSelectedNote && navigate(`/notes/${note.id}`)}
    >
      <Col>
        <Text className={styles.cardTitle}>{note.id}</Text>
        <Text className={styles.cardAuthor}>{note.author}</Text>
      </Col>
      <Col>
        {!isSelectedNote && (
          <Button type="link" onClick={handlePeek}>
            {pinned ? <IconPinnedFilled size={20} /> : <IconPinned size={20} />}
          </Button>
        )}
      </Col>
    </Row>
  );
}

export default NoteCard;
