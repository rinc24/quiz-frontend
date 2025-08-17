import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * Сервис для работы с локальным хранилищем данных
 * Поддерживает как нативные платформы (через Capacitor), так и веб (localStorage)
 */
class StorageService {
  constructor() {
    // Определяем, работаем ли мы на нативной платформе
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Сохраняет данные контент-пака в локальном хранилище
   * @param {string} slug - идентификатор контент-пака
   * @param {Object} data - данные для сохранения
   */
  async saveContentPack(slug, data) {
    const key = `content_pack_${slug}`;
    
    if (this.isNative) {
      try {
        await Filesystem.writeFile({
          path: `${key}.json`,
          data: JSON.stringify(data),
          directory: Directory.Data,
        });
      } catch (error) {
        // Откат на localStorage в случае ошибки
        localStorage.setItem(key, JSON.stringify(data));
      }
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  /**
   * Загружает данные контент-пака из локального хранилища
   * @param {string} slug - идентификатор контент-пака
   * @returns {Object|null} Данные контент-пака или null если не найден
   */
  async loadContentPack(slug) {
    const key = `content_pack_${slug}`;
    
    if (this.isNative) {
      try {
        const result = await Filesystem.readFile({
          path: `${key}.json`,
          directory: Directory.Data,
        });
        return JSON.parse(result.data);
      } catch (error) {
        // Откат на localStorage в случае ошибки
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }
    } else {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  }

  /**
   * Сохраняет информацию о покупках в локальном хранилище
   * @param {Array} purchases - массив идентификаторов купленных контент-паков
   */
  async savePurchaseInfo(purchases) {
    const key = 'purchased_content';
    
    if (this.isNative) {
      try {
        await Filesystem.writeFile({
          path: `${key}.json`,
          data: JSON.stringify(purchases),
          directory: Directory.Data,
        });
      } catch (error) {
        localStorage.setItem(key, JSON.stringify(purchases));
      }
    } else {
      localStorage.setItem(key, JSON.stringify(purchases));
    }
  }

  /**
   * Загружает информацию о покупках из локального хранилища
   * @returns {Array} Массив идентификаторов купленных контент-паков
   */
  async loadPurchaseInfo() {
    const key = 'purchased_content';
    
    if (this.isNative) {
      try {
        const result = await Filesystem.readFile({
          path: `${key}.json`,
          directory: Directory.Data,
        });
        return JSON.parse(result.data);
      } catch (error) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
      }
    } else {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    }
  }

  /**
   * Проверяет, куплен ли указанный контент-пак
   * @param {string} slug - идентификатор контент-пака
   * @returns {boolean} true если контент куплен, иначе false
   */
  async isPurchased(slug) {
    const purchases = await this.loadPurchaseInfo();
    return purchases.includes(slug);
  }

  /**
   * Добавляет контент-пак в список купленных
   * @param {string} slug - идентификатор купленного контент-пака
   */
  async addPurchase(slug) {
    const purchases = await this.loadPurchaseInfo();
    if (!purchases.includes(slug)) {
      purchases.push(slug);
      await this.savePurchaseInfo(purchases);
    }
  }
}

const storageService = new StorageService();
export default storageService;