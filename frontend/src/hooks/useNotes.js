// src/hooks/useNotes.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notes } from '../services/api';

export function useNotes() {
  const navigate = useNavigate();
  const [notesList, setNotesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load notes');
      }
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (formData) => {
    try {
      const response = await notes.create(formData.title, formData.content);
      setNotesList([response.data, ...notesList]);
      setError('');
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note');
      throw err;
    }
  };

  const updateNote = async (id, formData) => {
    try {
      const response = await notes.update(id, formData.title, formData.content);
      setNotesList(notesList.map(note =>
        note.id === id ? response.data : note
      ));
      setError('');
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
      throw err;
    }
  };

  const deleteNote = async (id) => {
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

  const updateNoteInList = (id, updates) => {
    setNotesList(notesList.map(note =>
      note.id === id ? { ...note, ...updates } : note
    ));
  };

  return {
    notesList,
    loading,
    error,
    setError,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    updateNoteInList
  };
}