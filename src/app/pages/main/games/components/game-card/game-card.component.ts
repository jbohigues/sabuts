import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  IonButton,
  IonIcon,
  IonAvatar,
  IonText,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonLabel,
  IonItemOption,
} from '@ionic/angular/standalone';
import { AlertButton } from '@ionic/core';
import { GameModel, UserOfGameModel } from '@models/games.model';
import { UserModel } from '@models/users.model';
import { GameService } from '@services/game.service';
import { UtilsService } from '@services/utils.service';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [
    IonItemOption,
    IonLabel,
    IonItemOptions,
    IonItem,
    IonItemSliding,
    CommonModule,
    IonIcon,
    IonAvatar,
    IonText,
    IonButton,
  ],
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
  @Input() game!: GameModel;
  @Input() myTurn!: boolean;
  @Input() isSmallScreen!: boolean;
  @Input() currentUser!: UserModel;
  @Output() deletedEmitter = new EventEmitter<boolean>();

  private gameService = inject(GameService);
  private utilsService = inject(UtilsService);

  alertHeader: string = '';
  alertMessage: string = '';
  isAlertOpen: boolean = false;
  alertButtons: AlertButton[] = [];

  rivalPlayer: UserOfGameModel | undefined;
  currentUserPlayer: UserOfGameModel | undefined;

  ngOnInit(): void {
    this.setCurrentUserInPlayer1();
  }

  protected playGame(game: GameModel) {
    this.utilsService.routerLink(`/games/${game.id}`);
  }

  private setCurrentUserInPlayer1() {
    const currentUserIsPlayer1 =
      this.game.player1.userId == this.currentUser.id;

    if (currentUserIsPlayer1) {
      this.currentUserPlayer = this.game!.player1;
      this.rivalPlayer = this.game!.player2;
    } else {
      this.currentUserPlayer = this.game!.player2;
      this.rivalPlayer = this.game!.player1;
    }
  }

  protected async confirmDeleteGame() {
    this.alertHeader = 'Eliminar partida';
    this.alertMessage = `Estàs segur d'eliminar la partida amb @${this.game.player1.userName}?`;

    this.alertButtons = [
      {
        text: 'Cancel·lar',
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: 'Acceptar',
        handler: () => {
          this.deleteGame();
        },
      },
    ];

    this.isAlertOpen = true;
  }

  private deleteGame() {
    this.gameService.deleteGame(this.game.id).subscribe({
      next: () => {
        this.deletedEmitter.emit(true);
        this.isAlertOpen = false;
      },
      error: (e) => {
        console.error(e);
      },
    });
  }
}
