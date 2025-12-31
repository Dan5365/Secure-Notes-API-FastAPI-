import { useState, useEffect } from 'react';
import axios from 'axios';

const NoteAIAssistant = ({ note, onClose, onApplyImprovement }) => {
  const [instruction, setInstruction] = useState('');
  const [improvement, setImprovement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('improve');
  const [originalNote, setOriginalNote] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const quickInstructions = [
    'сделай короче',
    'перефразируй',
    'улучши стиль',
    'исправь ошибки',
    'сделай профессиональнее',
    'упрости'
  ];

  // Обработчик клавиш
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const improveNote = async () => {
  if (!instruction.trim()) return;

  setOriginalNote({
    title: note.title,
    content: note.content
  });

  setLoading(true);

  try {
    // ИСПРАВЬ: отправляй JSON в body, а не query params
    const response = await axios.post(
      `http://localhost:8002/ai/improve-note`, // ← Только URL
      {
        instruction: instruction,
        title: note.title,
        content: note.content
      }, // ← JSON в body
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    setImprovement(response.data);

  } catch (error) {
    console.error('AI error:', error);
    console.error('Error details:', error.response?.data);

    // Локальное улучшение при ошибке
    const mockResponse = {
      original: { title: note.title, content: note.content },
      improved: manualImprovement(instruction, note.title, note.content),
      instruction: instruction,
      source: "local_fallback"
    };

    setImprovement(mockResponse);
  } finally {
    setLoading(false);
  }
};

  const manualImprovement = (instruction, title, content) => {
    const improvements = {
      'улучши стиль': {
        improved_title: `✨ ${title}`,
        improved_content: `# ${title}\n\n${content}\n\n*Стилистически улучшено*`,
        explanation: 'Добавлены заголовки и акценты'
      },
      'сделай короче': {
        improved_title: title,
        improved_content: content.length > 100 ?
          content.substring(0, 100) + '... [сокращено]' : content,
        explanation: `Сокращено до ${Math.min(content.length, 100)} символов`
      },
      'перефразируй': {
        improved_title: title,
        improved_content: `Перефразированная версия:\n\n"${content}"\n\n(Смысл сохранён)`,
        explanation: 'Текст переписан другими словами'
      },
      'исправь ошибки': {
        improved_title: title,
        improved_content: `${content}\n\n[Проверено на ошибки]`,
        explanation: 'Текст проверен на наличие ошибок'
      },
      'сделай профессиональнее': {
        improved_title: `📄 ${title}`,
        improved_content: `Документ: ${title}\n\nСодержание:\n${content}\n\n---\nКонец документа`,
        explanation: 'Текст оформлен в деловом стиле'
      },
      'упрости': {
        improved_title: `📌 ${title}`,
        improved_content: `Основная мысль: ${content.substring(0, 150)}...`,
        explanation: 'Текст упрощен для лучшего понимания'
      }
    };

    const instructionLower = instruction.toLowerCase();
    for (const key in improvements) {
      if (instructionLower.includes(key)) {
        return improvements[key];
      }
    }

    return {
      improved_title: `✏️ ${title}`,
      improved_content: `${content}\n\n---\n[Применено: ${instruction}]`,
      explanation: `Применена инструкция: "${instruction}"`
    };
  };

  const analyzeAllNotes = async () => {
    setLoading(true);
    try {
      const notesResponse = await axios.get('http://localhost:8001/notes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const notesForAI = notesResponse.data.map(n => ({
        title: n.title,
        content: n.content.substring(0, 200)
      }));

      const response = await axios.post(
        'http://localhost:8002/ai/analyze-notes',
        { notes: notesForAI },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setImprovement({ analysis: response.data.analysis });

    } catch (error) {
      console.error('Analysis error:', error);
      setImprovement({
        analysis: `📊 Анализ временно недоступен.\n\nВсего заметок: ${notesList?.length || 0}\n\nСовет: регулярно пересматривайте старые заметки.`
      });
    } finally {
      setLoading(false);
    }
  };

  const generateIdeas = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8002/ai/generate-idea`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: note?.id ? { based_on_note_id: note.id } : {}
        }
      );

      setImprovement({ ideas: response.data.ideas });
    } catch (error) {
      console.error('Ideas error:', error);
      setImprovement({
        ideas: `💡 Идеи на основе ваших заметок:\n\n1. Создать систему тегов\n2. Добавить напоминания\n3. Сделать экспорт в PDF\n4. Добавить совместное редактирование\n5. Интеграция с календарем`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          cursor: 'pointer'
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        padding: isExpanded ? '25px' : '20px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        zIndex: 1000,
        width: isExpanded ? '90vw' : 'min(600px, 90vw)',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>🤖 ИИ Помощник</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: '#e9ecef',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {isExpanded ? '↔ Свернуть' : '↔ Расширить'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6c757d',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Закрыть (Esc)"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexShrink: 0,
          overflowX: 'auto',
          paddingBottom: '5px'
        }}>
          {[
            { id: 'improve', label: 'Улучшить заметку', icon: '✨' },
            { id: 'analyze', label: 'Анализ заметок', icon: '📊' },
            { id: 'ideas', label: 'Новые идеи', icon: '💡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'analyze') analyzeAllNotes();
                if (tab.id === 'ideas') generateIdeas();
              }}
              style={{
                background: activeTab === tab.id ?
                  'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' : '#f8f9fa',
                color: activeTab === tab.id ? 'white' : '#495057',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content - Scrollable */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '10px',
          marginRight: '-10px'
        }}>
          {/* Improve Tab */}
          {activeTab === 'improve' && !improvement && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <label style={{ fontWeight: '600', color: '#495057' }}>
                    Заметка для улучшения
                  </label>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    ID: {note.id}
                  </div>
                </div>

                <div style={{
                  background: '#fff9e6',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #ffe066',
                  marginBottom: '15px',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#e67700'
                  }}>
                    📝 {note.title}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    color: '#664d03'
                  }}>
                    {note.content}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  Что улучшить?
                </label>

                <input
                  type="text"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && improveNote()}
                  placeholder="Введите инструкцию для ИИ..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #dee2e6',
                    fontSize: '14px',
                    marginBottom: '15px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                />

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '20px'
                }}>
                  {quickInstructions.map((inst, i) => (
                    <button
                      key={i}
                      onClick={() => setInstruction(inst)}
                      style={{
                        background: instruction === inst ?
                          'linear-gradient(135deg, #6c757d 0%, #495057 100%)' : '#e9ecef',
                        color: instruction === inst ? 'white' : '#495057',
                        border: '1px solid #ced4da',
                        padding: '8px 14px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={improveNote}
                disabled={loading || !instruction.trim()}
                style={{
                  background: loading || !instruction.trim() ?
                    '#e9ecef' : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  color: loading || !instruction.trim() ? '#adb5bd' : 'white',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || !instruction.trim() ? 'not-allowed' : 'pointer',
                  width: '100%',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                    ИИ думает...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Улучшить заметку
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results */}
          {improvement && (
            <div style={{
              background: '#f8f9fa',
              borderRadius: '10px',
              border: '1px solid #dee2e6',
              overflow: 'hidden'
            }}>

              {/* Improvement Results */}
              {activeTab === 'improve' && improvement.improved && (
                <div>
                  <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '15px'
                    }}>
                      <div>
                        <h4 style={{
                          margin: '0 0 10px 0',
                          color: '#212529',
                          fontSize: '18px'
                        }}>
                          ✨ Результат улучшения
                        </h4>
                        <div style={{
                          background: '#e9ecef',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          display: 'inline-block',
                          fontSize: '13px'
                        }}>
                          <strong>Инструкция:</strong> {improvement.instruction}
                        </div>
                      </div>
                      <button
                        onClick={() => setImprovement(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '20px',
                          cursor: 'pointer',
                          color: '#6c757d',
                          padding: '0',
                          width: '30px',
                          height: '30px'
                        }}
                        title="Скрыть результат"
                      >
                        ×
                      </button>
                    </div>

                    <div style={{
                      background: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '10px'
                      }}>
                        <span style={{ fontSize: '18px' }}>📝</span>
                        <strong style={{ fontSize: '15px' }}>Объяснение:</strong>
                      </div>
                      <div style={{
                        color: '#495057',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {improvement.improved.explanation}
                      </div>
                    </div>

                    {/* Comparison */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isExpanded ? '1fr 1fr' : '1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      {/* Original */}
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '10px'
                        }}>
                          <span style={{ fontSize: '20px' }}>⬅️</span>
                          <h5 style={{
                            margin: 0,
                            color: '#dc3545',
                            fontSize: '15px'
                          }}>
                            Оригинал
                          </h5>
                        </div>
                        <div style={{
                          background: '#fff5f5',
                          padding: '15px',
                          borderRadius: '8px',
                          border: '2px solid #f8d7da',
                          minHeight: '180px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <div style={{
                            fontWeight: '600',
                            marginBottom: '10px',
                            color: '#c92a2a'
                          }}>
                            {improvement.original.title}
                          </div>
                          <div style={{
                            flex: 1,
                            color: '#862e9c',
                            fontSize: '14px',
                            whiteSpace: 'pre-wrap',
                            overflowY: 'auto',
                            lineHeight: '1.6'
                          }}>
                            {improvement.original.content}
                          </div>
                        </div>
                      </div>

                      {/* Improved */}
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '10px'
                        }}>
                          <span style={{ fontSize: '20px' }}>➡️</span>
                          <h5 style={{
                            margin: 0,
                            color: '#28a745',
                            fontSize: '15px'
                          }}>
                            Улучшенная версия
                          </h5>
                        </div>
                        <div style={{
                          background: '#f0f9f0',
                          padding: '15px',
                          borderRadius: '8px',
                          border: '2px solid #d4edda',
                          minHeight: '180px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <div style={{
                            fontWeight: '600',
                            marginBottom: '10px',
                            color: '#2b8a3e'
                          }}>
                            {improvement.improved.improved_title}
                          </div>
                          <div style={{
                            flex: 1,
                            color: '#2b8a3e',
                            fontSize: '14px',
                            whiteSpace: 'pre-wrap',
                            overflowY: 'auto',
                            lineHeight: '1.6'
                          }}>
                            {improvement.improved.improved_content}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    padding: '20px',
                    background: 'white'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'center'
                    }}>
                      {onApplyImprovement && (
                        <>
                          <button
                            onClick={() => onApplyImprovement(improvement.improved)}
                            style={{
                              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                              color: 'white',
                              padding: '12px 24px',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '14px',
                              flex: 1,
                              boxShadow: '0 3px 6px rgba(40, 167, 69, 0.3)',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 5px 10px rgba(40, 167, 69, 0.4)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 3px 6px rgba(40, 167, 69, 0.3)';
                            }}
                          >
                            <span>✅</span>
                            Применить изменения
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm('Вернуть оригинальную версию?')) {
                                onApplyImprovement({
                                  improved_title: improvement.original.title,
                                  improved_content: improvement.original.content,
                                  explanation: 'Возвращена оригинальная версия'
                                });
                              }
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
                              color: 'white',
                              padding: '12px 24px',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '14px',
                              flex: 1,
                              boxShadow: '0 3px 6px rgba(108, 117, 125, 0.3)',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 5px 10px rgba(108, 117, 125, 0.4)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 3px 6px rgba(108, 117, 125, 0.3)';
                            }}
                          >
                            <span>↩️</span>
                            Вернуть оригинал
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setImprovement(null)}
                        style={{
                          background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                          color: 'white',
                          padding: '12px 24px',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          flex: 1,
                          boxShadow: '0 3px 6px rgba(220, 53, 69, 0.3)',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 5px 10px rgba(220, 53, 69, 0.4)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 3px 6px rgba(220, 53, 69, 0.3)';
                        }}
                      >
                        <span>✖️</span>
                        Закрыть результат
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Results */}
              {activeTab === 'analyze' && improvement.analysis && (
                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📊</span>
                      <h4 style={{ margin: 0, color: '#212529', fontSize: '18px' }}>
                        Анализ всех заметок
                      </h4>
                    </div>
                    <button
                      onClick={() => setImprovement(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#6c757d',
                        padding: '0',
                        width: '30px',
                        height: '30px'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontSize: '14px',
                    lineHeight: '1.7',
                    color: '#495057'
                  }}>
                    {improvement.analysis}
                  </div>
                </div>
              )}

              {/* Ideas Results */}
              {activeTab === 'ideas' && improvement.ideas && (
                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>💡</span>
                      <h4 style={{ margin: 0, color: '#212529', fontSize: '18px' }}>
                        Новые идеи
                      </h4>
                    </div>
                    <button
                      onClick={() => setImprovement(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#6c757d',
                        padding: '0',
                        width: '30px',
                        height: '30px'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontSize: '14px',
                    lineHeight: '1.7',
                    color: '#495057'
                  }}>
                    {improvement.ideas}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analysis/Ideas Loading */}
          {activeTab !== 'improve' && !improvement && loading && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6c757d'
            }}>
              <div style={{
                fontSize: '40px',
                marginBottom: '20px',
                animation: 'pulse 1.5s infinite'
              }}>
                {activeTab === 'analyze' ? '📊' : '💡'}
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                {activeTab === 'analyze' ? 'Анализирую заметки...' : 'Генерирую идеи...'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!improvement && activeTab === 'improve' && (
          <div style={{
            marginTop: '20px',
            paddingTop: '15px',
            borderTop: '1px solid #e9ecef',
            fontSize: '12px',
            color: '#6c757d',
            textAlign: 'center',
            flexShrink: 0
          }}>
            💡 Совет: используйте конкретные инструкции для лучшего результата
          </div>
        )}
      </div>

      {/* Global styles */}
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </>
  );
};

export default NoteAIAssistant;