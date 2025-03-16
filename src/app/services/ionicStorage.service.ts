import { inject, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class IonicStorageService {
  private storage = inject(Storage);
  private storageReady: Promise<Storage>;

  constructor() {
    this.storageReady = this.initializeStorage();
  }

  private async initializeStorage(): Promise<Storage> {
    return this.storage.create();
  }

  // Métodos públicos
  async set(key: string, value: any): Promise<void> {
    const storage = await this.storageReady;
    return storage.set(key, value);
  }

  async get(key: string): Promise<any> {
    const storage = await this.storageReady;
    return storage.get(key);
  }

  async remove(key: string): Promise<void> {
    const storage = await this.storageReady;
    return storage.remove(key);
  }

  async clear(): Promise<void> {
    const storage = await this.storageReady;
    return storage.clear();
  }
}
