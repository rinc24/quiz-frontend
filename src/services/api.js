const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://kids.localhost:8765/api/v1';

/**
 * Сервис для работы с API приложения детских развивающих игр
 * Включает кеширование данных и обработку ошибок с откатом на моковые данные
 */
class ApiService {
  constructor() {
    // Кеш для хранения данных между запросами
    this.cache = {
      quizContent: null,     // Данные викторин
      contentPacks: null,    // Данные контент-паков
      lastFetch: null        // Время последнего обновления кеша
    };
    // Время жизни кеша - 5 минут
    this.CACHE_DURATION = 5 * 60 * 1000;
  }

  /**
   * Очищает кеш данных
   */
  clearCache() {
    this.cache = {
      quizContent: null,
      contentPacks: null,
      lastFetch: null
    };
  }

  /**
   * Загружает содержимое викторин с сервера или из кеша
   * @returns {Promise<Array>} Массив данных викторин
   */
  async fetchQuizContent() {
    // Проверяем актуальность кеша
    const now = Date.now();
    if (this.cache.quizContent && this.cache.lastFetch && 
        (now - this.cache.lastFetch) < this.CACHE_DURATION) {
      return this.cache.quizContent;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/quiz/content/`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz content');
      }
      const data = await response.json();
      
      // Сохраняем в кеш
      this.cache.quizContent = data;
      this.cache.lastFetch = now;
      
      return data;
    } catch (error) {
      // В случае ошибки возвращаем моковые данные для разработки
      const mockData = this.getMockQuizContent();
      this.cache.quizContent = mockData;
      this.cache.lastFetch = now;
      return mockData;
    }
  }

  /**
   * Получает список доступных контент-паков
   * @returns {Promise<Array>} Массив контент-паков с метаданными
   */
  async fetchContentPacks() {
    // Проверяем кеш для content packs
    if (this.cache.contentPacks) {
      return this.cache.contentPacks;
    }

    const quizContent = await this.fetchQuizContent();
    const contentPacks = quizContent.map(pack => {
      const questionsCount = pack.quizzes[0]?.questions?.length || 0;
      const result = {
        id: pack.id,
        slug: pack.translations.ru.name.toLowerCase().replace(/\s+/g, '-'),
        name: pack.translations.ru.name,
        description: `Викторина: ${pack.translations.ru.name}`,
        image: pack.image, // Изображение из API
        questionsCount: questionsCount,
        is_free: pack.id === 5, // Пак "Животные" бесплатный
        is_purchased: pack.id === 5 // По умолчанию куплен только пак "Животные"
      };
      return result;
    });

    // Сохраняем в кеш
    this.cache.contentPacks = contentPacks;
    return contentPacks;
  }

  /**
   * Загружает конкретный контент-пак по его идентификатору
   * @param {string} slug - идентификатор контент-пака
   * @returns {Promise<Object|null>} Данные контент-пака или null при ошибке
   */
  async fetchContentPack(slug) {
    try {
      // Используем уже загруженные данные из кеша
      const quizContent = await this.fetchQuizContent();
      
      const pack = quizContent.find(p => 
        p.translations.ru.name.toLowerCase().replace(/\s+/g, '-') === slug
      );
      
      if (!pack) {
        throw new Error(`Content pack not found: ${slug}`);
      }

      // Преобразуем данные API в формат приложения
      const result = this.transformQuizData(pack);
      return result;
    } catch (error) {
      // Возвращаем моковые данные для разработки
      return this.getMockContentPack(slug);
    }
  }

  /**
   * Преобразует данные викторины из формата API в формат приложения
   * @param {Object} pack - данные пака из API
   * @returns {Object|null} Преобразованные данные или null
   */
  transformQuizData(pack) {
    const quiz = pack.quizzes[0]; // Берем первую викторину
    if (!quiz) {
      return null;
    }

    const transformedData = {
      id: pack.id,
      slug: pack.translations.ru.name.toLowerCase().replace(/\s+/g, '-'),
      name: pack.translations.ru.name,
      tasks: quiz.questions.map(question => ({
        id: question.id,
        question_text: question.translations.ru.text,
        audio_url: question.translations.ru.audio,
        correct_choice: question.choices.findIndex(choice => choice.is_correct),
        choices: question.choices.map(choice => ({
          id: choice.id,
          text: choice.item.translations.ru.name,
          image_url: choice.item.image,
          is_correct: choice.is_correct
        }))
      }))
    };
    
    return transformedData;
  }

  /**
   * Верифицирует покупку на сервере
   * @param {Object} purchaseData - данные покупки для верификации
   * @returns {Promise<Object>} Результат верификации
   */
  async verifyPurchase(purchaseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/purchases/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });
      if (!response.ok) {
        throw new Error('Failed to verify purchase');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Возвращает моковые данные для разработки и тестирования
   * @returns {Array} Массив моковых данных викторин
   */
  getMockQuizContent() {
    return [
      {
        "id": 5,
        "image": "http://kids.localhost:8765/media/images/item_categories/animals_lion.png",
        "translations": {
          "ru": {
            "name": "Животные"
          }
        },
        "quizzes": [
          {
            "id": 5,
            "translations": {
              "ru": {
                "name": "Викторина: Животные",
                "pronunciation": null
              }
            },
            "questions": [
              {
                "id": 39,
                "image": null,
                "order": 1,
                "translations": {
                  "ru": {
                    "text": "Где собака?",
                    "audio": null
                  }
                },
                "choices": [
                  {
                    "id": 77,
                    "item": {
                      "id": 69,
                      "image": "http://kids.localhost:8765/media/images/items/animals_dog.png",
                      "effect": null,
                      "translations": {
                        "ru": {
                          "name": "Собака",
                          "pronunciation": null
                        }
                      }
                    },
                    "is_correct": true
                  },
                  {
                    "id": 78,
                    "item": {
                      "id": 80,
                      "image": "http://kids.localhost:8765/media/images/items/animals_cat.png",
                      "effect": null,
                      "translations": {
                        "ru": {
                          "name": "Кошка",
                          "pronunciation": null
                        }
                      }
                    },
                    "is_correct": false
                  }
                ]
              },
              {
                "id": 40,
                "image": null,
                "order": 2,
                "translations": {
                  "ru": {
                    "text": "Где кошка?",
                    "audio": null
                  }
                },
                "choices": [
                  {
                    "id": 79,
                    "item": {
                      "id": 80,
                      "image": "http://kids.localhost:8765/media/images/items/animals_cat.png",
                      "effect": null,
                      "translations": {
                        "ru": {
                          "name": "Кошка",
                          "pronunciation": null
                        }
                      }
                    },
                    "is_correct": true
                  },
                  {
                    "id": 80,
                    "item": {
                      "id": 81,
                      "image": "http://kids.localhost:8765/media/images/items/animals_bird.png",
                      "effect": null,
                      "translations": {
                        "ru": {
                          "name": "Птица",
                          "pronunciation": null
                        }
                      }
                    },
                    "is_correct": false
                  }
                ]
              },
              {
                "id": 41,
                "image": null,
                "order": 3,
                "translations": {
                  "ru": {
                    "text": "Где птица?",
                    "audio": null
                  }
                },
                "choices": [
                  {
                    "id": 81,
                    "item": {
                      "id": 82,
                      "image": "http://kids.localhost:8765/media/images/items/animals_bear.png",
                      "effect": null,
                      "translations": {
                        "ru": {
                          "name": "Медведь",
                          "pronunciation": null
                        }
                      }
                    },
                    "is_correct": false
                  },
                  {
                    "id": 82,
                    "item": {
                      "id": 81,
                      "image": "http://kids.localhost:8765/media/images/items/animals_bird.png",
                      "effect": null,
                      "translations": {
                        "ru": {
                          "name": "Птица",
                          "pronunciation": null
                        }
                      }
                    },
                    "is_correct": true
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": 6,
        "image": "http://kids.localhost:8765/media/images/item_categories/emotions_calm_face.png",
        "translations": {
          "ru": {
            "name": "Эмоции"
          }
        },
        "quizzes": [
          {
            "id": 6,
            "translations": {
              "ru": {
                "name": "Викторина: Эмоции",
                "pronunciation": null
              }
            },
            "questions": [
              {
                "id": 42,
                "image": null,
                "order": 1,
                "translations": {
                  "ru": {
                    "text": "Кто здесь веселый?",
                    "audio": null
                  }
                },
                "choices": [
                  {
                    "id": 83,
                    "item": {
                      "id": 83,
                      "image": "http://kids.localhost:8765/media/images/items/emotions_happy_face.png",
                      "effect": null,
                      "translations": {
                        "ru": {
                          "name": "Веселое лицо",
                          "pronunciation": null
                        }
                      }
                    },
                    "is_correct": true
                  },
                  {
                    "id": 84,
                    "item": {
                      "id": 84,
                      "image": "http://kids.localhost:8765/media/images/items/emotions_sad_face.png",
                      "effect": null,
                      "translations": {
                        "ru": {
                          "name": "Грустное лицо",
                          "pronunciation": null
                        }
                      }
                    },
                    "is_correct": false
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  getMockContentPacks() {
    return [
      {
        id: 5,
        slug: 'животные',
        name: 'Животные',
        description: 'Викторина: Животные',
        image: "http://kids.localhost:8765/media/images/item_categories/animals_lion.png",
        is_free: true,
        is_purchased: true
      },
      {
        id: 6,
        slug: 'эмоции',
        name: 'Эмоции',
        description: 'Викторина: Эмоции',
        image: "http://kids.localhost:8765/media/images/item_categories/emotions_calm_face.png",
        is_free: false,
        is_purchased: false
      }
    ];
  }

  getMockContentPack(slug) {
    const mockData = this.getMockQuizContent();
    if (slug === 'животные') {
      return this.transformQuizData(mockData[0]);
    }
    if (slug === 'эмоции') {
      return this.transformQuizData(mockData[1]);
    }
    return null;
  }
}

const ApiServiceInstance = new ApiService();
export default ApiServiceInstance;