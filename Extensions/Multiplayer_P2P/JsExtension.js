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
  createExtension: function(_/*: (string) => string */, gd/*: libGDevelop */) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'P2P',
      _('Peer-to-Peer Multiplayer'),
      _(
        'Adds possibility to connect multiple game instances together via WebRTC (P2P)'
      ),
      'Arthur Pacaud (arthuro555)',
      'MIT'
    );

    extension
      .addCondition(
        'OnEvent',
        _('Banner loading'),
        _('Triggers once when a connected client sends the event.'),
        _('Event _PARAM0_ received from other client'),
        _('P2P Multiplayer'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('Event name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer_P2P/A_peer.js')
      .addIncludeFile('Extensions/Multiplayer_P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.on');

    extension
      .addAction(
        'Connect',
        _('Connect to other client'),
        _('Connects the current client to another client using it\'s id.'),
        _('Connect to P2P client _PARAM0_'),
        _('P2P Multiplayer'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('ID of the other client'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer_P2P/A_peer.js')
      .addIncludeFile('Extensions/Multiplayer_P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.connect');

    extension
      .addAction(
        'SendToAll',
        _('Send to all connected clients'),
        _('Triggers an event on all connected clients.'),
        _('Trigger event _PARAM0_ on all connected clients. (Extra data: _PARAM1_)'),
        _('P2P Multiplayer'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('Event name'), '', false)
      .addParameter('string', _('Extra data (optional)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer_P2P/A_peer.js')
      .addIncludeFile('Extensions/Multiplayer_P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.sendDataToAll');

    extension
      .addAction(
        'SendToOne',
        _('Send to one connected client'),
        _('Triggers an event on one specific connected client.'),
        _('Trigger event _PARAM1_ on _PARAM0_. (Extra data: _PARAM2_)'),
        _('P2P Multiplayer'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('ID of the other client'), '', false)
      .addParameter('string', _('Event name'), '', false)
      .addParameter('string', _('Extra data (optional)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer_P2P/A_peer.js')
      .addIncludeFile('Extensions/Multiplayer_P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.sendDataTo');

      extension
      .addAction(
        'SendToAllVariable',
        _('Send to all connected clients (variable)'),
        _('Triggers an event on all connected clients.'),
        _('Trigger event _PARAM0_ on all connected clients. (Extra data: _PARAM1_)'),
        _('P2P Multiplayer'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('Event name'), '', false)
      .addParameter('scenevar', _('Extra data as variable (optional)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer_P2P/A_peer.js')
      .addIncludeFile('Extensions/Multiplayer_P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.sendDataToAll');

    extension
      .addAction(
        'SendToOneVariable',
        _('Send to one connected client (variable)'),
        _('Triggers an event on one specific connected client.'),
        _('Trigger event _PARAM1_ on _PARAM0_. (Extra data: _PARAM2_)'),
        _('P2P Multiplayer'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('ID of the other client'), '', false)
      .addParameter('string', _('Event name'), '', false)
      .addParameter('scenevar', _('Extra data as variable (optional)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer_P2P/A_peer.js')
      .addIncludeFile('Extensions/Multiplayer_P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.sendVariableTo');

    extension
      .addAction(
        'GetEventVariable',
        _('Get event data (variable)'),
        _('Gets the variable sent with the last trigger of the passed event.'),
        _('Overwrite _PARAM1_ with variable sent with last trigger of _PARAM0_'),
        _('P2P Multiplayer'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('Event name'), '', false)
      .addParameter('scenevar', _('Extra data as variable (optional)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer_P2P/A_peer.js')
      .addIncludeFile('Extensions/Multiplayer_P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.getEventVariable');

    extension
      .addStrExpression(
        'GetEventData',
        _('Get event data'),
        _('Gets the data sent with the latest trigger of the passed event.'),
        _('P2P Multiplayer'),
        'res/actions/camera.png'
      )
      .addParameter('string', _('Event name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer_P2P/A_peer.js')
      .addIncludeFile('Extensions/Multiplayer_P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.getEventData');

    extension
      .addStrExpression(
        'GetID',
        _('Get client ID'),
        _('Gets the current client ID of the current game instance.'),
        _('P2P Multiplayer'),
        'res/actions/camera.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer_P2P/A_peer.js')
      .addIncludeFile('Extensions/Multiplayer_P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.getCurrentId');

    return extension;
  },
  runExtensionSanityTests: function(gd /*: libGDevelop */, extension /*: gdPlatformExtension*/) {
    return [];
  },
};
