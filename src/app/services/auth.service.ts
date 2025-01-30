import { Injectable } from '@angular/core';
import {
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from '@angular/fire/auth';

import { BehaviorSubject, Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => {
      this.loggedIn.next(!!user);
    });
  }

  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((res) => res.user)
    );
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }
  // isLoggedIn(): Observable<boolean> {
  //   return new Observable((observer) => {
  //     onAuthStateChanged(this.auth, (res) => {
  //       if (res) observer.next(true);
  //       else observer.next(false);
  //     });
  //   });
  // }

  register(email: string, password: string): Observable<User> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(map((res) => res.user));
  }

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }
}
