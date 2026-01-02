// src/components/AdminDropdown/AdminDropdown.jsx
import { useState, useEffect } from 'react';
import { adminAPI, getUserRole } from '../../services/api';
import styles from './AdminDropdown.module.css';

function AdminDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('admin');
  const [currentRole, setCurrentRole] = useState('');
  const [checkingRole, setCheckingRole] = useState(true);

  // Получаем роль текущего пользователя
  useEffect(() => {
    const role = getUserRole();
    setCurrentRole(role);
  }, []);

  // Загружаем всех пользователей при открытии меню
  useEffect(() => {
    if (isOpen && currentRole && (currentRole === 'admin' || currentRole === 'creator')) {
      fetchAllUsers();
    }
  }, [isOpen, currentRole]);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 403) {
        setError('У вас недостаточно прав для просмотра пользователей');
      } else {
        setError('Ошибка при загрузке пользователей');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async () => {
    if (!searchUsername.trim()) {
      setError('Введите имя пользователя');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getUserByUsername(searchUsername);
      setSearchResult(response.data);
    } catch (err) {
      console.error('Error searching user:', err);
      if (err.response?.status === 404) {
        setError('Пользователь не найден');
      } else if (err.response?.status === 403) {
        setError('У вас недостаточно прав');
      } else {
        setError('Ошибка при поиске пользователя');
      }
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async () => {
    if (!selectedUser) {
      setError('Выберите пользователя');
      return;
    }

    if (newRole === 'creator' && currentRole !== 'creator') {
      setError('Только создатель может назначать других создателей');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await adminAPI.makeAdmin(selectedUser.id, newRole);

      // Обновляем список пользователей
      const updatedUsers = users.map(user =>
        user.id === selectedUser.id ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);

      // Сбрасываем выбранного пользователя
      setSelectedUser(null);
      setError(`Роль пользователя ${selectedUser.username} успешно изменена на ${newRole}`);

      // Через 3 секунды очищаем сообщение
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error making admin:', err);
      if (err.response?.status === 403) {
        setError('У вас недостаточно прав для изменения ролей');
      } else {
        setError('Ошибка при изменении роли');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setNewRole(user.role === 'user' ? 'admin' : user.role);
  };

  // Если у пользователя нет админских прав, не показываем меню
  if (!currentRole || (currentRole !== 'admin' && currentRole !== 'creator')) {
    return null;
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.dropdownButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Административные функции"
      >
        👑 Админ-права
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdownContent}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Все пользователи</h4>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {loading ? (
              <div className={styles.loading}>Загрузка...</div>
            ) : (
              <div className={styles.userList}>
                {users.map(user => (
                  <div
                    key={user.id}
                    className={`${styles.userItem} ${selectedUser?.id === user.id ? styles.selected : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className={styles.userInfo}>
                      <span className={styles.username}>{user.username}</span>
                      <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                        {user.role === 'creator' ? '👑 Создатель' :
                         user.role === 'admin' ? '⭐ Админ' : '👤 Пользователь'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.divider}></div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Поиск пользователя</h4>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Введите имя пользователя"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className={styles.searchInput}
              />
              <button
                onClick={handleSearchUser}
                className={styles.searchButton}
                disabled={loading}
              >
                🔍 Найти
              </button>
            </div>

            {searchResult && (
              <div className={styles.searchResult}>
                <div className={styles.userInfo}>
                  <strong>{searchResult.username}</strong>
                  <span className={`${styles.roleBadge} ${styles[searchResult.role]}`}>
                    {searchResult.role === 'creator' ? '👑 Создатель' :
                     searchResult.role === 'admin' ? '⭐ Админ' : '👤 Пользователь'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleUserSelect(searchResult);
                    setSearchUsername('');
                    setSearchResult(null);
                  }}
                  className={styles.selectButton}
                >
                  Выбрать
                </button>
              </div>
            )}
          </div>

          {selectedUser && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Изменить роль</h4>
              <div className={styles.selectedUser}>
                Выбран: <strong>{selectedUser.username}</strong>
                <span className={`${styles.roleBadge} ${styles[selectedUser.role]}`}>
                  Текущая роль: {selectedUser.role}
                </span>
              </div>

              <div className={styles.roleSelection}>
                <label>
                  <input
                    type="radio"
                    value="admin"
                    checked={newRole === 'admin'}
                    onChange={() => setNewRole('admin')}
                    disabled={selectedUser.role === 'creator' && currentRole !== 'creator'}
                  />
                  <span className={styles.roleOption}>⭐ Администратор</span>
                </label>


                <label>
                  <input
                    type="radio"
                    value="user"
                    checked={newRole === 'user'}
                    onChange={() => setNewRole('user')}
                    disabled={selectedUser.role === 'creator' && currentRole !== 'creator'}
                  />
                  <span className={styles.roleOption}>👤 Обычный пользователь</span>
                </label>
              </div>

              <button
                onClick={handleMakeAdmin}
                className={styles.makeAdminButton}
                disabled={loading || selectedUser.role === newRole}
              >
                {loading ? 'Изменение...' : 'Изменить роль'}
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className={styles.clearButton}
              >
                Отменить выбор
              </button>
            </div>
          )}

          <div className={styles.footer}>
            <small>
              Ваша роль: <strong>
                {currentRole === 'creator' ? '👑 Создатель' :
                 currentRole === 'admin' ? '⭐ Администратор' : '👤 Пользователь'}
              </strong>
            </small>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDropdown;