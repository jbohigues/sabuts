import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  ViewChild,
} from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
  IonButton,
  IonModal,
  IonToolbar,
  IonHeader,
  IonButtons,
  IonTitle,
  IonItem,
  IonLabel,
  IonIcon,
  IonFab,
  IonFabButton,
  IonSearchbar,
  IonAlert,
  IonToast,
} from '@ionic/angular/standalone';
import { GameModel } from '@models/games.model';
import { HeaderComponent } from '@sharedComponents/header/header.component';
import { GameService } from '@services/game.service';
import { UtilsService } from '@services/utils.service';
import { UserModel } from '@models/users.model';
import { CommonModule } from '@angular/common';
import { GameCardComponent } from './components/game-card/game-card.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FriendService } from '@services/friend.service';
import { PartialFriendModel } from '@models/friends.model';
import { GameStatusEnum } from '@sharedEnums/states';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import {
  AlertButton,
  OverlayEventDetail,
  SearchbarInputEventDetail,
} from '@ionic/core/components';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
  standalone: true,
  imports: [
    IonToast,
    IonSearchbar,
    IonFabButton,
    IonFab,
    IonIcon,
    IonLabel,
    IonItem,
    IonTitle,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonModal,
    IonButton,
    IonText,
    IonSpinner,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    IonAlert,
    HeaderComponent,
    CommonModule,
    GameCardComponent,
  ],
})
export class GamesPage {
  @ViewChild(IonModal) modal!: IonModal;

  private gameService = inject(GameService);
  private utilsService = inject(UtilsService);
  private friendService = inject(FriendService);
  private breakpointObserver = inject(BreakpointObserver);

  // Variables
  totalScore: number = 0;
  loading: boolean = false;
  modalOpen: boolean = false;
  needReload: boolean = false;
  isAlertOpen: boolean = false;
  isSmallScreen: boolean = false;
  showScrollButton: boolean = false;

  // Alert
  alertHeader: string = '';
  alertMessage: string = '';
  alertButtons: AlertButton[] = [];

  // Toast
  isToastOpen: boolean = false;
  iconToast: string = '';
  colorToast: string = '';
  messageToast: string = '';

  // Objects
  idusers: string[] = [];
  gamesOriginal: GameModel[] = [];
  gamesTurnOfUser: GameModel[] = [];
  gamesTurnOfRival: GameModel[] = [];
  friendsList: PartialFriendModel[] = [];
  friendsListOriginal: PartialFriendModel[] = [];
  currentUser: UserModel | undefined;

  constructor(private cdr: ChangeDetectorRef) {
    this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .subscribe((result) => {
        this.isSmallScreen = result.matches; // true si es pequeño, false si no
      });

    effect(
      () => {
        this.needReload = this.utilsService.needReloadSignal();
        if (this.needReload) this.loadUserData();
      },
      { allowSignalWrites: true }
    );
  }

  ionViewWillEnter() {
    this.loadUserData();
  }

