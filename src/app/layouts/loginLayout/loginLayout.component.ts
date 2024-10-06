import { Component, Input, type OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-login-layout',
  standalone: true,
  imports: [IonContent, HeaderComponent],
  templateUrl: './loginLayout.component.html',
  styleUrl: './loginLayout.component.scss',
})
export class LoginLayoutComponent implements OnInit {
  @Input() pageTitle!: string;

  ngOnInit(): void {}
}
