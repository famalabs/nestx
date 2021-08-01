export const AUTH_OPTIONS = 'AUTH_OPTIONS';
export const PASSPORT_OPTIONS = 'PASSPORT_OPTIONS';
export const JWT_OPTIONS = 'JWT_OPTIONS';
export const LOGIN_ERRORS = {
  USER_NOT_FOUND: "This user doesn't exists.",
  USER_NOT_VERIFIED: 'Please, verify you mail.',
  WRONG_CREDENTIALS: 'Wrong credentials.',
  USER_NOT_LINKED:
    'This email address is already being used.\n' +
    'If you are the owner of the account then login and link to your third-party provider.',
  IDENTITY_LINKED: 'There is an account connected to this identity.\n' + 'Try to login with a third party provider.',
};
export const SIGNUP_ERRORS = {
  USER_ALREADY_EXISTS: 'User already exists.',
  USER_NOT_FOUND: "This user doesn't exists.",
};
export const JWT_ERRORS = {
  TOKEN_NOT_VALID: 'Token not valid.',
  MISSING: 'Missing token.',
};
export const REFRESH_TOKEN_ERRORS = {
  TOKEN_NOT_FOUND: 'Refresh token not found',
  TOKEN_EXPIRED: 'Refresh token expired',
  TOKEN_NOT_VALID: 'Refresh token not valid',
};
