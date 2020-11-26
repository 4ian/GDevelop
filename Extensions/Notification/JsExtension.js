// @flow
/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Changes in this file are watched and automatically imported if the editor
 * is running. You can also manually run `node import-GDJS-Runtime.js` (in newIDE/app/scripts).
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

/*::
// Import types to allow Flow to do static type checking on this file.
// Extensions declaration are typed using Flow (like the editor), but the files
// for the game engine are checked with TypeScript annotations.
import { type ObjectsRenderingService, type ObjectsEditorService } from '../JsExtensionTypes.flow.js'
*/

module.exports = {
  createExtension: function (
    _ /*: (string) => string */,
    gd /*: libGDevelop */
  ) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'Notification',
      _('Notification'),
      _('Use and manipulate notifications'),
      'Add00',
      'MIT'
    );

    extension
      .addCondition(
        'IsPermissionGranted',
        _('Check if permission has been granted'),
        _('Check if the user has given permission for notifications'),
        _('Check if the user has granted notification permissions'),
        _('Notification'),
        //'JsPlatform/Extensions/',
        //'JsPlatform/Extensions/'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Notification/notificationtools.js')
      .setFunctionName('gdjs.evtTools.notification.permissionGranted');

    extension
      .addCondition(
        'IsSupported',
        _('Notifications are supported'),
        _('Checks if the browser supports notifications (browser applications only).'),
        _('Notifications are supported'),
        _('Notification'),
        //'JsPlatform/Extensions/',
        //'JsPlatform/Extensions/'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Notification/notificationtools.js')
      .setFunctionName('gdjs.evtTools.notification.isSupported');

    extension
      .addCondition(
        'IsClicked',
        _('Notification has been clicked'),
        _('Check if the notification has been clicked'),
        _('Check if notification with an id of _PARAM0_ has been clicked'),
        _('Notification'),
        //'JsPlatform/Extensions/',
        //'JsPlatform/Extensions/'
      )
      .addParameter('expression', _('Id'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Notification/notificationtools.js')
      .setFunctionName('gdjs.evtTools.notification.onClick');

    extension
      .addCondition(
        'IsShown',
        _('Notification has been shown'),
        _('Check if the notification has been shown'),
        _('Check if notification with an id of _PARAM0_ has been shown'),
        _('Notification'),
        //'JsPlatform/Extensions/',
        //'JsPlatform/Extensions/'
      )
      .addParameter('expression', _('Id'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Notification/notificationtools.js')
      .setFunctionName('gdjs.evtTools.notification.onShow');

    extension
      .addCondition(
        'IsClosed',
        _('Notification has been closed'),
        _('Check if the notification has been closed'),
        _('Check if notification with an id of _PARAM0_ has been closed'),
        _('Notification'),
        //'JsPlatform/Extensions/',
        //'JsPlatform/Extensions/'
      )
      .addParameter('expression', _('Id'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Notification/notificationtools.js')
      .setFunctionName('gdjs.evtTools.notification.onClose');

    extension
      .addCondition(
        'IsError',
        _('Notification has an error'),
        _('Check if an error happend with the notification'),
        _('Check if notification with an id of _PARAM0_ has an error'),
        _('Notification'),
        //'JsPlatform/Extensions/',
        //'JsPlatform/Extensions/'
      )
      .addParameter('expression', _('Id'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Notification/notificationtools.js')
      .setFunctionName('gdjs.evtTools.notification.onError');

    extension
      .addAction(
        'RequestPermission',
        _('Request permissions for notifications'),
        _('Request permissions for notifications from the user'),
        _('Request permission for notifications from the user'),
        _('Notification'),
        //'JsPlatform/Extensions/',
        //'JsPlatform/Extensions/'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Notification/notificationtools.js')
      .setFunctionName('gdjs.evtTools.notification.requestPermission');

    extension
      .addAction(
        'CreateNotification',
        _('Create a new notification'),
        _('Create a new notification (always trigger once)'),
        _('Create a new notification with an id of _PARAM0_, a title of _PARAM1_ and a message of _PARAM2_'),
        _('Notification'),
        //'JsPlatform/Extensions/',
        //'JsPlatform/Extensions/'
      )
      .addParameter('expression', _('Id'), '', false)
      .addParameter('string', _('Title'), '', false)
      .addParameter('string', _('Message'), '', false)
      .addParameter('string', _('(Optional) file location of an image to display'), '', true)
      .addParameter('string', _('(Optional) change language of text, must be an ISO 2 Letter Language Code'), '', true)
      .addParameter('string', _('(Optional) vibrate mobile device, must be a comma separated list'), '', true)
      .addParameter('yesorno', _('(Optional) require interaction to make notification disappear'), '', true)
      .setDefaultValue('false')
      .addParameter('yesorno', _('(Optional) notification is silent'), '', true)
      .setDefaultValue('false')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Notification/notificationtools.js')
      .setFunctionName('gdjs.evtTools.notification.createNotification');

    extension
      .addAction(
        'RemoveNotification',
        _('Remove a notification'),
        _('Remove an exsiting notification'),
        _('Remove the notification with an id of _PARAM0_'),
        _('Notification'),
        //'JsPlatform/Extensions/',
        //'JsPlatform/Extensions/'
      )
      .addParameter('expression', _('Id'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Notification/notificationtools.js')
      .setFunctionName('gdjs.evtTools.notification.removeNotification');

    return extension;
  },
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};