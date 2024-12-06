import { Component, ViewChild } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '@sharedComponents/header/header.component';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    HeaderComponent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonFab,
    IonFabButton,
  ],
})
export class GamesPage {
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  showScrollButton = false;

  games = [
    { id: 1, title: 'Game 1', players: 4, status: 'In Progress' },
    { id: 2, title: 'Game 2', players: 2, status: 'Waiting' },
    { id: 3, title: 'Game 3', players: 3, status: 'Completed' },
  ];

  constructor() {}

  startNewGame() {
    // Implement new game logic
    console.log('Starting new game...');
  }

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollButton = scrollTop > 100;
  }

  scrollToTop() {
    this.content.scrollToTop(800);
  }
}
