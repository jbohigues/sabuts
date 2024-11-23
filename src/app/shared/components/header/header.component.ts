import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonBackButton, IonButtons, IonHeader, IonToolbar, IonTitle],
  standalone: true,
})
export class HeaderComponent {
  @Input() title!: string;
  @Input() backButton!: string;
  constructor() {}
}
