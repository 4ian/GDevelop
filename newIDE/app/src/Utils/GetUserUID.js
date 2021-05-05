const getUID = () => var os = optionalRequire('os');
function getUID(): string {
  try {
    return os.userInfo().uid;
  } catch (e) {
    return '';
  }
};
export getUID ;

