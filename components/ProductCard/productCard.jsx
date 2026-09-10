'use client';

import Image from 'next/image';
import styles from './style.module.css';

const ProductCard = ({ product, onEdit, onDelete }) => {
    const getUnitText = () => {
        if (product.unit === 'box') return 'ящик';
        return 'кг';
    };

    return (
        <div className={styles.productCard}>
            <div className={styles.images}>
                {product.image && (product.image.startsWith('data:image') || product.image === '🍎' || product.image === '🍌' || product.image === '🍅' || product.image === '🥜' || product.image === '🍊' || product.image === '🍇') ? (
                    product.image.startsWith('data:image') ? (
                        <Image 
                            src={product.image} 
                            alt={product.name} 
                            width={200}
                            height={150}
                            className={styles.productImage}
                        />
                    ) : (
                        <div className={styles.imagePlaceholder}>{product.image}</div>
                    )
                ) : (
                    <div className={styles.imagePlaceholder}>📦</div>
                )}
            </div>
            <div className={styles.productInfo}>
                <h2>
                    {product.name}
                    {product.isOnOrder && <span style={{marginLeft: '8px', fontSize: '12px', background: '#ff9800', padding: '2px 8px', borderRadius: '20px', color: 'white'}}>Под заказ</span>}
                </h2>
                <p className={styles.description}>{product.description}</p>
                <p className={styles.price}>₽ {product.price} / {getUnitText()}</p>
                <span className={styles.quantity}>
                    {product.isOnOrder 
                        ? '📦 Товар под заказ' 
                        : `В наличии: ${product.quantity} ${getUnitText()}`}
                </span>
                <div className={styles.productActions}>
                    <button className={styles.editBtn} onClick={() => onEdit(product)}>
                        ✏️ Редактировать
                    </button>
                    <button className={styles.deleteBtn} onClick={() => onDelete(product.id, product.name)}>
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;