import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  collectionData,
  doc,
  updateDoc,
  docData,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);

  createGame(players: string[]) {
    const gamesCollection = collection(this.firestore, 'games');
    return addDoc(gamesCollection, {
      players,
      currentTurn: players[0],
      status: 'active',
      createdAt: new Date(),
      scores: players.reduce((acc, player) => ({ ...acc, [player]: 0 }), {}),
    });
  }

  getActiveGames(userId: string): Observable<any[]> {
    const gamesCollection = collection(this.firestore, 'games');
    const activeGamesQuery = query(
      gamesCollection,
      where('players', 'array-contains', userId),
      where('status', '==', 'active')
    );
    return collectionData(activeGamesQuery, { idField: 'id' });
  }

  getGame(gameId: string): Observable<any> {
    const gameDocRef = doc(this.firestore, `games/${gameId}`);
    return docData(gameDocRef, { idField: 'id' });
  }

  updateGame(gameId: string, data: any) {
    const gameDoc = doc(this.firestore, `games/${gameId}`);
    return updateDoc(gameDoc, data);
  }
}
