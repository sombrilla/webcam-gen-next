import styles from './Spinner.module.scss';

export function Spinner() {
  return (
    <div className={styles.spinner}>
      <div className={styles.backdrop} />
      
      <div className={styles.dots}>
        <div/>
        <div/>
        <div/>
        <div/>
        <div/>
        <div/>
        <div/>
        <div/>
      </div>
    </div>
  );
}
