import { Component } from '@angular/core';
import { IonIcon, IonText, IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  imports: [IonImg, IonText, IonIcon],
  standalone: true,
})
export class LogoComponent {
  constructor() {}
}
