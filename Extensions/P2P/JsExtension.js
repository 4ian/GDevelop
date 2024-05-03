//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />
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

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension /*: gdPlatformExtension */ = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'P2P',
        _('P2P'),
        'Allow game instances to communicate remotely using messages sent via WebRTC (P2P).',
        'Arthur Pacaud (arthuro555)',
        'MIT'
      )
      .setExtensionHelpPath('/all-features/p2p')
      .setCategory('Network');
    extension
      .addInstructionOrExpressionGroupMetadata(_('P2P'))
      .setIcon('JsPlatform/Extensions/p2picon.svg');

    extension
      .addCondition(
        'OnEvent',
        _('Event triggered by peer'),
        _('Triggers once when a connected client sends the event'),
        _('Event _PARAM0_ received from other client (data loss: _PARAM1_)'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', _('Event name'), '', false)
      .addParameter('yesorno', _('Data loss allowed?'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.onEvent');

    extension
      .addCondition(
        'IsReady',
        _('Is P2P ready'),
        _(
          'True if the peer-to-peer extension initialized and is ready to use.'
        ),
        _('Is P2P ready?'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.isReady');

    extension
      .addCondition(
        'OnError',
        _('An error occurred'),
        _(
          'Triggers once when an error occurs. ' +
            'Use P2P::GetLastError() expression to get the content of the error ' +
            'if you want to analyse it or display it to the user.'
        ),
        _('P2P error occurred'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.onError');

    extension
      .addCondition(
        'OnDisconnection',
        _('Peer disconnected'),
        _('Triggers once when a peer disconnects.'),
        _('P2P peer disconnected'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.onDisconnect');

    extension
      .addCondition(
        'OnConnection',
        _('Peer Connected'),
        _('Triggers once when a remote peer initiates a connection.'),
        _('P2P peer connected'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.onConnection');

    extension
      .addAction(
        'Connect',
        _('Connect to another client'),
        _('Connects the current client to another client using its id.'),
        _('Connect to P2P client _PARAM0_'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', _('ID of the other client'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.connect');

    extension
      .addAction(
        'UseOwnBroker',
        _('Connect to a broker server'),
        _('Connects the extension to a broker server.'),
        _('Connect to the broker server at http://_PARAM0_:_PARAM1_/'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', _('Host'), '', false)
      .addParameter('expression', _('Port'), '', false)
      .addParameter('string', _('Path'), '', false)
      .addParameter('string', _('Key'), '', false)
      .addParameter('yesorno', _('SSl enabled?'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.useCustomBrokerServer');

    extension
      .addAction(
        'UseOwnICEServer',
        _('Use a custom ICE server'),
        _(
          'Disables the default ICE (STUN or TURN) servers list and use one of your own. ' +
            'Note that it is recommended to add at least 1 self-hosted STUN and TURN server ' +
            'for games that are not over LAN but over the internet. ' +
            'This action can be used multiple times to add multiple servers. ' +
            'This action needs to be called BEFORE connecting to the broker server.'
        ),
        _('Use ICE server _PARAM0_ (username: _PARAM1_, password: _PARAM2_)'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', _('URL to the ICE server'), '', false)
      .addParameter('string', _('(Optional) Username'), '', true)
      .addParameter('string', _('(Optional) Password'), '', true)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.useCustomICECandidate');

    extension
      .addAction(
        'ForceRelayServer',
        _('Disable IP address sharing'),
        _(
          'Disables the sharing of IP addresses with the other peers. ' +
            'This action needs to be called BEFORE connecting to the broker server.'
        ),
        _('Disable IP sharing: _PARAM0_'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter(
        'yesorno',
        _('Disable sharing of IP addresses'),
        'Generally, it is recommended to keep sharing of IP addressed enabled ' +
          'to make connections faster and more often possible. ' +
          'Disabling IP address sharing will force all connections to pass messages through a ' +
          'TURN relay server, you can make P2P use one by adding one as an ICE candidate.',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.forceUseRelayServer');

    extension
      .addAction(
        'UseDefaultBroker',
        _('Connect to the default broker server'),
        _('Connects to the default broker server.'),
        _('Connect to the default broker server'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.useDefaultBrokerServer');

    extension
      .addAction(
        'OverrideID',
        _('Override the client ID'),
        _(
          'Overrides the client ID of the current game instance with a specified ID. ' +
            'Must be called BEFORE connecting to a broker.'
        ),
        _('Override the client ID with _PARAM0_'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', _('ID'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.overrideId');

    extension
      .addAction(
        'SendToAll',
        _('Trigger event on all connected clients'),
        _('Triggers an event on all connected clients'),
        _(
          'Trigger event _PARAM0_ on all connected clients (extra data: _PARAM1_)'
        ),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', _('Event name'), '', false)
      .addParameter('string', _('Extra data (optional)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.sendDataToAll');

    extension
      .addAction(
        'SendToOne',
        _('Trigger event on a specific client'),
        _('Triggers an event on a specific connected client'),
        _('Trigger event _PARAM1_ on client _PARAM0_ (extra data: _PARAM2_)'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', _('ID of the other client'), '', false)
      .addParameter('string', _('Event name'), '', false)
      .addParameter('string', _('Extra data (optional)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.sendDataTo');

    extension
      .addAction(
        'SendToAllVariable',
        _('Trigger event on all connected clients (variable)'),
        _('Triggers an event on all connected clients'),
        _(
          'Trigger event _PARAM0_ on all connected clients (extra data: _PARAM1_)'
        ),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', _('Event name'), '', false)
      .addParameter(
        'scenevar',
        _('Variable containing the extra data'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.sendVariableToAll');

    extension
      .addAction(
        'SendToOneVariable',
        _('Trigger event on a specific client (variable)'),
        _('Triggers an event on a specific connected client'),
        _('Trigger event _PARAM1_ on client _PARAM0_ (extra data: _PARAM2_)'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', _('ID of the other client'), '', false)
      .addParameter('string', _('Event name'), '', false)
      .addParameter(
        'scenevar',
        _('Variable containing the extra data'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.sendVariableTo');

    extension
      .addAction(
        'GetEventVariable',
        _('Get event data (variable)'),
        _(
          'Store the data of the specified event in a variable. ' +
            'Check in the conditions that the event was received using the "Event received" condition.'
        ),
        _(
          'Overwrite _PARAM1_ with variable sent with last trigger of _PARAM0_'
        ),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', _('Event name'), '', false)
      .addParameter(
        'scenevar',
        _('Variable where to store the received data'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.getEventVariable');

    extension
      .addAction(
        'DisconnectFromPeer',
        _('Disconnect from a peer'),
        _('Disconnects this client from another client.'),
        _('Disconnect from client _PARAM0_'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', 'ID of the peer to disconnect from', '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.disconnectFromPeer');

    extension
      .addAction(
        'DisconnectFromAllPeers',
        _('Disconnect from all peers'),
        _('Disconnects this client from all other clients.'),
        _('Disconnect from all clients'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.disconnectFromAllPeers');

    extension
      .addAction(
        'DisconnectFromBroker',
        _('Disconnect from broker'),
        _('Disconnects the client from the broker server.'),
        _('Disconnect the client from the broker'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.disconnectFromBroker');

    extension
      .addAction(
        'DisconnectFromAll',
        _('Disconnect from all'),
        _(
          'Disconnects the client from the broker server and all other clients.'
        ),
        _('Disconnect the client from the broker and other clients'),
        '',
        'JsPlatform/Extensions/p2picon.svg',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.disconnectFromAll');

    extension
      .addStrExpression(
        'GetEventData',
        _('Get event data'),
        _(
          'Returns the data received when the specified event was last triggered'
        ),
        '',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', _('Event name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.getEventData');

    extension
      .addStrExpression(
        'GetEventSender',
        _('Get event sender'),
        _('Returns the id of the peer that triggered the event'),
        '',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .addParameter('string', _('Event name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.getEventSender');

    extension
      .addStrExpression(
        'GetID',
        _('Get client ID'),
        _('Gets the client ID of the current game instance'),
        '',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.getCurrentId');

    extension
      .addStrExpression(
        'GetLastError',
        _('Get last error'),
        _('Gets the description of the last P2P error'),
        '',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.getLastError');

    extension
      .addStrExpression(
        'GetLastDisconnectedPeer',
        _('Get last disconnected peer'),
        _('Gets the ID of the latest peer that has disconnected.'),
        '',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.getDisconnectedPeer');

    extension
      .addStrExpression(
        'GetLastConnectedPeer',
        _('Get ID of the connected peer'),
        _('Gets the ID of the newly connected peer.'),
        '',
        'JsPlatform/Extensions/p2picon.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .setFunctionName('gdjs.evtTools.p2p.getConnectedPeer');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
