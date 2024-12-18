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
} from '@ionic/angular/standalone';
import { LoginLayoutComponent } from '@layouts/loginLayout/loginLayout.component';
import { LogoComponent } from '@sharedComponents/logo/logo.component';
import { AuthService } from '@services/auth.service';
import { UtilsService } from '@services/old/utils.service';
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
    const loading = await this.utilsService.loading();
    await loading.present();
    const { userName, email, password } = this.formAuth.value;
    if (email && password) {
      this.authService.register(email, password).subscribe({
        next: (user) => {
          const usermodel: UserModel = {
            id: user.uid,
            name: userName ?? '',
            email: email ?? '',
            userName: email.split('@')[0] ?? '',
            lastName: '',
            avatarid: '',
            totalPoints: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            isAdmin: false,
            active: true,
          };

          this.userService.createUser(usermodel).subscribe({
            next: () => {
              this.utilsService.saveInLocalStorage('user', usermodel);
              this.utilsService.routerLink('/home');
              this.formAuth.reset();
              this.utilsService.presentToast(
                'Usuari creat amb èxit',
                Colors.success,
                IconsToast.success_thumbs_up
              );
            },
            error: (e) => {
              console.error(e);
              this.presentError(e, loading);
            },
            complete: () => {
              loading.dismiss();
            },
          });
        },
        error: (e) => {
          console.error("Error al registrar l'usuari:", e);
          this.presentError(e, loading);
        },
      });
    }
  }

  private presentError(e: any, loading: HTMLIonLoadingElement) {
    const message = e.message.includes('email-already-in-use')
      ? 'Error: el correu electrònic ja és registrat'
      : "Error: error al registrar l'usuari";
    this.utilsService.presentToast(
      message,
      Colors.danger,
      IconsToast.danger_close_circle
    );
    loading.dismiss();
  }
}
