import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  runTransaction,
  collection,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '@models/users.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);

  // constructor(private firestore: Firestore, private authService: AuthService) {}

  updateProfile(userId: string, data: any) {
    const userRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userRef, data);
  }

  sendFriendRequest(fromUserId: string, toUserId: string) {
    const userRef = doc(this.firestore, `users/${toUserId}`);
    return updateDoc(userRef, {
      pendingFriendRequests: arrayUnion(fromUserId),
    });
  }

  async acceptFriendRequest(userId: string, friendId: string) {
    const userRef = doc(this.firestore, `users/${userId}`);
    const friendRef = doc(this.firestore, `users/${friendId}`);

    try {
      await runTransaction(this.firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const friendDoc = await transaction.get(friendRef);

        if (!userDoc.exists() || !friendDoc.exists()) {
          throw 'Document does not exist!';
        }

        transaction.update(userRef, {
          friends: arrayUnion(friendId),
          pendingFriendRequests: arrayRemove(friendId),
        });
        transaction.update(friendRef, {
          friends: arrayUnion(userId),
        });
      });
      console.log('Transaction successfully committed!');
    } catch (e) {
      console.log('Transaction failed: ', e);
    }
  }

  getFriends(userId: string): Observable<any[]> {
    const userRef = doc(this.firestore, `users/${userId}`);
    return from(getDoc(userRef)).pipe(
      switchMap((userDoc) => {
        console.log(userDoc.data());

        const friendIds = userDoc.data()?.['friendsList'] || [];
        console.log(friendIds);

        if (friendIds.length === 0) {
          return [];
        }
        return from(
          Promise.all(
            friendIds.map((friendId: string) =>
              getDoc(doc(this.firestore, `users/${friendId}`))
            )
          )
        ).pipe(
          map((friendDocs) =>
            friendDocs.map((doc) => ({ id: doc.id, ...doc.data() }))
          )
        );
      })
    );
  }

  getPendingFriendRequests(userId: string): Observable<any[]> {
    const userRef = doc(this.firestore, `users/${userId}`);
    return from(getDoc(userRef)).pipe(
      switchMap((userDoc) => {
        const pendingIds = userDoc.data()?.['pendingFriendRequests'] || [];
        if (pendingIds.length === 0) {
          return [];
        }
        return from(
          Promise.all(
            pendingIds.map((pendingId: string) =>
              getDoc(doc(this.firestore, `users/${pendingId}`))
            )
          )
        ).pipe(
          map((pendingDocs) =>
            pendingDocs.map((doc) => ({ id: doc.id, ...doc.data() }))
          )
        );
      })
    );
  }

  searchUsers(searchTerm: string): Observable<any[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return from([]);
    const usersRef = collection(this.firestore, 'users');
    const q = query(
      usersRef,
      where('userName', '>=', searchTerm),
      where('userName', '<=', searchTerm + '\uf8ff')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
  }

  rejectFriendRequest(userId: string, friendId: string) {
    const userRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userRef, {
      pendingFriendRequests: arrayRemove(friendId),
    });
  }

  removeFriend(userId: string, friendId: string) {
    const userRef = doc(this.firestore, `users/${userId}`);
    const friendRef = doc(this.firestore, `users/${friendId}`);

    return runTransaction(this.firestore, async (transaction) => {
      transaction.update(userRef, {
        friends: arrayRemove(friendId),
      });
      transaction.update(friendRef, {
        friends: arrayRemove(userId),
      });
    });
  }
}
