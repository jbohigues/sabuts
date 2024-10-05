import { Component } from '@angular/core';
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
  ],
})
export class AuthPage {
  formAuth = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  constructor() {}

  submit() {
    console.log(this.formAuth.value);
  }
}
