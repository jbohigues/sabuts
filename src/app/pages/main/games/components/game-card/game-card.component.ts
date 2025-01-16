import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonAvatar,
  IonText,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonLabel,
  IonBadge,
  IonItemOption,
} from '@ionic/angular/standalone';
import { GameModel } from '@models/games.model';
import { UserModel } from '@models/users.model';
import { GameService } from '@services/game.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [
    IonItemOption,
    IonLabel,
    IonItemOptions,
    IonItem,
    IonItemSliding,
    CommonModule,
    IonIcon,
    IonAvatar,
    IonText,
  ],
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
  @Input() game!: GameModel;
  @Input() myTurn!: boolean;
  @Input() isSmallScreen!: boolean;
  @Input() currentUser!: UserModel;
  @Output() deletedEmitter = new EventEmitter<boolean>();

  private gameService = inject(GameService);

  constructor(private alertController: AlertController) {}

  ngOnInit() {}

  protected playGame(game: GameModel) {
    // Lógica para iniciar el juego
    // this.router.navigate(['/game', game.id]);
  }

  protected async confirmDeleteGame() {
    const alert = await this.alertController.create({
      header: 'Eliminar partida',
      message: `Estàs segur d'eliminar la partida amb @${this.game.player1.userName}?`,
      buttons: [
        {
          text: 'Cancel·lar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Acceptar',
          handler: () => {
            this.deleteGame();
          },
        },
      ],
    });
    await alert.present();
  }

  private deleteGame() {
    this.gameService.deleteGame(this.game.id).subscribe({
      next: (res) => {
        console.log(res);
        this.deletedEmitter.emit(true);
      },
      error: (e) => {
        console.error(e);
      },
    });
  }
}
