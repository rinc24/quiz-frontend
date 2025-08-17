import { Capacitor } from '@capacitor/core';
import StorageService from './storage';
import ApiService from './api';

class PurchaseService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async initializePurchases() {
    if (this.isNative) {
      // В реальном приложении здесь будет инициализация In-App Purchases
      console.log('Initializing native purchases...');
    }
  }

  async purchaseContentPack(packSlug) {
    try {
      if (this.isNative) {
        // Логика покупки для нативных платформ
        return await this.handleNativePurchase(packSlug);
      } else {
        // Логика покупки для веб-версии (например, через Stripe)
        return await this.handleWebPurchase(packSlug);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  async handleNativePurchase(packSlug) {
    // Моковая реализация для разработки
    // В реальном приложении здесь будет интеграция с App Store/Google Play
    
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock purchase completed for ${packSlug}`);
        resolve({
          success: true,
          transactionId: `mock_${Date.now()}`,
          productId: packSlug
        });
      }, 2000);
    });
  }

  async handleWebPurchase(packSlug) {
    // Моковая реализация для веб-версии
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock web purchase completed for ${packSlug}`);
        resolve({
          success: true,
          transactionId: `web_mock_${Date.now()}`,
          productId: packSlug
        });
      }, 1500);
    });
  }

  async verifyPurchase(purchaseData) {
    try {
      // Отправляем данные о покупке на сервер для верификации
      const result = await ApiService.verifyPurchase(purchaseData);
      
      if (result.success) {
        // Сохраняем информацию о покупке локально
        await StorageService.addPurchase(purchaseData.productId);
        
        // Загружаем контент пакета
        const contentPack = await ApiService.fetchContentPack(purchaseData.productId);
        if (contentPack) {
          await StorageService.saveContentPack(purchaseData.productId, contentPack);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Purchase verification failed:', error);
      throw error;
    }
  }

  async restorePurchases() {
    if (this.isNative) {
      // В реальном приложении здесь будет восстановление покупок
      console.log('Restoring purchases...');
      
      // Моковые данные для разработки
      const mockPurchases = ['emotions', 'objects'];
      
      for (const packSlug of mockPurchases) {
        await StorageService.addPurchase(packSlug);
      }
      
      return mockPurchases;
    }
    
    return [];
  }

  async getPurchasedContent() {
    return await StorageService.loadPurchaseInfo();
  }
}

const purchaseService = new PurchaseService();
export default purchaseService;