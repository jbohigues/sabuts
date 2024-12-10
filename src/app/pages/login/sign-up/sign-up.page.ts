import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { LoginLayoutComponent } from '@layouts/loginLayout/loginLayout.component';
import { UserModel, UserModelWithPassword } from '@models/users.model';
import { LoginService } from '@services/login.service';
import { UtilsService } from '@services/utils.service';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { LogoComponent } from '@sharedComponents/logo/logo.component';
import { CustomInputComponent } from '@sharedComponents/custom-input/custom-input.component';
import { FirestoreService } from '@services/firestore.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
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
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  async submit() {
    if (this.formAuth.valid) {
      const loading = await this.utilsService.loading();
      await loading.present();

      this.loginService
        .signUp(this.formAuth.value as UserModelWithPassword)
        .then(async (res) => {
          const uid = res.user.uid;
          this.formAuth.controls.uid.setValue(uid); // Guardamos el id del usuario obtenido en el formulario
          this.setUserInfo(uid);

          // Actualizamos el nombre al hacer el registro
          if (res && this.formAuth.value.name) {
            await this.loginService.updateProfileOfUser(
              this.formAuth.value.name
            );
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

      const { uid, name, email } = this.formAuth.value;

      const usermodel: UserModel = {
        uid: uid ?? '',
        name: name ?? '',
        email: email ?? '',
        avatarid: '',
        userName: '',
        lastName: '',
        totalPoints: 0,
        friendsList: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
        active: true,
      };

      this.firestoreService
        .setDocument(`users/${iduser}`, usermodel)
        .then((res) => {
          this.utilsService.saveInLocalStorage('user', usermodel);
          this.utilsService.routerLink('/home');
          this.formAuth.reset();
          this.utilsService.presentToast(
            'Usuari creat amb èxit',
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
