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
} from '@ionic/angular/standalone';
import { GameModel } from '@models/games.model';
import { GameService } from '@services/game.service';
import { UtilsService } from '@services/utils.service';
import { HeaderComponent } from '@sharedComponents/header/header.component';
import { TypeGame } from '@sharedEnums/games';
import { AlertController } from '@ionic/angular';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
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
export class GamesPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  private gameService = inject(GameService);
  private utilsService = inject(UtilsService);

  showScrollButton = false;
  games: GameModel[] = [];

  constructor(private alertController: AlertController) {}

  ngOnInit() {
    this.getPlayerGames();
  }

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollButton = scrollTop > 100;
  }

  scrollToTop() {
    this.content.scrollToTop(800);
  }

  startNewGame() {
    this.gameService
      .createGame(TypeGame.aleatoria)
      .then((res) => {
        console.log('then');
        // this.getPlayerGames();
      })
      .finally(() => {
        console.log('finally');
      });
  }

  refreshGames(event: any) {
    this.getPlayerGames(event);
  }

  async getPlayerGames(event?: any) {
    const loading = await this.utilsService.loading();
    await loading.present();
    this.gameService.getPlayerGames().subscribe({
      next: (res) => {
        console.log(res);
        if (res && Array.isArray(res)) this.games = res;
        if (event) event.target.complete();
      },
      error: (e) => {
        console.error(e);
      },
      complete: () => {
        loading.dismiss();
      },
    });
  }

  async confirmDelete(game: GameModel) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminació',
      message: 'Estàs segur de voler eliminar aquesta partida?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.gameService.deleteGame(game.id).subscribe({
              next: () => {
                this.getPlayerGames();

                this.utilsService.presentToast(
                  'Partida eliminada amb èxit',
                  Colors.success,
                  IconsToast.success_checkmark_circle
                );
              },
              error: (e) => {
                console.error(e);
                this.utilsService.presentToast(
                  'Error al eliminar la partida',
                  Colors.success,
                  IconsToast.success_checkmark_circle
                );
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }
}
