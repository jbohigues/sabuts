import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  setDoc,
  writeBatch,
  getCountFromServer,
} from '@angular/fire/firestore';
import { GameModel, RoundModel, UserOfGameModel } from '@models/games.model';
import { QuestionModel } from '@models/question.model';
import { ErrorsEnum } from '@sharedEnums/errors';
import { GameStatusEnum, RoundStatusEnum } from '@sharedEnums/states';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GameService {
  private firestore = inject(Firestore);

  // Obtener todas las partidas
  getGames(): Observable<GameModel[]> {
    const gamesRef = collection(this.firestore, 'games');
    return from(getDocs(gamesRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as GameModel))
      )
    );
  }

  // Obtener partida por ID
  getGameById(gameId: string): Observable<GameModel> {
    const gameDoc = doc(this.firestore, `games/${gameId}`);
    return from(getDoc(gameDoc)).pipe(
      map((snapshot) => {
        const game = snapshot.data() as GameModel;
        if (!game) throw new Error('Game not found');

        return {
          ...game,
          id: snapshot.id,
          player1: this.populateUser(game.player1),
          player2: this.populateUser(game.player2),
        };
      })
    );
  }

  // Crear una nueva partida
  createGame(game: Partial<GameModel>): Observable<string> {
    const gamesRef = collection(this.firestore, 'games');
    if (!game.player1 || !game.player2)
      return throwError(() => new Error(ErrorsEnum.not_players_in_game));

    // Primero, verificamos el número de partidas activas para ambos jugadores
    return this.checkActiveGames(game.player1.userId, game.player2.userId).pipe(
      switchMap((canCreate) => {
        if (!canCreate)
          return throwError(() => new Error(ErrorsEnum.max_games_in_play));

        return from(addDoc(gamesRef, game)).pipe(
          switchMap((docRef) => {
            const gameWithId = { ...game, id: docRef.id };
            return from(setDoc(docRef, gameWithId)).pipe(map(() => docRef.id));
          })
        );
      })
    );
  }

  // Actualizar una partida existente
  updateGame(gameId: string, changes: Partial<GameModel>): Observable<void> {
    const gameDoc = doc(this.firestore, `games/${gameId}`);
    return from(updateDoc(gameDoc, changes)).pipe(map(() => void 0));
  }

  // Eliminar una partida
  deleteGame(gameId: string): Observable<void> {
    if (!gameId) return throwError(() => new Error('Game ID is required'));
    const gameDoc = doc(this.firestore, `games/${gameId}`);

    return from(deleteDoc(gameDoc)).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error('Error deleting game:', error);
        return throwError(() => new Error('Failed to delete game'));
      })
    );
  }

  deleteUserGames(userId: string): Observable<void> {
    const gamesRef = collection(this.firestore, 'games');
    const player1Query = query(gamesRef, where('player1.userId', '==', userId));
    const player2Query = query(gamesRef, where('player2.userId', '==', userId));

    return from(
      Promise.all([getDocs(player1Query), getDocs(player2Query)])
    ).pipe(
      switchMap(([player1Snapshot, player2Snapshot]) => {
        const batch = writeBatch(this.firestore);

        player1Snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        player2Snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        return from(batch.commit());
      })
    );
  }

  // Cambiar el turno actual
  // setCurrentTurn(
  //   gameId: string,
  //   playerId: string,
  //   roundNumber: number
  // ): Observable<void> {
  //   const gameDoc = doc(this.firestore, `games/${gameId}`);
  //   return from(
  //     updateDoc(gameDoc, {
  //       currentPlayerId: playerId,
  //       currentRound: roundNumber,
  //     })
  //   ).pipe(map(() => void 0));
  // }

  // Registrar respuesta de un jugador
  // submitAnswer(
  //   gameId: string,
  //   roundId: string,
  //   playerId: string,
  //   answer: string
  // ): Observable<void> {
  //   const roundDoc = doc(this.firestore, `games/${gameId}/rounds/${roundId}`);
  //   const field = playerId === 'player1' ? 'player1Answer' : 'player2Answer';
  //   return from(updateDoc(roundDoc, { [field]: answer })).pipe(
  //     map(() => void 0)
  //   );
  // }

  // Finalizar una ronda
  // endRound(gameId: string, roundId: string): Observable<void> {
  //   const roundDoc = doc(this.firestore, `games/${gameId}/rounds/${roundId}`);
  //   return from(
  //     updateDoc(roundDoc, { status: RoundStatusEnum.completed })
  //   ).pipe(map(() => void 0));
  // }

  // Finalizar el juego
  endGame(gameId: string, winnerId: string): Observable<void> {
    const gameDoc = doc(this.firestore, `games/${gameId}`);
    return from(
      updateDoc(gameDoc, {
        status: RoundStatusEnum.completed,
        winner: winnerId,
        endTime: new Date(),
      })
    ).pipe(map(() => void 0));
  }

  // Obtener partidas activas de un usuario
  getActiveGamesByUser(userId: string): Observable<GameModel[]> {
    const gamesRef = collection(this.firestore, 'games');

    // Crea una consulta genérica con un array de condiciones
    const createQuery = (field: string) =>
      query(
        gamesRef,
        where('status', '==', GameStatusEnum.in_progress),
        where(field, '==', userId),
        orderBy('updatedAt', 'desc')
      );

    // Ejecuta ambas consultas en paralelo
    return from(
      Promise.all([
        getDocs(createQuery('player1.userId')),
        getDocs(createQuery('player2.userId')),
      ])
    ).pipe(
      map((snapshots) => {
        // Combina y procesa los resultados de ambas consultas
        const games = snapshots.flatMap((snapshot) =>
          snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as GameModel)
          )
        );

        // Elimina duplicados basados en el ID
        return Array.from(
          new Map(games.map((game) => [game.id, game])).values()
        );
      })
    );
  }

  // Agregar una ronda a una partida
  addRound(gameId: string, round: Partial<RoundModel>): Observable<void> {
    const roundsRef = collection(this.firestore, `games/${gameId}/rounds`);
    return from(addDoc(roundsRef, round)).pipe(map(() => void 0));
  }

  // Obtener rondas de una partida
  getRounds(gameId: string): Observable<RoundModel[]> {
    const roundsRef = collection(this.firestore, `games/${gameId}/rounds`);
    return from(getDocs(roundsRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as RoundModel)
        )
      )
    );
  }

  // Obtener una pregunta por ID
  getQuestionById(questionId: string): Observable<QuestionModel> {
    const questionDoc = doc(this.firestore, `questions/${questionId}`);
    return from(getDoc(questionDoc)).pipe(
      map(
        (snapshot) => ({ id: snapshot.id, ...snapshot.data() } as QuestionModel)
      )
    );
  }

  // Obtener preguntas por categoría
  getQuestionsByCategory(categoryId: string): Observable<QuestionModel[]> {
    const questionsRef = collection(this.firestore, 'questions');
    const q = query(questionsRef, where('categoryId', '==', categoryId));
    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as QuestionModel)
        )
      )
    );
  }

  // Obtener pregunta aleatoria (de todas o por categoría)
  getRandomQuestion(categoryId?: string): Observable<QuestionModel> {
    const questionsRef = collection(this.firestore, 'questions');
    const q = categoryId
      ? query(questionsRef, where('categoryId', '==', categoryId))
      : questionsRef;
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        const docs = snapshot.docs;
        const randomIndex = Math.floor(Math.random() * docs.length);
        return {
          id: docs[randomIndex].id,
          ...docs[randomIndex].data(),
        } as QuestionModel;
      })
    );
  }

  // Método para popular usuarios (simulación de población limitada)
  private populateUser(user: UserOfGameModel): UserOfGameModel {
    // Aquí puedes limitar los datos que se incluyen del usuario
    return {
      userId: user.userId,
      userName: user.userName,
      backgroundColor: user.backgroundColor,
      score: user.score,
    };
  }

  // Método para ver la cantidad de partidas activas entre 2amigos
  private checkActiveGames(
    player1Id: string,
    player2Id: string
  ): Observable<boolean> {
    const gamesRef = collection(this.firestore, 'games');
    const activeGamesQuery = query(
      gamesRef,
      where('status', '==', GameStatusEnum.in_progress),
      where('player1.userId', 'in', [player1Id, player2Id]),
      where('player2.userId', 'in', [player1Id, player2Id])
    );

    return from(getCountFromServer(activeGamesQuery)).pipe(
      map((snapshot) => {
        const count = snapshot.data().count;
        return count < 5;
      })
    );
  }
}
