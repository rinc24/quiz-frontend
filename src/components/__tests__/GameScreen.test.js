import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameScreen from '../GameScreen';

// Mock the SpeakerIcon and TransparentImage components
jest.mock('../SpeakerIcon', () => {
    return function MockSpeakerIcon({ onClick, isPlaying }) {
        return (
            <button data-testid="speaker-icon" onClick={onClick}>
                {isPlaying ? 'Playing' : 'Play'}
            </button>
        );
    };
});

jest.mock('../TransparentImage', () => {
    return function MockTransparentImage({ src, alt, onClick, isCorrect, isSelected, showResult }) {
        return (
            <button
                data-testid={`choice-${alt}`}
                onClick={onClick}
                className={`choice ${isSelected ? 'selected' : ''} ${showResult && isCorrect ? 'correct' : ''} ${showResult && isSelected && !isCorrect ? 'incorrect' : ''}`}
            >
                <img src={src} alt={alt} />
            </button>
        );
    };
});

// Mock Web Speech API
Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: {
        cancel: jest.fn(),
        speak: jest.fn(),
    },
});

const mockContentPack = {
    id: 'test-pack',
    name: 'Test Pack',
    tasks: [
        {
            id: 1,
            question_text: 'Где собака?',
            audio_url: null,
            correct_choice: 0,
            choices: [
                {
                    id: 1,
                    text: 'Собака',
                    image_url: '/images/dog.png',
                    is_correct: true
                },
                {
                    id: 2,
                    text: 'Кошка',
                    image_url: '/images/cat.png',
                    is_correct: false
                }
            ]
        },
        {
            id: 2,
            question_text: 'Где кошка?',
            audio_url: null,
            correct_choice: 1,
            choices: [
                {
                    id: 3,
                    text: 'Собака',
                    image_url: '/images/dog.png',
                    is_correct: false
                },
                {
                    id: 4,
                    text: 'Кошка',
                    image_url: '/images/cat.png',
                    is_correct: true
                }
            ]
        },
        {
            id: 3,
            question_text: 'Где птица?',
            audio_url: null,
            correct_choice: 0,
            choices: [
                {
                    id: 5,
                    text: 'Птица',
                    image_url: '/images/bird.png',
                    is_correct: true
                },
                {
                    id: 6,
                    text: 'Медведь',
                    image_url: '/images/bear.png',
                    is_correct: false
                }
            ]
        }
    ]
};

describe('GameScreen Multiple Questions', () => {
    let mockOnBack;

    beforeEach(() => {
        mockOnBack = jest.fn();
        jest.clearAllMocks();
        // Mock console.log to avoid noise in tests
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should display first question initially', () => {
        render(<GameScreen contentPack={mockContentPack} onBack={mockOnBack} />);

        expect(screen.getByTestId('choice-Собака')).toBeInTheDocument();
        expect(screen.getByTestId('choice-Кошка')).toBeInTheDocument();
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    test('should navigate through all questions', async () => {
        render(<GameScreen contentPack={mockContentPack} onBack={mockOnBack} />);

        // First question
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('choice-Собака'));

        // Wait for transition to second question
        await waitFor(() => {
            expect(screen.getByText('2 / 3')).toBeInTheDocument();
        }, { timeout: 2000 });

        // Second question
        fireEvent.click(screen.getByTestId('choice-Кошка'));

        // Wait for transition to third question
        await waitFor(() => {
            expect(screen.getByText('3 / 3')).toBeInTheDocument();
        }, { timeout: 2000 });

        // Third question
        fireEvent.click(screen.getByTestId('choice-Птица'));

        // Wait for completion screen
        await waitFor(() => {
            expect(screen.getByText('Молодец! 🎉')).toBeInTheDocument();
            expect(screen.getByText('Тест завершен')).toBeInTheDocument();
        }, { timeout: 2000 });

        // Wait for automatic return to menu
        await waitFor(() => {
            expect(mockOnBack).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    test('should handle single question quiz', async () => {
        const singleQuestionPack = {
            ...mockContentPack,
            tasks: [mockContentPack.tasks[0]]
        };

        render(<GameScreen contentPack={singleQuestionPack} onBack={mockOnBack} />);

        // Should not show progress indicator for single question
        expect(screen.queryByText('1 / 1')).not.toBeInTheDocument();

        // Answer the question
        fireEvent.click(screen.getByTestId('choice-Собака'));

        // Should go directly to completion
        await waitFor(() => {
            expect(screen.getByText('Молодец! 🎉')).toBeInTheDocument();
        }, { timeout: 2000 });

        // Should return to menu
        await waitFor(() => {
            expect(mockOnBack).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    test('should prevent multiple selections on same question', () => {
        render(<GameScreen contentPack={mockContentPack} onBack={mockOnBack} />);

        const firstChoice = screen.getByTestId('choice-Собака');
        const secondChoice = screen.getByTestId('choice-Кошка');

        // Click first choice
        fireEvent.click(firstChoice);

        // Try to click second choice immediately
        fireEvent.click(secondChoice);

        // Only first choice should be selected
        expect(firstChoice).toHaveClass('selected');
        expect(secondChoice).not.toHaveClass('selected');
    });

    test('should reset state when content pack changes', () => {
        const { rerender } = render(<GameScreen contentPack={mockContentPack} onBack={mockOnBack} />);

        // Answer first question
        fireEvent.click(screen.getByTestId('choice-Собака'));

        // Change content pack
        const newContentPack = { ...mockContentPack, id: 'new-pack' };
        rerender(<GameScreen contentPack={newContentPack} onBack={mockOnBack} />);

        // Should be back to first question
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
});