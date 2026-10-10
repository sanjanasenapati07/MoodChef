import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonTitle, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonLoading, 
  IonToast, 
  useIonRouter,
  IonRange,
  IonIcon
} from '@ionic/react';
import { logOutOutline, saveOutline, personOutline, trophyOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import './Auth.css'; // Reusing your existing auth styles

const Profile: React.FC = () => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<number>(3); // Default dopamine goal
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const router = useIonRouter();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setName(user.user_metadata?.full_name || '');
        // Fetch goal from metadata if it exists, else default to 3
        setGoal(user.user_metadata?.daily_goal || 3);
      }
    };
    getProfile();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    // Update both the name and the daily goal in Supabase Metadata
    const { error } = await supabase.auth.updateUser({ 
      data: { 
        full_name: name,
        daily_goal: goal 
      } 
    });
    
    setLoading(false);
    if (error) {
      setToastMsg(error.message);
    } else {
      setToastMsg("Profile & Goal Updated!");
      // Optional: Go back to Tab1 after a short delay
      setTimeout(() => router.push('/tab1', 'back', 'replace'), 1500);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login', 'root', 'replace');
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#ffffff' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab1" />
          </IonButtons>
          <IonTitle style={{ fontWeight: '700' }}>My Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="auth-bg ion-padding">
        <div className="auth-wrapper" style={{ justifyContent: 'start', paddingTop: '20px' }}>
          
          <div className="auth-form-container">
            {/* Name Section */}
            <div style={{ marginBottom: '30px' }}>
               <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>PERSONAL INFO</h3>
               <IonItem lines="full" className="auth-item">
                 <IonIcon icon={personOutline} slot="start" style={{ color: '#ff8a75' }} />
                 <IonLabel position="stacked">Display Name</IonLabel>
                 <IonInput 
                   value={name} 
                   onIonInput={e => setName(e.detail.value!)} 
                   placeholder="Enter your name"
                 />
               </IonItem>
            </div>

            {/* Goal Setting Section */}
            <div style={{ marginBottom: '40px' }}>
               <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>DAILY TARGET</h3>
               <div style={{ padding: '0 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: '600' }}>Dopamine Goal: {goal} items</p>
                    <IonIcon icon={trophyOutline} style={{ color: '#ffc107' }} />
                  </div>
                  <IonRange 
                    min={1} 
                    max={10} 
                    value={goal} 
                    snaps={true} 
                    ticks={true} 
                    color="primary"
                    onIonChange={e => setGoal(e.detail.value as number)}
                    style={{ '--bar-background-active': '#ff8a75' }}
                  />
                  <p style={{ fontSize: '0.8rem', color: '#888' }}>How many activities do you want to complete daily?</p>
               </div>
            </div>

            {/* Buttons */}
            <button className="login-submit-btn" onClick={handleUpdate}>
              <IonIcon icon={saveOutline} style={{ marginRight: '8px' }} />
              SAVE CHANGES
            </button>

            <button 
              onClick={handleLogout} 
              style={{ 
                marginTop: '30px', 
                background: 'transparent', 
                color: '#eb445a', 
                width: '100%', 
                border: '1px solid #eb445a', 
                padding: '12px',
                borderRadius: '8px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IonIcon icon={logOutOutline} style={{ marginRight: '8px' }} />
              SIGN OUT
            </button>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Saving your profile..." />
        <IonToast 
          isOpen={!!toastMsg} 
          message={toastMsg} 
          duration={2000} 
          onDidDismiss={() => setToastMsg('')} 
          color={toastMsg.includes('Updated') ? 'success' : 'danger'}
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;