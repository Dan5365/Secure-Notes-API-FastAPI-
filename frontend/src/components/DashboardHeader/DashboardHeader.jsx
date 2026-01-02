// src/components/DashboardHeader/DashboardHeader.jsx
import AdminDropdown from '../AdminDropdown/AdminDropdown'; // Импортируем
import styles from './DashboardHeader.module.css';

function DashboardHeader({ onLogout, userRole }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>📝 Notes App</h1>
      </div>

      <div className={styles.actions}>
        {/* Добавляем админ-панель рядом с кнопкой выхода */}
        <AdminDropdown />

        <button onClick={onLogout} className={styles.logoutButton}>
          🚪 Выйти
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;