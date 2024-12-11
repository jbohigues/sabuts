import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonListHeader,
} from '@ionic/angular/standalone';
import { GameModel } from '@models/games.model';
import { GameService } from '@services/game.service';
import { UtilsService } from '@services/utils.service';
import { HeaderComponent } from '@sharedComponents/header/header.component';
import { TypeGame } from '@sharedEnums/games';
import { AlertController } from '@ionic/angular';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
  standalone: true,
  imports: [
    IonListHeader,
    IonTitle,
    IonToolbar,
    IonHeader,
    // IonRefresherContent,
    // IonRefresher,
    IonContent,
    // HeaderComponent,
    IonButton,
    // IonIcon,
    IonList,
    IonItem,
    IonLabel,
    // IonFab,
    // IonFabButton,
  ],
})
export class GamesPage implements OnInit {
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  activeGames: any[] = [];

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.gameService.getActiveGames(user.uid).subscribe((games) => {
          this.activeGames = games;
        });
      }
    });
  }

  continueGame(gameId: string) {
    // Implementar la navegación a la partida específica
  }
}
