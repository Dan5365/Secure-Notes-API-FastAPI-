// src/components/NoteForm/NoteForm.jsx
import { useState, useEffect } from 'react';
import styles from './NoteForm.module.css';

function NoteForm({ note, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    if (note) {
      setFormData({ title: note.title, content: note.content });
    } else {
      setFormData({ title: '', content: '' });
    }
  }, [note]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>
        {note ? '✏️ Edit Note' : '➕ Create New Note'}
      </h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Note Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className={styles.input}
        />
        <textarea
          placeholder="Note Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          rows="6"
          className={styles.textarea}
        />
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            {note ? 'Update Note' : 'Create Note'}
          </button>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoteForm;