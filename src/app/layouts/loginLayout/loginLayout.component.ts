import { Component, Input } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '@sharedComponents/header/header.component';

@Component({
  selector: 'app-login-layout',
  standalone: true,
  imports: [IonContent, HeaderComponent],
  templateUrl: './loginLayout.component.html',
  styleUrl: './loginLayout.component.scss',
})
export class LoginLayoutComponent {
  @Input() pageTitle!: string;
  @Input() backButton!: string;
}
