import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SpeakerIcon from './SpeakerIcon';
import TransparentImage from './TransparentImage';
import './GameScreen.css';

/**
 * Ультра-минималистичный компонент экрана игры
 * Содержит только фон-градиент, иконку колонки и два прозрачных изображения
 * @param {Object} contentPack - данные контент-пака с заданиями
 * @param {Function} onBack - обработчик возврата в главное меню
 */
const GameScreen = ({ contentPack, onBack }) => {
  // Состояние текущего задания
  const [currentTask, setCurrentTask] = useState(0);
  // Индекс выбранного варианта ответа
  const [selectedChoice, setSelectedChoice] = useState(null);
  // Показать ли результат ответа
  const [showResult, setShowResult] = useState(false);
  // Состояние воспроизведения аудио
  const [isPlaying, setIsPlaying] = useState(false);
  // Состояние завершения теста
  const [isCompleted, setIsCompleted] = useState(false);

  // Мемоизированный список заданий
  const tasks = useMemo(() => contentPack?.tasks || [], [contentPack?.tasks]);
  // Текущее задание
  const task = tasks[currentTask];

  /**
   * Сброс состояния при смене контент-пака
   */
  useEffect(() => {
    setCurrentTask(0);
    setSelectedChoice(null);
    setShowResult(false);
    setIsPlaying(false);
    setIsCompleted(false);
  }, [contentPack?.id]);

  /**
   * Очистка при размонтировании компонента
   */
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  /**
   * Воспроизводит текст вопроса с помощью синтеза речи
   */
  const playTextToSpeech = useCallback(() => {
    if (!('speechSynthesis' in window) || !task?.question_text) {
      setIsPlaying(false);
      return;
    }

    // Останавливаем предыдущее произношение
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(task.question_text);
    
    // Настройки произношения для детей
    utterance.lang = 'ru-RU';
    utterance.rate = 0.7;
    utterance.pitch = 1.3;
    utterance.volume = 1;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechSynthesis.speak(utterance);
  }, [task?.question_text]);

  /**
   * Автоматически воспроизводит вопрос при смене задания
   */
  useEffect(() => {
    if (task && !showResult) {
      const timer = setTimeout(() => {
        setIsPlaying(true);
        if (task?.audio_url) {
          const audio = new Audio(task.audio_url);
          audio.onended = () => setIsPlaying(false);
          audio.onerror = () => playTextToSpeech();
          audio.play().catch(() => playTextToSpeech());
        } else {
          playTextToSpeech();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentTask, task, showResult, playTextToSpeech]);

  /**
   * Воспроизводит аудио вопроса (файл или синтез речи)
   */
  const playAudio = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    if (task?.audio_url) {
      const audio = new Audio(task.audio_url);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => playTextToSpeech();
      audio.play().catch(() => playTextToSpeech());
    } else {
      playTextToSpeech();
    }
  };

  /**
   * Обработчик выбора варианта ответа
   * @param {number} choiceIndex - индекс выбранного варианта
   */
  const handleChoice = (choiceIndex) => {
    if (selectedChoice !== null || !task) return;

    setSelectedChoice(choiceIndex);
    setShowResult(true);

    // Переход к следующему вопросу через 1.5 секунды
    setTimeout(() => {
      const isLastQuestion = currentTask >= tasks.length - 1;
      
      if (!isLastQuestion) {
        // Переходим к следующему вопросу
        setCurrentTask(prev => prev + 1);
        setSelectedChoice(null);
        setShowResult(false);
      } else {
        // Завершаем тест после последнего вопроса
        setIsCompleted(true);
        
        // Возвращаемся в меню через 2 секунды
        setTimeout(() => {
          onBack();
        }, 2000);
      }
    }, 1500);
  };

  // Проверяем наличие данных задания
  if (!task && !isCompleted) {
    return <div className="game-screen" />;
  }

  // Экран завершения теста
  if (isCompleted) {
    return (
      <div className="game-screen">
        <button className="back-button" onClick={onBack}>←</button>
        <div className="completion-message">
          <div className="completion-text">Молодец! 🎉</div>
          <div className="completion-subtext">Тест завершен</div>
        </div>
      </div>
    );
  }

  const choices = task.choices || [];

  return (
    <div className="game-screen">
      {/* Минималистичная кнопка назад */}
      <button className="back-button" onClick={onBack}>←</button>

      {/* Иконка колонки для повтора вопроса */}
      <SpeakerIcon 
        onClick={playAudio}
        isPlaying={isPlaying}
      />

      {/* Минималистичный индикатор прогресса (только для отладки) */}
      {tasks.length > 1 && (
        <div className="progress-indicator">
          {currentTask + 1} / {tasks.length}
        </div>
      )}

      {/* Контейнер для размещения изображений */}
      <div className="choice-container">
        {choices.slice(0, 2).map((choice, index) => (
          <TransparentImage
            key={`${currentTask}-${index}`}
            src={choice.image_url}
            alt={choice.text || `Вариант ${index + 1}`}
            onClick={() => handleChoice(index)}
            isCorrect={index === task.correct_choice}
            isSelected={selectedChoice === index}
            showResult={showResult}
          />
        ))}
      </div>
    </div>
  );
};

export default GameScreen;