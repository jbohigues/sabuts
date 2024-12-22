import { inject, Injectable } from '@angular/core';
import { user } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  updateDoc,
} from '@angular/fire/firestore';
import { PartialUserModel, UserModel } from '@models/users.model';
import { query, setDoc, where } from 'firebase/firestore';

import { Observable, forkJoin, from, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);

  getUsers(): Observable<UserModel[]> {
    const usersRef = collection(this.firestore, 'users');
    return from(getDocs(usersRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserModel))
      )
    );
  }

  getUserById(id: string): Observable<UserModel> {
    const userDoc = doc(this.firestore, `users/${id}`);
    return from(getDoc(userDoc)).pipe(
      map((snapshot) => ({ id: snapshot.id, ...snapshot.data() } as UserModel))
    );
  }

  findUserByEmailOrUserName(
    email: string
  ): Observable<PartialUserModel | null> {
    const usersRef = collection(this.firestore, 'users');
    const emailQuery = query(usersRef, where('email', '==', email));

    return from(getDocs(emailQuery)).pipe(
      map((emailSnapshot) => {
        if (emailSnapshot.empty) return null;

        const userData = emailSnapshot.docs[0].data() as UserModel;

        return {
          id: emailSnapshot.docs[0].id,
          name: userData.name,
          userName: userData.userName,
          backgroundColor: userData.backgroundColor,
          avatarid: userData.avatarid,
          totalPoints: userData.totalPoints,
        };
      })
    );
  }

  createUser(user: UserModel): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${user.id}`);
    // Crear el usuario con campos adicionales para las subcolecciones
    const userData = {
      ...user,
      uid: user.id,
      friends: {}, // Campo vacío para representar la subcolección
      friendRequests: {}, // Campo vacío para representar la subcolección
    };
    return from(setDoc(userDocRef, userData));
  }

  updateUser(id: string, user: Partial<UserModel>): Observable<void> {
    const userDoc = doc(this.firestore, `users/${id}`);
    return from(updateDoc(userDoc, user)).pipe(map(() => void 0));
  }

  deleteUser(id: string): Observable<void> {
    const userDoc = doc(this.firestore, `users/${id}`);
    return from(deleteDoc(userDoc)).pipe(map(() => void 0));
  }

  // New Methods for Answered Questions Management

  addAnsweredQuestion(
    userId: string,
    questionId: string,
    wasCorrect: boolean
  ): Observable<void> {
    const answeredQuestionsRef = collection(
      this.firestore,
      `users/${userId}/answeredQuestions`
    );
    const data = { questionId, answeredAt: new Date(), wasCorrect };
    return from(addDoc(answeredQuestionsRef, data)).pipe(map(() => void 0));
  }

  getAnsweredQuestions(userId: string): Observable<string[]> {
    const answeredQuestionsRef = collection(
      this.firestore,
      `users/${userId}/answeredQuestions`
    );
    return from(getDocs(answeredQuestionsRef)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data()['questionId']))
    );
  }

  resetAnsweredQuestions(userId: string): Observable<void> {
    const answeredQuestionsRef = collection(
      this.firestore,
      `users/${userId}/answeredQuestions`
    );
    return from(getDocs(answeredQuestionsRef)).pipe(
      switchMap((snapshot) => {
        const deleteOps = snapshot.docs.map((doc) => deleteDoc(doc.ref));
        return forkJoin(deleteOps).pipe(map(() => void 0));
      })
    );
  }
}
