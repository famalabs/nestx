export const AUTH_OPTIONS = 'AUTH_OPTIONS';
export const LOGIN_ERRORS = {
  USER_NOT_FOUND: "This user doesn't exists.",
  USER_NOT_VERIFIED: 'Please, verify you mail.',
  WRONG_CREDENTIALS: 'Wrong credentials.',
  USER_NOT_LINKED:
    'This email address is already being used. If you are the owner of the account then login and link to your third-party provider.',
  IDENTITY_LINKED: 'There is an account connected to this identity. Try to login with a third party provider.',
};
export const SIGNUP_ERRORS = {
  USER_ALREADY_EXISTS: 'User already exists.',
  USER_NOT_FOUND: "This user doesn't exists.",
};
export const EMAIL_ERRORS = {
  USER_NOT_FOUND: "This user doesn't exists.",
  EMAIL_SENT_RECENTLY: 'Email sent recently.',
  EMAIL_NOT_SENT: 'Error sending email.',
  EMAIL_WRONG_VERIFY_CODE: 'Wrong verify code.',
};
export const RESET_PASSWORD_ERRORS = {
  WRONG_CREDENTIALS: 'Wrong credentials.',
  WRONG_TOKEN: 'Wrong token.',
  TOKEN_EXPIRED: 'Token expired.',
  RESET_ERROR: 'Reset password error.',
};
export const JWT_ERRORS = {
  TOKEN_BLACKLISTED: 'Token not valid.',
  WRONG_OWNER: 'Wrong owner.',
  TOKEN_NOT_VALID: 'Token not valid.',
};
export const REFRESH_TOKEN_ERRORS = {
  TOKEN_NOT_FOUND: 'Refresh token not found',
  TOKEN_EXPIRED: 'Refresh token expired',
};
