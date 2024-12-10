export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserModel {
  uid: string;
  name: string;
  lastName: string;
  userName: string;
  email: string;
  avatarid: string;
  totalPoints: number;
  friendsList: string[];
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  active: boolean;
}

export interface UserModelWithPassword extends UserModel {
  password: string;
}
