import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  // IonList,
  IonItem,
  IonButton,
  // IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonLabel,
  IonInput,
} from '@ionic/angular/standalone';
// import { HeaderComponent } from '@sharedComponents/header/header.component';
// import { UserModel } from '@models/users.model';
// import {
//   FriendRequestModel,
//   FriendRequestModelDto,
// } from '@models/friendRequest.model';
import { UserService } from '@services/user.service';
// import { UtilsService } from '@services/utils.service';
// import { StateFriendRequest } from '@sharedEnums/states';
// import { AlertController } from '@ionic/angular';
// import { Colors } from '@sharedEnums/colors';
// import { IconsToast } from '@sharedEnums/iconsToast';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonLabel,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonContent,
    CommonModule,
    FormsModule,
    // HeaderComponent,
    // IonList,
    IonItem,
    IonButton,
    // IonIcon,
  ],
})
export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  user: any;

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  updateProfile(displayName: string | number | null | undefined) {
    if (this.user && typeof displayName == 'string') {
      this.userService
        .updateProfile(this.user.uid, { displayName })
        .then(() => console.log('Perfil actualizado exitosamente'))
        .catch((error) =>
          console.error('Error al actualizar el perfil', error)
        );
    }
  }
}
