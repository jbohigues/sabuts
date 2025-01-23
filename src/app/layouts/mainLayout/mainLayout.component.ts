import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonSplitPane,
  IonIcon,
  IonMenu,
  IonContent,
  IonButton,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonText,
} from '@ionic/angular/standalone';
import { UserModel } from '@models/users.model';
import { UtilsService } from '@services/utils.service';
import { AuthService } from '@services/auth.service';
import { LogoComponent } from '@sharedComponents/logo/logo.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './mainLayout.component.html',
  styleUrls: ['./mainLayout.component.scss'],
  standalone: true,
  imports: [
    IonText,
    IonButton,
    IonIcon,
    IonSplitPane,
    IonMenu,
    CommonModule,
    FormsModule,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonIcon,
    IonButton,
    IonTabs,
    IonTabBar,
    IonTabButton,
    LogoComponent,
  ],
})
export class MainLayoutComponent implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @Input() pageTitle!: string;
  @Input() backButton!: string;

  private authService = inject(AuthService);
  private utilService = inject(UtilsService);

  user: UserModel | undefined;

  ngOnInit(): void {
    this.user = this.utilService.getFromLocalStorage('user');
  }

  protected signOut() {
    this.authService.logout().subscribe({
      next: () => {
        this.utilService.clearLocalStorage();
      },
    });
  }

  protected scrollToTop() {
    this.content.scrollToTop(500);
  }
}
