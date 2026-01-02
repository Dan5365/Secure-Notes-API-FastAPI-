// src/components/ErrorMessage/ErrorMessage.jsx
import styles from './ErrorMessage.module.css';

function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className={styles.error}>
      {message}
    </div>
  );
}

export default ErrorMessage;