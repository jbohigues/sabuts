import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonIcon,
  IonInput,
  IonText,
  IonButton,
  IonInputPasswordToggle,
  IonLoading,
  IonToast,
} from '@ionic/angular/standalone';
import { LogoComponent } from '@sharedComponents/logo/logo.component';
import { LoginLayoutComponent } from '@layouts/loginLayout/loginLayout.component';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { AuthService } from '@services/auth.service';
import { UtilsService } from '@services/utils.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '@services/user.service';
import { IonicStorageService } from '@services/ionicStorage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonToast,
    IonLoading,
    CommonModule,
    ReactiveFormsModule,
    LoginLayoutComponent,
    LogoComponent,
    RouterLink,
    IonText,
    IonInput,
    IonIcon,
    IonButton,
    IonInputPasswordToggle,
  ],
})
export class LoginPage {
  // Injects
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private utilsService = inject(UtilsService);
  private ionicStorageService = inject(IonicStorageService);

  // Variables
  openLoading: boolean = false;

  // Objects
  formAuth = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  // Toast
  isToastOpen: boolean = false;
  iconToast: string = '';
  colorToast: string = '';
  messageToast: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  async login() {
    this.openLoading = true;

    const { email, password } = this.formAuth.controls;
    const emailValue = email.value;
    const passwordValue = password.value;
    if (emailValue && passwordValue) {
      this.authService
        .login(emailValue.toLowerCase(), passwordValue)
        .subscribe({
          next: (user) => {
            if (!user.emailVerified) {
              this.openLoading = false;
              this.messageToast = 'Has de verificar el correu per accedir';
              this.colorToast = Colors.danger;
              this.iconToast = IconsToast.danger_close_circle;
              this.isToastOpen = true;

              this.cdr.detectChanges();
              return;
            }

            this.userService.getUserById(user.uid).subscribe({
              next: async (res) => {
                if (res) {
                  await this.ionicStorageService.set('currentUser', res);
                  this.openLoading = false;
                  this.formAuth.reset();

                  this.messageToast = `Hola ${res.userName}, benvingut/a!`;
                  this.colorToast = Colors.success;
                  this.iconToast = IconsToast.success_thumbs_up;
                  this.isToastOpen = true;

                  this.cdr.detectChanges();

                  this.utilsService.routerLink('/home');
                } else {
                  this.openLoading = false;
                  this.messageToast =
                    'Error al iniciar sessió: Credencials incorrectes';
                  this.colorToast = Colors.danger;
                  this.iconToast = IconsToast.danger_close_circle;
                  this.isToastOpen = true;

                  this.cdr.detectChanges();
                }
              },
            });
          },
          error: (err) => {
            console.error('Error en el login:', err);
            this.openLoading = false;

            this.messageToast =
              'Error al iniciar sessió: Credencials incorrectes';
            this.colorToast = Colors.danger;
            this.iconToast = IconsToast.danger_close_circle;
            this.isToastOpen = true;

            this.cdr.detectChanges();
          },
        });
    }
  }

  protected sendVerification() {
    const user = this.authService.sendEmailVerification();
    if (!user) return;

    this.messageToast = 'Si us plau, verifica el teu correu electrònic';
    this.colorToast = Colors.medium;
    this.iconToast = IconsToast.secondary_alert;
    this.isToastOpen = true;

    this.cdr.detectChanges();
  }
}
