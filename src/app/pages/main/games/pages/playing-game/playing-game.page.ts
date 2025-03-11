import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
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
import { firstValueFrom, forkJoin } from 'rxjs';
import { IonicStorageService } from '@services/ionicStorage.service';
import { QuestionService } from '@services/question.service';

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
export class PlayingGamePage implements OnInit {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('_idgame') idgame!: string;

  private cdr = inject(ChangeDetectorRef);
  private gameService = inject(GameService);
  private userService = inject(UserService);
  private utilsService = inject(UtilsService);
  private questionService = inject(QuestionService);
  private ionicStorageService = inject(IonicStorageService);

  // Variables
  progress: number = 0;
  buffer: number = 0.06;
  timeLeft: number = 20;
  correctAnswers: number = 0;

  // Alert
  isAlertOpen: boolean = false;
  alertHeader: string = '';
  alertMessage: string = '';
  alertButtons: AlertButton[] = [];

  openLoading: boolean = false;
  showQuestion: boolean = false;
  answerSelected: boolean = false;

  // Objects
  timer: any;
  categories = Categories;
  questions: QuestionModel[] = [];
  playingGame: GameModel | undefined;
  currentUser: UserModel | undefined;
  currentAnswer: AnswerModel | undefined;
  currentQuestion: QuestionModel | undefined;
  rivalPlayer: UserOfGameModel | undefined;
  currentUserPlayer: UserOfGameModel | undefined;

  categorieMap: Map<string, Category> = new Map();

