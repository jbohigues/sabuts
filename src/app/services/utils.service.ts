'use strict';
import { Injectable, NgZone, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  needReloadSignal = signal(false);

  constructor(private router: Router, private ngZone: NgZone) {}

  routerLink(url: string, needReload?: boolean) {
    this.ngZone.run(() => {
      if (needReload != null) this.needReloadSignal.set(needReload);
      this.router.navigateByUrl(url);
    });
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

  // //! LOCALSTORAGE
  // saveInLocalStorage(key: string, value: any) {
  //   return localStorage.setItem(key, JSON.stringify(value));
  // }

  // getFromLocalStorage(key: string) {
  //   const value = localStorage.getItem(key);
  //   if (value) return JSON.parse(value);
  //   return null;
  // }

  // removeItemOfLocalStorage(key: string) {
  //   localStorage.removeItem(key);
  // }

  // clearLocalStorage() {
  //   localStorage.clear();
  //   this.routerLink('login');
  // }
}
