import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { UserModel } from '@models/users.model';
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
  IonAlert,
  IonToast,
  IonLoading,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { UserService } from '@services/user.service';
import { AlertButton } from '@ionic/core';
import { DeleteService } from '@services/delete.service';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { IonicStorageService } from '@services/ionicStorage.service';

@Component({
  selector: 'app-confprofile-modal',
  templateUrl: './confprofile-modal.component.html',
  styleUrls: ['./confprofile-modal.component.scss'],
  standalone: true,
  imports: [
    IonLoading,
    IonToast,
    IonAlert,
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
export class ConfprofileModalComponent implements OnInit {
  // Injects
  private userService = inject(UserService);
  private deleteService = inject(DeleteService);
  private ionicStorageService = inject(IonicStorageService);

  // Objects
  oldUserName: string = '';
  openLoading: boolean = false;
  editProfileForm: FormGroup;
  currentUser: UserModel | undefined;

  // Alert
  isAlertOpen: boolean = false;
  alertHeader: string = '';
  alertMessage: string = '';
  alertButtons: AlertButton[] = [];

  // Toast
  isToastOpen: boolean = false;
  iconToast: string = '';
  colorToast: string = '';
  messageToast: string = '';

  constructor(private modalCtrl: ModalController) {
    this.editProfileForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20),
      ]),
      userName: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20),
      ]),
      backgroundColor: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      totalPoints: new FormControl(0),
    });

    this.editProfileForm.get('email')?.disable();
    this.editProfileForm.get('totalPoints')?.disable();
  }

  async ngOnInit() {
    this.currentUser = await this.ionicStorageService.get('currentUser');
    this.loadUserData();
  }

  private loadUserData() {
    if (this.currentUser) {
      this.oldUserName = this.currentUser.userName;
      this.editProfileForm.updateValueAndValidity();
      const { name, userName, email, totalPoints } = this.currentUser;
      const backgroundColor = !this.currentUser.backgroundColor.includes('#')
        ? this.rgbToHex(this.currentUser.backgroundColor)
        : this.currentUser.backgroundColor;

      this.editProfileForm.patchValue({
        name,
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

  async onSubmit() {
    if (!this.currentUser) return;
    const updatedAt = new Date();
    const { name, userName, backgroundColor } = this.editProfileForm.value;
    if (!name || !userName || !backgroundColor) return;

    const goodUserName = userName.toLowerCase().replaceAll(' ', '_').trim();
    this.userService
      .checkUsernameAvailability(goodUserName, this.currentUser.id)
      .then((isAvailable) => {
        if (!isAvailable) {
          this.messageToast = "El nom d'usuari no està disponible";
          this.colorToast = Colors.danger;
          this.iconToast = IconsToast.danger_close_circle;
          this.isToastOpen = true;
          return;
        }

        if (!this.currentUser) return;

        this.currentUser = {
          ...this.currentUser,
          name,
          userName,
          backgroundColor,
          updatedAt,
        };

        const partialUser: Partial<UserModel> = {
          name,
          userName,
          backgroundColor,
          updatedAt,
        };

        this.userService
          .updateUser(this.currentUser!.id, partialUser, this.oldUserName)
          .subscribe({
            next: async () => {
              await this.ionicStorageService.set(
                'currentUser',
                this.currentUser
              );
              return this.modalCtrl.dismiss(null, 'updated');
            },
            error: (e) => {
              console.error(e);
              this.messageToast = e;
              this.colorToast = Colors.danger;
              this.iconToast = IconsToast.danger_close_circle;
              this.isToastOpen = true;
            },
          });
      });
  }

  cancelEdit() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  protected async showConfirmationAlert() {
    this.alertHeader = 'Eliminar compte';
    this.alertMessage =
      'Aquesta acció eliminarà permanentment el teu compte i totes les teves dades associades. Aquesta acció no es pot desfer. Estàs segur que vols continuar?';

    this.alertButtons = [
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          this.isAlertOpen = false;
        },
      },
      {
        text: 'Acceptar',
        handler: () => {
          this.deleteAccount();
        },
      },
    ];

    this.isAlertOpen = true;
  }

  async deleteAccount(): Promise<void> {
    if (!this.currentUser) return;
    this.openLoading = true;
    this.deleteService
      .deleteUserAccount(this.currentUser.id, this.currentUser.userName)
      .then(async () => {
        await this.ionicStorageService.remove('currentUser');
        location.reload();
      })
      .catch((e) => {
        console.error('Error al eliminar la cuenta:', e);
      })
      .then(() => {
        this.openLoading = false;
      });
  }
}
