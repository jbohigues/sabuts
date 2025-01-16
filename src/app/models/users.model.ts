export interface PartialUserModel {
  id: string;
  name: string;
  userName: string;
  backgroundColor: string;
  avatarid: string;
  totalPoints: number;
}

export interface UserModel extends PartialUserModel {
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  active: boolean;
}

// export interface UserModelWithPassword extends UserModel {
//   password: string;
// }

// export interface User {
//   uid: string;
//   email: string;
//   displayName: string;
//   photoURL?: string;
//   stats?: UserStats;
// }

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  totalPoints: number;
}
