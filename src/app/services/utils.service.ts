import { inject, Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { Colors } from '../shared/enums/colors';
import { IconsToast } from '../shared/enums/iconsToast';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  router = inject(Router);
  toastController = inject(ToastController);
  loadingController = inject(LoadingController);

  loading() {
    return this.loadingController.create({ spinner: 'crescent' });
  }

  routerLink(url: string) {
    return this.router.navigateByUrl(url);
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

  // LOCALSTORAGE
  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  getFromLocalStorage(key: string) {
    const value = localStorage.getItem(key);
    if (value) return JSON.parse(value);
    return null;
  }
}