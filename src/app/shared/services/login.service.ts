import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserModel } from '../models/users.models';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  auth = inject(AngularFireAuth);

  constructor() {}

  signIn(user: UserModel) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }
}
