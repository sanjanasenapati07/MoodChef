import { Redirect, Route, useLocation } from 'react-router-dom';
import { 
  IonApp, 
  IonIcon, 
  IonLabel, 
  IonRouterOutlet, 
  IonTabBar, 
  IonTabButton, 
  IonTabs, 
  setupIonicReact 
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { restaurantOutline, fastFoodOutline, sparklesOutline } from 'ionicons/icons';
import React from 'react';

// Page Imports
import Auth from './pages/Auth'; 
import Register from './pages/Register';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import Profile from './pages/Profile'; 

/* Core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';

setupIonicReact();

const AppContent: React.FC = () => {
  const location = useLocation();
  
  // 1. Identify if we are on a tab page
  const isTabPage = location.pathname.includes('tab');

  return (
    /* 2. The KEY is the secret: It forces the bar to re-render instantly 
       when switching from login to a tab. */
    <IonTabs key={isTabPage ? 'app-tabs' : 'auth-tabs'}>
      <IonRouterOutlet>
        <Route exact path="/login" component={Auth} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/tab1" component={Tab1} />
        <Route exact path="/tab2" component={Tab2} />
        <Route exact path="/tab3" component={Tab3} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/" render={() => <Redirect to="/login" />} />
      </IonRouterOutlet>

      {/* 3. The Bar: Hidden on login, flex on tabs */}
      <IonTabBar 
        slot="bottom" 
        style={{ 
          display: isTabPage ? 'flex' : 'none', 
          height: '75px', 
          '--background': '#FDFCFB',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          position: 'fixed',
          bottom: 0,
          width: '100%',
          zIndex: 1000
        } as any}
      >
        <IonTabButton tab="tab1" href="/tab1">
          <IonIcon icon={restaurantOutline} />
          <IonLabel style={{ fontWeight: '600' }}>ORDER</IonLabel>
        </IonTabButton>

        <IonTabButton tab="tab2" href="/tab2">
          <IonIcon icon={fastFoodOutline} />
          <IonLabel style={{ fontWeight: '600' }}>MENU</IonLabel>
        </IonTabButton>

        <IonTabButton tab="tab3" href="/tab3">
          <IonIcon icon={sparklesOutline} />
          <IonLabel style={{ fontWeight: '600' }}>GLOW</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <AppContent />
    </IonReactRouter>
  </IonApp>
);

export default App;