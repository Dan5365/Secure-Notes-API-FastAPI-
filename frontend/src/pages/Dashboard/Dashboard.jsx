// src/pages/Dashboard/Dashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import AdminDropdown from '../../components/AdminDropdown/AdminDropdown';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import NoteForm from '../../components/NoteForm/NoteForm';
import NotesList from '../../components/NotesList/NotesList';
import NoteAIAssistant from '../../services/NoteAIAssistant';
import { useNotes } from '../../hooks/useNotes';
import styles from './Dashboard.module.css';

function Dashboard({ setAuth }) {
  const navigate = useNavigate();
  const {
    notesList,
    loading,
    error,
    setError,
    updateNoteInList,
    deleteNote,
    createNote,
    updateNote
  } = useNotes();

  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedNoteForAI, setSelectedNoteForAI] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    navigate('/login');
  };

  // Создание новой заметки
  const handleCreateNote = () => {
    setEditingNote(null);
    setShowForm(true);
  };

  // Редактирование заметки
  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  // Удаление заметки
  const handleDeleteNote = async (id) => {
    await deleteNote(id);
  };

  // Отправка формы заметки (создание/редактирование)
  const handleSubmitNote = async (formData) => {
    if (editingNote) {
      // Редактирование существующей заметки
      await updateNote(editingNote.id, formData);
    } else {
      // Создание новой заметки
      await createNote(formData);
    }
    setShowForm(false);
    setEditingNote(null);
  };

  // Отмена создания/редактирования
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  // Открытие AI ассистента для заметки
  const handleOpenAI = (note) => {
    setSelectedNoteForAI(note);
  };

  // Применение улучшений от AI
  const handleApplyAIImprovement = (improved) => {
    if (selectedNoteForAI) {
      // Обновляем заметку с улучшениями от AI
      updateNoteInList(selectedNoteForAI.id, {
        title: improved.improved_title,
        content: improved.improved_content
      });
      setSelectedNoteForAI(null);
      setError('Note improved with AI!');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className={styles.container}>
      <DashboardHeader onLogout={handleLogout} />


      {error && <ErrorMessage message={error} />}

      <main className={styles.main}>
        {!showForm && (
          <button onClick={handleCreateNote} className={styles.createButton}>
            ➕ Create New Note
          </button>
        )}

        {showForm && (
          <NoteForm
            note={editingNote}
            onSubmit={handleSubmitNote}
            onCancel={handleCancelForm}
          />
        )}

        <NotesList
          notes={notesList}
          loading={loading}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          onOpenAI={handleOpenAI}
        />
      </main>

      {selectedNoteForAI && (
        <NoteAIAssistant
          note={selectedNoteForAI}
          onClose={() => setSelectedNoteForAI(null)}
          onApplyImprovement={handleApplyAIImprovement}
        />
      )}
    </div>
  );
}

export default Dashboard;