  protected onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollButton = scrollTop > 100;
  }

  protected scrollToTop(content: IonContent) {
    content.scrollToTop(800);
  }

  protected refreshPage(event: any) {
    this.ionViewWillEnter();
    event.target.complete();
  }

  private loadUserData() {
    if (this.needReload) this.utilsService.needReloadSignal.set(false);

    this.currentUser = this.utilsService.getFromLocalStorage('user');
    if (this.currentUser) this.getUserInfo(this.currentUser.id);
    else location.reload();
  }

  private getUserInfo(id: string) {
    this.loading = true;
    this.getActiveGamesByUser(id);
    this.getFriends(id);
  }

  private getActiveGamesByUser(id: string) {
    this.gameService.getActiveGamesByUser(id).subscribe({
      next: (res) => {
        if (res) this.gamesOriginal = res;

        this.gamesTurnOfUser = this.gamesOriginal.filter(
          (games) => games.currentTurn.playerId == this.currentUser?.id
        );
        this.gamesTurnOfRival = this.gamesOriginal.filter(
          (games) => games.currentTurn.playerId != this.currentUser?.id
        );
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
      },
    });
  }

  private getFriends(id: string) {
    this.friendService.getFriends(id).subscribe({
      next: (res) => {
        if (res) {
          this.friendsList = res;
          this.friendsListOriginal = res;
          // this.filterFriendsYetInGame();
        }
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  // private filterFriendsYetInGame() {
  //   this.idusers = [];
  //   // Crear un Set para almacenar todos los IDs de usuarios de manera única
  //   const idUsersSet = new Set(this.idusers);

  //   // Agregar los IDs de los jugadores de cada juego al Set
  //   this.gamesOriginal.forEach((game) => {
  //     idUsersSet.add(game.player1.userId);
  //     idUsersSet.add(game.player2.userId);
  //   });

  //   // Convertir el Set a un array solo una vez
  //   this.idusers = Array.from(idUsersSet);

  //   // Filtrar la lista de amigos que no están en idusers
  //   this.friendsList = this.friendsListOriginal.filter(
  //     (friend) => !idUsersSet.has(friend.friendId)
  //   );
  // }

  protected handleInput(event: CustomEvent<SearchbarInputEventDetail>) {
    const value = event.detail.value;

    if (value) {
      this.friendsList = this.friendsListOriginal.filter(
        (friend) =>
          friend.friendUser.userName.toLowerCase().includes(value) ||
          friend.friendUser.email.toLowerCase().includes(value) ||
          friend.friendUser.name.toLowerCase().includes(value)
      );
    } else {
      this.friendsList = this.friendsListOriginal;
    }
  }

  protected cancel() {
    this.modalOpen = false;
  }

  protected onDidDismiss(event: CustomEvent<OverlayEventDetail<any>>) {
    this.modalOpen = false;
    if (event.detail.role == 'created')
      this.exitOperation('Partida creada amb èxit');
  }

  private exitOperation(message: string) {
    if (this.currentUser) {
      this.getActiveGamesByUser(this.currentUser.id);
      this.getFriends(this.currentUser.id);

      this.messageToast = message;
      this.colorToast = Colors.success;
      this.iconToast = IconsToast.success_checkmark_circle;
      this.isToastOpen = true;
    }
  }

  // Mensaje confirmacion
  protected async confirmCreateGame(friend: PartialFriendModel) {
    this.alertHeader = 'Confirmar partida';
    this.alertMessage = `Estàs segur de voler començar una partida amb @${friend.friendUser.userName}?`;

    this.alertButtons = [
      {
        text: 'Cancel·lar',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          this.isAlertOpen = false;
        },
      },
      {
        text: 'Acceptar',
        handler: () => {
          this.createGame(friend);
        },
      },
    ];

    this.isAlertOpen = true;
  }

  private createGame(friend: PartialFriendModel) {
    if (!this.currentUser) throw new Error('User no logged');
    const game: GameModel = {
      id: '',
      currentTurn: {
        playerId: this.currentUser.id,
        roundNumber: 0,
      },
      player1: {
        score: 0,
        userId: this.currentUser.id,
        userName: this.currentUser.userName,
        backgroundColor: this.currentUser.backgroundColor,
      },
      player2: {
        score: 0,
        userId: friend.friendUser.id,
        userName: friend.friendUser.userName,
        backgroundColor: friend.friendUser.backgroundColor,
      },
      rounds: [],
      startTime: new Date(),
      updatedAt: new Date(),
      status: GameStatusEnum.in_progress,
    };

    this.gameService.createGame(game).subscribe({
      next: (res) => {
        if (res) {
          this.isAlertOpen = false;
          this.modal.dismiss(null, 'created');
          this.cdr.detectChanges();
        }
      },
      error: (e) => {
        console.error(e);
        this.isAlertOpen = false;
        this.modalOpen = false;

        this.messageToast = e.message;
        this.colorToast = Colors.danger;
        this.iconToast = IconsToast.danger_close_circle;
        this.isToastOpen = true;
        this.cdr.detectChanges();
      },
    });
  }

  protected deletedGame(event: boolean) {
    if (event) this.exitOperation('Partida eliminada amb èxit');
  }
}
