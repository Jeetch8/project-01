export const getTokenFromLocalStorage = (variable?: string) => {
  try {
    const token = localStorage.getItem(variable ?? 'access_token');
    if (token !== undefined || token) {
      return token;
    } else return false;
  } catch (error) {
    console.log(error, 'get');
    return false;
  }
};

export const setTokenInLocalStorage = (token: string) => {
  try {
    localStorage.setItem('access_token', token);
    return true;
  } catch (error) {
    console.log(error, 'set');
    return false;
  }
};
