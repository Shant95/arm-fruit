"use client";

import { useState } from 'react';
import Image from 'next/image';
import styles from './style.module.css';

const ProductModal = ({ 
    isOpen, 
    onClose, 
    isEditing, 
    formData, 
    setFormData, 
    onSave,
    categories 
}) => {
    const [imagePreview, setImagePreview] = useState(formData.image || '');

    if (!isOpen) return null;

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите изображение');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('Изображение не должно превышать 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageDataUrl = reader.result;
                setImagePreview(imageDataUrl);
                setFormData({...formData, image: imageDataUrl, imageFile: file});
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview('');
        setFormData({...formData, image: '', imageFile: null});
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{isEditing ? 'Редактировать товар' : 'Создать товар'}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label>Изображение товара</label>
                        <div className={styles.imageUploadArea}>
                            {imagePreview ? (
                                <div className={styles.imagePreviewContainer}>
                                    <Image 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        width={150}
                                        height={150}
                                        className={styles.imagePreview}
                                    />
                                    <div className={styles.imageActions}>
                                        <button 
                                            type="button"
                                            className={styles.changeImageBtn}
                                            onClick={() => document.getElementById('imageUpload').click()}
                                        >
                                            📷 Изменить
                                        </button>
                                        <button 
                                            type="button"
                                            className={styles.removeImageBtn}
                                            onClick={handleRemoveImage}
                                        >
                                            ✕ Удалить
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.uploadPlaceholder}>
                                    <div className={styles.uploadIcon}>📸</div>
                                    <p>Нажмите для выбора изображения</p>
                                    <p className={styles.uploadHint}>PNG, JPG, WEBP до 5MB</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                className={styles.fileInput}
                                id="imageUpload"
                            />
                            {!imagePreview && (
                                <label htmlFor="imageUpload" className={styles.uploadLabel}>
                                    Выбрать файл
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Эмодзи */}
                    <div className={styles.formGroup}>
                        <label>Или выберите эмодзи</label>
                        <div className={styles.emojiGrid}>
                            {['🍎', '🍌', '🍅', '🥜', '🍊', '🍇', '🥒', '🌰', '🍓', '🍒', '🥝', '🍋', '🥑', '🍑', '🍐'].map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={`${styles.emojiBtn} ${formData.image === emoji ? styles.emojiBtnActive : ''}`}
                                    onClick={() => {
                                        setFormData({...formData, image: emoji, imageFile: null});
                                        setImagePreview(emoji);
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Поля товара */}
                    <div className={styles.formGroup}>
                        <label>Название (русский) *</label>
                        <input 
                            type="text" 
                            placeholder="Например: Яблоки Голден"
                            className={styles.input}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Название (армянский)</label>
                        <input 
                            type="text" 
                            placeholder="Օրինակ: Ոսկե խնձոր"
                            className={styles.input}
                            value={formData.nameAm || ''}
                            onChange={(e) => setFormData({...formData, nameAm: e.target.value})}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Категория</label>
                        <select 
                            className={styles.input}
                            value={formData.categoryId || formData.category}
                            onChange={(e) => setFormData({...formData, categoryId: e.target.value, category: e.target.value})}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.icon} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Выбор единицы измерения */}
                    <div className={styles.formGroup}>
                        <label>Единица измерения *</label>
                        <div className={styles.unitGroup}>
                            <label className={`${styles.unitLabel} ${formData.unit === 'kg' ? styles.unitActive : ''}`}>
                                <input
                                    type="radio"
                                    name="unit"
                                    value="kg"
                                    checked={formData.unit === 'kg'}
                                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                />
                                <span>📦 кг</span>
                            </label>
                            <label className={`${styles.unitLabel} ${formData.unit === 'box' ? styles.unitActive : ''}`}>
                                <input
                                    type="radio"
                                    name="unit"
                                    value="box"
                                    checked={formData.unit === 'box'}
                                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                />
                                <span>📦 ящик</span>
                            </label>
                        </div>
                    </div>

                    {/* Чекбоксы "Популярный", "Новый", "Под заказ" */}
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input 
                                    type="checkbox"
                                    checked={formData.isPopular || false}
                                    onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                                />
                                <span>⭐ Популярный</span>
                            </label>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input 
                                    type="checkbox"
                                    checked={formData.isNew || false}
                                    onChange={(e) => setFormData({...formData, isNew: e.target.checked})}
                                />
                                <span>🆕 Новый</span>
                            </label>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input 
                                    type="checkbox"
                                    checked={formData.isOnOrder || false}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData, 
                                            isOnOrder: e.target.checked,
                                            quantity: e.target.checked ? 0 : formData.quantity
                                        });
                                    }}
                                />
                                <span>📦 Под заказ</span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Описание (русский)</label>
                        <textarea 
                            placeholder="Описание товара на русском..."
                            className={styles.textarea}
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Описание (армянский)</label>
                        <textarea 
                            placeholder="Նկարագրությունը հայերեն..."
                            className={styles.textarea}
                            rows="3"
                            value={formData.descriptionAm || ''}
                            onChange={(e) => setFormData({...formData, descriptionAm: e.target.value})}
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Цена (₽) *</label>
                            <input 
                                type="number" 
                                placeholder="150"
                                className={styles.input}
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                            />
                        </div>
                        {!formData.isOnOrder && (
                            <div className={styles.formGroup}>
                                <label>Количество ({formData.unit === 'kg' ? 'кг' : 'ящиков'})</label>
                                <input 
                                    type="number" 
                                    placeholder="50"
                                    className={styles.input}
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Отмена
                    </button>
                    <button className={styles.saveBtn} onClick={onSave}>
                        {isEditing ? 'Сохранить изменения' : 'Создать товар'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;