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
  IonLoading,
  IonAlert,
  AlertButton,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { GameService } from '@services/game.service';
import { GameModel, UserOfGameModel } from '@models/games.model';
import { UtilsService } from '@services/utils.service';
import { UserModel } from '@models/users.model';
import { AnswerModel, QuestionModel } from '@models/question.model';
import { Categories } from '@sharedEnums/categories';
import { environment } from 'src/environments/environment';
import confetti from 'canvas-confetti';
import { GameStatusEnum } from '@sharedEnums/states';
import { UserService } from '@services/user.service';
import { forkJoin } from 'rxjs';

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
    IonLoading,
    IonItem,
    IonProgressBar,
    IonIcon,
    IonButton,
    IonText,
    IonLabel,
    IonAvatar,
    IonContent,
    IonImg,
    IonAlert,
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

  // Variables
  progress: number = 0;
  buffer: number = 0.06;
  timeLeft: number = 20;
  correctAnswers: number = 0;

  alertHeader: string = '';
  alertMessage: string = '';
  alertButtons: AlertButton[] = [];

  loading: boolean = true;
  isAlertOpen: boolean = false;
  openLoading: boolean = false;
  showQuestion: boolean = false;
  answerSelected: boolean = false;

  // Objects
  timer: any;
  categories = Categories;
  playingGame: GameModel | undefined;
  currentUser: UserModel | undefined;
  currentAnswer: AnswerModel | undefined;
  currentQuestion: QuestionModel | undefined;
  rivalPlayer: UserOfGameModel | undefined;
  currentUserPlayer: UserOfGameModel | undefined;

  categorieMap: Map<string, Category> = new Map();

  constructor() {
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
    this.openLoading = true;
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
    });
    // this.loadGameOfLocalStorage();

    // if (this.playingGame) {
    //   this.setCurrentUserInPlayer1();
    // } else {
    //   this.gameService.getGameById(this.idgame).subscribe({
    //     next: (res) => {
    //       if (res) {
    //         this.playingGame = res;
    //         this.setCurrentUserInPlayer1();
    //       }
    //     },
    //     error: (e) => {
    //       console.error(e);
    //     },
    //   });
    // }
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

    this.loading = false;
    this.openLoading = false;
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
    this.playIncorrectSound();
    this.showErrorAnswerMessage(true);
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
      this.showErrorAnswerMessage(false);
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

      // this.saveGameInLocalStorage();

      if (this.currentUserPlayer.score == environment.pointsToWinGame) {
        this.fireConfetti();
        this.showWinGameMessage();
      } else if (this.correctAnswers == environment.maxCorrectAnswers)
        this.showMaxCorrectAnswersMessage();
    }
  }

  // private saveGameInLocalStorage() {
  //   if (this.playingGame) {
  //     this.utilsService.saveInLocalStorage(
  //       `play_${this.playingGame.id}`,
  //       this.playingGame
  //     );

  //     this.utilsService.saveInLocalStorage(
  //       `correctanswers_play_${this.playingGame.id}`,
  //       this.correctAnswers
  //     );
  //   }
  // }

  // private loadGameOfLocalStorage() {
  //   this.playingGame = this.utilsService.getFromLocalStorage(
  //     `play_${this.idgame}`
  //   );
  //   this.correctAnswers = this.utilsService.getFromLocalStorage(
  //     `correctanswers_play_${this.idgame}`
  //   );
  // }

  // private clearGameOfLocalStorage() {
  //   this.utilsService.removeItemOfLocalStorage(`play_${this.idgame}`);
  //   this.utilsService.removeItemOfLocalStorage(
  //     `correctanswers_play_${this.idgame}`
  //   );
  // }

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
    this.alertHeader = 'Màxim de respostes correctes';
    this.alertMessage = `Has aplegat al màxim de respostes correctes, has d'esperar fins que responga el teu contrincant`;

    this.alertButtons = [
      {
        text: 'Acceptar',
        handler: () => {
          if (this.playingGame) {
            this.updateGameScore(false);
            // this.clearGameOfLocalStorage();
            this.gameService
              .updateGame(this.playingGame.id, this.playingGame)
              .subscribe({
                next: () => {
                  this.isAlertOpen = false;
                  setTimeout(() => {
                    this.utilsService.routerLink('games');
                  }, 1);
                },
                error: (e) => console.error(e),
              });
          }
        },
      },
    ];

    this.isAlertOpen = true;
  }

  private async showWinGameMessage() {
    this.alertHeader = 'ENHORABONA!';
    this.alertMessage = ``;

    this.alertButtons = [
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
                // this.clearGameOfLocalStorage();
                this.utilsService.saveInLocalStorage('user', this.currentUser);
                this.isAlertOpen = false;
                setTimeout(() => {
                  this.utilsService.routerLink('games');
                }, 1);
              },
            });
          }
        },
      },
    ];

    this.isAlertOpen = true;
  }

  private async showErrorAnswerMessage(isTimeOut: boolean) {
    this.updateGameScore(false);
    // this.saveGameInLocalStorage();

    this.alertHeader = isTimeOut ? 'Oooooh...' : 'INCORRECTE...';
    this.alertMessage = `${
      isTimeOut ? "S'ha acabat el temps" : 'Has fallat la resposta'
    } així que el torn acaba ací, hauràs d'esperar fins que el rival responga.`;

    this.alertButtons = [
      {
        text: 'Acceptar',
        handler: () => {
          // this.clearGameOfLocalStorage();
          if (this.playingGame) {
            this.gameService
              .updateGame(this.playingGame.id, this.playingGame)
              .subscribe({
                next: () => {
                  this.isAlertOpen = false;
                  setTimeout(() => {
                    this.utilsService.routerLink('games');
                  }, 1);
                },
                error: (e) => console.error(e),
              });
          }
        },
      },
    ];

    this.isAlertOpen = true;
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
