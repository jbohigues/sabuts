import { Component, ViewChild } from '@angular/core';
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
import { FriendRequestModel } from '@models/friendRequest.model';
import { AlertController } from '@ionic/angular';

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

  showScrollButton = false;

  currentUser: UserModel | undefined;
  friendsList: UserModel[] = [];
  solicitudesPendientes: FriendRequestModel[] = [];

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

  // ionViewWillEnter() {
  //   this.currentUser = this.utilService.getFromLocalStorage('user');
  //   if (this.currentUser) this.cargarDatosUsuario(this.currentUser.uid);
  // }

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
