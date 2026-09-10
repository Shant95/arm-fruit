'use client';

import Link from 'next/link';
import styles from './style.module.css';

const CatalogItem = ({ href, image, text }) => {
    const imageSrc = image && image !== '' ? image : '/images/fructs.webp';
    
    return (
        <div className={styles.catalogItem}>
            <Link href={href}>
                <div className={styles.image}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={styles.img} src={imageSrc} alt={text} />
                </div>
                <div className={styles.title}>
                    <p>{text}</p>
                </div>
            </Link>
        </div>
    );
};

export default CatalogItem;