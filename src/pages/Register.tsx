import React, { useState } from 'react';
import { 
  IonContent, IonPage, IonInput, IonButton, 
  IonLoading, useIonRouter, IonIcon, IonItem 
} from '@ionic/react';
import { arrowBackOutline, personOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import './Auth.css';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useIonRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email, password, options: { data: { full_name: fullName } }
    });
    if (error) alert(error.message);
    else {
      alert('Success! Please check your email.');
      router.push('/login', 'back');
    }
    setLoading(false);
  };

  return (
    <IonPage>
      <IonContent className="auth-page-main">
        <div className="full-screen-bg-logo"></div>

        <div className="back-btn-round" onClick={() => router.push('/login', 'back')}>
          <IonIcon icon={arrowBackOutline} />
        </div>

        <div className="login-wrapper">
          <div className="logo-top">
            <img src="favicon.png" alt="MoodChef" className="brand-logo-large" />
          </div>

          <h2 className="white-text header-margin">Create Account</h2>

          <form onSubmit={handleRegister} className="form-container">
            <IonItem lines="none" className="input-item long-element">
              <IonIcon icon={personOutline} className="input-icon" slot="start" />
              <IonInput 
                className="custom-input"
                placeholder="Full Name"
                value={fullName} 
                onIonChange={e => setFullName(e.detail.value!)} 
              />
            </IonItem>

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
                CREATE ACCOUNT
              </IonButton>
            </div>
          </form>

          <p className="white-text bottom-text">
            Already have an account? <span className="coral-link" onClick={() => router.push('/login')}>Log In</span>
          </p>
        </div>

        <IonLoading isOpen={loading} message="Preparing your kitchen..." />
      </IonContent>
    </IonPage>
  );
};

export default Register;