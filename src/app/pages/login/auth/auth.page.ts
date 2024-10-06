import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonToolbar,
  IonHeader,
  IonButton,
  IonIcon,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';
import { JsonPipe } from '@angular/common';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoginLayoutComponent } from '../../../layouts/loginLayout/loginLayout.component';
import { LoginService } from 'src/app/services/login.service';
import { UserModel } from 'src/app/models/users.model';
import { UtilsService } from 'src/app/services/utils.service';
import { Colors } from 'src/app/shared/enums/colors';
import { IconsToast } from 'src/app/shared/enums/iconsToast';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    IonRouterOutlet,
    IonIcon,
    IonButton,
    IonHeader,
    IonToolbar,
    IonContent,
    CustomInputComponent,
    ReactiveFormsModule,
    JsonPipe,
    LogoComponent,
    RouterLink,
    HeaderComponent,
    LoginLayoutComponent,
  ],
})
export class AuthPage {
  // Injects
  loginService = inject(LoginService);
  utilsService = inject(UtilsService);

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
        .signIn(this.formAuth.value as UserModel)
        .then((res) => {
          console.log(res);
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
}
