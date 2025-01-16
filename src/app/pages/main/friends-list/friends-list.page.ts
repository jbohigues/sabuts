import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonListHeader,
  IonLabel,
  IonButton,
  IonItem,
  IonIcon,
  IonAvatar,
} from '@ionic/angular/standalone';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.page.html',
  styleUrls: ['./friends-list.page.scss'],
  standalone: true,
  imports: [
    IonAvatar,
    IonIcon,
    IonItem,
    IonButton,
    IonLabel,
    IonListHeader,
    IonList,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class FriendsListPage implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  friends: any[] = [];
  pendingRequests: any[] = [];

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.loadFriends(user.uid);
        this.loadPendingRequests(user.uid);
      }
    });
  }

  loadFriends(userId: string) {
    this.userService.getFriends(userId).subscribe((friends) => {
      this.friends = friends;
      console.log(friends);
    });
  }

  loadPendingRequests(userId: string) {
    this.userService.getPendingFriendRequests(userId).subscribe((requests) => {
      this.pendingRequests = requests;
    });
  }

  acceptFriendRequest(friendId: string) {
    const userId = this.authService.getCurrentUser()?.uid;
    if (userId) {
      this.userService
        .acceptFriendRequest(userId, friendId)
        .then(() => {
          this.loadFriends(userId);
          this.loadPendingRequests(userId);
        })
        .catch((error) =>
          console.error('Error accepting friend request', error)
        );
    }
  }

  rejectFriendRequest(friendId: string) {
    const userId = this.authService.getCurrentUser()?.uid;
    if (userId) {
      this.userService
        .rejectFriendRequest(userId, friendId)
        .then(() => this.loadPendingRequests(userId))
        .catch((error) =>
          console.error('Error rejecting friend request', error)
        );
    }
  }

  removeFriend(friendId: string) {
    const userId = this.authService.getCurrentUser()?.uid;
    if (userId) {
      this.userService
        .removeFriend(userId, friendId)
        .then(() => this.loadFriends(userId))
        .catch((error) => console.error('Error removing friend', error));
    }
  }
}
