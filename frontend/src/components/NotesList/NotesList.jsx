// src/components/NotesList/NotesList.jsx
import NoteCard from '../NoteCard/NoteCard.jsx';
import styles from './NotesList.module.css';

function NotesList({ notes, loading, onEdit, onDelete, onOpenAI }) {
  if (loading) {
    return <div className={styles.loading}>Loading notes...</div>;
  }

  if (notes.length === 0) {
    return (
      <div className={styles.empty}>
        📭 No notes yet. Create your first note!
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenAI={onOpenAI}
        />
      ))}
    </div>
  );
}

export default NotesList;