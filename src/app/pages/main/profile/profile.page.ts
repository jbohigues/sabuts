import {
  ChangeDetectorRef,
  Component,
  inject,
  ViewChild,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  IonAvatar,
  IonSegmentButton,
  IonItemSliding,
  IonFab,
  IonFabButton,
  IonSegment,
  IonSpinner,
  IonLoading,
  IonActionSheet,
  IonAlert,
  IonText,
  IonButton,
  IonSearchbar,
  IonToast,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '@sharedComponents/header/header.component';
import { PartialUserModel, UserModel } from '@models/users.model';
import {
  FriendRequestModel,
  PartialFriendRequestModel,
} from '@models/friendRequest.model';
import { FriendService } from '@services/friend.service';
import { PartialFriendModel } from '@models/friends.model';
import { FriendRequestService } from '@services/friend-request.service';
import { UserService } from '@services/user.service';
import { FriendRequestStatusEnum } from '@sharedEnums/states';
import { ErrorsEnum } from '@sharedEnums/errors';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { ConfprofileModalComponent } from './modals/confprofile-modal/confprofile-modal.component';
import {
  ActionSheetButton,
  AlertButton,
  AlertInput,
  SearchbarInputEventDetail,
} from '@ionic/core';
import { ModalController } from '@ionic/angular';
import { IonicStorageService } from '@services/ionicStorage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonToast,
    IonSearchbar,
    IonButton,
    IonAlert,
    IonActionSheet,
    IonLoading,
    IonSpinner,
    IonSegment,
    IonFabButton,
    IonFab,
    IonItemSliding,
    IonSegmentButton,
    IonAvatar,
    IonRefresherContent,
    IonRefresher,
    IonBadge,
    IonLabel,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonList,
    IonItem,
    IonIcon,
    IonText,
  ],
  providers: [ModalController],
})
export class ProfilePage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  // Injects
  private userService = inject(UserService);
  private friendService = inject(FriendService);
  private ionicStorageService = inject(IonicStorageService);
  private friendRequestService = inject(FriendRequestService);

  // Variables
  selectedSegment: string = 'friends';
  requestsselectedSegment: string = 'pending';
  openLoading: boolean = false;
  isAlertOpen: boolean = false;
  isActionSheetOpen: boolean = false;
  loadingFriends: boolean = true;
  loadingFriendRequest: boolean = true;
  showScrollButton: boolean = false;

  // Alert
  alertHeader: string = '';
  alertMessage: string = '';
  alertInputs: AlertInput[] = [];
  alertButtons: AlertButton[] = [];

  // Toast
  isToastOpen: boolean = false;
  iconToast: string = '';
  colorToast: string = '';
  messageToast: string = '';

  // ActionSheet
  actionSheetHeader: string = '';
  actionSheetButtons: ActionSheetButton[] = [];

  // Objects
  currentUser: UserModel | undefined;
  friendsList: PartialFriendModel[] = [];
  friendsListOriginal: PartialFriendModel[] = [];
  friendRequestList: PartialFriendRequestModel[] = [];

  constructor(
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollButton = scrollTop > 100;
  }

  scrollToTop() {
    this.content.scrollToTop(800);
  }

  protected segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  protected segmentRequestsChanged(event: any) {
    this.requestsselectedSegment = event.detail.value;
  }

  protected refreshPage(event: any) {
    this.loadUserData();
    event.target.complete();
  }

  private async loadUserData() {
    this.currentUser = await this.ionicStorageService.get('currentUser');
    if (this.currentUser && this.currentUser.id)
      this.getUserInfo(this.currentUser.id);
    else location.reload();
  }

  private getUserInfo(id: string) {
    this.loadingFriends = true;
    this.loadingFriendRequest = true;

    this.friendService.getFriends(id).subscribe({
      next: (res) => {
        if (res) {
          this.friendsList = res;
          this.friendsListOriginal = res;
        }
        this.loadingFriends = false;
      },
      error: (e) => {
        console.error(e);
        this.loadingFriends = false;
      },
    });

    this.friendRequestService
      .getFriendRequests(id, FriendRequestStatusEnum.pending)
      .subscribe({
        next: (res) => {
          if (res) this.friendRequestList = res;
          this.loadingFriendRequest = false;
        },
        error: (e) => {
          console.error(e);
          this.loadingFriendRequest = false;
        },
      });
  }

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

  async presentActionSheet(accepted: boolean, requestId: string) {
    this.actionSheetHeader = `Està segur ${
      accepted ? "d'acceptar" : 'de rebutjar'
    } la sol·licitut d'amistat?`;

    this.actionSheetButtons = [
      {
        text: accepted ? 'Acceptar' : 'Rebutjar',
        icon: accepted ? 'checkmark-outline' : 'trash-outline',
        role: 'destructive',
        handler: () => {
          this.isActionSheetOpen = false;
          accepted
            ? this.acceptFriendRequest(requestId)
            : this.rejectFriendRequest(requestId);
        },
      },
      {
        text: 'Cancel·lar',
        icon: 'close-outline',
        role: 'cancel',
        handler: () => {
          this.isActionSheetOpen = false;
        },
      },
    ];

    this.isActionSheetOpen = true;
  }

  private async sendFriendRequest(searchItem: string) {
    this.openLoading = true;
    if (searchItem == this.currentUser?.email) {
      this.openLoading = false;

      this.messageToast = 'Has ficat el teu correu electrònic';
      this.colorToast = Colors.danger;
      this.iconToast = IconsToast.danger_close_circle;
      this.isToastOpen = true;

      this.cdr.detectChanges();
      return;
    }

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

            this.getUserInfo(this.currentUser!.id);
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

  private async acceptFriendRequest(requestId: string) {
    this.openLoading = true;

    if (this.currentUser && this.currentUser.id) {
      this.friendRequestService
        .acceptFriendRequest(this.currentUser.id, requestId)
        .subscribe({
          next: () => {
            this.openLoading = false;

            this.messageToast = 'Petició acceptada amb èxit';
            this.colorToast = Colors.success;
            this.iconToast = IconsToast.success_checkmark_circle;
            this.isToastOpen = true;

            this.cdr.detectChanges();

            this.getUserInfo(this.currentUser!.id);
          },
          error: (e) => {
            console.error(e);

            this.openLoading = false;

            const message = e.message.includes('permission-denied')
              ? 'Permissos insuficients'
              : 'Error al acceptar la petició';
            this.messageToast = message;
            this.colorToast = Colors.danger;
            this.iconToast = IconsToast.danger_close_circle;
            this.isToastOpen = true;

            this.cdr.detectChanges();
          },
        });
    }
  }

  private async rejectFriendRequest(requestId: string) {
    this.openLoading = true;

    if (this.currentUser && this.currentUser.id) {
      this.friendRequestService
        .rejectFriendRequest(this.currentUser.id, requestId)
        .subscribe({
          next: () => {
            this.openLoading = false;

            this.messageToast = 'Petició rebutjada amb èxit';
            this.colorToast = Colors.success;
            this.iconToast = IconsToast.success_checkmark_circle;
            this.isToastOpen = true;

            this.cdr.detectChanges();

            this.getUserInfo(this.currentUser!.id);
          },
          error: (e) => {
            console.error(e);
            this.openLoading = false;

            const message = e.message.includes('permission-denied')
              ? 'Permissos insuficients'
              : 'Error al rebutjar la petició';
            this.messageToast = message;
            this.colorToast = Colors.danger;
            this.iconToast = IconsToast.danger_close_circle;
            this.isToastOpen = true;

            this.cdr.detectChanges();
          },
        });
    }
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ConfprofileModalComponent,
    });
    modal.present();

    const { role } = await modal.onWillDismiss();

    if (role === 'updated') {
      this.loadUserData();

      this.messageToast = "Dades de l'usuari actualitzades amb èxit";
      this.colorToast = Colors.success;
      this.iconToast = IconsToast.success_checkmark_circle;
      this.isToastOpen = true;
    }

    if (role === 'cancel') {
      modal.dismiss();
    }
  }
}
