export type CreateUserParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type UserLoginParams = {
  email: string;
  password: string;
};

export type verifyUserParams = {
  email: string;
  code: string;
};
