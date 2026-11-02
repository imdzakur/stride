import Image from 'next/image';
import styles from './wordmark.module.css';

// The official logo from public/stride-brand-kit. SVG is served as is, without optimization.
export function Wordmark() {
  return (
    <Image
      className={styles.logo}
      src="/stride-brand-kit/stride-logo-primary.svg"
      alt="Stride"
      width={700}
      height={256}
      priority
      unoptimized
    />
  );
}

export function BrandGlyph({ size }: { size: number }) {
  return (
    <Image
      src="/stride-brand-kit/stride-glyph-primary.svg"
      alt=""
      width={size}
      height={size}
      unoptimized
    />
  );
}
