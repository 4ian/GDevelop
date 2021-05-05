var os = optionalRequire('os');
function getUsername(): string {
  try {
    return os.userInfo().uid;
  } catch (e) {
    return '';
  }
}
