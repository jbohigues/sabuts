import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonText,
  IonInputPasswordToggle,
  IonLoading,
  IonToast,
} from '@ionic/angular/standalone';
import { LoginLayoutComponent } from '@layouts/loginLayout/loginLayout.component';
import { LogoComponent } from '@sharedComponents/logo/logo.component';
import { AuthService } from '@services/auth.service';
import { UtilsService } from '@services/utils.service';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { UserModel } from '@models/users.model';
import { UserService } from '@services/user.service';
import { IonicStorageService } from '@services/ionicStorage.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [
    IonToast,
    IonLoading,
    IonText,
    IonInput,
    IonButton,
    IonInputPasswordToggle,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoginLayoutComponent,
    LogoComponent,
  ],
})
export class SignUpPage {
  // Injects
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private utilsService = inject(UtilsService);
  private ionicStorageService = inject(IonicStorageService);

  //Variables
  openLoading: boolean = false;
  showPassword: boolean = false;

  // Toast
  isToastOpen: boolean = false;
  iconToast: string = '';
  colorToast: string = '';
  messageToast: string = '';

  // Objects
  formAuth = new FormGroup({
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
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/), // minus, mayus, numeros y 6caracteres (min)
    ]),
  });

  constructor(private cdr: ChangeDetectorRef) {}

  async submit() {
    this.openLoading = true;

    const { name, userName, email, password } = this.formAuth.value;
    if (!name || !userName || !email || !password) return;

    this.userService.checkUsernameAvailability(userName).then((isAvailable) => {
      if (!isAvailable) {
        this.presentError("El nom d'usuari no està disponible");
        return;
      }

      this.authService.register(email.toLowerCase(), password).subscribe({
        next: (user) => {
          const backgroundColor = this.utilsService.getRandomDarkColor();
          const usermodel: UserModel = {
            id: user.uid,
            name,
            email: email.toLowerCase(),
            userName,
            lastName: '',
            avatarid: '',
            backgroundColor,
            totalPoints: 0,
            answeredQuestions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isAdmin: false,
            active: true,
          };

          // Crear usuario y reservar nombre simultáneamente
          this.userService
            .createUserAndUsername(usermodel, userName)
            .subscribe({
              next: async () => {
                await this.ionicStorageService.set('currentUser', usermodel);
                this.openLoading = false;
                this.formAuth.reset();
                this.messageToast =
                  'Registre amb èxit. Si us plau, verifica el teu correu electrònic';
                this.colorToast = Colors.medium;
                this.iconToast = IconsToast.secondary_alert;
                this.isToastOpen = true;

                this.cdr.detectChanges();
                this.utilsService.routerLink('/login');
              },
              error: (e) => {
                const message = this.customMessage(e);

                console.error(e);
                this.presentError(message);
              },
            });
        },
        error: (e) => {
          const message = this.customMessage(e);

          console.error("Error al registrar l'usuari:", e);
          this.presentError(message);
        },
      });
    });
  }

  private customMessage(e: any) {
    return e.message.includes('email-already-in-use') ||
      e.message.includes('EMAIL_EXISTS')
      ? 'Error: el correu electrònic ja és registrat'
      : e.message.includes('invalid-email')
      ? 'Error: el correu electrònic no és vàlid'
      : "Error: error al registrar l'usuari";
  }

  private presentError(message: string) {
    this.openLoading = false;

    this.messageToast = message;
    this.colorToast = Colors.danger;
    this.iconToast = IconsToast.danger_close_circle;
    this.isToastOpen = true;

    this.cdr.detectChanges();
  }
}
