import React, { useState } from 'react';
import { 
  IonContent, IonPage, IonInput, IonButton, 
  IonLoading, useIonRouter, IonIcon, IonItem 
} from '@ionic/react';
import { mailOutline, lockClosedOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import './Auth.css';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useIonRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push('/tab1', 'forward');
    setLoading(false);
  };

  return (
    <IonPage>
      <IonContent className="auth-page-main">
        <div className="full-screen-bg-logo"></div>

        <div className="login-wrapper">
          <div className="logo-top">
            <img src="favicon.png" alt="MoodChef" className="brand-logo-large" />
          </div>

          <h2 className="white-text header-margin">Sign in</h2>

          <form onSubmit={handleLogin} className="form-container">
            <IonItem lines="none" className="input-item long-element">
              <IonIcon icon={mailOutline} className="input-icon" slot="start" />
              <IonInput 
                className="custom-input"
                type="email" 
                placeholder="Email Address"
                value={email} 
                onIonChange={e => setEmail(e.detail.value!)} 
              />
            </IonItem>

            <IonItem lines="none" className="input-item long-element">
              <IonIcon icon={lockClosedOutline} className="input-icon" slot="start" />
              <IonInput 
                className="custom-input"
                type="password" 
                placeholder="Password"
                value={password} 
                onIonChange={e => setPassword(e.detail.value!)} 
              />
            </IonItem>

            <div className="long-element button-margin-top">
              <IonButton expand="block" type="submit" className="coral-btn main-action-btn">
                SIGN IN
              </IonButton>
            </div>
          </form>

          <div className="or-divider long-element">
            <div className="line"></div>
            <span className="white-text">OR</span>
            <div className="line"></div>
          </div>

          <div className="long-element">
            <IonButton fill="outline" expand="block" onClick={() => router.push('/tab1')} className="free-btn secondary-action-btn">
              USE FOR FREE
            </IonButton>
          </div>

          <p className="white-text bottom-text">
            Don't have an account? <span className="coral-link" onClick={() => router.push('/register')}>Register</span>
          </p>
        </div>

        <IonLoading isOpen={loading} />
      </IonContent>
    </IonPage>
  );
};

export default Auth;