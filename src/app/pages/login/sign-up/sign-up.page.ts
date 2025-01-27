import { Component, inject } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { LoginLayoutComponent } from '@layouts/loginLayout/loginLayout.component';
import { LogoComponent } from '@sharedComponents/logo/logo.component';
import { AuthService } from '@services/auth.service';
import { UtilsService } from '@services/utils.service';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { UserModel } from '@models/users.model';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [
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

  //Variables
  openLoading: boolean = false;
  showPassword: boolean = false;

  // Objects
  formAuth = new FormGroup({
    userName: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/),
    ]),
  });

  async submit() {
    this.openLoading = true;

    const { userName, email, password } = this.formAuth.value;
    if (email && password) {
      this.authService.register(email, password).subscribe({
        next: (user) => {
          const backgroundColor = this.utilsService.getRandomDarkColor();

          const usermodel: UserModel = {
            id: user.uid,
            name: userName ?? '',
            email: email ?? '',
            userName: email.split('@')[0] ?? '',
            lastName: '',
            avatarid: '',
            backgroundColor,
            totalPoints: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            isAdmin: false,
            active: true,
          };

          this.userService.createUser(usermodel).subscribe({
            next: () => {
              this.utilsService.saveInLocalStorage('user', usermodel);
              this.openLoading = false;
              setTimeout(() => {
                this.utilsService.routerLink('/home');
                this.formAuth.reset();
                this.utilsService.presentToast(
                  'Usuari creat amb èxit',
                  Colors.success,
                  IconsToast.success_thumbs_up
                );
              }, 1);
            },
            error: (e) => {
              console.error(e);
              this.openLoading = false;
              this.presentError(e);
            },
          });
        },
        error: (e) => {
          console.error("Error al registrar l'usuari:", e);
          this.presentError(e);
        },
      });
    }
  }

  private presentError(e: any) {
    const message =
      e.message.includes('email-already-in-use') ||
      e.message.includes('EMAIL_EXISTS')
        ? 'Error: el correu electrònic ja és registrat'
        : e.message.includes('invalid-email')
        ? 'Error: el correu electrònic no és vàlid'
        : "Error: error al registrar l'usuari";
    this.utilsService.presentToast(
      message,
      Colors.danger,
      IconsToast.danger_close_circle
    );
  }
}
