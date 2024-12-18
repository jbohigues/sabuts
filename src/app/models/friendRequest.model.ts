import { FriendRequestStatus } from '@sharedEnums/states';
import { PartialUserModel } from './users.model';

export interface FriendRequestModel {
  id?: string;
  sendingUserId: string;
  createdAt: Date;
  updatedAt: Date;
  status: FriendRequestStatus;
}

export interface PartialFriendRequestModel {
  id?: string;
  sendingUser: PartialUserModel;
  sendingUserId: string;
  createdAt: Date;
  updatedAt: Date;
  status: FriendRequestStatus;
}
