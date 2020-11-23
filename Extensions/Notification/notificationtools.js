/**
 * @memberof gdjs.evtTools
 * @namespace
 * @static
 * @public
 */

//variables
gdjs.evtTools.notification = {
  status: 'default',
  notif: [],        //used for actions
  event: [],        //used for conditions (typically eventhandlers)
};

gdjs.evtTools.notification.requestPermission = function() {
    Notification.requestPermission().then(function(status) {
      gdjs.evtTools.notification.status = status;
    });
}

gdjs.evtTools.notification.permissionGranted = function() {
  if (Notification.permission === 'granted') {
    return true
  } else {
    return false
  }
}

gdjs.evtTools.notification.isSupported = function() {
  //Check if the window object contains a Notification
  if ('Notification' in window) return true
}

gdjs.evtTools.notification.createNotification = function(id, title, body, icon, lang, requireInteraction, silent, vibrate) {
  //Notification configuration see https://developer.mozilla.org/en-US/docs/Web/API/Notification for more information
  const config = {
    body: body,
    data: id,
    icon: icon,
    lang: lang,
    requireInteraction: requireInteraction,
    silent: silent,
    vibrate: vibrate.split(",")
  }

  gdjs.evtTools.notification.notif[id] = new Notification(title, config);

  gdjs.evtTools.notification.event[id] = gdjs.evtTools.notification.notif[id];
  gdjs.evtTools.notification.event[id].onclick = () => {gdjs.evtTools.notification.event[id] = "click"}
  gdjs.evtTools.notification.event[id].onshow = () => {gdjs.evtTools.notification.event[id] = "show"}
  gdjs.evtTools.notification.event[id].onerror = () => {gdjs.evtTools.notification.event[id] = "error"}
  gdjs.evtTools.notification.event[id].onclose = () => {gdjs.evtTools.notification.event[id] = "close"}

  console.log(gdjs.evtTools.notification);
}

gdjs.evtTools.notification.onClick = function(id) {
  const returnValue = gdjs.evtTools.notification.event[id];
  gdjs.evtTools.notification.event[id] = false;
  return returnValue;
}

gdjs.evtTools.notification.onShow = function(id) {
  const returnValue = gdjs.evtTools.notification.event[id];
  gdjs.evtTools.notification.event[id] = false;
  return returnValue;
}

gdjs.evtTools.notification.onError = function(id) {
  const returnValue = gdjs.evtTools.notification.event[id];
  gdjs.evtTools.notification.event[id] = false;
  return returnValue;
}

gdjs.evtTools.notification.onClose = function(id) {
  const returnValue = gdjs.evtTools.notification.event[id];
  gdjs.evtTools.notification.event[id] = false;
  return returnValue;
}

gdjs.evtTools.notification.removeNotification = function(id) {
  gdjs.evtTools.notification.notif[id].close();
  delete gdjs.evtTools.notification.notif[id];
}
