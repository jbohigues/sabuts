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
} from '@ionic/angular/standalone';
import { PartialUserModel, UserModel } from '@models/users.model';
import { UtilsService } from '@services/utils.service';
import { AuthService } from '@services/auth.service';
import { LogoComponent } from '@sharedComponents/logo/logo.component';
import { AlertButton, AlertInput } from '@ionic/core';
import { FriendRequestModel } from '@models/friendRequest.model';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { FriendRequestStatusEnum } from '@sharedEnums/states';
import { UserService } from '@services/user.service';
import { FriendRequestService } from '@services/friend-request.service';
import { PartialFriendModel } from '@models/friends.model';
import { GameModel } from '@models/games.model';
import { IonicStorageService } from '@services/ionicStorage.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './mainLayout.component.html',
  styleUrls: ['./mainLayout.component.scss'],
  standalone: true,
  imports: [
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
  @Input() pageTitle!: string;
  @Input() backButton!: string;

  private cdr = inject(ChangeDetectorRef);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private utilsService = inject(UtilsService);
  private ionicStorageService = inject(IonicStorageService);
  private friendRequestService = inject(FriendRequestService);

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

  ngOnInit(): void {
    this.init();
  }

  private async init() {
    this.currentUser = await this.ionicStorageService.get('currentUser');
    const user = this.authService.getCurrentUser();
    if (!user?.emailVerified || !this.currentUser) this.signOut();
  }

  protected signOut() {
    this.authService.logout().subscribe({
      next: () => {
        this.utilsService.routerLink('login');
        this.ionicStorageService.clear();
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

    this.userService.findUserByEmail(searchItem).subscribe({
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
}
