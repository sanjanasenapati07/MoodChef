import React, { useState, useEffect, useCallback } from 'react';
import { 
  IonContent, IonPage, IonIcon, IonModal, useIonRouter, useIonViewWillEnter 
} from '@ionic/react';
import { addOutline, cartOutline, checkmarkOutline, trashOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import confetti from 'canvas-confetti';
import './Tab1.css';

const Tab1: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useIonRouter();

  const fallbackImage = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400';

  const fetchInitialData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUserName(user.user_metadata?.full_name || "User");

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${user.id}`) 
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        return;
      }

      if (data) {
        const unique = data.filter((v, i, a) => a.findIndex(t => t.title === v.title) === i);
        setActivities(unique);
      }
    }
  }, []);

  useIonViewWillEnter(() => {
    fetchInitialData();
  });

  useEffect(() => {
    fetchInitialData();

    const channel = supabase
      .channel('tab1-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            setActivities((current) => current.filter(act => String(act.id) !== String(deletedId)));
          } 
          else if (payload.eventType === 'INSERT') {
            const newItem = payload.new;
            if (newItem.user_id === null || newItem.user_id === user.id) {
              setActivities((current) => {
                if (current.find(a => a.title === newItem.title)) return current;
                return [newItem, ...current];
              });
            }
          }
          else {
            fetchInitialData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInitialData]);

  const addToCart = (title: string) => {
    if (!cart.includes(title)) setCart(prev => [...prev, title]);
  };

  const removeFromCart = (title: string) => {
    setCart(prev => prev.filter(item => item !== title));
  };

  const handleCheckout = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    const finalOrder = cart.map(title => ({ title, status: 'pending' }));
    localStorage.setItem('dailyOrder', JSON.stringify(finalOrder));
    setTimeout(() => {
      setCart([]);
      setShowCart(false);
      router.push('/tab3', 'forward', 'push');
    }, 800);
  };

  const SelectionBox = ({ title, cat, emoji }: any) => (
    <div className="main-category-group">
      <div className="category-box-header">
        <span className="emoji-icon">{emoji}</span>
        <h2>{title}</h2>
      </div>
      <div className="category-box-content">
        {activities.filter(a => a.category === cat).map(item => {
          const isSelected = cart.includes(item.title);
          
          // --- SMART IMAGE LOGIC START ---
          // If the image is a Base64 upload, use it directly.
          // Otherwise, use the proxy for external links.
          const finalImageUrl = (item.img_url && item.img_url.startsWith('data:image'))
            ? item.img_url
            : `https://wsrv.nl/?url=${encodeURIComponent(item.img_url || fallbackImage)}&default=${encodeURIComponent(fallbackImage)}&output=jpg`;
          // --- SMART IMAGE LOGIC END ---

          return (
            <div key={item.id} className="selection-item-row darkened-block">
              <div className="selection-item-text">
                <h4>{item.title}</h4>
                <p>{item.description || 'No description available'}</p>
              </div>
              <div className="selection-item-image-wrapper">
                <img 
                  src={finalImageUrl} 
                  alt={item.title} 
                  className="item-img" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackImage;
                  }}
                />
                <div className="button-overlay">
                  {!isSelected ? (
                    <button className="add-btn-round" onClick={() => addToCart(item.title)}>
                      <IonIcon icon={addOutline} />
                    </button>
                  ) : (
                    <div className="active-actions">
                      <div className="check-badge-glow"><IonIcon icon={checkmarkOutline} /></div>
                      <button className="trash-btn-round" onClick={() => removeFromCart(item.title)}>
                        <IonIcon icon={trashOutline} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <IonPage>
      <IonContent className="cream-bg" fullscreen>
        <div className="tab1-hero-banner">
          <div className="hero-text">
            <p className="hello-text">Hello, {userName || '...'}</p>
            <h1>Dopamine Menu</h1>
            <p>Select your daily dopamine</p>
          </div>
        </div>
        <div className="menu-container-padded">
          <SelectionBox title="Starters" cat="Starter" emoji="🥗" />
          <SelectionBox title="Mains" cat="Main" emoji="🍲" />
          <SelectionBox title="Desserts" cat="Dessert" emoji="🍰" />
        </div>
        {cart.length > 0 && (
          <div className="view-plate-container">
            <button className="view-plate-btn" onClick={() => setShowCart(true)}>
              <span>VIEW MY PLATE ({cart.length})</span>
              <IonIcon icon={cartOutline} />
            </button>
          </div>
        )}
        <IonModal 
          isOpen={showCart} 
          onDidDismiss={() => setShowCart(false)} 
          className="checkout-modal" 
          initialBreakpoint={0.65} 
          breakpoints={[0, 0.65, 1]}
        >
          <div className="modal-inner">
            <div className="modal-top-indicator"></div>
            <div className="modal-header-row">
              <IonIcon icon={checkmarkOutline} className="header-check" />
              <h2>Confirm Selection</h2>
            </div>
            <div className="checkout-list">
              {cart.map(itemTitle => (
                <div key={itemTitle} className="confirm-item-card">
                  <span className="item-title">{itemTitle}</span>
                  <span className="status-label">Selected</span>
                </div>
              ))}
            </div>
            <div className="modal-footer-btns">
              <button className="coral-checkout-btn" onClick={handleCheckout}>CHECKOUT & GLOW</button>
              <button className="plain-cancel-btn" onClick={() => setShowCart(false)}>CANCEL</button>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;