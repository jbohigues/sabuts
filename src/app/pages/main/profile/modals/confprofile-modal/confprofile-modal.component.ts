import { Component, inject } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { PartialUserModel, UserModel } from '@models/users.model';
import { UtilsService } from '@services/old/utils.service';
import {
  IonButton,
  IonInput,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonAvatar,
  IonBadge,
  IonFab,
  IonFabButton,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonNote,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-confprofile-modal',
  templateUrl: './confprofile-modal.component.html',
  styleUrls: ['./confprofile-modal.component.scss'],
  standalone: true,
  imports: [
    IonNote,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonIcon,
    IonFabButton,
    IonFab,
    IonBadge,
    IonAvatar,
    IonList,
    IonLabel,
    IonItem,
    IonContent,
    IonInput,
    IonButton,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ConfprofileModalComponent {
  // Injects
  private userService = inject(UserService);
  private utilsService = inject(UtilsService);

  // Objects
  editProfileForm: FormGroup;
  currentUser: UserModel | undefined;

  constructor(private fb: FormBuilder, private modalCtrl: ModalController) {
    this.editProfileForm = this.fb.group({
      avatarid: ['assets/images/default-avatar.svg'], // Ruta del avatar por defecto o actual
      name: ['', [Validators.required, Validators.minLength(4)]],
      lastName: ['', [Validators.minLength(4)]],
      userName: ['', [Validators.required, Validators.minLength(4)]],
      email: [],
      totalPoints: [],
    });
    this.editProfileForm.get('email')?.disable();
    this.editProfileForm.get('totalPoints')?.disable();
  }

  ionViewWillEnter() {
    this.loadUserData();
  }

  private loadUserData() {
    this.currentUser = this.utilsService.getFromLocalStorage('user');
    if (this.currentUser) {
      this.editProfileForm.patchValue({
        avatarid: this.currentUser.avatarid,
        name: this.currentUser.name,
        lastName: this.currentUser.lastName,
        userName: this.currentUser.userName,
        email: this.currentUser.email,
        totalPoints: this.currentUser.totalPoints,
      });
    } else location.reload();
  }

  onSubmit() {
    if (this.currentUser) {
      const updatedAt = new Date();
      const { avatarid, name, userName, lastName } = this.editProfileForm.value;

      this.currentUser = {
        ...this.currentUser,
        name,
        avatarid,
        userName,
        lastName,
        updatedAt,
      };

      const partialUser: Partial<UserModel> = {
        avatarid,
        name,
        userName,
        lastName,
        updatedAt,
      };

      this.userService.updateUser(this.currentUser!.id, partialUser).subscribe({
        next: () => {
          this.utilsService.saveInLocalStorage('user', this.currentUser);
          return this.modalCtrl.dismiss(null, 'updated');
        },
        error: (e) => {
          console.error(e);
        },
      });
    }
  }

  //TODO: hay que ver si creamos avatares personalizados
  // changeAvatar() {
  //   console.log('Abrir selector de avatar');
  //   // Implementar lógica para cambiar el avatar.
  // }

  cancelEdit() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}
