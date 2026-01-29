import { useEffect } from 'react';
import styles from './AdSense.module.css';

interface AdSenseProps {
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSense: React.FC<AdSenseProps> = ({ className }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`${styles.adContainer} ${className || ''}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6510313420673654"
        data-ad-slot="1951658027"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSense;
