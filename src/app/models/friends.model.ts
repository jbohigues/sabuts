import { PartialUserModel } from './users.model';

export interface FriendModel {
  id?: string;
  friendId: string;
  addedAt: Date;
}

export interface PartialFriendModel extends FriendModel {
  friendUser: PartialUserModel;
}
