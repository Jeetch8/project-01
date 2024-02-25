export const getTokenFromLocalStorage = () => {
  try {
    const token = localStorage.getItem("token");
    if (token !== undefined || token) {
      return token;
    } else return false;
  } catch (error) {
    console.log(error, "get");
    return false;
  }
};

export const setTokenInLocalStorage = (token: string) => {
  try {
    localStorage.setItem("token", token);
    return true;
  } catch (error) {
    console.log(error, "set");
    return false;
  }
};
