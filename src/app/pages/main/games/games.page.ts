import { Component, inject, ViewChild } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
  IonButton,
} from '@ionic/angular/standalone';
import { GameModel } from '@models/games.model';
import { HeaderComponent } from '@sharedComponents/header/header.component';
import { AlertController } from '@ionic/angular';
import { GameService } from '@services/game.service';
import { UtilsService } from '@services/utils.service';
import { UserModel } from '@models/users.model';
import { CommonModule } from '@angular/common';
import { GameCardComponent } from './components/game-card/game-card.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonText,
    IonSpinner,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    HeaderComponent,
    CommonModule,
    GameCardComponent,
  ],
})
export class GamesPage {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  private breakpointObserver = inject(BreakpointObserver);
  private gameService = inject(GameService);
  private utilsService = inject(UtilsService);

  // Variables
  totalScore: number = 0;
  loading: boolean = false;
  isSmallScreen: boolean = false;
  showScrollButton: boolean = false;

  // Objects
  gamesOriginal: GameModel[] = [];
  gamesTurnOfUser: GameModel[] = [];
  gamesTurnOfRival: GameModel[] = [];
  currentUser: UserModel | undefined;

  constructor(private alertController: AlertController) {
    this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .subscribe((result) => {
        this.isSmallScreen = result.matches; // true si es pequeño, false si no
      });
  }

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

  protected refreshPage(event: any) {
    this.ionViewWillEnter();
    event.target.complete();
  }

  // getRandomColor() {
  //   return '#' + Math.floor(Math.random() * 16777215).toString(16);
  // }

  // getGameIcon(status: GameStatusEnum) {
  //   switch (status) {
  //     case GameStatusEnum.in_progress:
  //       return 'play-circle';
  //     case GameStatusEnum.finished:
  //       return 'checkmark-circle';
  //     default:
  //       return 'hourglass';
  //   }
  // }

  // getRivalName(game: GameModel) {
  //   if (game.player1.userId == this.currentUser?.id)
  //     return game.player2.userName;
  //   return game.player1.userName;
  // }

  // viewGameDetails(game: any) {
  //   // Implementa la navegación a los detalles del juego
  // }

  // protected refreshPage(event: any) {
  //   this.ionViewWillEnter();
  //   event.target.complete();
  // }

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

        if (res) this.gamesOriginal = res;
        this.gamesTurnOfUser = this.gamesOriginal.filter(
          (games) => games.currentTurn.playerId == this.currentUser?.id
        );
        this.gamesTurnOfRival = this.gamesOriginal.filter(
          (games) => games.currentTurn.playerId != this.currentUser?.id
        );
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
      },
    });
  }

  // startNewGame() {
  //   console.log('startNewGame');
  //   const game: GameModel = {
  //     currentPlayerId: '',
  //     currentTurn: {
  //       playerId: '',
  //       roundNumber: 0,
  //     },
  //     id: '',
  //     player1: {
  //       score: 0,
  //       userId: '',
  //       userName: '',
  //     },
  //     player2: {
  //       score: 0,
  //       userId: '',
  //       userName: '',
  //     },
  //     rounds: [],
  //     startTime: new Date(),
  //     updatedAt: new Date(),
  //     status: GameStatusEnum.in_progress,
  //   };
  // }

  // confirmDelete(game: GameModel) {
  //   console.log('confirmDelete');
  // }

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
