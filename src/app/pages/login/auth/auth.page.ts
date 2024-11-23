import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { RouterLink } from '@angular/router';
import { LoginLayoutComponent } from '../../../layouts/loginLayout/loginLayout.component';
import { LoginService } from 'src/app/services/login.service';
import { UserModel, UserModelWithPassword } from 'src/app/models/users.model';
import { UtilsService } from 'src/app/services/utils.service';
import { Colors } from 'src/app/shared/enums/colors';
import { IconsToast } from 'src/app/shared/enums/iconsToast';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    CustomInputComponent,
    ReactiveFormsModule,
    LogoComponent,
    RouterLink,
    LoginLayoutComponent,
  ],
})
export class AuthPage {
  // Injects
  loginService = inject(LoginService);
  utilsService = inject(UtilsService);
  firestoreService = inject(FirestoreService);

  // Objects
  formAuth = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  async submit() {
    if (this.formAuth.valid) {
      const loading = await this.utilsService.loading();
      await loading.present();

      this.loginService
        .signIn(this.formAuth.value as UserModelWithPassword)
        .then((res) => {
          this.getUserInfo(res.user.uid);
        })
        .catch((e) => {
          console.error(e);

          this.utilsService.presentToast(
            'Error al iniciar sessió: Credencials incorrectes',
            Colors.danger,
            IconsToast.danger_close_circle
          );
        })
        .finally(() => {
          loading.dismiss();
        });
    }
  }

  async getUserInfo(iduser: string) {
    if (this.formAuth.valid) {
      const loading = await this.utilsService.loading();
      await loading.present();

      let path = `users/${iduser}`;

      this.firestoreService
        .getDocument(path)
        .then((res) => {
          const user = res as UserModel;
          this.utilsService.saveInLocalStorage('user', user);
          this.utilsService.routerLink('/home');
          this.formAuth.reset();
          this.utilsService.presentToast(
            `Hola ${user.name}, benvingut/a!`,
            Colors.success,
            IconsToast.success_thumbs_up
          );
        })
        .catch((e) => {
          console.error(e);

          const message = e.message.includes('email-already-in-use')
            ? 'Error: el correu electrònic ja és registrat'
            : "Error: error al registrar l'usuari";

          this.utilsService.presentToast(
            message,
            Colors.danger,
            IconsToast.danger_close_circle
          );
        })
        .finally(() => {
          loading.dismiss();
        });
    }
  }
}
