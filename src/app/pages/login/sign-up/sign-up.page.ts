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
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { LoginLayoutComponent } from '../../../layouts/loginLayout/loginLayout.component';
import { UserModel } from 'src/app/models/users.model';
import { LoginService } from 'src/app/services/login.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Colors } from 'src/app/shared/enums/colors';
import { IconsToast } from 'src/app/shared/enums/iconsToast';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoginLayoutComponent,
    LogoComponent,
    CustomInputComponent,
  ],
})
export class SignUpPage {
  // Injects
  loginService = inject(LoginService);
  utilsService = inject(UtilsService);
  firestoreService = inject(FirestoreService);

  // Objects
  formAuth = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  async submit() {
    if (this.formAuth.valid) {
      const loading = await this.utilsService.loading();
      await loading.present();

      this.loginService
        .signUp(this.formAuth.value as UserModel)
        .then((res) => {
          console.log(res);
          if (res && this.formAuth.value.name) {
            this.loginService.updateProfileOfUser(this.formAuth.value.name);
          }
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

  async setUserInfo(iduser: string) {
    if (this.formAuth.valid) {
      const loading = await this.utilsService.loading();
      await loading.present();

      let path = `users/${iduser}`;
      const user = this.formAuth.value;
      delete user.password;

      this.firestoreService
        .setDocument(path, user)
        .then((res) => {
          console.log(res);
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
