/**
 * @memberof gdjs.evtTools
 * @namespace
 */

//variables
gdjs.evtTools.notification = {
  notif: [],        //used for actions
  event: [],        //used for conditions (typically eventhandlers)
};

gdjs.evtTools.notification.requestPermission = function() {
  Notification.requestPermission()
}

gdjs.evtTools.notification.permissionGranted = function() {
  return Notification.permission === 'granted';
}

gdjs.evtTools.notification.isSupported = function() {
  //Check if the window object contains a Notification
  return typeof window.Notification !== "undefined";
}

gdjs.evtTools.notification.createNotification = function(id, title, body, icon, lang, vibrate, requireInteraction, silent) {
  //Notification configuration see https://developer.mozilla.org/en-US/docs/Web/API/Notification for more information
  const config = {
    body: body,
    icon: icon,
    lang: lang,
    vibrate: vibrate.split(","),
    requireInteraction: requireInteraction,
    silent: silent,
    tag: id
  }

  gdjs.evtTools.notification.notif[id] = new Notification(title, config);

  gdjs.evtTools.notification.event[id] = gdjs.evtTools.notification.notif[id];
  gdjs.evtTools.notification.event[id].onclick = () => {gdjs.evtTools.notification.event[id] = "click"}
  gdjs.evtTools.notification.event[id].onshow = () => {gdjs.evtTools.notification.event[id] = "show"}
  gdjs.evtTools.notification.event[id].onerror = () => {gdjs.evtTools.notification.event[id] = "error"}
  gdjs.evtTools.notification.event[id].onclose = () => {gdjs.evtTools.notification.event[id] = "close"}
}

gdjs.evtTools.notification.onClick = function(id) {
  if(gdjs.evtTools.notification.event[id] && gdjs.evtTools.notification.event[id] === "click") {
    delete gdjs.evtTools.notification.event[id];
    return true
  }
}

gdjs.evtTools.notification.onShow = function(id) {
  if(gdjs.evtTools.notification.event[id] && gdjs.evtTools.notification.event[id] === "show") {
    delete gdjs.evtTools.notification.event[id];
    return true;
  }
}

gdjs.evtTools.notification.onError = function(id) {
  if(gdjs.evtTools.notification.event[id] && gdjs.evtTools.notification.event[id] === "error") {
    delete gdjs.evtTools.notification.event[id];
    return true;
  }
}

gdjs.evtTools.notification.onClose = function(id) {
  if(gdjs.evtTools.notification.event[id] && gdjs.evtTools.notification.event[id] === "close") {
    delete gdjs.evtTools.notification.event[id];
    return true;
  }
}

gdjs.evtTools.notification.removeNotification = function(id) {
  gdjs.evtTools.notification.notif[id].close();
  delete gdjs.evtTools.notification.notif[id];
}
