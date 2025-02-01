import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
  IonLoading,
  IonToast,
} from '@ionic/angular/standalone';
import { LoginLayoutComponent } from '@layouts/loginLayout/loginLayout.component';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { LogoComponent } from '@sharedComponents/logo/logo.component';
import { UtilsService } from '@services/utils.service';
import { AuthService } from '@services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    IonToast,
    IonLoading,
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

  // Variables
  openLoading: boolean = false;

  // Objects
  formAuth = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  // Toast
  isToastOpen: boolean = false;
  iconToast: string = '';
  colorToast: string = '';
  messageToast: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  async submit() {
    this.openLoading = true;

    const { email } = this.formAuth.value;
    if (email) {
      this.authService
        .sendRecoveryEmail(email)
        .then(() => {
          this.openLoading = false;

          this.messageToast = 'Hem enviat un enllaç al seu correu electrònic';
          this.colorToast = Colors.medium;
          this.iconToast = IconsToast.secondary_alert;
          this.isToastOpen = true;

          this.cdr.detectChanges();

          this.utilsService.routerLink('/auth');
        })
        .catch((e) => {
          console.error(e);
          this.openLoading = false;
          const message = e.message.includes('invalid-email')
            ? 'Error: el correu electrònic no té el format correcte'
            : 'Error al enviar el correu de recuperació';

          this.messageToast = message;
          this.colorToast = Colors.danger;
          this.iconToast = IconsToast.danger_close_circle;
          this.isToastOpen = true;

          this.cdr.detectChanges();
        });
    }
  }
}
