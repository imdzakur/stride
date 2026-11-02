import { Shape } from './shape';
import styles from './background-shapes.module.css';

// A few large pastel shapes behind the content; quiet enough to never compete with text.
export function BackgroundShapes() {
  return (
    <div className={styles.layer} aria-hidden="true">
      <Shape kind="cookie9" className={`${styles.shape} ${styles.one}`} />
      <Shape kind="clover4" rotate={20} className={`${styles.shape} ${styles.two}`} />
      <Shape kind="cookie6" className={`${styles.shape} ${styles.three}`} />
    </div>
  );
}