  constructor() {
    this.categorieMap.set(Categories.historia, {
      label: 'València',
      color: 'yellow',
    });

    this.categorieMap.set(Categories.falles, {
      label: 'Falles',
      color: 'red',
    });

    this.categorieMap.set(Categories.musica, {
      label: 'Música',
      color: 'blue',
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

  ionViewWillLeave() {
    this.stopTimer();
  }

  ngOnInit() {
    this.openLoading = true;
    this.getAllDataOfStorage();
  }

  private async getAllDataOfStorage() {
    this.currentUser = await this.ionicStorageService.get('currentUser');

    this.playingGame =
      (await this.ionicStorageService.get(`playingGame_${this.idgame}`)) ||
      (await this.getGameById());

    this.currentUserPlayer = await this.ionicStorageService.get(
      `currentUserPlayer_${this.idgame}`
    );

    this.rivalPlayer = await this.ionicStorageService.get(
      `rivalPlayer_${this.idgame}`
    );

    if (!this.currentUserPlayer || !this.rivalPlayer)
      this.setCurrentUserInPlayer1();

    this.correctAnswers =
      (await this.ionicStorageService.get(`correctAnswers_${this.idgame}`)) ||
      0;

    this.questions =
      (await this.ionicStorageService.get(`questions_${this.idgame}`)) || [];
    if (!this.questions.length) this.getRandomQuestions();

    this.openLoading = false;
    this.cdr.detectChanges();
  }

  private async getGameById(): Promise<GameModel> {
    const game = await firstValueFrom(
      this.gameService.getGameById(this.idgame)
    );

    await this.ionicStorageService.set(`playingGame_${game.id}`, game);
    return game;
  }

  private async setCurrentUserInPlayer1() {
    if (this.currentUser && this.playingGame) {
      const currentUserIsPlayer1 =
        this.playingGame.player1.userId == this.currentUser.id;

      if (currentUserIsPlayer1) {
        this.playingGame.player1.backgroundColor =
          this.currentUser.backgroundColor;
        this.currentUserPlayer = this.playingGame.player1;
        this.rivalPlayer = this.playingGame.player2;
      } else {
        this.playingGame.player2.backgroundColor =
          this.currentUser.backgroundColor;
        this.currentUserPlayer = this.playingGame.player2;
        this.rivalPlayer = this.playingGame.player1;
      }

      this.ionicStorageService.set(
        `currentUserPlayer_${this.idgame}`,
        this.currentUserPlayer
      );

      this.ionicStorageService.set(
        `rivalPlayer_${this.idgame}`,
        this.rivalPlayer
      );
    }
  }

  private getRandomQuestions() {
    this.questionService
      .getRandomQuestions(this.currentUser!.id)
      .then((res) => {
        if (res && Array.isArray(res)) {
          this.questions = res;
          this.ionicStorageService.set(
            `questions_${this.idgame}`,
            this.questions
          );
        }
      });
  }

  protected async makeQuestion() {
    this.answerSelected = false;

    this.currentQuestion = this.questions[this.correctAnswers];

    this.showQuestion = true;
    this.startTimer();
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

  protected async answerQuestion(answer: AnswerModel) {
    this.stopTimer();

    this.answerSelected = true;
    this.currentAnswer = answer;

    if (!this.currentUser!.answeredQuestions)
      this.currentUser!.answeredQuestions = [];

    this.currentUser!.answeredQuestions.push(
      this.questions[this.correctAnswers].id
    );
    await this.ionicStorageService.set(`currentUser`, this.currentUser);

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

  private async incrementScore() {
    if (this.playingGame && this.currentUserPlayer) {
      this.correctAnswers++;
      this.currentUserPlayer.score = this.currentUserPlayer.score + 1;

      await this.ionicStorageService.set(
        `correctAnswers_${this.playingGame.id}`,
        this.correctAnswers
      );

      await this.ionicStorageService.set(
        `currentUserPlayer_${this.playingGame.id}`,
        this.currentUserPlayer
      );

      if (this.currentUserPlayer.score == environment.pointsToWinGame) {
        this.fireConfetti();
        this.showWinGameMessage();
      } else if (this.correctAnswers == environment.maxCorrectAnswers)
        this.showMaxCorrectAnswersMessage();
    }
  }

  private async updateGameScore(wingame: boolean) {
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

      await this.ionicStorageService.set(
        `playingGame_${this.playingGame.id}`,
        this.playingGame
      );
    }
  }

  private async showMaxCorrectAnswersMessage() {
    this.updateGameScore(false);

    if (this.playingGame) {
      this.gameService
        .updateGame(this.playingGame.id, this.playingGame)
        .subscribe({
          next: () => {
            this.cleanAllInfoOfIonicStorage();
          },
          error: (e) => console.error(e),
        });
    }

    this.alertHeader = 'Màxim de respostes correctes';
    this.alertMessage = `Has aplegat al màxim de respostes correctes, has d'esperar fins que responga el teu contrincant`;

    this.alertButtons = [
      {
        text: 'Acceptar',
        handler: async () => {
          this.isAlertOpen = false;
          this.cdr.detectChanges();

          this.utilsService.routerLink('games', true);
        },
      },
    ];

    this.isAlertOpen = true;
  }

  private async showWinGameMessage() {
    this.updateGameScore(true);

    if (this.playingGame && this.currentUser) {
      this.currentUser.totalPoints += 5;

      forkJoin([
        this.gameService.updateGame(this.playingGame.id, this.playingGame),
        this.userService.updateUser(this.currentUser.id, {
          totalPoints: this.currentUser.totalPoints,
        }),
      ]).subscribe({
        next: () => {
          this.cleanAllInfoOfIonicStorage();
        },
        error: (e) => console.error(e),
      });
    }

    this.alertHeader = 'ENHORABONA!';
    this.alertMessage = ``;

    this.alertButtons = [
      {
        text: 'Acceptar',
        handler: async () => {
          await this.ionicStorageService.set(`currentUser`, this.currentUser);

          this.isAlertOpen = false;
          this.cdr.detectChanges();
          this.utilsService.routerLink('games');
        },
      },
    ];

    this.isAlertOpen = true;
  }

  private async showErrorAnswerMessage(isTimeOut: boolean) {
    this.updateGameScore(false);

    if (this.playingGame) {
      this.gameService
        .updateGame(this.playingGame.id, this.playingGame)
        .subscribe({
          next: () => {
            this.cleanAllInfoOfIonicStorage();
          },
          error: (e) => console.error(e),
        });
    }

    this.alertHeader = isTimeOut ? 'Oooooh...' : 'INCORRECTE...';
    this.alertMessage = `${
      isTimeOut ? "S'ha acabat el temps" : 'Has fallat la resposta'
    } així que el torn acaba ací, hauràs d'esperar fins que el rival responga.`;

    this.alertButtons = [
      {
        text: 'Acceptar',
        handler: async () => {
          this.isAlertOpen = false;
          this.utilsService.routerLink('games', true);
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

  private cleanAllInfoOfIonicStorage() {
    this.ionicStorageService.remove(`questions_${this.idgame}`);
    this.ionicStorageService.remove(`playingGame_${this.idgame}`);
    this.ionicStorageService.remove(`rivalPlayer_${this.idgame}`);
    this.ionicStorageService.remove(`correctAnswers_${this.idgame}`);
    this.ionicStorageService.remove(`currentUserPlayer_${this.idgame}`);
  }
}
