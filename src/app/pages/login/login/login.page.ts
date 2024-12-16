import { Component, inject } from '@angular/core';
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
  IonItem,
  IonCard,
} from '@ionic/angular/standalone';
import { LogoComponent } from '@sharedComponents/logo/logo.component';
import { LoginLayoutComponent } from '@layouts/loginLayout/loginLayout.component';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { AuthService } from '@services/auth.service';
import { UtilsService } from '@services/old/utils.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoginLayoutComponent,
    LogoComponent,
    RouterLink,
    IonText,
    IonInput,
    IonIcon,
    IonButton,
  ],
})
export class LoginPage {
  // Injects
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private utilsService = inject(UtilsService);

  // Objects
  formAuth = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  async login() {
    const loading = await this.utilsService.loading();
    await loading.present();
    const { email, password } = this.formAuth.controls;
    const emailValue = email.value;
    const passwordValue = password.value;
    if (emailValue && passwordValue) {
      this.authService.login(emailValue, passwordValue).subscribe({
        next: (user) => {
          this.userService.getUserById(user.uid).subscribe({
            next: (res) => {
              console.log(res);
              if (res) {
                this.utilsService.saveInLocalStorage('user', res);
                this.utilsService.routerLink('/home');
                this.formAuth.reset();
                this.utilsService.presentToast(
                  `Hola ${user.displayName}, benvingut/a!`,
                  Colors.success,
                  IconsToast.success_thumbs_up
                );
              } else {
                this.utilsService.presentToast(
                  'Error al iniciar sessió: Credencials incorrectes',
                  Colors.danger,
                  IconsToast.danger_close_circle
                );
              }
            },
          });
        },
        error: (err) => {
          console.error('Error en el login:', err);
          this.utilsService.presentToast(
            'Error al iniciar sessió: Credencials incorrectes',
            Colors.danger,
            IconsToast.danger_close_circle
          );
          loading.dismiss();
        },
        complete: () => {
          loading.dismiss();
        },
      });
    }
  }
}
