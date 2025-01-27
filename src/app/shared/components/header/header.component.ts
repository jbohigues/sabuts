import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonMenuButton,
  IonImg,
} from '@ionic/angular/standalone';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    IonImg,
    IonBackButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonMenuButton,
  ],
  standalone: true,
})
export class HeaderComponent {
  @Input() title!: string;
  @Input() backButton!: string;
  @Input() menuButton: boolean = false;
  constructor() {}
}
