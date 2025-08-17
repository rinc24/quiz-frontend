import React from 'react';
import './MainMenuScreen.css';

/**
 * Упрощенный компонент главного экрана меню
 * Отображает изображения категорий вместо текстовых кнопок
 */
const MainMenuScreen = ({ onStartGame, onPurchase, contentPacks, loading }) => {
  if (loading) {
    return (
      <div className="main-menu">
        <div className="loading-text">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="main-menu">
      <div className="menu-buttons">
        {contentPacks.map((pack) => (
          <button
            key={pack.id}
            className={`category-button ${!pack.is_purchased ? 'category-button--locked' : ''}`}
            onClick={() => (pack.is_purchased ? onStartGame(pack.slug) : onPurchase())}
            disabled={!pack.is_purchased}
            aria-label={pack.name}
          >
            <div className="category-button__content">
              {pack.image && (
                <img
                  src={pack.image}
                  alt={pack.name}
                  className="category-image"
                />
              )}
              <span className="category-button__text">
                {pack.name}
              </span>
            </div>
            {!pack.is_purchased && <div className="lock-overlay">🔒</div>}
          </button>
        ))}
        
        <button
          className="menu-button menu-button--purchase"
          onClick={onPurchase}
        >
          Больше игр
        </button>
      </div>
    </div>
  );
};

export default MainMenuScreen;