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
  IonChip,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonBadge,
} from '@ionic/angular/standalone';
import { GameModel } from '@models/games.model';
import { HeaderComponent } from '@sharedComponents/header/header.component';
import { TypeGame } from '@sharedEnums/games';
import { AlertController } from '@ionic/angular';
import { Colors } from '@sharedEnums/colors';
import { IconsToast } from '@sharedEnums/iconsToast';
import { GameService } from '@services/game.service';
import { UtilsService } from '@services/utils.service';
import { UserModel } from '@models/users.model';
import { GameStatusEnum } from '@sharedEnums/states';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
  standalone: true,
  imports: [
    IonBadge,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonCardHeader,
    IonCard,
    IonChip,
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
    CommonModule,
  ],
})
export class GamesPage {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  private gameService = inject(GameService);
  private utilsService = inject(UtilsService);

  // Variables
  totalScore: number = 0;
  loading: boolean = false;
  showScrollButton = false;

  // Objects
  games: GameModel[] = [];
  currentUser: UserModel | undefined;

  constructor(private alertController: AlertController) {}

  ionViewWillEnter() {
    this.loadUserData();
  }

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollButton = scrollTop > 100;
  }

  scrollToTop() {
    this.content.scrollToTop(800);
  }

  getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  getGameIcon(status: GameStatusEnum) {
    switch (status) {
      case GameStatusEnum.in_progress:
        return 'play-circle';
      case GameStatusEnum.finished:
        return 'checkmark-circle';
      default:
        return 'hourglass';
    }
  }

  getRivalName(game: GameModel) {
    if (game.player1.userId == this.currentUser?.id)
      return game.player2.userName;
    return game.player1.userName;
  }

  viewGameDetails(game: any) {
    // Implementa la navegación a los detalles del juego
  }

  protected refreshPage(event: any) {
    this.ionViewWillEnter();
    event.target.complete();
  }

  private loadUserData() {
    this.currentUser = this.utilsService.getFromLocalStorage('user');
    if (this.currentUser && this.currentUser.id)
      this.getUserInfo(this.currentUser.id);
    else location.reload();
  }

  private getUserInfo(id: string) {
    this.loading = true;

    this.gameService.getActiveGamesByUser(id).subscribe({
      next: (res) => {
        console.log(res);

        if (res) this.games = res;
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
      },
    });
  }

  startNewGame() {
    console.log('startNewGame');
    const game: GameModel = {
      currentPlayerId: '',
      currentTurn: {
        playerId: '',
        roundNumber: 0,
      },
      id: '',
      player1: {
        score: 0,
        userId: '',
        userName: '',
      },
      player2: {
        score: 0,
        userId: '',
        userName: '',
      },
      rounds: [],
      startTime: new Date(),
      updatedAt: new Date(),
      status: GameStatusEnum.in_progress,
    };
  }

  confirmDelete(game: GameModel) {
    console.log('confirmDelete');
  }

  // refreshGames(event: any) {
  //   this.getPlayerGames(event);
  // }

  // async getPlayerGames(event?: any) {
  //   const loading = await this.utilsService.loading();
  //   await loading.present();
  //   this.gameService.getActiveGamesByUser().subscribe({
  //     next: (res) => {
  //       console.log(res);
  //       if (res && Array.isArray(res)) this.games = res;
  //       if (event) event.target.complete();
  //     },
  //     error: (e) => {
  //       console.error(e);
  //     },
  //     complete: () => {
  //       loading.dismiss();
  //     },
  //   });
  // }

  // async confirmDelete(game: GameModel) {
  // const alert = await this.alertController.create({
  //   header: 'Confirmar eliminació',
  //   message: 'Estàs segur de voler eliminar aquesta partida?',
  //   buttons: [
  //     {
  //       text: 'Cancelar',
  //       role: 'cancel',
  //       cssClass: 'secondary',
  //     },
  //     {
  //       text: 'Eliminar',
  //       handler: () => {
  //         this.gameService.deleteGame(game.id).subscribe({
  //           next: () => {
  //             this.getPlayerGames();
  //             this.utilsService.presentToast(
  //               'Partida eliminada amb èxit',
  //               Colors.success,
  //               IconsToast.success_checkmark_circle
  //             );
  //           },
  //           error: (e) => {
  //             console.error(e);
  //             this.utilsService.presentToast(
  //               'Error al eliminar la partida',
  //               Colors.success,
  //               IconsToast.success_checkmark_circle
  //             );
  //           },
  //         });
  //       },
  //     },
  //   ],
  // });
  // await alert.present();
  // }
}
