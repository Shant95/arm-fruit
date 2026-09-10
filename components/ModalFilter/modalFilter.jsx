'use client';

import styles from './style.module.css';
import Filter from '../Filter/filter';

const ModalFilter = ({ 
    categories, 
    selectedCategory, 
    onCategoryChange,
    priceRange,
    onPriceChange,
    sortBy,
    onSortChange,
    onlyInStock,
    onStockChange,
    onReset,
    onClose 
}) => {
    return (
        <div className={styles.modalFilter} onClick={onClose}>
            <div className={styles.container} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Фильтры</h3>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                <Filter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={onCategoryChange}
                    priceRange={priceRange}
                    onPriceChange={onPriceChange}
                    sortBy={sortBy}
                    onSortChange={onSortChange}
                    onlyInStock={onlyInStock}
                    onStockChange={onStockChange}
                    onReset={onReset}
                />
            </div>
        </div>
    );
};

export default ModalFilter;