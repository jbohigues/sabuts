import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  // IonList,
  IonItem,
  IonButton,
  IonIcon,
  IonLabel,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  IonAvatar,
  IonSegmentButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonFab,
  IonFabButton,
  IonSegment,
  IonSpinner,
  IonFabList,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '@sharedComponents/header/header.component';
import { PartialUserModel, UserModel } from '@models/users.model';
import {
  FriendRequestModel,
  PartialFriendRequestModel,
} from '@models/friendRequest.model';
import {
  AlertController,
  ActionSheetController,
  ModalController,
} from '@ionic/angular';
import { UtilsService } from '@services/utils.service';
import { FriendService } from '@services/friend.service';
import { PartialFriendModel } from '@models/friends.model';
import { FriendRequestService } from '@services/friend-request.service';
import { UserService } from '@services/user.service';
import { FriendRequestStatusEnum } from '@sharedEnums/states';
import { ErrorsEnum } from '@sharedEnums/errors';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { ConfprofileModalComponent } from './modals/confprofile-modal/confprofile-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonFabList,
    IonSpinner,
    IonSegment,
    IonFabButton,
    IonFab,
    IonItemOption,
    IonItemOptions,
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
    // HeaderComponent,
    // IonList,
    IonItem,
    IonButton,
    // IonIcon,
  ],
  providers: [ModalController],
})
export class ProfilePage {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  // Injects
  private userService = inject(UserService);
  private utilsService = inject(UtilsService);
  private friendService = inject(FriendService);
  private friendRequestService = inject(FriendRequestService);

  // Variables
  selectedSegment: string = 'friends';
  showScrollButton = false;
  loadingFriends: boolean = true;
  loadingFriendRequest: boolean = true;

  // Objects
  currentUser: UserModel | undefined;
  loadingElement: HTMLIonLoadingElement | undefined;
  friendsList: PartialFriendModel[] = [];
  friendRequestList: PartialFriendRequestModel[] = [];

  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) {}

  ionViewWillEnter() {
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

  protected refreshPage(event: any) {
    this.ionViewWillEnter();
    event.target.complete();
  }

  private loadUserData() {
    this.currentUser = this.utilsService.getFromLocalStorage('user');
    if (this.currentUser && this.currentUser.id)
      this.getUserInfo(this.currentUser.id);
    else location.reload();
  }

  private getUserInfo(id: string) {
    this.loadingFriends = true;
    this.loadingFriendRequest = true;

    this.friendService.getFriends(id).subscribe({
      next: (res) => {
        if (res) this.friendsList = res;
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

  async presentAddFriendPrompt() {
    const alert = await this.alertController.create({
      header: 'Afegir nou amic/a',
      inputs: [
        {
          type: 'text',
          name: 'username',
          placeholder: 'Escriu el correu electrònic del teu amic/a',
          attributes: {
            maxlength: 100,
          },
        },
      ],
      buttons: [
        {
          text: 'Cancel·lar',
          role: 'cancel',
        },
        {
          text: 'Afegir',
          handler: (data) => {
            this.sendFriendRequest(data.username);
          },
        },
      ],
    });

    await alert.present();
  }

  async presentActionSheet(accepted: boolean, requestId: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: `Està segur ${
        accepted ? "d'acceptar" : 'de rebutjar'
      } la sol·licitut d'amistat?`,
      buttons: [
        {
          text: accepted ? 'Acceptar' : 'Rebutjar',
          icon: accepted ? 'checkmark-outline' : 'trash-outline',
          role: 'destructive',
          handler: () => {
            accepted
              ? this.acceptFriendRequest(requestId)
              : this.rejectFriendRequest(requestId);
          },
        },
        {
          text: 'Cancel·lar',
          icon: 'close-outline',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  private async sendFriendRequest(searchItem: string) {
    this.loadingElement = await this.utilsService.loading();
    await this.loadingElement.present();
    this.userService.findUserByEmailOrUserName(searchItem).subscribe({
      next: (res) => {
        if (res) {
          const userToSendRequest = res;
          this.createFriendRequest(userToSendRequest);
        } else
          this.utilsService.presentToast(
            "No s'han trobat coincidències",
            Colors.danger,
            IconsToast.danger_close_circle
          );
        this.loadingElement?.dismiss();
      },
      error: (e) => {
        console.error(e);
        this.loadingElement?.dismiss();
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
            this.utilsService.presentToast(
              "Sol·licitut d'amistat enviada correctament",
              Colors.success,
              IconsToast.success_checkmark_circle
            );
            this.getUserInfo(this.currentUser!.id);
            this.loadingElement?.dismiss();
          },
          error: (e) => {
            const errorMessages: Record<string, string> = {
              [ErrorsEnum.already_sent_request]:
                "Ja has enviat una sol·licitut d'amistat a aquest usuari",
              [ErrorsEnum.already_received_request]:
                "Aquest usuari ja t'ha enviat una sol·licitut d'amistat",
              [ErrorsEnum.already_friends]:
                "Aquest usuari ja pertany al teu llistat d'amics",
            };

            const toastMessage =
              errorMessages[e.message] ||
              "Error al enviar la sol·licitut d'amistat";

            this.utilsService.presentToast(
              toastMessage,
              Colors.danger,
              IconsToast.danger_close_circle
            );
            this.loadingElement?.dismiss();
          },
        });
    }
  }

  private async acceptFriendRequest(requestId: string) {
    this.loadingElement = await this.utilsService.loading();
    await this.loadingElement.present();
    if (this.currentUser && this.currentUser.id) {
      this.friendRequestService
        .acceptFriendRequest(this.currentUser.id, requestId)
        .subscribe({
          next: () => {
            this.utilsService.presentToast(
              'Petició acceptada amb èxit',
              Colors.success,
              IconsToast.success_checkmark_circle
            );
            this.getUserInfo(this.currentUser!.id);
            this.loadingElement?.dismiss();
          },
          error: (e) => {
            console.error(e);
          },
        });
    }
  }

  private async rejectFriendRequest(requestId: string) {
    this.loadingElement = await this.utilsService.loading();
    await this.loadingElement.present();
    if (this.currentUser && this.currentUser.id) {
      this.friendRequestService
        .rejectFriendRequest(this.currentUser.id, requestId)
        .subscribe({
          next: () => {
            this.utilsService.presentToast(
              'Petició rebutjada amb èxit',
              Colors.success,
              IconsToast.success_checkmark_circle
            );
            this.getUserInfo(this.currentUser!.id);
            this.loadingElement?.dismiss();
          },
          error: (e) => {
            console.error(e);
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

      this.utilsService.presentToast(
        "Dades de l'usuari actualitzades amb èxit",
        Colors.success,
        IconsToast.success_checkmark_circle
      );
    }

    if (role === 'cancel') {
      modal.dismiss();
    }
  }
}
