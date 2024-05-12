import { Component } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircle,
  personCircleOutline,
  personCircleSharp,
} from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonMenu,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonMenuToggle,
  ],
})
export class HeaderComponent {
  constructor() {
    addIcons({ personCircleOutline, personCircle, personCircleSharp });
  }
}
