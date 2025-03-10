import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  // writeBatch,
} from '@angular/fire/firestore';
import { QuestionModel } from '@models/question.model';
import { Observable, from, map } from 'rxjs';
// import questions from '@assets/data/questions.json';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private firestore = inject(Firestore);

  // async addQuestions() {
  //   const batch = writeBatch(this.firestore);
  //   questions.forEach((question) => {
  //     const idString = question.id.toString();
  //     const docRef = doc(collection(this.firestore, 'questions'), idString);
  //     const { id, ...questionData } = question;
  //     batch.set(docRef, {
  //       ...questionData,
  //     });
  //   });

  //   await batch.commit();
  // }

  // Obtener pregunta aleatoria (de todas o por categoría)
  // getRandomQuestion(categoryId?: string): Observable<QuestionModel> {
  //   const questionsRef = collection(this.firestore, 'questions');
  //   const q = categoryId
  //     ? query(questionsRef, where('categoryId', '==', categoryId))
  //     : questionsRef;
  //   return from(getDocs(q)).pipe(
  //     map((snapshot) => {
  //       const docs = snapshot.docs;
  //       const randomIndex = Math.floor(Math.random() * docs.length);
  //       return {
  //         id: docs[randomIndex].id,
  //         ...docs[randomIndex].data(),
  //       } as QuestionModel;
  //     })
  //   );
  // }

  // Obtener x preguntas aleatorias para cierto usuario
  async getRandomQuestions(userid: string, count: number = 3) {
    const [answeredQuestionsOfUser, totalQuestions] = await Promise.all([
      this.getUserAnsweredQuestions(userid),
      this.getTotalCountOfQuestions(),
    ]);

    const answeredSet = new Set(answeredQuestionsOfUser);

    let availableIds = Array.from({ length: totalQuestions }, (_, i) =>
      (i + 1).toString()
    ).filter((id) => !answeredSet.has(id));

    if (availableIds.length === 0 || availableIds.length < count) {
      await this.resetUserAnsweredQuestions(userid);
      availableIds = Array.from({ length: totalQuestions }, (_, i) =>
        (i + 1).toString()
      );
    }

    const selectedIds = [];
    for (let i = 0; i < count; i++) {
      if (availableIds.length === 0) break;
      const randomIndex = Math.floor(Math.random() * availableIds.length);
      selectedIds.push(availableIds[randomIndex]);
      availableIds.splice(randomIndex, 1);
    }

    const questionsRef = collection(this.firestore, 'questions');
    const q = query(questionsRef, where('__name__', 'in', selectedIds));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as QuestionModel)
    );
  }

  // Método para resetear las preguntas respondidas del usuario
  private async resetUserAnsweredQuestions(userid: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${userid}`);
    await updateDoc(userRef, {
      answeredQuestions: [],
    });
  }

  private async getTotalCountOfQuestions() {
    const questionsRef = collection(this.firestore, 'questions');
    const countSnapshot = await getCountFromServer(questionsRef);
    return countSnapshot.data().count;
  }

  private async getUserAnsweredQuestions(userid: string): Promise<string[]> {
    const userRef = doc(this.firestore, `users/${userid}`);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data()['answeredQuestions'] || [] : [];
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

  // getQuestions(): Observable<QuestionModel[]> {
  //   const questionsRef = collection(this.firestore, 'questions');
  //   return from(getDocs(questionsRef)).pipe(
  //     map((snapshot) =>
  //       snapshot.docs.map(
  //         (doc) => ({ id: doc.id, ...doc.data() } as QuestionModel)
  //       )
  //     )
  //   );
  // }

  // getQuestionsOfGame(gameId: string): Observable<QuestionModel[]> {
  //   const questionsRef = collection(
  //     this.firestore,
  //     `games/${gameId}/questions`
  //   );
  //   return from(getDocs(questionsRef)).pipe(
  //     map((snapshot) =>
  //       snapshot.docs.map(
  //         (doc) => ({ id: doc.id, ...doc.data() } as QuestionModel)
  //       )
  //     )
  //   );
  // }
}
