import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { QuestionModel } from '@models/question.model';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private firestore = inject(Firestore);

  // async addQuestions() {
  //   const questionsCollection = collection(this.firestore, 'questions');
  //   for (const question of questions) {
  //     try {
  //       // Elimina el id existente para que Firestore genere uno nuevo
  //       const { id, ...questionWithoutId } = question;
  //       // Añade el documento y obtén la referencia
  //       const docRef = await addDoc(questionsCollection, questionWithoutId);
  //       // Actualiza el documento con el nuevo id
  //       await updateDoc(docRef, { id: docRef.id });
  //       console.log('Pregunta añadida con ID: ', docRef.id);
  //     } catch (e) {
  //       console.error('Error al añadir pregunta: ', e);
  //     }
  //   }
  // }

  getQuestions(): Observable<QuestionModel[]> {
    const questionsRef = collection(this.firestore, 'questions');
    return from(getDocs(questionsRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as QuestionModel)
        )
      )
    );
  }

  getQuestionsOfGame(gameId: string): Observable<QuestionModel[]> {
    const questionsRef = collection(
      this.firestore,
      `games/${gameId}/questions`
    );
    return from(getDocs(questionsRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as QuestionModel)
        )
      )
    );
  }
}
