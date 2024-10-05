import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  IonItem,
  IonInput,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  imports: [IonButton, IonIcon, IonInput, IonItem, ReactiveFormsModule],
  standalone: true,
})
export class CustomInputComponent implements OnInit {
  @Input() control!: FormControl;
  @Input() icon!: string;
  @Input() type!: string;
  @Input() label!: string;
  @Input() placeholder!: string;
  @Input() autocomplete!: string;

  hide: boolean = true;
  isPassword!: boolean;

  constructor() {}

  ngOnInit(): void {
    if (this.type === 'password') this.isPassword = true;
  }

  togglePassword() {
    this.hide = !this.hide;
    if (this.hide) this.type = 'password';
    else this.type = 'text';
  }
}
