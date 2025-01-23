import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonIcon,
  IonFab,
  IonFabButton,
  IonImg,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '@sharedComponents/header/header.component';
import { CustomItemComponent } from './components/custom-item/custom-item.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonImg,
    IonFabButton,
    IonFab,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonIcon,
    CustomItemComponent,
  ],
})
export class HomePage {
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  showScrollButton = false;

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollButton = scrollTop > 100;
  }

  scrollToTop() {
    this.content.scrollToTop(800);
  }
}
