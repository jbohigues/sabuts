import { Component, Input, type OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '@sharedComponents/header/header.component';

@Component({
  selector: 'app-login-layout',
  standalone: true,
  imports: [IonContent, HeaderComponent],
  templateUrl: './loginLayout.component.html',
  styleUrl: './loginLayout.component.scss',
})
export class LoginLayoutComponent implements OnInit {
  @Input() pageTitle!: string;
  @Input() backButton!: string;

  ngOnInit(): void {}
}
