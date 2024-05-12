import { Component, EnvironmentInjector, inject } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, ellipse, square } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: 'main-layout.page.html',
  styleUrls: ['main-layout.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonTitle,
    HeaderComponent,
  ],
})
export class MainLayoutPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({ home, ellipse, square });
  }
}
