// import { StatusModel } from './status.model';

// export interface FriendRequestModel extends FriendRequestModelDto {
//   sendingUserName: string;
//   receivingUserName: string;
// }

// export interface FriendRequestModelDto {
//   id: string;
//   sendingUserId: string;
//   receivingUserId: string;
//   createdAt: Date;
//   updatedAt: Date;
//   status: StatusModel['value'];
// }

export interface FriendRequest {
  id?: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
}
