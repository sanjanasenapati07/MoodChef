import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 
import { 
  IonIcon, IonSearchbar, IonHeader, 
  IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonItem, IonInput, IonLabel 
} from '@ionic/react';
import { addOutline, trashOutline, checkmarkOutline } from 'ionicons/icons';

interface Activity {
  id: number;
  title: string;
  description: string;
  image_url: string; 
  user_id: string | null; // Added user_id to the interface
}

const ActivityList: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    // 1. Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Fetch activities. 
    // If RLS is ON, Supabase automatically filters (Default + User's Own)
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error("Error fetching activities:", error.message);
    } else {
      setActivities(data || []);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return 'https://via.placeholder.com/150';
    
    // If it's a full URL (Default activities), use it as is
    if (path.startsWith('http')) return path;

    // If it's a path (User activities), get the URL from storage
    const { data } = supabase.storage
      .from('activities')
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const handleSelect = (id: number) => {
    if (!selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemove = (id: number) => {
    setSelectedIds(selectedIds.filter(favId => favId !== id));
  };

  const filteredActivities = activities.filter((a) =>
    a.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: '10px', background: '#FDFCFB', minHeight: '100vh' }}>
      <IonSearchbar 
        value={searchText} 
        onIonInput={(e: any) => setSearchText(e.detail.value!)} 
        placeholder="Search activities..."
        style={{ '--border-radius': '12px' }}
      />

      <div style={{ marginTop: '15px' }}>
        {filteredActivities.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>No activities found.</p>
        ) : (
          filteredActivities.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const displayImageUrl = getImageUrl(item.image_url);

            return (
              <div key={item.id} style={containerStyle}>
                <div style={{ flex: 1, paddingRight: '15px' }}>
                  <h3 style={{ margin: 0, fontWeight: '700' }}>{item.title}</h3>
                  <p style={{ margin: '4px 0', color: '#777', fontSize: '0.85rem' }}>
                    {item.description}
                  </p>
                  {/* Small tag to show if it's a personal activity */}
                  {item.user_id && (
                    <span style={{ fontSize: '0.7rem', color: '#4caf50' }}>Personal</span>
                  )}
                </div>

                <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                  <img 
                    src={displayImageUrl} 
                    alt={item.title}
                    style={{ 
                      width: '90px', 
                      height: '90px', 
                      objectFit: 'cover', 
                      borderRadius: '20px',
                      opacity: isSelected ? 0.6 : 1,
                      backgroundColor: '#eee'
                    }} 
                  />
                  
                  <button 
                    onClick={() => handleSelect(item.id)}
                    disabled={isSelected}
                    style={{
                      ...badgeStyle,
                      right: '32px', 
                      background: isSelected ? '#4caf50' : '#0d140d',
                    }}
                  >
                    <IonIcon icon={isSelected ? checkmarkOutline : addOutline} />
                  </button>

                  {isSelected && (
                    <button 
                      onClick={() => handleRemove(item.id)}
                      style={{
                        ...badgeStyle,
                        right: '-2px',
                        background: '#eb445a'
                      }}
                    >
                      <IonIcon icon={trashOutline} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const containerStyle = {
  display: 'flex', 
  alignItems: 'center', 
  padding: '16px 0',
  borderBottom: '1px solid #f0f0f0'
};

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '-5px',
  color: 'white',
  borderRadius: '10px',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  zIndex: 2,
  cursor: 'pointer'
};

export default ActivityList;