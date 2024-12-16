import { inject, Injectable } from '@angular/core';
import {
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from '@angular/fire/auth';

import { Observable, from, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);

  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((res) => res.user)
    );
  }

  isLoggedIn(): Observable<boolean> {
    return new Observable((observer) => {
      onAuthStateChanged(this.auth, (res) => {
        console.log(res);
        if (res) observer.next(true);
        else observer.next(false);
      });
    });
  }

  register(email: string, password: string): Observable<User> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(map((res) => res.user));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }
}
