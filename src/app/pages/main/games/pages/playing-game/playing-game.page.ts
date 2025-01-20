import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonAvatar,
  IonSpinner,
  IonLabel,
  IonText,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonProgressBar,
  IonGrid,
  IonCol,
  IonRow,
  IonItem,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { GameService } from '@services/game.service';
import { GameModel, UserOfGameModel } from '@models/games.model';
import { UtilsService } from '@services/utils.service';
import { UserModel } from '@models/users.model';
import { QuestionService } from '@services/question.service';
import { AnswerModel, QuestionModel } from '@models/question.model';

@Component({
  selector: 'app-playing-game',
  templateUrl: './playing-game.page.html',
  styleUrls: ['./playing-game.page.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonRow,
    IonCol,
    IonGrid,
    IonProgressBar,
    IonCardContent,
    IonCard,
    IonIcon,
    IonButton,
    IonText,
    IonLabel,
    IonAvatar,
    IonSpinner,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
  ],
})
export class PlayingGamePage implements OnInit {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('_idgame') idgame!: string;

  private gameService = inject(GameService);
  private utilsService = inject(UtilsService);
  // private questionService = inject(QuestionService);

  public buffer = 0.06;
  public progress = 0;

  timeLeft: number = 20;
  loading: boolean = true;
  showQuestion: boolean = false;
  answerSelected: boolean = false;

  timer: any;
  playingGame: GameModel | undefined;
  currentUser: UserModel | undefined;
  currentAnswer: AnswerModel | undefined;
  currentQuestion: QuestionModel | undefined;
  rivalPlayer: UserOfGameModel | undefined;
  currentUserPlayer: UserOfGameModel | undefined;

  async ngOnInit() {
    const loading = await this.utilsService.loading();
    await loading.present();

    this.gameService.getGameById(this.idgame).subscribe({
      next: (res) => {
        if (res) {
          this.playingGame = res;
          this.setCurrentUserInPlayer1();
        }
      },
      error: (e) => {
        console.error(e);
      },
      complete: () => {
        this.loading = false;
        loading.dismiss();
      },
    });
  }

  private setCurrentUserInPlayer1() {
    this.currentUser = this.utilsService.getFromLocalStorage('user');
    if (this.currentUser) {
      const currentUserIsPlayer1 =
        this.playingGame?.player1.userId == this.currentUser.id;

      if (currentUserIsPlayer1) {
        this.currentUserPlayer = this.playingGame!.player1;
        this.rivalPlayer = this.playingGame!.player2;
      } else {
        this.currentUserPlayer = this.playingGame!.player2;
        this.rivalPlayer = this.playingGame!.player1;
      }
    }
  }

  protected makeQuestion() {
    this.gameService.getRandomQuestion().subscribe({
      next: (res) => {
        console.log(res);
        if (res) {
          this.currentQuestion = res;
          this.showQuestion = true;
          this.startTimer();
        }
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  private startTimer() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.buffer = (20 - this.timeLeft) / 17;
        this.progress = (20 - this.timeLeft) / 20;
      } else {
        clearInterval(this.timer);
        this.timeExpired();
      }
    }, 1000);
  }

  private stopTimer() {
    this.buffer = 1;
    this.progress = 1;
    this.timeLeft = 0;
    clearInterval(this.timer);
  }

  private timeExpired() {
    // Lógica cuando se acaba el tiempo
    console.log('¡Tiempo agotado!');
  }

  protected answerQuestion(answer: AnswerModel) {
    this.stopTimer();

    this.answerSelected = true;
    this.currentAnswer = answer;

    if (answer.isCorrect) {
      this.playCorrectSound();
      this.incrementScore();
    } else {
      this.playIncorrectSound();
    }
  }

  getAnswerColor(answer: any): string {
    // Si aún no se ha seleccionado respuesta, color por defecto
    if (!this.answerSelected) return '';

    // Si ya se seleccionó, mostrar color según si es correcta
    return answer.isCorrect ? 'success' : 'danger';
  }

  playCorrectSound() {
    // Reproducir sonido de respuesta correcta
    const audio = new Audio('assets/sounds/correct.mp3');
    audio.play();
  }

  playIncorrectSound() {
    // Reproducir sonido de respuesta incorrecta
    const audio = new Audio('assets/sounds/incorrect.mp3');
    audio.play();
  }

  incrementScore() {
    // Incrementar puntuación del jugador
  }
}
