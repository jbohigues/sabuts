// export interface UserCredentials {
//   email: string;
//   password: string;
// }

export interface User {
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
