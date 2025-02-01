import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  imports: [CommonModule, IonImg],
  standalone: true,
})
export class LogoComponent {
  @Input() sidebarLogo: boolean | undefined;
  constructor() {}
}
