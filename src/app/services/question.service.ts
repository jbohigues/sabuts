import { inject, Injectable } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { QuestionModel } from '@models/question.model';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private firestore = inject(Firestore);

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
