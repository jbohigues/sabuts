import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { LoginLayoutComponent } from '@layouts/loginLayout/loginLayout.component';
import { FirestoreService } from '@services/firestore.service';
import { LoginService } from '@services/login.service';
import { UtilsService } from '@services/utils.service';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { CustomInputComponent } from '@sharedComponents/custom-input/custom-input.component';
import { LogoComponent } from '@sharedComponents/logo/logo.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    CustomInputComponent,
    ReactiveFormsModule,
    LogoComponent,
    LoginLayoutComponent,
  ],
})
export class ForgotPasswordPage {
  // Injects
  loginService = inject(LoginService);
  utilsService = inject(UtilsService);
  firestoreService = inject(FirestoreService);

  // Objects
  formAuth = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  async submit() {
    if (this.formAuth.valid && this.formAuth.value.email) {
      const loading = await this.utilsService.loading();
      await loading.present();

      this.loginService
        .sendRecoveryEmail(this.formAuth.value.email)
        .then((res) => {
          this.utilsService.routerLink('/auth');
          this.utilsService.presentToast(
            'Hem enviat un enllaç al seu correu electrònic',
            Colors.medium,
            IconsToast.secondary_alert
          );
        })
        .catch((e) => {
          console.error(e);

          const message = e.message.includes('invalid-email')
            ? 'Error: el correu electrònic no té el format correcte'
            : 'Error al enviar el correu de recuperació';

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
