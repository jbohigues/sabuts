import { Component } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenu,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircle,
  bulb,
  checkmarkCircle,
  closeCircle,
  ellipsisHorizontal,
  helpCircle,
  informationCircle,
  moon,
  shield,
  sparkles,
  star,
  sunny,
  thumbsUp,
  trash,
  warning,
  alert,
  personCircle,
  closeOutline,
} from 'ionicons/icons';
import { CreateUserDto } from 'src/app/shared/dto/user-dto';
import { Colors } from 'src/app/shared/enums/colors';
import { IconsToast } from 'src/app/shared/enums/iconsToast';
import { UserModel } from 'src/app/shared/models/users.models';
import { FirestoreService } from 'src/app/shared/services/firestore.service';
import { ValidatorService } from 'src/app/shared/services/validator.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenuToggle,
    IonButton,
    IonButtons,
    IonIcon,
    IonList,
    IonItem,
  ],
})
export class HomePage {
  users: UserModel[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private validatorService: ValidatorService
  ) {
    addIcons({
      'thumbs-up': thumbsUp,
      'help-circle': helpCircle,
      'alert-circle': alertCircle,
      'close-circle': closeCircle,
      'checkmark-circle': checkmarkCircle,
      'information-circle': informationCircle,
      'ellipsis-horizontal': ellipsisHorizontal,
      star,
      bulb,
      moon,
      alert,
      trash,
      sunny,
      shield,
      warning,
      sparkles,
      personCircle,
      closeOutline,
    });

    this.loadUsers();
  }

  loadUsers() {
    this.firestoreService.getCollectionChanges<UserModel>('users').subscribe({
      next: (res) => {
        if (res) this.users = res;
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  async createUser() {
    let user: CreateUserDto = {
      email: 'prueba',
      firstName: 'prueba',
      lastName: 'prueba',
      userName: 'prueba',
      avatarId: '',
      totalPoints: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      isAdmin: false,
      active: true,
    };

    try {
      // Verificar si el email ya existe
      const emailExists = await this.validatorService.checkIfEmailExists(
        user.email
      );
      if (emailExists) {
        await this.validatorService.presentToast(
          'Ja existeix un usuari amb aquest correu electrònic',
          Colors.danger,
          IconsToast.danger_close_circle
        );
        return;
      }

      // Verificar si el username ya existe
      const usernameExists = await this.validatorService.checkIfUsernameExists(
        user.userName
      );
      if (usernameExists) {
        await this.validatorService.presentToast(
          "Ja existeix un usuari amb aquest nom d'usuari",
          Colors.danger,
          IconsToast.danger_trash
        );
        return;
      }

      // Si no existe ni el email ni el username, procedemos a crear el usuario
      const result = await this.firestoreService.createDocument(user, 'users');
      if (result) {
        await this.validatorService.presentToast(
          'Usuari creat exitosament',
          Colors.success,
          IconsToast.success_checkmark_circle
        );
        return;
      }
    } catch (error) {
      console.error('Error al crear el usuari:', error);
    }
  }
}
