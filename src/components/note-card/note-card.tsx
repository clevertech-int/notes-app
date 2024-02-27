import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row, Typography } from 'antd';
import { TNote } from '@notes/types';
import styles from './note-card.module.less';
import cn from 'classnames';
import { IconPinned, IconPinnedFilled } from '@tabler/icons-react';
import { socket } from '@notes/data';

const { Text } = Typography;

export interface NoteCardProps {
  note: TNote;
  pinned?: boolean;
}

export function NoteCard({ note, pinned }: NoteCardProps) {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const peekNote = () => {
    socket.emit('notePeeked', note);
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
        <Button type="link" onClick={peekNote}>
          {pinned ? <IconPinnedFilled size={20} /> : <IconPinned size={20} />}
        </Button>
      </Col>
    </Row>
  );
}

export default NoteCard;
