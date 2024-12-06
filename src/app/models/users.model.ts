// export interface CreateUserModelDto {
//   email: string;
//   password: string;
//   userName: string;
//   firstName: string;
//   lastName: string;
//   avatarId: string;
//   totalPoints: number;
//   createdAt: Date;
//   updatedAt: Date;
//   isAdmin: boolean;
//   active: boolean;
// }

// export interface UserModel extends CreateUserModelDto {
//   id: string;
// }

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
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  active: boolean;
}

export interface UserModelWithPassword extends UserModel {
  password: string;
}
