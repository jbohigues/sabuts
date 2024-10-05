import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonContent, IonHeader, IonToolbar, IonTitle],
  standalone: true,
})
export class HeaderComponent {
  @Input() title!: string;
  constructor() {}
}
