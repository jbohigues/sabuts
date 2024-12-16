// import { inject, Injectable } from '@angular/core';
// import { GameModel } from '@models/games.model';
// import {
//   collection,
//   getDocs,
//   addDoc,
//   updateDoc,
//   onSnapshot,
//   deleteDoc,
// } from 'firebase/firestore';
// import { Observable, from, map, switchMap } from 'rxjs';
// import { LoginService } from './login.service';
// import { FirestoreService } from './firestore.service';
// import { TypeGame } from '@sharedEnums/games';
// import { Categories } from '@sharedEnums/categories';
// import { User } from 'firebase/auth';
// import { UtilsService } from './utils.service';
// import { Colors } from '@sharedEnums/colors';
// import { IconsToast } from '@sharedEnums/iconsToast';
// import { doc } from '@angular/fire/firestore';
// import { StateGame } from '@sharedEnums/states';

// @Injectable({
//   providedIn: 'root',
// })
// export class GameService {
//   private loginService = inject(LoginService);
//   private utilsService = inject(UtilsService);
//   private firestoreService = inject(FirestoreService);

//   // 1. Get partidas de un jugador
//   getPlayerGames(): Observable<GameModel[]> {
//     const user = this.loginService.getCurrentUser();
//     if (!user) return from([]);

//     const q = this.firestoreService.createQuery('games', [
//       'player1.id',
//       '==',
//       user.uid,
//     ]);

//     return from(getDocs(q)).pipe(
//       map((querySnapshot) => {
//         return querySnapshot.docs.map((doc) => {
//           const data = doc.data();
//           return {
//             id: doc.id,
//             currentPlayerId: data['currentPlayerId'],
//             player1: data['player1'],
//             player2: data['player2'],
//             startTime: data['startTime'].toDate(),
//             endTime: data['endTime']?.toDate(),
//             status: data['status'],
//           } as GameModel;
//         });
//       })
//     );
//   }

//   // // 2. Get Game por id
//   // getGamePorId(GameId: string): Observable<Game | null> {
//   //   const GameRef = doc(this.firestore, `Games/${GameId}`);
//   //   return from(getDoc(GameRef)).pipe(
//   //     map((docSnap) =>
//   //       docSnap.exists()
//   //         ? ({ id: docSnap.id, ...docSnap.data() } as Game)
//   //         : null
//   //     )
//   //   );
//   // }

//   // 3. Crear Game
//   async createGame(opponentType: TypeGame) {
//     const loading = await this.utilsService.loading();
//     await loading.present();
//     const user = this.loginService.getCurrentUser();
//     if (!user) {
//       loading.dismiss();
//       throw new Error('Usuario no logueat');
//     }

//     console.log({ opponentType });

//     if (opponentType === TypeGame.aleatoria) {
//       this.joinRandomQueue(loading).subscribe({
//         next: (res) => {
//           console.log(res);
//         },
//         error: (e) => {
//           console.error(e);
//         },
//         complete: () => {
//           console.log('dismiss');
//           loading.dismiss();
//         },
//       });
//     } else {
//       // Para jugar con un amigo, simplemente creamos la partida en espera
//       console.log('createGameWithRandomOpponent');
//       this.createGameWithRandomOpponent(user, loading);
//       console.log('despues createGameWithRandomOpponent');
//     }
//   }

//   // Entrar en una partida random
//   private joinRandomQueue(loading: HTMLIonLoadingElement): Observable<string> {
//     const user = this.loginService.getCurrentUser();
//     if (!user) throw new Error('No user logged in');

//     const queueRef = collection(
//       this.firestoreService.getFirestore(),
//       'random_queue'
//     );
//     const playerEntry = {
//       userId: user.uid,
//       name: user.displayName || 'Jugador 1',
//       timestamp: new Date(),
//     };

//     return from(addDoc(queueRef, playerEntry)).pipe(
//       switchMap((docRef) => {
//         return new Observable<string>((observer) => {
//           const unsubscribe = onSnapshot(docRef, (doc) => {
//             if (doc.exists() && doc.data()['matchedGameId']) {
//               observer.next(doc.data()['matchedGameId']);
//               observer.complete();
//               deleteDoc(docRef); // Remove from queue after match
//             }
//           });

//           // Check for existing match immediately
//           this.checkForExistingMatch(user.uid).subscribe((matchedGameId) => {
//             if (matchedGameId) {
//               observer.next(matchedGameId);
//               observer.complete();
//               deleteDoc(docRef); // Remove from queue if matched
//             } else {
//               this.createGameWithRandomOpponent(user, loading);
//             }
//           });

//           return () => unsubscribe();
//         });
//       })
//     );
//   }

//   // Buscar partidas random donde entrar
//   private checkForExistingMatch(userId: string): Observable<string | null> {
//     const q = this.firestoreService.createQuery(
//       'games',
//       ['status', '==', StateGame.pendiente],
//       // ['player1.id', '!=', userId],
//       ['player2', '==', '']
//     );

//     return from(getDocs(q)).pipe(
//       map((querySnapshot) => {
//         for (const doc of querySnapshot.docs) {
//           const game = doc.data() as GameModel;
//           if (game.player1.id !== userId) {
//             // Match found, update the game
//             updateDoc(doc.ref, {
//               'player2.id': userId,
//               'player2.name':
//                 this.loginService.getCurrentUser()?.displayName || 'Jugador 2',
//               status: StateGame.en_curso,
//             });
//             return doc.id;
//           }
//         }
//         return null;
//       })
//     );
//   }

//   // Crear partida para que alguien pueda entrar
//   private async createGameWithRandomOpponent(
//     user: User,
//     loading: HTMLIonLoadingElement
//   ) {
//     // const loading = await this.utilsService.loading();
//     // await loading.present();
//     const newGame: Omit<GameModel, 'id'> = {
//       player1: {
//         id: user.uid,
//         name: user.displayName || 'Jugador 1',
//         score: 0,
//       },
//       player2: {
//         id: '',
//         name: '',
//         score: 0,
//       },
//       currentPlayerId: user.uid,
//       startTime: new Date(),
//       status: StateGame.pendiente,
//       rounds: [],
//       categories: [Categories.historia, Categories.indumentaria],
//     };

//     addDoc(collection(this.firestoreService.getFirestore(), 'games'), newGame)
//       .then((res) => {
//         console.log(res);
//         this.utilsService.presentToast(
//           'Partida creada amb èxit',
//           Colors.success,
//           IconsToast.success_checkmark_circle
//         );
//       })
//       .catch((e) => {
//         console.error(e);

//         this.utilsService.presentToast(
//           'Error al crear la partida',
//           Colors.danger,
//           IconsToast.danger_close_circle
//         );
//       })
//       .finally(() => {
//         console.log('finally');
//         loading.dismiss();
//       });
//   }

//   // // 4. Actualizar Game
//   // actualizarGame(GameId: string, cambios: Partial<Game>): Observable<void> {
//   //   const GameRef = doc(
//   //     this.firestore,
//   //     `Games/${GameId}`
//   //   ) as DocumentReference<Game>;
//   //   return from(updateDoc(GameRef, cambios));
//   // }

//   // // 5. Aceptar Game
//   // aceptarGame(GameId: string, player2Id: string): Observable<void> {
//   //   return this.actualizarGame(GameId, {
//   //     player2: player2Id,
//   //     estado: 'aceptada',
//   //   });
//   // }

//   // 6. Delete Game
//   deleteGame(gameId: string): Observable<void> {
//     const gameRef = doc(this.firestoreService.getFirestore(), 'games', gameId);
//     return from(deleteDoc(gameRef));
//   }
// }
