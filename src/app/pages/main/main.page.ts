import { Component, inject, OnInit } from '@angular/core';
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
import { LoginService } from 'src/app/services/login.service';
import { UtilsService } from 'src/app/services/utils.service';

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
  private utilsService = inject(UtilsService);

  signOut() {
    this.loginService.signOut();
  }
}
