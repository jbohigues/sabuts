import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonApp,
  IonSplitPane,
  IonIcon,
  IonTabButton,
  IonRouterOutlet,
  IonTabBar,
  IonTabs,
  IonMenu,
  IonButton,
} from '@ionic/angular/standalone';
import { LoginService } from '@services/login.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonTabs,
    IonTabBar,
    IonRouterOutlet,
    IonTabButton,
    IonIcon,
    IonSplitPane,
    IonApp,
    IonMenu,
    CommonModule,
    FormsModule,
  ],
})
export class MainPage {
  private loginService = inject(LoginService);

  signOut() {
    this.loginService.signOut();
  }
}
