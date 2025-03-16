export interface PartialUserModel {
  id: string;
  name: string;
  userName: string;
  email: string;
  backgroundColor: string;
  avatarid: string;
  totalPoints: number;
}

export interface UserModel extends PartialUserModel {
  lastName: string;
  answeredQuestions: string[];
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  active: boolean;
}

export interface UserModelWithPassword extends UserModel {
  password: string;
}
