import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonAvatar,
  IonLabel,
  IonText,
  IonButton,
  IonIcon,
  IonProgressBar,
  IonItem,
  IonImg,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { GameService } from '@services/game.service';
import { GameModel, UserOfGameModel } from '@models/games.model';
import { UtilsService } from '@services/utils.service';
import { UserModel } from '@models/users.model';
import { AnswerModel, QuestionModel } from '@models/question.model';
import { AlertController } from '@ionic/angular';
import { Categories } from '@sharedEnums/categories';
import { environment } from 'src/environments/environment.prod';
import confetti from 'canvas-confetti';
import { GameStatusEnum } from '@sharedEnums/states';
import { UserService } from '@services/user.service';
import { forkJoin, tap } from 'rxjs';

interface Category {
  label: string;
  color: string;
}

@Component({
  selector: 'app-playing-game',
  templateUrl: './playing-game.page.html',
  styleUrls: ['./playing-game.page.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonProgressBar,
    IonIcon,
    IonButton,
    IonText,
    IonLabel,
    IonAvatar,
    IonContent,
    IonImg,
    CommonModule,
    FormsModule,
    HeaderComponent,
  ],
})
export class PlayingGamePage {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('_idgame') idgame!: string;

  private gameService = inject(GameService);
  private userService = inject(UserService);
  private utilsService = inject(UtilsService);

  progress: number = 0;
  buffer: number = 0.06;
  timeLeft: number = 20;
  correctAnswers: number = 0;
  loading: boolean = true;
  showQuestion: boolean = false;
  answerSelected: boolean = false;

  timer: any;
  categories = Categories;
  playingGame: GameModel | undefined;
  currentUser: UserModel | undefined;
  currentAnswer: AnswerModel | undefined;
  currentQuestion: QuestionModel | undefined;
  rivalPlayer: UserOfGameModel | undefined;
  currentUserPlayer: UserOfGameModel | undefined;

  categorieMap: Map<string, Category> = new Map();

  constructor(private alertController: AlertController) {
    this.categorieMap.set(Categories.historia_de_valencia, {
      label: 'Història de València',
      color: 'blue',
    });

    this.categorieMap.set(Categories.falles, {
      label: 'Falles',
      color: 'red',
    });

    this.categorieMap.set(Categories.musica, {
      label: 'Música',
      color: 'yellow',
    });

    this.categorieMap.set(Categories.literatura, {
      label: 'Literatura',
      color: 'pink',
    });

    this.categorieMap.set(Categories.poble_de_cullera, {
      label: 'Poble de Cullera',
      color: 'orange',
    });
  }

  async ionViewWillEnter() {
    const loading = await this.utilsService.loading();
    await loading.present();

    this.gameService.getGameById(this.idgame).subscribe({
      next: (res) => {
        if (res) {
          this.playingGame = res;
          this.setCurrentUserInPlayer1(loading);
        }
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  private setCurrentUserInPlayer1(loading?: HTMLIonLoadingElement) {
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

    this.loading = false;
    loading?.dismiss();
  }

  protected makeQuestion() {
    this.answerSelected = false;
    this.gameService.getRandomQuestion().subscribe({
      next: (res) => {
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
      this.showErrorAnswerMessage();
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
    if (this.playingGame && this.currentUserPlayer) {
      this.correctAnswers++;
      this.currentUserPlayer.score = this.currentUserPlayer.score + 1;

      if (this.currentUserPlayer.score == environment.pointsToWinGame) {
        this.fireConfetti();
        this.showWinGameMessage();
      } else if (this.correctAnswers == environment.maxCorrectAnswers)
        this.showMaxCorrectAnswersMessage();
    }
  }

  private updateGameScore(wingame: boolean) {
    if (this.playingGame && this.rivalPlayer && this.currentUserPlayer) {
      const currentUserIsPlayer1 =
        this.playingGame?.player1.userId == this.currentUserPlayer.userId;

      currentUserIsPlayer1
        ? (this.playingGame.player1.score = this.currentUserPlayer.score)
        : (this.playingGame.player2.score = this.currentUserPlayer.score);

      this.playingGame = {
        ...this.playingGame,
        updatedAt: new Date(),
        currentTurn: {
          playerId: this.rivalPlayer.userId,
          roundNumber: this.playingGame.currentTurn.roundNumber + 1,
        },
      };

      if (wingame) {
        this.playingGame.winner = this.currentUserPlayer.userId;
        this.playingGame.endTime = new Date();
        this.playingGame.status = GameStatusEnum.finished;
      }
    }
  }

  private async showMaxCorrectAnswersMessage() {
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
              this.updateGameScore(false);
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

  private async showWinGameMessage() {
    const alert = await this.alertController.create({
      header: 'ENHORABONA!',
      message: `Has aplegat a 15 acerts abans que el rival, així que eres el guanyador de la partida!`,
      keyboardClose: false,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Acceptar',
          handler: () => {
            if (this.playingGame && this.currentUser) {
              this.updateGameScore(true);

              this.currentUser.totalPoints += 5;

              forkJoin([
                this.gameService.updateGame(
                  this.playingGame.id,
                  this.playingGame
                ),
                this.userService.updateUser(this.currentUser.id, {
                  totalPoints: this.currentUser.totalPoints,
                }),
              ]).subscribe({
                error: (e) => console.error(e),
                complete: () => {
                  this.utilsService.saveInLocalStorage(
                    'user',
                    this.currentUser
                  );
                  this.utilsService.routerLink('games');
                },
              });
            }
          },
        },
      ],
    });
    await alert.present();
  }

  private async showErrorAnswerMessage() {
    const alert = await this.alertController.create({
      header: 'INCORRECTE...',
      message: `Has fallat la resposta aixi que el torn acaba ací, hauràs d'esperar fins que el rival responga.`,
      keyboardClose: false,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Acceptar',
          handler: () => {
            if (this.playingGame) {
              this.updateGameScore(false);
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

  private fireConfetti() {
    const defaults = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
    };

    confetti(Object.assign({}, defaults));
  }
}
