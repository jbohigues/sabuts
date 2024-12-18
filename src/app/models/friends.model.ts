import { PartialUserModel } from './users.model';

export interface FriendModel {
  id?: string;
  userid: string;
  addedAt: Date;
}

export interface PartialFriendModel {
  id?: string;
  userid: string;
  addedAt: Date;
  friendUser: PartialUserModel;
}
