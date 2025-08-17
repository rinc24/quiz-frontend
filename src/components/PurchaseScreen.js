import React, { useState, useEffect } from 'react';
import PurchaseService from '../services/purchases';
import StorageService from '../services/storage';
import './PurchaseScreen.css';

const PurchaseScreen = ({ onBack, onPurchase }) => {
  const [contentPacks] = useState([
    { id: 'emotions', name: 'Эмоции', price: '99 ₽' },
    { id: 'objects', name: 'Предметы', price: '99 ₽' }
  ]);
  
  const [purchasedPacks, setPurchasedPacks] = useState([]);
  const [purchasingPack, setPurchasingPack] = useState(null);

  useEffect(() => {
    loadPurchasedPacks();
  }, []);

  const loadPurchasedPacks = async () => {
    try {
      const purchased = await StorageService.loadPurchaseInfo();
      setPurchasedPacks(purchased);
    } catch (error) {
      console.error('Error loading purchased packs:', error);
    }
  };

  const handlePurchase = async (packId) => {
    if (purchasedPacks.includes(packId)) return;

    setPurchasingPack(packId);
    
    try {
      const purchaseResult = await PurchaseService.purchaseContentPack(packId);
      
      if (purchaseResult.success) {
        await PurchaseService.verifyPurchase(purchaseResult);
        await loadPurchasedPacks();
        onPurchase(packId);
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setPurchasingPack(null);
    }
  };

  return (
    <div className="purchase-screen">
      <button className="back-button" onClick={onBack}>←</button>
      
      <div className="content-packs">
        {contentPacks.map(pack => {
          const isPurchased = purchasedPacks.includes(pack.id);
          const isPurchasing = purchasingPack === pack.id;
          
          return (
            <div key={pack.id} className="content-pack">
              <span>{pack.name}</span>
              <button 
                className="purchase-button"
                onClick={() => handlePurchase(pack.id)}
                disabled={isPurchased || isPurchasing}
              >
                {isPurchasing ? '...' : 
                 isPurchased ? '✓' : 
                 pack.price}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PurchaseScreen;