import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { CreateUserModelDto, UserModel } from '../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private auth: Auth = inject(Auth);

  signIn(user: UserModel) {
    return signInWithEmailAndPassword(this.auth, user.email, user.password);
  }

  signUp(user: CreateUserModelDto) {
    return createUserWithEmailAndPassword(this.auth, user.email, user.password);
  }

  // Esto solo actualiza nombre y foto
  updateProfileOfUser(displayName: string) {
    const user = this.auth.currentUser;
    if (user) return updateProfile(user, { displayName });
    return null;
  }
}
