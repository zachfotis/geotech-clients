import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBtmU81lsQzkW1IK0DErX-N_erAKcb0J3g',
  authDomain: 'geotech-clients.firebaseapp.com',
  projectId: 'geotech-clients',
  storageBucket: 'geotech-clients.appspot.com',
  messagingSenderId: '573983322994',
  appId: '1:573983322994:web:a821e9bee3d50b50dce3eb',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
