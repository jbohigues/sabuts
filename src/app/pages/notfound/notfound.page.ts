import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { UtilsService } from '@services/utils.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.page.html',
  styleUrls: ['./notfound.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, CommonModule, FormsModule, HeaderComponent],
})
export class NotfoundPage {
  private utilsService = inject(UtilsService);

  goHome() {
    this.utilsService.routerLink('home');
  }
}
