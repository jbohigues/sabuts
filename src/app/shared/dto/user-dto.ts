export interface CreateUserDto {
  email: string;
  password: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatarId: string;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  active: boolean;
}
