import { FriendRequestStatus } from '@sharedEnums/states';

export interface FriendRequestModel {
  id?: string;
  sendingUserId: string;
  createdAt: Date;
  updatedAt: Date;
  status: FriendRequestStatus;
}
