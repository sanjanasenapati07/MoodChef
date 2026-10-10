import React, { useState, useEffect } from 'react';
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonText, IonIcon
} from '@ionic/react';
import { cloudUploadOutline, linkOutline, imageOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddActivityModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Starter');
  const [energy, setEnergy] = useState('Low');
  const [imgUrl, setImgUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const fallbackImage = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400';

  // --- 1. SMART PREVIEW LOGIC ---
  useEffect(() => {
    if (imgUrl.trim() === '') {
      setPreviewUrl(fallbackImage);
    } else if (imgUrl.startsWith('data:image')) {
      // It's an uploaded Base64 image
      setPreviewUrl(imgUrl);
    } else {
      // It's a web link - use the proxy
      setPreviewUrl(`https://wsrv.nl/?url=${encodeURIComponent(imgUrl)}&default=${encodeURIComponent(fallbackImage)}&output=jpg`);
    }
  }, [imgUrl]);

  // --- 2. FILE UPLOAD LOGIC ---
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result as string); // Converts image to Base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title) {
      alert("Please enter a name for the activity.");
      return;
    }

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in again.");
        return;
      }

      const { error } = await supabase
        .from('activities')
        .insert({
          title: title,
          category: category,
          energy: energy,
          img_url: imgUrl || fallbackImage,
          user_id: user.id 
        });

      if (error) throw error;

      // Reset fields
      setTitle('');
      setImgUrl('');
      onSuccess(); 
      onClose();   
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Expand Menu</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        
        {/* IMAGE PREVIEW */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ 
                width: '100%', height: '200px', borderRadius: '15px', 
                overflow: 'hidden', background: '#f0f0f0', border: '1px solid #ddd',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => (e.currentTarget.src = fallbackImage)}
                />
            </div>
            <IonText color="medium">
                <p style={{ fontSize: '12px' }}>Live Preview</p>
            </IonText>
        </div>

        <IonItem lines="full">
          <IonLabel position="stacked">What's the activity?</IonLabel>
          <IonInput 
            value={title} 
            onIonInput={(e) => setTitle(e.detail.value!)} 
            placeholder="e.g. 5 Minute Dance"
          />
        </IonItem>

        {/* METHOD 1: UPLOAD */}
        <div style={{ margin: '20px 0', padding: '10px', background: '#f9f9f9', borderRadius: '10px' }}>
            <IonText color="primary">
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                    <IonIcon icon={cloudUploadOutline} /> Option 1: Upload (Best for Pinterest)
                </h3>
            </IonText>
            <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* METHOD 2: LINK */}
        <div style={{ margin: '20px 0', padding: '10px', background: '#f9f9f9', borderRadius: '10px' }}>
            <IonText color="secondary">
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                    <IonIcon icon={linkOutline} /> Option 2: Paste Link
                </h3>
            </IonText>
            <IonInput 
                value={imgUrl.startsWith('data:') ? '' : imgUrl} 
                onIonInput={(e) => setImgUrl(e.detail.value!)} 
                placeholder="https://..."
                style={{ borderBottom: '1px solid #ccc' }}
            />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <IonItem lines="none" style={{ flex: 1, borderBottom: '1px solid #ddd' }}>
                <IonLabel position="stacked">Category</IonLabel>
                <IonSelect value={category} onIonChange={e => setCategory(e.detail.value)}>
                    <IonSelectOption value="Starter">Starter</IonSelectOption>
                    <IonSelectOption value="Main">Main</IonSelectOption>
                    <IonSelectOption value="Dessert">Dessert</IonSelectOption>
                </IonSelect>
            </IonItem>
            <IonItem lines="none" style={{ flex: 1, borderBottom: '1px solid #ddd' }}>
                <IonLabel position="stacked">Energy</IonLabel>
                <IonSelect value={energy} onIonChange={e => setEnergy(e.detail.value)}>
                    <IonSelectOption value="Low">Low</IonSelectOption>
                    <IonSelectOption value="Medium">Medium</IonSelectOption>
                    <IonSelectOption value="High">High</IonSelectOption>
                </IonSelect>
            </IonItem>
        </div>

        <IonButton 
          expand="block" 
          onClick={handleSave} 
          disabled={uploading}
          style={{ marginTop: '30px', '--border-radius': '10px' }}
          color="dark"
        >
          {uploading ? 'Processing...' : 'Add to My Menu'}
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default AddActivityModal;