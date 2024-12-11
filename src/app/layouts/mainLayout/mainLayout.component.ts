import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonSplitPane,
  IonIcon,
  IonRouterOutlet,
  IonMenu,
  IonContent,
  IonAvatar,
  IonButton,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonItem,
  IonList,
  IonMenuButton,
} from '@ionic/angular/standalone';
// import { LoginService } from '@services/login.service';
// import { UserModel } from '@models/users.model';
// import { UtilsService } from '@services/utils.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './mainLayout.component.html',
  styleUrls: ['./mainLayout.component.scss'],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonTitle,
    IonButtons,
    IonToolbar,
    IonHeader,
    IonLabel,
    IonRouterOutlet,
    IonIcon,
    IonSplitPane,
    IonMenu,
    CommonModule,
    FormsModule,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonIcon,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonMenuButton,
  ],
})
export class MainLayoutComponent {
  // @ViewChild(IonContent, { static: false }) content!: IonContent;
  // @Input() pageTitle!: string;
  // @Input() backButton!: string;

  // private utilService = inject(UtilsService);
  // private loginService = inject(LoginService);

  // user: UserModel | undefined;

  // ngOnInit(): void {
  //   this.user = this.utilService.getFromLocalStorage('user');
  // }

  // signOut() {
  //   this.loginService.signOut();
  //   this.user = this.utilService.getFromLocalStorage('user');
  //   console.log(this.user);
  // }

  // scrollToTop() {
  //   this.content.scrollToTop(500);
  // }

  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
    // Redirigir al login después de cerrar sesión
  }

  getTitle() {
    // Lógica para obtener el título basado en la ruta actual
    return 'Preguntados App';
  }
}
