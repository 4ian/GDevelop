/**
 * @memberof gdjs.evtTools
 * @class notification
 * @static
 * @private
 */

//variables
gdjs.evtTools.notification = {
  notif: [],        //used for actions
  event: [],        //used for conditions (typicply eventhandlers)
};

gdjs.evtTools.notification.requestPermission = function() {
  //Check if the user has already granted permission
  if (Notification.permission === 'granted') {
    return true;
  }

  //If they haven't ask for it
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function(status) {
      if (status === "granted") {
          return true;
      }
    });
  }

  //The user does not grant permission or does not respond to the prompt
  else {
    return false;
  }
};

gdjs.evtTools.notification.isSupported = function() {
  //Check if the window object contains a Notification
  if (!('Notification' in window)) {
    return false;
  } 
  
  //The broswer is outdated and does not support notifications
  else {
    return true;
  }
}

gdjs.evtTools.notification.createNotification = function(id, title, msg, img, lng, tag, silence, vibe) {
  //Notification configuration see https://developer.mozilla.org/en-US/docs/Web/API/Notification for more information
  const config = {
    body: msg,
    data: id,
    icon: img,
    lang: lng,
    tag: tag,
    silent: silence,
    vibrate: vibe.split(",")
  }

  gdjs.evtTools.notification.notif[id] = new Notification(title, config);

  gdjs.evtTools.notification.event[id] = gdjs.evtTools.notification.notif[id];
  gdjs.evtTools.notification.event[id].onclick = () => {gdjs.evtTools.notification.event[id] = true}
  gdjs.evtTools.notification.event[id].onshow = () => {gdjs.evtTools.notification.event[id] = true}
  gdjs.evtTools.notification.event[id].onerror = () => {gdjs.evtTools.notification.event[id] = true}
  gdjs.evtTools.notification.event[id].onclose = () => {gdjs.evtTools.notification.event[id] = true}

  console.log(gdjs.evtTools.notification);
}

gdjs.evtTools.notification.onEvent = function(id) {
  const returnValue = gdjs.evtTools.notification.event[id];
  gdjs.evtTools.notification.event[id] = false;
  gdjs.evtTools.notification.notif[id] = null;

  //console.log(gdjs.evtTools.notification);

  return returnValue;
}

gdjs.evtTools.notification.removeNotification = function(id) {
  gdjs.evtTools.notification.notif[id].close();
  gdjs.evtTools.notification.event[id] = false;

  console.log(gdjs.evtTools.notification);
}

gdjs.evtTools.notification.permissionStatus = function() {
  return typeof Notification !== "undefined" ? Notification.permission : "default";
}