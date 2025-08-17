import React, { useState, useEffect } from 'react';
import MainMenuScreen from './components/MainMenuScreen';
import GameScreen from './components/GameScreen';
import PurchaseScreen from './components/PurchaseScreen';
import ApiService from './services/api';
import './App.css';

/**
 * Упрощенный главный компонент приложения
 * Минимальная логика навигации между экранами
 */
function App() {
  const [screen, setScreen] = useState('menu');
  const [contentPack, setContentPack] = useState(null);
  const [contentPacks, setContentPacks] = useState([]);

  useEffect(() => {
    ApiService.fetchContentPacks().then(setContentPacks).catch(() => setContentPacks([]));
  }, []);

  const startGame = async (packSlug) => {
    const pack = await ApiService.fetchContentPack(packSlug);
    if (pack) {
      setContentPack(pack);
      setScreen('game');
    }
  };

  const goToMenu = () => {
    setScreen('menu');
    setContentPack(null);
  };

  const goToPurchase = () => setScreen('purchase');

  if (screen === 'game') {
    return <GameScreen contentPack={contentPack} onBack={goToMenu} />;
  }

  if (screen === 'purchase') {
    return <PurchaseScreen onBack={goToMenu} onPurchase={goToMenu} />;
  }

  return (
    <MainMenuScreen 
      onStartGame={startGame}
      onPurchase={goToPurchase}
      contentPacks={contentPacks}
      loading={contentPacks.length === 0}
    />
  );
}

export default App;
