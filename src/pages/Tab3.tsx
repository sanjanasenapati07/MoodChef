import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonPage, useIonViewWillEnter, IonIcon, IonItem, 
  IonLabel, IonInput, IonSelect, IonSelectOption, IonButton, IonAccordion, IonAccordionGroup,
  IonProgressBar, IonText, IonAvatar, useIonRouter, IonToast, IonAlert, IonThumbnail
} from '@ionic/react';
import { 
  flameOutline, imageOutline, trashOutline, settingsOutline, trophyOutline, personCircleOutline, addCircleOutline, cloudUploadOutline, linkOutline
} from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import './Tab3.css';

// Importing the Modal component
import AddActivityModal from '../components/AddActivityModal';

const Tab3: React.FC = () => {
  const [routines, setRoutines] = useState<any[]>([]);
  const [systemActivities, setSystemActivities] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [dailyGoal, setDailyGoal] = useState<number>(3); 
  const [userName, setUserName] = useState<string>(''); 
  const [toastMsg, setToastMsg] = useState(''); 
  const [showDeleteAlert, setShowDeleteAlert] = useState(false); 
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const fallbackImage = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400';

  const [newActivity, setNewActivity] = useState({ 
    title: '', energy: 'Low', category: 'Starter', img_url: '' 
  });

  const router = useIonRouter();

  const loadData = async () => {
    const savedRoutines = localStorage.getItem('dailyOrder');
    const savedStreak = localStorage.getItem('sessionStreak');
    const lastDateStr = localStorage.getItem('lastCompletionDate');
    
    if (savedRoutines) setRoutines(JSON.parse(savedRoutines));

    if (savedStreak && lastDateStr) {
      const lastDate = new Date(lastDateStr);
      const now = new Date();
      const diffInHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

      if (diffInHours > 24) {
        setStreak(0);
        localStorage.setItem('sessionStreak', '0');
      } else {
        setStreak(parseInt(savedStreak));
      }
    } else if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setDailyGoal(user.user_metadata?.daily_goal || 3);
      setUserName(user.user_metadata?.full_name || 'User'); 

      const { data, error } = await supabase
        .from('activities') 
        .select('*')
        .or(`user_id.is.null,user_id.eq.${user.id}`) 
        .order('created_at', { ascending: false });
      
      if (data) setSystemActivities(data);
      if (error) console.error("Error fetching activities:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useIonViewWillEnter(() => {
    loadData();
  });

  // HELPER: Handles both Base64 and Proxy URLs
  const getSmartImage = (url: string) => {
    if (!url) return fallbackImage;
    if (url.startsWith('data:image')) return url;
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&default=${encodeURIComponent(fallbackImage)}&output=jpg`;
  };

  // NEW: FILE UPLOAD LOGIC FOR THE TAB 3 FORM
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewActivity({ ...newActivity, img_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const completedCount = routines.filter(r => r.status === 'completed').length;
  const progress = dailyGoal > 0 ? completedCount / dailyGoal : 0;

  const toggleTask = (index: number) => {
    const updated = [...routines];
    updated[index].status = updated[index].status === 'completed' ? 'pending' : 'completed';
    setRoutines(updated);
    localStorage.setItem('dailyOrder', JSON.stringify(updated));
  };

  const removeActivityFromList = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const updated = routines.filter((_, idx) => idx !== index);
    setRoutines(updated);
    localStorage.setItem('dailyOrder', JSON.stringify(updated));
  };

  const deleteFromSystem = async (id: number) => {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (!error) {
      setToastMsg("Activity removed.");
      loadData();
    } else {
      setToastMsg("Error: Check permissions.");
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.title) {
      setToastMsg("Please enter a name.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('activities').insert([
      {
        title: newActivity.title,
        energy: newActivity.energy,
        category: newActivity.category,
        user_id: user.id, 
        img_url: newActivity.img_url || fallbackImage
      }
    ]);

    if (!error) {
      setNewActivity({ title: '', energy: 'Low', category: 'Starter', img_url: '' });
      setToastMsg("Added to your system!");
      loadData();
    }
  };

  return (
    <IonPage>
      <IonContent className="glow-bg-main">
        
        {/* Profile Header */}
        <div className="user-corner-profile" onClick={() => router.push('/profile', 'forward')}>
          <span className="user-name-text">{userName}</span>
          <IonAvatar className="user-avatar-small">
            <IonIcon icon={personCircleOutline} />
          </IonAvatar>
        </div>

        <div className="tab3-header">
          <div className="streak-badge-main">
            <IonIcon icon={flameOutline} className="flame-icon" />
            <span>{streak} SESSION STREAK</span>
          </div>
          <h1 className="header-text">Daily Glow</h1>
        </div>

        <div className="tab3-body-container">
          {/* Progress Card */}
          <div className="progress-card-v3">
            <div className="progress-info-row">
              <IonText>
                <h2>{completedCount} / {dailyGoal} Completed</h2>
              </IonText>
              <IonIcon icon={trophyOutline} className={progress >= 1 ? "gold-trophy" : "grey-trophy"} />
            </div>
            <IonProgressBar value={progress} className="glow-progress-bar" color={progress >= 1 ? "success" : "primary"} />
          </div>

          {/* Pending Actions List */}
          <div className="pending-actions-card">
            <h3 className="section-title">Pending Actions</h3>
            {routines.length > 0 ? (
              <>
                {routines.map((item, idx) => (
                  <div key={idx} className="glow-item-row" onClick={() => toggleTask(idx)}>
                    <div className="glow-item-info"><strong>{item.title}</strong></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={`status-pill-v3 ${item.status || 'pending'}`}>
                        {(item.status || 'pending').toUpperCase()}
                      </div>
                      <button className="item-remove-btn" onClick={(e) => removeActivityFromList(e, idx)}>
                        <IonIcon icon={trashOutline} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="empty-glow-state">
                <IonButton fill="clear" routerLink="/tab1" className="coral-text">GO TO MENU</IonButton>
              </div>
            )}
          </div>

          {/* ADMIN SECTION */}
          <div className="admin-form-section">
            <IonAccordionGroup>
              <IonAccordion value="manage">
                <IonItem slot="header" color="light">
                  <IonIcon icon={settingsOutline} slot="start" />
                  <IonLabel>Manage System Menu</IonLabel>
                </IonItem>
                <div className="ion-padding" slot="content" style={{ background: '#fff' }}>
                  {systemActivities.map(act => (
                    <div key={act.id} className="system-manage-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <IonThumbnail style={{ width: '40px', height: '40px' }}>
                           <img src={getSmartImage(act.img_url)} style={{ borderRadius: '4px' }} onError={(e) => (e.currentTarget.src = fallbackImage)} />
                        </IonThumbnail>
                        <span>{act.title}</span>
                      </div>
                      <IonIcon icon={trashOutline} color="danger" onClick={() => {
                        setSelectedDeleteId(act.id);
                        setShowDeleteAlert(true);
                      }} />
                    </div>
                  ))}
                </div>
              </IonAccordion>
            </IonAccordionGroup>

            <h3 className="admin-section-head" style={{ marginTop: '20px' }}>
              <IonIcon icon={addCircleOutline} /> Expand System
            </h3>
            
            <div className="admin-form-card">
              {/* LIVE PREVIEW BOX */}
              <div style={{ width: '100%', height: '150px', backgroundColor: '#f0f0f0', borderRadius: '10px', marginBottom: '15px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img 
                    src={getSmartImage(newActivity.img_url)} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => (e.currentTarget.src = fallbackImage)}
                  />
              </div>

              <IonItem lines="none" className="admin-input-item">
                <IonLabel position="stacked">Activity Name</IonLabel>
                <IonInput value={newActivity.title} onIonInput={e => setNewActivity({...newActivity, title: e.detail.value!})} />
              </IonItem>

              {/* OPTION 1: UPLOAD (NEW TO TAB 3) */}
              <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '10px' }}>
                <IonText color="primary"><h4 style={{ margin: '0 0 5px 0' }}><IonIcon icon={cloudUploadOutline} /> Option 1: Upload Image</h4></IonText>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </div>

              {/* OPTION 2: PASTE LINK */}
              <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '10px' }}>
                <IonText color="secondary"><h4 style={{ margin: '0 0 5px 0' }}><IonIcon icon={linkOutline} /> Option 2: Paste Link</h4></IonText>
                <IonInput 
                  value={newActivity.img_url.startsWith('data:') ? '' : newActivity.img_url} 
                  onIonInput={e => setNewActivity({...newActivity, img_url: e.detail.value!})} 
                  placeholder="Paste URL here..." 
                />
              </div>

              <div className="admin-form-row">
                <IonItem lines="none" className="admin-input-item flex-1">
                  <IonLabel position="stacked">Category</IonLabel>
                  <IonSelect value={newActivity.category} onIonChange={e => setNewActivity({...newActivity, category: e.detail.value})}>
                    <IonSelectOption value="Starter">Starter</IonSelectOption>
                    <IonSelectOption value="Main">Main</IonSelectOption>
                    <IonSelectOption value="Dessert">Dessert</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem lines="none" className="admin-input-item flex-1">
                  <IonLabel position="stacked">Energy</IonLabel>
                  <IonSelect value={newActivity.energy} onIonChange={e => setNewActivity({...newActivity, energy: e.detail.value})}>
                    <IonSelectOption value="Low">Low</IonSelectOption>
                    <IonSelectOption value="Medium">Medium</IonSelectOption>
                    <IonSelectOption value="High">High</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </div>
              
              <button className="admin-submit-btn" onClick={handleAddActivity}>ADD TO SYSTEM</button>
            </div>
          </div>
        </div>

        <IonToast isOpen={!!toastMsg} message={toastMsg} duration={2000} color="success" onDidDismiss={() => setToastMsg('')} />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Deletion'}
          message={'Remove this activity?'}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Remove', handler: () => { if(selectedDeleteId) deleteFromSystem(selectedDeleteId); } }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab3;