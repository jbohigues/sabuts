import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonList,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CustomItemComponent } from '../main/home/components/custom-item/custom-item.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonImg,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonIcon,
    IonFabButton,
    IonFab,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    CustomItemComponent,
  ],
})
export class AboutPage {
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
