import { Button } from 'antd';
import { TNote } from '@notes/types';
import styles from './note-list.module.less';
import { NoteCard } from '..';
import { IconPlus } from '@tabler/icons-react';

export interface NoteCardProps {
  notes: TNote[];
  peekedNotes: TNote[];
}

export function NoteList({ notes, peekedNotes }: NoteCardProps) {
  const createNote = () => {
    // TODO: Create a new note
  };

  return (
    <div className={styles.container}>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} pinned={peekedNotes.some((n) => n.id === note.id)} />
      ))}
      <Button type="link" className={styles.addButton} onClick={createNote}>
        <IconPlus size={18} />
        Add note
      </Button>
    </div>
  );
}

export default NoteList;
