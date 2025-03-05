import { inject, Injectable } from '@angular/core';
import {
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from '@angular/fire/auth';
import {
  Observable,
  catchError,
  from,
  map,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);

  getCurrentUser() {
    return this.auth.currentUser;
  }

  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((res) => res.user)
    );
  }

  isLoggedIn(): Observable<boolean> {
    return new Observable((observer) => {
      onAuthStateChanged(this.auth, (res) => {
        if (res) observer.next(true);
        else observer.next(false);
      });
    });
  }

  register(email: string, password: string): Observable<User> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      switchMap((userCredential) => {
        const user = userCredential.user;
        return from(sendEmailVerification(user)).pipe(
          tap(() => console.log('Correu de verificació enviat')),
          map(() => user)
        );
      }),
      catchError((error) => {
        console.error('Error durant el registre:', error);
        return throwError(
          () => new Error('Fallo en el registre: ' + error.message)
        );
      })
    );
  }

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  sendEmailVerification() {
    const user = this.auth.currentUser;
    if (user) sendEmailVerification(user);
    return user;
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }
}
