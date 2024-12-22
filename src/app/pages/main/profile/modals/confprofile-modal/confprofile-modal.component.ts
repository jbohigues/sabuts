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
      name: ['', [Validators.required, Validators.minLength(4)]],
      lastName: ['', [Validators.minLength(4)]],
      userName: ['', [Validators.required, Validators.minLength(4)]],
      backgroundColor: ['', [Validators.required]],
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
      const { name, lastName, userName, email, totalPoints } = this.currentUser;
      const backgroundColor = !this.currentUser.backgroundColor.includes('#')
        ? this.rgbToHex(this.currentUser.backgroundColor)
        : this.currentUser.backgroundColor;

      this.editProfileForm.patchValue({
        name,
        lastName,
        userName,
        backgroundColor,
        email,
        totalPoints,
      });
    } else location.reload();
  }

  private rgbToHex(rgb: string): string {
    const result = rgb.match(/\d+/g); // Extrae los valores numéricos del formato rgb
    if (!result) return '#000000'; // Devuelve un color por defecto si el formato no es válido

    const [r, g, b] = result.map(Number); // Convierte los valores en números
    return (
      '#' +
      [r, g, b]
        .map((x) => x.toString(16).padStart(2, '0')) // Convierte a hexadecimal y añade ceros si es necesario
        .join('')
    );
  }

  onSubmit() {
    if (this.currentUser) {
      const updatedAt = new Date();
      const { name, userName, lastName, backgroundColor } =
        this.editProfileForm.value;

      this.currentUser = {
        ...this.currentUser,
        name,
        userName,
        lastName,
        backgroundColor,
        updatedAt,
      };

      const partialUser: Partial<UserModel> = {
        name,
        userName,
        lastName,
        backgroundColor,
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

  cancelEdit() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}
