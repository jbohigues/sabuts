import { inject, Injectable } from '@angular/core';
import { FriendModel } from '@models/friends.model';
import {
  Firestore,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  private firestore = inject(Firestore);

  getFriends(userId: string): Observable<FriendModel[]> {
    const friendsRef = collection(this.firestore, `users/${userId}/friends`);
    return from(getDocs(friendsRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as FriendModel)
        )
      )
    );
  }

  createFriend(userId: string, friend: Partial<FriendModel>): Observable<void> {
    const friendsRef = collection(this.firestore, `users/${userId}/friends`);
    return from(addDoc(friendsRef, friend)).pipe(map(() => void 0));
  }

  deleteFriend(userId: string, friendId: string): Observable<void> {
    const friendDoc = doc(
      this.firestore,
      `users/${userId}/friends/${friendId}`
    );
    return from(deleteDoc(friendDoc)).pipe(map(() => void 0));
  }
}
