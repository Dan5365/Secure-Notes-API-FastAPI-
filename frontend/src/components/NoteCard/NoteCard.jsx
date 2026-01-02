// src/components/NoteCard/NoteCard.jsx
import styles from './NoteCard.module.css';

function NoteCard({ note, onEdit, onDelete, onOpenAI }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{note.title}</h3>
      <p className={styles.content}>{note.content}</p>
      <div className={styles.actions}>
        <button onClick={() => onEdit(note)} className={styles.editButton}>
          ✏️ Edit
        </button>
        <button onClick={() => onDelete(note.id)} className={styles.deleteButton}>
          🗑️ Delete
        </button>
        <button onClick={() => onOpenAI(note)} className={styles.aiButton}>
          🤖 AI
        </button>
      </div>
    </div>
  );
}

export default NoteCard;