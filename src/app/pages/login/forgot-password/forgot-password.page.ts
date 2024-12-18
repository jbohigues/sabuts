import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonIcon,
  IonText,
  IonInput,
} from '@ionic/angular/standalone';
import { LoginLayoutComponent } from '@layouts/loginLayout/loginLayout.component';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { LogoComponent } from '@sharedComponents/logo/logo.component';
import { UtilsService } from '@services/old/utils.service';
import { AuthService } from '@services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonText,
    IonIcon,
    IonButton,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LogoComponent,
    LoginLayoutComponent,
  ],
})
export class ForgotPasswordPage {
  // Injects
  private authService = inject(AuthService);
  private utilsService = inject(UtilsService);

  // Objects
  formAuth = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  async submit() {
    const loading = await this.utilsService.loading();
    await loading.present();
    const { email } = this.formAuth.value;
    if (email) {
      this.authService
        .sendRecoveryEmail(email)
        .then(() => {
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
