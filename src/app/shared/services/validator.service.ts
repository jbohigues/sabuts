import { inject, Injectable } from '@angular/core';
import {
  collection,
  query,
  where,
  getDocs,
  Firestore,
} from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';
import { Colors } from '../enums/colors';
import { IconsToast } from '../enums/iconsToast';

@Injectable({
  providedIn: 'root',
})
export class ValidatorService {
  private firestore: Firestore = inject(Firestore);

  constructor(private toastController: ToastController) {}

  async checkIfEmailExists(email: string): Promise<boolean> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  async checkIfUsernameExists(username: string): Promise<boolean> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('userName', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  async presentToast(
    message: string,
    color: Colors = Colors.success,
    icon: IconsToast = IconsToast.success_thumbs_up
  ) {
    const toast = await this.toastController.create({
      message,
      color,
      icon,
      duration: 5000,
      position: 'bottom',
      animated: true,
    });
    toast.present();
  }
}
