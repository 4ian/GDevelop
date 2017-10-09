// See https://gist.github.com/jed/982883
const generateUUID = (a) => {
  return a
    // eslint-disable-next-line
    ? (a ^ Math.random() * 16 >> a / 4).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateUUID);
}

const localStorageKey = 'gd-user-uuid';

export const getUserUUID = () => {
    const existingUserUUID = localStorage.getItem(localStorageKey);
    if (existingUserUUID) return existingUserUUID;

    const newUserUUID = generateUUID();
    localStorage.setItem(localStorageKey, newUserUUID);
    return newUserUUID;
};
