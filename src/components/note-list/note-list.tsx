import { Button } from 'antd';
import { TNote, TNoteContent } from '@notes/types';
import styles from './note-list.module.less';
import { NoteCard } from '..';
import { IconPlus } from '@tabler/icons-react';
import { socket } from '../../data';

export interface NoteListProps {
  notes: TNote[];
  peekedNotes: TNoteContent[];
  peekNote: (id: string) => Promise<void>;
}

export function NoteList({ notes, peekedNotes, peekNote }: NoteListProps) {
  const createNote = async () => {
    await socket.emitWithAck('createNote');
  };

  return (
    <div className={styles.container}>
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          pinned={peekedNotes.some((n) => n.noteId === note.id)}
          peekNote={peekNote}
        />
      ))}
      <Button type="link" className={styles.addButton} onClick={createNote}>
        <IconPlus size={18} />
        Add note
      </Button>
    </div>
  );
}

export default NoteList;
