// export interface UserCredentials {
//   email: string;
//   password: string;
// }

export interface PartialUserModel {
  id?: string;
  name: string;
  userName: string;
  avatarid: string;
  totalPoints: number;
}

export interface UserModel extends PartialUserModel {
  lastName: string;
  email: string;
  friendsList: string[];
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  active: boolean;
}

export interface UserModelWithPassword extends UserModel {
  password: string;
}
