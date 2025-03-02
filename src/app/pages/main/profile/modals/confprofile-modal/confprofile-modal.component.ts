import { Component, inject } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { UserModel } from '@models/users.model';
import { UtilsService } from '@services/utils.service';
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
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { UserService } from '@services/user.service';
import { AlertButton } from '@ionic/core';
import { DeleteService } from '@services/delete.service';

@Component({
  selector: 'app-confprofile-modal',
  templateUrl: './confprofile-modal.component.html',
  styleUrls: ['./confprofile-modal.component.scss'],
  standalone: true,
  imports: [
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
export class ConfprofileModalComponent {
  // Injects
  private userService = inject(UserService);
  private utilsService = inject(UtilsService);
  private deleteService = inject(DeleteService);

  // Objects
  editProfileForm: FormGroup;
  currentUser: UserModel | undefined;

  // Alert
  isAlertOpen: boolean = false;
  alertHeader: string = '';
  alertMessage: string = '';
  alertButtons: AlertButton[] = [];

  constructor(private modalCtrl: ModalController) {
    this.currentUser = this.utilsService.getFromLocalStorage('user');

    this.editProfileForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20),
      ]),
      userName: new FormControl(
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(20),
        ],
        [this.checkUsernameAvailability(this.currentUser?.id)]
      ),
      backgroundColor: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      totalPoints: new FormControl(0),
    });

    this.editProfileForm.get('email')?.disable();
    this.editProfileForm.get('totalPoints')?.disable();
  }

  checkUsernameAvailability(userId?: string): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> => {
      const username = control.value;

      // Si el campo está vacío, no hacemos la validación asíncrona
      if (!username) return Promise.resolve(null);

      return this.userService.checkUsernameAvailability(username, userId).then(
        (isAvailable) => (isAvailable ? null : { usernameTaken: true }) // Si no está disponible, retornamos un error
      );
    };
  }

  ionViewWillEnter() {
    this.loadUserData();
  }

  private loadUserData() {
    if (this.currentUser) {
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
    if (this.currentUser) {
      const updatedAt = new Date();
      const { name, userName, backgroundColor } = this.editProfileForm.value;
      if (!name || !userName || !backgroundColor) return;

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
    this.deleteService.deleteAccount().subscribe({
      next: () => {
        this.utilsService.removeItemOfLocalStorage('user');
        location.reload();
      },
    });
  }
}
