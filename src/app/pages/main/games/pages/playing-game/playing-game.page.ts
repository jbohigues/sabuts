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
import { AnswerModel, QuestionModel } from '@models/question.model';
import { AlertController } from '@ionic/angular';

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

  progress: number = 0;
  buffer: number = 0.06;
  timeLeft: number = 20;
  correctAnswers: number = 0;
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

  constructor(private alertController: AlertController) {}

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
    this.answerSelected = false;
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
    console.log('this.startTimer');
    this.progress = 0;
    this.buffer = 0.06;
    this.timeLeft = 20;

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

  private playCorrectSound() {
    const audio = new Audio('assets/sounds/correct_answer.mp3');
    audio.play();
  }

  private playIncorrectSound() {
    const audio = new Audio('assets/sounds/incorrect_answer.mp3');
    audio.play();
  }

  private incrementScore() {
    if (this.playingGame) {
      this.correctAnswers++;
      this.playingGame.player1.score = this.correctAnswers;
      this.setCurrentUserInPlayer1();

      if (this.correctAnswers == 3) {
        this.showMaxCorrectAnswersMessage();
      }
    }
  }

  private async showMaxCorrectAnswersMessage() {
    console.log(this.playingGame);
    const alert = await this.alertController.create({
      header: 'Màxim de respostes correctes',
      message: `Has aplegat al màxim de respostes correctes, has d'esperar fins que responga el teu contrincant`,
      keyboardClose: false,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Acceptar',
          handler: () => {
            if (this.playingGame) {
              this.playingGame = {
                ...this.playingGame,
                updatedAt: new Date(),
                currentTurn: {
                  playerId: this.playingGame.player2.userId,
                  roundNumber: this.playingGame.currentTurn.roundNumber + 1,
                },
              };
              console.log(this.playingGame);
              this.gameService
                .updateGame(this.playingGame.id, this.playingGame)
                .subscribe({
                  next: () => {
                    this.utilsService.routerLink('games');
                  },
                  error: (e) => console.error(e),
                });
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
