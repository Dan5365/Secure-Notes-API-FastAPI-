import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notes } from '../services/api';
import NoteAIAssistant from '../services/NoteAIAssistant';

function Dashboard({ setAuth }) {
  const navigate = useNavigate();
  const [notesList, setNotesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Форма для создания/редактирования
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const [selectedNoteForAI, setSelectedNoteForAI] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // ДОБАВЬ ЭТУ ФУНКЦИЮ ПОСЛЕ handleCancel
const handleApplyAIImprovement = (improved) => {
  if (selectedNoteForAI) {
    // Обновляем заметку в списке
    setNotesList(notesList.map(note =>
      note.id === selectedNoteForAI.id
        ? {
            ...note,
            title: improved.improved_title,
            content: improved.improved_content
          }
        : note
    ));

    // Закрываем ИИ ассистента
    setSelectedNoteForAI(null);
    setShowAIAssistant(false);
    setError('Note improved with AI!');
    setTimeout(() => setError(''), 3000);
  }
};


  // Загрузка заметок при монтировании
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notes.getAll();
      setNotesList(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching notes:', err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError('Failed to load notes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    navigate('/login');
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setFormData({ title: '', content: '' });
    setShowForm(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content });
    setShowForm(true);
  };

const handleDeleteNote = async (id) => {
  const originalNotes = [...notesList];
  const noteToDelete = originalNotes.find(n => n.id === id);


  setNotesList(originalNotes.filter(note => note.id !== id));

  try {
    await notes.delete(id);

    setError('Note deleted successfully');
    setTimeout(() => setError(''), 2000);
  } catch (err) {

    setNotesList(originalNotes);
    setError(`Failed to delete "${noteToDelete?.title}"`);
  }
};

const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingNote) {

        if (!editingNote.id) {
          console.error("Note ID is undefined!", editingNote);
          setError("Note ID is missing");
          return;
        }

        console.log("Updating note with ID:", editingNote.id);

        // Обновление
        const response = await notes.update(editingNote.id, formData.title, formData.content);
        setNotesList(notesList.map(note =>
          note.id === editingNote.id ? response.data : note
        ));
      } else {
        // Создание
        const response = await notes.create(formData.title, formData.content);
        setNotesList([response.data, ...notesList]);
      }

      setShowForm(false);
      setFormData({ title: '', content: '' });
      setError('');
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Failed to save note');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ title: '', content: '' });
    setEditingNote(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      padding: '3rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
    }}>
      {/* Header */}
      <header style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: '1rem 2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', letterSpacing: '1.2px' }}>
          📝 My Secure Notes
        </h1>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#ff4d4d',
            border: 'none',
            padding: '0.6rem 1.4rem',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(255, 77, 77, 0.6)',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e04343'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ff4d4d'}
        >
          Logout
        </button>
      </header>

      {/* Error Message */}
      {error && (
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          backgroundColor: 'rgba(255, 77, 77, 0.2)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 77, 77, 0.5)',
        }}>
          {error}
        </div>
      )}

      {/* Main Content */}
      <main style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}>
        {/* Create Button */}
        {!showForm && (
          <button
            onClick={handleCreateNote}
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#4caf50',
              border: 'none',
              padding: '0.8rem 2rem',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: '600',
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(76, 175, 80, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#45a049';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#4caf50';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ➕ Create New Note
          </button>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 6px 15px rgba(0,0,0,0.25)',
          }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>
              {editingNote ? '✏️ Edit Note' : '➕ Create New Note'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Note Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{
                  padding: '0.8rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1.1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#333',
                }}
              />
              <textarea
                placeholder="Note Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows="6"
                style={{
                  padding: '0.8rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#333',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: '#4caf50',
                    border: 'none',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  {editingNote ? 'Update Note' : 'Create Note'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    backgroundColor: '#757575',
                    border: 'none',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes List */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            fontSize: '1.5rem',
          }}>
            Loading notes...
          </div>
        ) : notesList.length === 0 ? (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            fontSize: '1.3rem',
          }}>
            📭 No notes yet. Create your first note!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {notesList.map((note, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  margin: 0,
                  wordBreak: 'break-word',
                }}>
                  {note.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  margin: 0,
                  flex: 1,
                  lineHeight: '1.6',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}>
                  {note.content}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                }}>
                  <button
                      onClick={() => handleEditNote(note)}
                      style={{
                        flex: 1,
                        backgroundColor: '#2196f3',
                        border: 'none',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        color: '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                      onClick={() => handleDeleteNote(note.id)}
                      style={{
                        flex: 1,
                        backgroundColor: '#f44336',
                        border: 'none',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        color: '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                  >
                    🗑️ Delete
                  </button>
                  <button
                      onClick={() => {
                        setSelectedNoteForAI(note);
                        setShowAIAssistant(true);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#9c27b0', // фиолетовый для ИИ
                        border: 'none',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        color: '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                  >
                    🤖 AI
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
       {showAIAssistant && selectedNoteForAI && (
        <NoteAIAssistant
          note={selectedNoteForAI}
          onClose={() => {
            setSelectedNoteForAI(null);
            setShowAIAssistant(false);
          }}
          onApplyImprovement={handleApplyAIImprovement}
        />
      )}
    </div>

  );

}


export default Dashboard;