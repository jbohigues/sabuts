import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonButton,
  IonItem,
  IonLabel,
  IonIcon,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { User } from '@models/users.model';

@Component({
  selector: 'app-friends-search',
  templateUrl: './friends-search.page.html',
  styleUrls: ['./friends-search.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonLabel,
    IonItem,
    IonButton,
    IonList,
    IonContent,
    // IonHeader,
    // IonTitle,
    // IonToolbar,
    CommonModule,
    FormsModule,
    IonSearchbar,
  ],
})
export class FriendsSearchPage {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  searchTerm: string = '';
  searchResults: User[] = [];
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.userService.searchUsers(term))
      )
      .subscribe((results) => {
        this.searchResults = results.filter(
          (res) => res.uid != this.authService.getCurrentUser()?.uid
        );
      });
  }

  ionViewWillEnter() {
    this.search();
  }

  search() {
    this.searchSubject.next(this.searchTerm);
  }

  sendFriendRequest(friendId: string) {
    const userId = this.authService.getCurrentUser()?.uid;
    if (userId) {
      this.userService
        .sendFriendRequest(userId, friendId)
        .then(() => console.log('Friend request sent'))
        .catch((error) => console.error('Error sending friend request', error));
    }
  }
}
