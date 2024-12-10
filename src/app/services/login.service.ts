import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { UserModelWithPassword } from '@models/users.model';
import { UtilsService } from '@services/utils.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly auth: Auth = inject(Auth);
  private utilservice = inject(UtilsService);

  getAuth() {
    return this.auth;
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  signIn(user: UserModelWithPassword) {
    return signInWithEmailAndPassword(this.auth, user.email, user.password);
  }

  signUp(user: UserModelWithPassword) {
    return createUserWithEmailAndPassword(this.auth, user.email, user.password);
  }

  signOut() {
    this.auth.signOut();
    localStorage.removeItem('user');
    this.utilservice.routerLink('/login');
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
