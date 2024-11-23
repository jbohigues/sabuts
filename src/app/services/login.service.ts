import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { UserModelWithPassword } from '../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private auth: Auth = inject(Auth);

  signIn(user: UserModelWithPassword) {
    return signInWithEmailAndPassword(this.auth, user.email, user.password);
  }

  signUp(user: UserModelWithPassword) {
    return createUserWithEmailAndPassword(this.auth, user.email, user.password);
  }

  // Esto solo actualiza nombre y foto
  updateProfileOfUser(displayName: string) {
    const user = this.auth.currentUser;
    if (user) return updateProfile(user, { displayName });
    return null;
  }

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }
}
