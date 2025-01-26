import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor(
    private router: Router,
    private toastController: ToastController
  ) {}

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
      swipeGesture: 'vertical',
      buttons: [
        {
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    toast.present();
  }

  getRandomDarkColor(): string {
    const getRandomValue = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const toHex = (value: number) => value.toString(16).padStart(2, '0');

    const min = 100; // Mínimo valor RGB (un poco oscuro)
    const max = 180; // Máximo valor RGB (no demasiado claro)

    const r = getRandomValue(min, max);
    const g = getRandomValue(min, max);
    const b = getRandomValue(min, max);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  convertTimestamps(timestamp: any): Date | null {
    // Convierte los campos de timestamp a Date
    if (!('seconds' in timestamp) || !('nanoseconds' in timestamp)) return null;
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }

  toDate(timestamp: any): Date {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }

  //! LOCALSTORAGE
  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  getFromLocalStorage(key: string) {
    const value = localStorage.getItem(key);
    if (value) return JSON.parse(value);
    return null;
  }

  removeItemOfLocalStorage(key: string) {
    localStorage.removeItem(key);
  }

  clearLocalStorage() {
    localStorage.clear();
    this.routerLink('login');
  }
}
