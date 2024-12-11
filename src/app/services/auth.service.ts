import { Injectable, inject } from '@angular/core';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  user$: Observable<any> = this.userSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.getUserData(user.uid).then((userData) => {
          this.userSubject.next(userData);
        });
      } else {
        this.userSubject.next(null);
      }
    });
  }

  private async getUserData(uid: string): Promise<any> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() };
    }
    return null;
  }

  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;
      await this.setUserData(user, { displayName });
    } catch (error) {
      console.error('Error during registration', error);
      throw error;
    }
  }

  private async setUserData(
    user: User,
    additionalData: any = {}
  ): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      ...additionalData,
    };
    await setDoc(userRef, userData, { merge: true });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Error during login', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.userSubject.next(null);
    } catch (error) {
      console.error('Error during logout', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  isAuthenticated(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        observer.next(!!user);
      });
      return unsubscribe;
    });
  }
}
