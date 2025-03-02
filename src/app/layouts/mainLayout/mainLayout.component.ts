import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonSplitPane,
  IonIcon,
  IonMenu,
  IonContent,
  IonButton,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonAvatar,
  IonBadge,
  IonAlert,
  IonToast,
  // IonModal,
  // IonHeader,
  // IonToolbar,
  // IonButtons,
  // IonSearchbar,
  // IonItem,
  // IonLabel,
  // IonText,
  // IonFab,
  // IonFabButton,
  // IonTitle,
} from '@ionic/angular/standalone';
import { PartialUserModel, UserModel } from '@models/users.model';
import { UtilsService } from '@services/utils.service';
import { AuthService } from '@services/auth.service';
import { LogoComponent } from '@sharedComponents/logo/logo.component';
import {
  AlertButton,
  AlertInput,
  // OverlayEventDetail,
  // SearchbarInputEventDetail,
} from '@ionic/core';
import { FriendRequestModel } from '@models/friendRequest.model';
import { Colors } from '@sharedEnums/colors';
import { ErrorsEnum } from '@sharedEnums/errors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { FriendRequestStatusEnum, GameStatusEnum } from '@sharedEnums/states';
import { UserService } from '@services/user.service';
import { FriendRequestService } from '@services/friend-request.service';
import { PartialFriendModel } from '@models/friends.model';
import { GameModel } from '@models/games.model';
// import { GameService } from '@services/game.service';
// import { FriendService } from '@services/friend.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './mainLayout.component.html',
  styleUrls: ['./mainLayout.component.scss'],
  standalone: true,
  imports: [
    // IonTitle,
    // IonFabButton,
    // IonFab,
    // IonText,
    // IonLabel,
    // IonItem,
    // IonSearchbar,
    // IonButtons,
    // IonToolbar,
    // IonHeader,
    // IonModal,
    IonToast,
    IonAlert,
    IonBadge,
    IonAvatar,
    IonButton,
    IonIcon,
    IonSplitPane,
    IonMenu,
    CommonModule,
    FormsModule,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonIcon,
    IonButton,
    IonTabs,
    IonTabBar,
    IonTabButton,
    LogoComponent,
  ],
})
export class MainLayoutComponent implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  // @ViewChild(IonModal) modal!: IonModal;
  @Input() pageTitle!: string;
  @Input() backButton!: string;

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private utilsService = inject(UtilsService);
  private friendRequestService = inject(FriendRequestService);
  // private gameService = inject(GameService);
  // private friendService = inject(FriendService);

  // modalOpen: boolean = false;
  openLoading: boolean = false;
  showScrollButton: boolean = false;

  idusers: string[] = [];
  currentUser: UserModel | undefined;
  gamesOriginal: GameModel[] = [];
  friendsList: PartialFriendModel[] = [];
  friendsListOriginal: PartialFriendModel[] = [];

  // Alert
  isAlertOpen: boolean = false;
  alertHeader: string = '';
  alertMessage: string = '';
  alertInputs: AlertInput[] = [];
  alertButtons: AlertButton[] = [];

  // Toast
  isToastOpen: boolean = false;
  iconToast: string = '';
  colorToast: string = '';
  messageToast: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ionViewWillEnter() {
    this.init();
  }

  ngOnInit(): void {
    this.init();
  }

  private init() {
    this.currentUser = this.utilsService.getFromLocalStorage('user');

    // if (this.currentUser) {
    //   this.getFriends(this.currentUser.id);
    //   this.getActiveGamesByUser(this.currentUser.id);
    // }
  }

  protected signOut() {
    this.authService.logout().subscribe({
      next: () => {
        this.utilsService.clearLocalStorage();
      },
    });
  }

  protected scrollToTop(content: IonContent) {
    content.scrollToTop(800);
  }

  protected onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollButton = scrollTop > 100;
  }

  async presentAddFriendPrompt() {
    this.alertHeader = 'Afegir nou amic/a';

    this.alertInputs = [
      {
        type: 'text',
        name: 'username',
        placeholder: 'Escriu el correu electrònic del teu amic/a',
        attributes: {
          maxlength: 100,
        },
      },
    ];

    this.alertButtons = [
      {
        text: 'Cancel·lar',
        role: 'cancel',
        handler: () => {
          this.isAlertOpen = false;
        },
      },
      {
        text: 'Afegir',
        handler: (data) => {
          this.isAlertOpen = false;
          this.sendFriendRequest(data.username);
        },
      },
    ];

    this.isAlertOpen = true;
  }

  private async sendFriendRequest(searchItem: string) {
    this.openLoading = true;

    this.userService.findUserByEmailOrUserName(searchItem).subscribe({
      next: (res) => {
        if (res) {
          const userToSendRequest = res;
          this.createFriendRequest(userToSendRequest);
        } else {
          this.openLoading = false;

          this.messageToast = "No s'han trobat coincidències";
          this.colorToast = Colors.danger;
          this.iconToast = IconsToast.danger_close_circle;
          this.isToastOpen = true;

          this.cdr.detectChanges();
        }
      },
      error: (e) => {
        console.error(e);
        this.openLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private createFriendRequest(userToSendRequest: PartialUserModel) {
    if (this.currentUser) {
      const friendRequest: FriendRequestModel = {
        createdAt: new Date(),
        updatedAt: new Date(),
        sendingUserId: this.currentUser.id!,
        status: FriendRequestStatusEnum.pending,
      };

      this.friendRequestService
        .createFriendRequest(userToSendRequest.id!, friendRequest)
        .subscribe({
          next: () => {
            this.openLoading = false;

            this.messageToast = "Sol·licitut d'amistat enviada correctament";
            this.colorToast = Colors.success;
            this.iconToast = IconsToast.success_checkmark_circle;
            this.isToastOpen = true;

            this.cdr.detectChanges();
          },
          error: (e) => {
            this.openLoading = false;
            const toastMessage =
              e.message || "Error al enviar la sol·licitut d'amistat";

            this.messageToast = toastMessage;
            this.colorToast = Colors.danger;
            this.iconToast = IconsToast.danger_close_circle;
            this.isToastOpen = true;

            this.cdr.detectChanges();
          },
        });
    }
  }

  // private getFriends(id: string) {
  //   this.friendService.getFriends(id).subscribe({
  //     next: (res) => {
  //       if (res) {
  //         this.friendsListOriginal = res;
  //         console.log(this.friendsListOriginal);

  //         this.filterFriendsYetInGame();
  //       }
  //     },
  //     error: (e) => {
  //       console.error(e);
  //     },
  //   });
  // }

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
  //   console.log(this.friendsList);
  // }

  // private getActiveGamesByUser(id: string) {
  //   this.gameService.getActiveGamesByUser(id).subscribe({
  //     next: (res) => {
  //       if (res) this.gamesOriginal = res;
  //       console.log(this.gamesOriginal);
  //     },
  //     error: (e) => {
  //       console.error(e);
  //     },
  //   });
  // }

  // protected cancel() {
  //   this.modalOpen = false;
  // }

  // protected onDidDismiss(event: CustomEvent<OverlayEventDetail<any>>) {
  //   this.modalOpen = false;
  //   if (event.detail.role == 'created')
  //     this.exitOperation('Partida creada amb èxit');
  // }

  // private exitOperation(message: string) {
  //   if (this.currentUser) {
  //     // this.getActiveGamesByUser(this.currentUser.id);
  //     // this.getFriends(this.currentUser.id);
  //     this.utilsService.presentToast(
  //       message,
  //       Colors.success,
  //       IconsToast.success_checkmark_circle
  //     );
  //   }
  // }

  // protected handleInput(event: CustomEvent<SearchbarInputEventDetail>) {
  //   const value = event.detail.value;
  //   if (value) {
  //     this.friendsList = this.friendsListOriginal.filter((friend) =>
  //       friend.friendUser.userName.includes(value)
  //     );
  //   } else {
  //     this.friendsList = this.friendsListOriginal;
  //   }
  // }

  // Mensaje confirmacion
  // protected async confirmCreateGame(friend: PartialFriendModel) {
  //   this.alertHeader = 'Confirmar partida';
  //   this.alertMessage = `Estàs segur de voler començar una partida amb @${friend.friendUser.userName}?`;

  //   this.alertButtons = [
  //     {
  //       text: 'Cancel·lar',
  //       role: 'cancel',
  //       cssClass: 'secondary',
  //     },
  //     {
  //       text: 'Acceptar',
  //       handler: () => {
  //         this.createGame(friend);
  //       },
  //     },
  //   ];

  //   this.isAlertOpen = true;
  // }

  // private createGame(friend: PartialFriendModel) {
  //   if (!this.currentUser) throw new Error('User no logged');
  //   const game: GameModel = {
  //     id: '',
  //     currentTurn: {
  //       playerId: this.currentUser.id,
  //       roundNumber: 0,
  //     },
  //     player1: {
  //       score: 0,
  //       userId: this.currentUser.id,
  //       userName: this.currentUser.userName,
  //       backgroundColor: this.currentUser.backgroundColor,
  //     },
  //     player2: {
  //       score: 0,
  //       userId: friend.friendUser.id,
  //       userName: friend.friendUser.userName,
  //       backgroundColor: friend.friendUser.backgroundColor,
  //     },
  //     rounds: [],
  //     startTime: new Date(),
  //     updatedAt: new Date(),
  //     status: GameStatusEnum.in_progress,
  //   };

  //   this.gameService.createGame(game).subscribe({
  //     next: (res) => {
  //       if (res) {
  //         this.isAlertOpen = false;
  //         this.modal.dismiss(null, 'created');
  //       }
  //     },
  //     error: (e) => {
  //       console.error(e);
  //       this.utilsService.presentToast(
  //         'Error al crear la partida',
  //         Colors.danger,
  //         IconsToast.danger_close_circle
  //       );
  //     },
  //   });
  // }
}
