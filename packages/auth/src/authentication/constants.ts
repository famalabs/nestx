export const AUTH_OPTIONS = 'AUTH_OPTIONS';
export const LOGIN_ERRORS = {
  USER_NOT_FOUND: "This user doesn't exists.",
  USER_NOT_VERIFIED: 'Please, verify you mail.',
  USER_SOCIAL: 'This is a social user. Use your social provider to login.',
  USER_LOCAL: 'This is a local user. Use your email and password to login.',
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
};
export const REFRESH_TOKEN_ERRORS = {
  TOKEN_NOT_FOUND: 'Refresh token not found',
  TOKEN_EXPIRED: 'Refresh token expired',
};
