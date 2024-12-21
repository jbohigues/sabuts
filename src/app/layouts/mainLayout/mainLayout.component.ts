import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonSplitPane,
  IonIcon,
  IonMenu,
  IonContent,
  IonAvatar,
  IonButton,
  IonTabs,
  IonTabBar,
  IonTabButton,
} from '@ionic/angular/standalone';
import { UserModel } from '@models/users.model';
import { UtilsService } from '@services/old/utils.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './mainLayout.component.html',
  styleUrls: ['./mainLayout.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonIcon,
    IonSplitPane,
    IonMenu,
    CommonModule,
    FormsModule,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonAvatar,
    IonIcon,
    IonButton,
    IonTabs,
    IonTabBar,
    IonTabButton,
  ],
})
export class MainLayoutComponent implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @Input() pageTitle!: string;
  @Input() backButton!: string;

  private authService = inject(AuthService);
  private utilService = inject(UtilsService);
  // private loginService = inject(LoginService);

  user: UserModel | undefined;

  ngOnInit(): void {
    // this.user = this.utilService.getFromLocalStorage('user');
  }

  signOut() {
    this.authService.logout().subscribe({
      next: () => {
        this.utilService.clearLocalStorage();
      },
    });
  }

  scrollToTop() {
    this.content.scrollToTop(500);
  }
}
