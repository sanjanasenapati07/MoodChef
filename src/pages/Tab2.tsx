import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonAccordion, IonAccordionGroup, IonItem, IonLabel, useIonViewWillEnter } from '@ionic/react';
import { supabase } from '../supabaseClient';
import './Tab2.css';

const Tab2: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);

  const fetchItems = async () => {
    console.log("Tab 2: Fetching activities...");
    const { data } = await supabase.from('activities').select('*');
    if (data) {
      // Keep list unique by title to prevent duplicate display
      const unique = data.filter((v, i, a) => a.findIndex(t => t.title === v.title) === i);
      setActivities(unique);
    }
  };

  // 1. Critical for Ionic: Refresh data whenever user switches to this tab
  useIonViewWillEnter(() => {
    fetchItems();
  });

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel('tab2-realtime-room')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        (payload) => {
          console.log('Tab 2 Change Detected:', payload);
          
          if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            // Optimistic local filter to make it feel instant
            if (deletedId) {
              setActivities((current) => 
                current.filter(act => String(act.id) !== String(deletedId))
              );
            }
            // Background sync to ensure unique title logic is maintained
            fetchItems();
          } 
          
          else if (payload.eventType === 'INSERT') {
            const newItem = payload.new;
            setActivities((current) => {
              // Only add if title isn't already there (respecting your unique rule)
              if (current.find(a => a.title === newItem.title)) return current;
              return [...current, newItem];
            });
          } 
          
          else {
            // For UPDATE or unknown changes, just pull the source of truth
            fetchItems();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const MenuBlock = ({ title, desc, img, cat }: any) => (
    <div className="menu-card-v2">
      <div className="menu-hero-img-container">
        <img src={img} className="menu-hero-img" alt={title} />
      </div>
      <div className="menu-card-intro">
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
      <IonAccordionGroup>
        <IonAccordion value={cat}>
          <IonItem slot="header" lines="none" className="menu-expand-trigger">
            <IonLabel>VIEW {title.toUpperCase()} LIST</IonLabel>
          </IonItem>
          <div slot="content" className="menu-inner-list">
            {activities.filter(a => a.category === cat).map(item => (
              <div key={item.id} className="menu-activity-row">
                <div className="menu-activity-text">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
                <div className="menu-activity-photo">
                  <img src={item.img_url || 'https://via.placeholder.com/150'} alt="" />
                </div>
              </div>
            ))}
            {activities.filter(a => a.category === cat).length === 0 && (
              <div className="ion-padding ion-text-center">
                <p style={{ opacity: 0.5 }}>No activities here yet.</p>
              </div>
            )}
          </div>
        </IonAccordion>
      </IonAccordionGroup>
    </div>
  );

  return (
    <IonPage>
      <IonContent className="app-cream-bg">
        <div className="tab2-scroll-wrapper">
          <MenuBlock title="Starters" desc="Light activities to spark your morning energy." img="/starter.jpg" cat="Starter" />
          <MenuBlock title="Mains" desc="Deep, satisfying tasks for your peak hours." img="/main.jpg" cat="Main" />
          <MenuBlock title="Desserts" desc="Calming routines to wind down and recharge." img="/dessert.jpg" cat="Dessert" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;