'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './style.module.css';
import HeaderBlokAdmin from '../../../../components/HeaderBlokAdmin/headerBlokAdmin';

export default function AdminCategories() {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        nameAm: '',
        description: '',
        descriptionAm: '',
        image: ''
    });

    // Загрузка категорий из базы данных
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            alert('Ошибка загрузки категорий');
        } finally {
            setLoading(false);
        }
    };

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
                setImagePreview(reader.result);
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData({ ...formData, image: '' });
    };

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({ 
            name: '', 
            nameAm: '',
            description: '', 
            descriptionAm: '',
            image: '' 
        });
        setImagePreview(null);
        setIsOpenModal(true);
    };

    const handleOpenEditModal = (category) => {
        setIsEditing(true);
        setEditingId(category.id);
        setFormData({
            name: category.name,
            nameAm: category.nameAm || '',
            description: category.description || '',
            descriptionAm: category.descriptionAm || '',
            image: category.image || ''
        });
        setImagePreview(category.image || null);
        setIsOpenModal(true);
    };

    const handleCloseModal = () => {
        setIsOpenModal(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({ 
            name: '', 
            nameAm: '',
            description: '', 
            descriptionAm: '',
            image: '' 
        });
        setImagePreview(null);
    };

    const handleSaveCategory = async () => {
        if (!formData.name.trim()) {
            alert('Введите название категории');
            return;
        }

        setLoading(true);

        try {
            if (isEditing && editingId) {
                // Обновление категории
                const res = await fetch(`/api/categories`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingId,
                        name: formData.name,
                        nameAm: formData.nameAm || null,
                        description: formData.description,
                        descriptionAm: formData.descriptionAm || null,
                        image: formData.image || null
                    })
                });

                if (res.ok) {
                    alert('Категория обновлена');
                    fetchCategories();
                    handleCloseModal();
                } else {
                    const error = await res.json();
                    alert(error.error || 'Ошибка обновления');
                }
            } else {
                // Создание новой категории
                const res = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        nameAm: formData.nameAm || null,
                        description: formData.description,
                        descriptionAm: formData.descriptionAm || null,
                        image: formData.image || null
                    })
                });

                if (res.ok) {
                    alert('Категория создана');
                    fetchCategories();
                    handleCloseModal();
                } else {
                    const error = await res.json();
                    alert(error.error || 'Ошибка создания');
                }
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при сохранении категории');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id, name) => {
        if (confirm(`Вы уверены, что хотите удалить категорию "${name}"?`)) {
            try {
                const res = await fetch(`/api/categories?id=${id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    alert('Категория удалена');
                    fetchCategories();
                } else {
                    const error = await res.json();
                    alert(error.error || 'Ошибка удаления');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка при удалении категории');
            }
        }
    };

    return (
        <div className={styles.categoriesPage}>
            <div className={styles.header}>
                <div>
                    <HeaderBlokAdmin title='Категории' subtitle='Управляйте категориями товаров.' />
                </div>
            </div>
            <div className={styles.containers}>
                <div className={styles.topBlok}>
                    <div className={styles.title}>
                        <h2>Список категорий</h2>
                        <p>Показано: {categories.length} из {categories.length}</p>
                    </div>
                    <button className={styles.addBtn} onClick={handleOpenAddModal}>
                        + Добавить категорию
                    </button>
                </div>

                {loading && categories.length === 0 ? (
                    <div className={styles.loading}>Загрузка...</div>
                ) : (
                    <div className={styles.categoriesList}>
                        {categories.map((category) => (
                            <div key={category.id} className={styles.categoryCard}>
                                <div className={styles.image}>
                                    {category.image ? (
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            width={225}
                                            height={130}
                                            className={styles.categoryImage}
                                            unoptimized={category.image.startsWith('data:')}
                                        />
                                    ) : (
                                        <div className={styles.imagePlaceholder}>📷</div>
                                    )}
                                </div>
                                <div className={styles.categoryInfo}>
                                    <h3>{category.name}</h3>
                                    <p>{category.description}</p>
                                    <span className={styles.productCount}>
                                        {category._count?.products || 0} товаров
                                    </span>
                                </div>
                                <div className={styles.categoryActions}>
                                    <button 
                                        className={styles.editBtn} 
                                        onClick={() => handleOpenEditModal(category)}
                                    >
                                        ✏️ Редактировать
                                    </button>
                                    <button 
                                        className={styles.deleteBtn} 
                                        onClick={() => handleDeleteCategory(category.id, category.name)}
                                    >
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isOpenModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalWrapper}>
                            <div className={styles.modalHeader}>
                                <h2>{isEditing ? 'Редактировать категорию' : 'Добавить категорию'}</h2>
                                <button className={styles.closeModalBtn} onClick={handleCloseModal}>✕</button>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Изображение категории</label>
                                    <div className={styles.imageUploadArea}>
                                        {imagePreview ? (
                                            <div className={styles.imagePreviewContainer}>
                                                <Image
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    width={120}
                                                    height={120}
                                                    className={styles.imagePreviewImg}
                                                    unoptimized={imagePreview.startsWith('data:')}
                                                />
                                                <div className={styles.imageActions}>
                                                    <button
                                                        type="button"
                                                        className={styles.changeImageBtn}
                                                        onClick={() => document.getElementById('categoryImageUpload').click()}
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
                                            id="categoryImageUpload"
                                        />
                                        {!imagePreview && (
                                            <label htmlFor="categoryImageUpload" className={styles.uploadLabel}>
                                                Выбрать файл
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Название (русский)"
                                    className={styles.input}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Название (армянский)"
                                    className={styles.input}
                                    value={formData.nameAm}
                                    onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                                />
                                <textarea
                                    placeholder="Описание (русский)"
                                    className={styles.textarea}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <textarea
                                    placeholder="Նկարագրություն (հայերեն)"
                                    className={styles.textarea}
                                    value={formData.descriptionAm}
                                    onChange={(e) => setFormData({ ...formData, descriptionAm: e.target.value })}
                                />
                            </div>

                            <div className={styles.modalFooter}>
                                <button className={styles.cancelBtn} onClick={handleCloseModal}>Отмена</button>
                                <button 
                                    className={styles.saveBtn} 
                                    onClick={handleSaveCategory}
                                    disabled={loading}
                                >
                                    {loading ? 'Сохранение...' : (isEditing ? 'Сохранить' : 'Добавить')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}