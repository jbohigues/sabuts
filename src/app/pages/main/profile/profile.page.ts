import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '@sharedComponents/header/header.component';
import { UserModel } from '@models/users.model';
import {
  FriendRequestModel,
  PartialFriendRequestModel,
} from '@models/friendRequest.model';
import { AlertController } from '@ionic/angular';
import { UtilsService } from '@services/old/utils.service';
import { FriendService } from '@services/friend.service';
import { PartialFriendModel } from '@models/friends.model';
import { FriendRequestService } from '@services/friend-request.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonList,
    IonItem,
    IonButton,
    IonIcon,
  ],
})
export class ProfilePage {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  // Injects
  private utilsService = inject(UtilsService);
  private friendService = inject(FriendService);
  private friendRequestService = inject(FriendRequestService);

  // Variables
  showScrollButton = false;

  // Objects
  currentUser: UserModel | undefined;
  friendsList: PartialFriendModel[] = [];
  friendRequestList: PartialFriendRequestModel[] = [];

  constructor(
    // private userService: UserService,
    // private utilService: UtilsService,
    private alertController: AlertController
  ) {}

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollButton = scrollTop > 100;
  }

  scrollToTop() {
    this.content.scrollToTop(800);
  }

  ionViewWillEnter() {
    this.currentUser = this.utilsService.getFromLocalStorage('user');
    if (this.currentUser && this.currentUser.id)
      this.getUserInfo(this.currentUser.id);
  }

  private getUserInfo(id: string) {
    this.friendService.getFriends(id).subscribe({
      next: (res) => {
        console.log(res);
        if (res && Array.isArray(res)) this.friendsList = res;
      },
      error: (e) => {
        console.error(e);
      },
    });

    this.friendRequestService.getFriendRequests(id).subscribe({
      next: (res) => {
        console.log(res);
        if (res && Array.isArray(res)) this.friendRequestList = res;
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  // cargarDatosUsuario(userId: string) {
  //   this.userService.getFriends(userId).subscribe((res) => {
  //     console.log(res);
  //     this.friendsList = res;
  //   });

  //   this.userService.getPendingFriendRequests(userId).subscribe((res) => {
  //     console.log(res);
  //     this.solicitudesPendientes = res;
  //   });
  // }

  // aceptarSolicitud(solicitud: FriendRequestModel) {
  //   this.userService
  //     .actualizarSolicitud(solicitud.id, StateFriendRequest.aceptada)
  //     .then(() => {
  //       this.userService
  //         .agregarAmigo(this.currentUser!.uid, solicitud.sendingUserId)
  //         .then((res) => {
  //           console.log(res);
  //           res.success
  //             ? this.utilService.presentToast(
  //                 res.message,
  //                 Colors.success,
  //                 IconsToast.success_checkmark_circle
  //               )
  //             : this.utilService.presentToast(
  //                 res.message,
  //                 Colors.danger,
  //                 IconsToast.danger_close_circle
  //               );
  //         });
  //     });
  // }

  // rechazarSolicitud(solicitud: FriendRequestModel) {
  //   this.userService.actualizarSolicitud(
  //     solicitud.id,
  //     StateFriendRequest.rechazada
  //   );
  // }

  // async presentAddFriendPrompt() {
  //   const alert = await this.alertController.create({
  //     header: 'Afegir nou amic/a',
  //     inputs: [
  //       {
  //         name: 'username',
  //         type: 'text',
  //         placeholder: 'Nom usuari',
  //       },
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancelar',
  //         role: 'cancel',
  //       },
  //       {
  //         text: 'Afegir',
  //         handler: (data) => {
  //           this.enviarSolicitud(data.username);
  //         },
  //       },
  //     ],
  //   });

  //   await alert.present();
  // }

  // private async enviarSolicitud(username: string) {
  //   const user = await this.userService.getUserByUsername(username);

  //   if (user) {
  //     const currentUser = this.utilService.getFromLocalStorage('user') as
  //       | UserModel
  //       | undefined;
  //     if (currentUser) {
  //       const friendRequest: FriendRequestModelDto = {
  //         id: '',
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //         receivingUserId: user.uid,
  //         sendingUserId: currentUser.uid,
  //         status: StateFriendRequest.pendiente,
  //       };
  //       this.userService.createFriendRequest(friendRequest).then((res) => {
  //         console.log(res);
  //       });
  //       // this.userService
  //       //   .enviarSolicitud(currentUser.uid, user.uid)
  //       //   .then((res) => {
  //       //     res.success
  //       //       ? this.presentSuccessAlert(res.message)
  //       //       : this.presentErrorAlert(res.message);
  //       //   });
  //     }
  //   } else {
  //     this.presentErrorAlert('Error al enviar la solicitud');
  //   }
  // }

  // private async presentSuccessAlert(message: string) {
  //   const alert = await this.alertController.create({
  //     header: 'Éxit',
  //     message,
  //     buttons: ['OK'],
  //   });

  //   await alert.present();
  // }

  // private async presentErrorAlert(message: string) {
  //   const alert = await this.alertController.create({
  //     header: 'Error',
  //     message: message,
  //     buttons: ['OK'],
  //   });

  //   await alert.present();
  // }
}
