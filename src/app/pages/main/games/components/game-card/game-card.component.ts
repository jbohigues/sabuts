import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonAvatar,
  IonText,
} from '@ionic/angular/standalone';
import { GameModel } from '@models/games.model';
import { UserModel } from '@models/users.model';
import { GameStatusEnum } from '@sharedEnums/states';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
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
  constructor() {}

  ngOnInit() {}

  playGame(game: GameModel) {
    // Lógica para iniciar el juego
    // this.router.navigate(['/game', game.id]);
  }
}
