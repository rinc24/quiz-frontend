import React from 'react';
import './SpeakerIcon.css';

/**
 * Полупрозрачная иконка колонки в углу экрана
 * Единственный UI элемент в ультра-минималистичном игровом экране
 * @param {Function} onClick - обработчик нажатия для воспроизведения аудио
 * @param {boolean} isPlaying - состояние воспроизведения
 */
const SpeakerIcon = ({ onClick, isPlaying }) => {
  return (
    <button
      className={`speaker-icon ${isPlaying ? 'speaker-icon--playing' : ''}`}
      onClick={onClick}
      aria-label="Повторить вопрос"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11 5L6 9H2V15H6L11 19V5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.07 4.93C20.9445 6.80448 21.9982 9.34785 21.9982 12C21.9982 14.6522 20.9445 17.1955 19.07 19.07"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 12C17.0039 13.3308 16.4774 14.6024 15.54 15.54"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default SpeakerIcon;