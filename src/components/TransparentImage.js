import React from 'react';
import './TransparentImage.css';

/**
 * Компонент для отображения прозрачных PNG изображений без контейнеров
 * Полностью интегрирован в фон без визуальных границ
 * @param {string} src - URL изображения
 * @param {string} alt - альтернативный текст
 * @param {Function} onClick - обработчик нажатия
 * @param {boolean} isCorrect - правильный ли это ответ (для анимации)
 * @param {boolean} isSelected - выбрано ли изображение
 * @param {boolean} showResult - показывать ли результат
 */
const TransparentImage = ({ 
  src, 
  alt, 
  onClick, 
  isCorrect, 
  isSelected, 
  showResult 
}) => {
  const getImageClass = () => {
    let className = 'transparent-image';
    
    if (showResult && isSelected) {
      className += isCorrect ? ' transparent-image--correct' : ' transparent-image--incorrect';
    }
    
    return className;
  };

  return (
    <button
      className={getImageClass()}
      onClick={onClick}
      aria-label={alt}
    >
      <img
        src={src}
        alt={alt}
        className="transparent-image__img"
        draggable={false}
      />
    </button>
  );
};

export default TransparentImage;