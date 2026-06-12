//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />

const ICON = 'JsPlatform/Extensions/spine.svg';
const OBJECT_TYPE = 'Spine43Object';
const FULL_OBJECT_TYPE = 'Spine43Object::Spine43Object';
const DEFAULT_RUNTIME_SCRIPT_PATH = 'Extensions/Spine43Object/spine-pixi-v7.js';

const SPINE43_ZH_CN = {
  Spine: 'Spine',
  'Spine (experimental)': 'Spine\uff08\u5b9e\u9a8c\u6027\uff09',
  'Spine 4.3': 'Spine 4.3',
  'Display and animate Spine skeletons, including Spine 4.3 physics constraints.':
    '\u663e\u793a\u5e76\u64ad\u653e Spine \u9aa8\u9abc\u52a8\u753b\uff0c\u5305\u62ec Spine 4.3 \u7269\u7406\u7ea6\u675f\u3002',
  'Native Spine object with Spine 4.3 support, editor preview, physics constraint updates, bones, slots and blocking hooks.':
    '\u539f\u751f Spine \u5bf9\u8c61\uff0c\u652f\u6301 Spine 4.3\u3001\u7f16\u8f91\u5668\u9884\u89c8\u3001\u7269\u7406\u7ea6\u675f\u3001\u9aa8\u9abc\u3001\u63d2\u69fd\u548c\u963b\u6321\u94a9\u5b50\u3002',
  'Display Spine skeletons as a native object, including Spine 4.3 files.':
    '\u5c06 Spine \u9aa8\u9abc\u4f5c\u4e3a\u539f\u751f\u5bf9\u8c61\u663e\u793a\uff0c\u5305\u62ec Spine 4.3 \u6587\u4ef6\u3002',
  'Spine object': 'Spine \u5bf9\u8c61',
  'Spine resources': 'Spine \u8d44\u6e90',
  'Display and animate Spine 4.3 skeletons, including physics constraints.':
    '\u663e\u793a\u5e76\u64ad\u653e Spine 4.3 \u9aa8\u9abc\u52a8\u753b\uff0c\u5305\u62ec\u7269\u7406\u7ea6\u675f\u3002',
  'Native Spine 4.3 object with editor preview, physics constraint updates, bones, slots and blocking hooks.':
    '\u539f\u751f Spine 4.3 \u5bf9\u8c61\uff0c\u652f\u6301\u7f16\u8f91\u5668\u9884\u89c8\u3001\u7269\u7406\u7ea6\u675f\u3001\u9aa8\u9abc\u3001\u63d2\u69fd\u548c\u963b\u6321\u94a9\u5b50\u3002',
  'Display Spine 4.3 skeletons as a native object.':
    '\u5c06 Spine 4.3 \u9aa8\u9abc\u4f5c\u4e3a\u539f\u751f\u5bf9\u8c61\u663e\u793a\u3002',
  'Spine 4.3 object': 'Spine 4.3 \u5bf9\u8c61',
  'Spine 4.3 resources': 'Spine 4.3 \u8d44\u6e90',
  'Skeleton resource (.json or .skel)':
    '\u9aa8\u67b6\u8d44\u6e90\uff08.json \u6216 .skel\uff09',
  'Atlas resource': '\u56fe\u96c6\u8d44\u6e90',
  'Spine 4.3 runtime script path':
    'Spine 4.3 \u8fd0\u884c\u5e93\u811a\u672c\u8def\u5f84',
  'Skeleton is binary .skel': '\u9aa8\u67b6\u662f\u4e8c\u8fdb\u5236 .skel',
  'Import scale': '\u5bfc\u5165\u7f29\u653e',
  'Initial skin name': '\u521d\u59cb\u76ae\u80a4\u540d\u79f0',
  'Initial animation name': '\u521d\u59cb\u52a8\u753b\u540d\u79f0',
  'Initial animation override': '\u521d\u59cb\u52a8\u753b\u8986\u76d6',
  Playback: '\u64ad\u653e',
  'Loop initial animation': '\u5faa\u73af\u64ad\u653e\u521d\u59cb\u52a8\u753b',
  'Default mix duration': '\u9ed8\u8ba4\u6df7\u5408\u65f6\u957f',
  'Time scale': '\u65f6\u95f4\u6bd4\u4f8b',
  Visible: '\u53ef\u89c1',
  Opacity: '\u4e0d\u900f\u660e\u5ea6',
  Display: '\u663e\u793a',
  'Preview physics constraints in the editor':
    '\u5728\u7f16\u8f91\u5668\u4e2d\u9884\u89c8\u7269\u7406\u7ea6\u675f',
  'Maximum editor update delta':
    '\u7f16\u8f91\u5668\u6700\u5927\u66f4\u65b0\u65f6\u95f4\u95f4\u9694',
  'Editor preview': '\u7f16\u8f91\u5668\u9884\u89c8',
  'Reload Spine resources': '\u91cd\u65b0\u52a0\u8f7d Spine \u8d44\u6e90',
  'Reload _PARAM0_': '\u91cd\u65b0\u52a0\u8f7d _PARAM0_',
  'Play animation': '\u64ad\u653e\u52a8\u753b',
  'Play animation _PARAM1_ on _PARAM0_':
    '\u5728 _PARAM0_ \u4e0a\u64ad\u653e\u52a8\u753b _PARAM1_',
  'Play animation on track': '\u5728\u8f68\u9053\u4e0a\u64ad\u653e\u52a8\u753b',
  'Play _PARAM2_ on track _PARAM1_ of _PARAM0_':
    '\u5728 _PARAM0_ \u7684\u8f68\u9053 _PARAM1_ \u4e0a\u64ad\u653e _PARAM2_',
  'Queue animation': '\u6392\u961f\u64ad\u653e\u52a8\u753b',
  'Queue _PARAM2_ on track _PARAM1_ of _PARAM0_':
    '\u5c06 _PARAM2_ \u6392\u961f\u5230 _PARAM0_ \u7684\u8f68\u9053 _PARAM1_',
  'Clear track': '\u6e05\u9664\u8f68\u9053',
  'Clear track _PARAM1_ of _PARAM0_':
    '\u6e05\u9664 _PARAM0_ \u7684\u8f68\u9053 _PARAM1_',
  'Clear all tracks': '\u6e05\u9664\u6240\u6709\u8f68\u9053',
  'Clear all tracks of _PARAM0_':
    '\u6e05\u9664 _PARAM0_ \u7684\u6240\u6709\u8f68\u9053',
  'Set skin': '\u8bbe\u7f6e\u76ae\u80a4',
  'Set skin of _PARAM0_ to _PARAM1_':
    '\u5c06 _PARAM0_ \u7684\u76ae\u80a4\u8bbe\u4e3a _PARAM1_',
  'Set time scale': '\u8bbe\u7f6e\u65f6\u95f4\u6bd4\u4f8b',
  'Set time scale of _PARAM0_ to _PARAM1_':
    '\u5c06 _PARAM0_ \u7684\u65f6\u95f4\u6bd4\u4f8b\u8bbe\u4e3a _PARAM1_',
  'Set mix duration': '\u8bbe\u7f6e\u6df7\u5408\u65f6\u957f',
  'Set mix duration of _PARAM0_ to _PARAM1_':
    '\u5c06 _PARAM0_ \u7684\u6df7\u5408\u65f6\u957f\u8bbe\u4e3a _PARAM1_',
  'Set Spine visibility': '\u8bbe\u7f6e Spine \u53ef\u89c1\u6027',
  'Set visibility of _PARAM0_ to _PARAM1_':
    '\u5c06 _PARAM0_ \u7684\u53ef\u89c1\u6027\u8bbe\u4e3a _PARAM1_',
  'Set bone local position': '\u8bbe\u7f6e\u9aa8\u9abc\u5c40\u90e8\u4f4d\u7f6e',
  'Set bone _PARAM1_ position of _PARAM0_':
    '\u8bbe\u7f6e _PARAM0_ \u7684\u9aa8\u9abc _PARAM1_ \u4f4d\u7f6e',
  'Offset bone local position':
    '\u504f\u79fb\u9aa8\u9abc\u5c40\u90e8\u4f4d\u7f6e',
  'Offset bone _PARAM1_ of _PARAM0_':
    '\u504f\u79fb _PARAM0_ \u7684\u9aa8\u9abc _PARAM1_',
  'Set bone rotation': '\u8bbe\u7f6e\u9aa8\u9abc\u65cb\u8f6c',
  'Set bone _PARAM1_ rotation of _PARAM0_':
    '\u8bbe\u7f6e _PARAM0_ \u7684\u9aa8\u9abc _PARAM1_ \u65cb\u8f6c',
  'Offset bone rotation': '\u504f\u79fb\u9aa8\u9abc\u65cb\u8f6c',
  'Offset bone _PARAM1_ rotation of _PARAM0_':
    '\u504f\u79fb _PARAM0_ \u7684\u9aa8\u9abc _PARAM1_ \u65cb\u8f6c',
  'Set bone scale': '\u8bbe\u7f6e\u9aa8\u9abc\u7f29\u653e',
  'Set bone _PARAM1_ scale of _PARAM0_':
    '\u8bbe\u7f6e _PARAM0_ \u7684\u9aa8\u9abc _PARAM1_ \u7f29\u653e',
  'Offset bone scale': '\u504f\u79fb\u9aa8\u9abc\u7f29\u653e',
  'Offset bone _PARAM1_ scale of _PARAM0_':
    '\u504f\u79fb _PARAM0_ \u7684\u9aa8\u9abc _PARAM1_ \u7f29\u653e',
  'Reset bone': '\u91cd\u7f6e\u9aa8\u9abc',
  'Reset bone _PARAM1_ of _PARAM0_':
    '\u91cd\u7f6e _PARAM0_ \u7684\u9aa8\u9abc _PARAM1_',
  'Reset all bones': '\u91cd\u7f6e\u6240\u6709\u9aa8\u9abc',
  'Reset all bones of _PARAM0_':
    '\u91cd\u7f6e _PARAM0_ \u7684\u6240\u6709\u9aa8\u9abc',
  'Set bone scene position': '\u8bbe\u7f6e\u9aa8\u9abc\u573a\u666f\u4f4d\u7f6e',
  'Set bone _PARAM1_ of _PARAM0_ to scene position':
    '\u5c06 _PARAM0_ \u7684\u9aa8\u9abc _PARAM1_ \u79fb\u5230\u573a\u666f\u4f4d\u7f6e',
  'Rotate bone toward scene position':
    '\u8ba9\u9aa8\u9abc\u671d\u5411\u573a\u666f\u4f4d\u7f6e',
  'Rotate bone _PARAM1_ of _PARAM0_ toward scene position':
    '\u8ba9 _PARAM0_ \u7684\u9aa8\u9abc _PARAM1_ \u671d\u5411\u573a\u666f\u4f4d\u7f6e',
  'Set slot attachment': '\u8bbe\u7f6e\u63d2\u69fd\u9644\u4ef6',
  'Set slot _PARAM1_ attachment of _PARAM0_ to _PARAM2_':
    '\u5c06 _PARAM0_ \u7684\u63d2\u69fd _PARAM1_ \u9644\u4ef6\u8bbe\u4e3a _PARAM2_',
  'Clear slot attachments': '\u6e05\u9664\u63d2\u69fd\u9644\u4ef6',
  'Clear attachments of _PARAM0_':
    '\u6e05\u9664 _PARAM0_ \u7684\u63d2\u69fd\u9644\u4ef6',
  'Set slot color': '\u8bbe\u7f6e\u63d2\u69fd\u989c\u8272',
  'Set slot _PARAM1_ color of _PARAM0_':
    '\u8bbe\u7f6e _PARAM0_ \u7684\u63d2\u69fd _PARAM1_ \u989c\u8272',
  'Set animation progress': '\u8bbe\u7f6e\u52a8\u753b\u8fdb\u5ea6',
  'Set animation progress of _PARAM0_':
    '\u8bbe\u7f6e _PARAM0_ \u7684\u52a8\u753b\u8fdb\u5ea6',
  'Set IK constraint mix': '\u8bbe\u7f6e IK \u7ea6\u675f\u6df7\u5408',
  'Set IK constraint _PARAM1_ mix of _PARAM0_':
    '\u8bbe\u7f6e _PARAM0_ \u7684 IK \u7ea6\u675f _PARAM1_ \u6df7\u5408',
  'Set transform constraint mix':
    '\u8bbe\u7f6e\u53d8\u6362\u7ea6\u675f\u6df7\u5408',
  'Set transform constraint _PARAM1_ mix of _PARAM0_':
    '\u8bbe\u7f6e _PARAM0_ \u7684\u53d8\u6362\u7ea6\u675f _PARAM1_ \u6df7\u5408',
  'Configure bone auto reset':
    '\u914d\u7f6e\u9aa8\u9abc\u81ea\u52a8\u590d\u4f4d',
  'Configure auto reset for bone _PARAM1_ of _PARAM0_':
    '\u914d\u7f6e _PARAM0_ \u7684\u9aa8\u9abc _PARAM1_ \u81ea\u52a8\u590d\u4f4d',
  'Show debug bones': '\u663e\u793a\u8c03\u8bd5\u9aa8\u9abc',
  'Show debug bones for _PARAM0_: _PARAM1_':
    '\u663e\u793a _PARAM0_ \u8c03\u8bd5\u9aa8\u9abc\uff1a_PARAM1_',
  'Show debug extras': '\u663e\u793a\u8c03\u8bd5\u9644\u52a0\u5185\u5bb9',
  'Show debug extras for _PARAM0_: _PARAM1_':
    '\u663e\u793a _PARAM0_ \u8c03\u8bd5\u9644\u52a0\u5185\u5bb9\uff1a_PARAM1_',
  'Draw bone ellipse area': '\u7ed8\u5236\u9aa8\u9abc\u692d\u5706\u533a\u57df',
  'Draw ellipse on bone _PARAM1_ of _PARAM0_':
    '\u5728 _PARAM0_ \u7684\u9aa8\u9abc _PARAM1_ \u4e0a\u7ed8\u5236\u692d\u5706',
  'Resolve scene blocking': '\u89e3\u6790\u573a\u666f\u963b\u6321',
  'Resolve scene mesh blocking for _PARAM0_':
    '\u89e3\u6790 _PARAM0_ \u7684\u573a\u666f\u7f51\u683c\u963b\u6321',
  'Is ready': '\u5df2\u51c6\u5907\u597d',
  '_PARAM0_ is ready': '_PARAM0_ \u5df2\u51c6\u5907\u597d',
  'Is loading': '\u6b63\u5728\u52a0\u8f7d',
  '_PARAM0_ is loading': '_PARAM0_ \u6b63\u5728\u52a0\u8f7d',
  'Has loading error': '\u6709\u52a0\u8f7d\u9519\u8bef',
  '_PARAM0_ has a loading error': '_PARAM0_ \u6709\u52a0\u8f7d\u9519\u8bef',
  'Bone exists': '\u9aa8\u9abc\u5b58\u5728',
  'Bone _PARAM1_ exists in _PARAM0_':
    '_PARAM0_ \u4e2d\u5b58\u5728\u9aa8\u9abc _PARAM1_',
  'Slot exists': '\u63d2\u69fd\u5b58\u5728',
  'Slot _PARAM1_ exists in _PARAM0_':
    '_PARAM0_ \u4e2d\u5b58\u5728\u63d2\u69fd _PARAM1_',
  'Current animation is': '\u5f53\u524d\u52a8\u753b\u4e3a',
  'Current animation of _PARAM0_ is _PARAM1_':
    '_PARAM0_ \u7684\u5f53\u524d\u52a8\u753b\u4e3a _PARAM1_',
  'Event fired': '\u4e8b\u4ef6\u5df2\u89e6\u53d1',
  'Event _PARAM1_ fired on _PARAM0_':
    '_PARAM0_ \u89e6\u53d1\u4e86\u4e8b\u4ef6 _PARAM1_',
  'Animation completed': '\u52a8\u753b\u5df2\u5b8c\u6210',
  'Animation _PARAM1_ completed on _PARAM0_':
    '_PARAM0_ \u4e0a\u7684\u52a8\u753b _PARAM1_ \u5df2\u5b8c\u6210',
  'Has animation': '\u5b58\u5728\u52a8\u753b',
  'Animation _PARAM1_ exists in _PARAM0_':
    '_PARAM0_ \u4e2d\u5b58\u5728\u52a8\u753b _PARAM1_',
  'Has skin': '\u5b58\u5728\u76ae\u80a4',
  'Skin _PARAM1_ exists in _PARAM0_':
    '_PARAM0_ \u4e2d\u5b58\u5728\u76ae\u80a4 _PARAM1_',
  'Track is playing': '\u8f68\u9053\u6b63\u5728\u64ad\u653e',
  'Track _PARAM1_ is playing on _PARAM0_':
    '_PARAM0_ \u7684\u8f68\u9053 _PARAM1_ \u6b63\u5728\u64ad\u653e',
  'Track animation complete': '\u8f68\u9053\u52a8\u753b\u5df2\u5b8c\u6210',
  'Track _PARAM1_ animation is complete on _PARAM0_':
    '_PARAM0_ \u7684\u8f68\u9053 _PARAM1_ \u52a8\u753b\u5df2\u5b8c\u6210',
  'Bone is near scene position':
    '\u9aa8\u9abc\u63a5\u8fd1\u573a\u666f\u4f4d\u7f6e',
  'Bone _PARAM1_ of _PARAM0_ is near scene position':
    '_PARAM0_ \u7684\u9aa8\u9abc _PARAM1_ \u63a5\u8fd1\u573a\u666f\u4f4d\u7f6e',
  'Bone auto reset active': '\u9aa8\u9abc\u81ea\u52a8\u590d\u4f4d\u4e2d',
  'Bone _PARAM1_ of _PARAM0_ is auto resetting':
    '_PARAM0_ \u7684\u9aa8\u9abc _PARAM1_ \u6b63\u5728\u81ea\u52a8\u590d\u4f4d',
  'Scene blocked': '\u53d7\u5230\u573a\u666f\u963b\u6321',
  '_PARAM0_ is scene blocked': '_PARAM0_ \u53d7\u5230\u573a\u666f\u963b\u6321',
  'Wall slide active': '\u5899\u9762\u6ed1\u884c\u4e2d',
  '_PARAM0_ is wall sliding': '_PARAM0_ \u6b63\u5728\u5899\u9762\u6ed1\u884c',
  'Can wall jump': '\u53ef\u5899\u8df3',
  '_PARAM0_ can wall jump': '_PARAM0_ \u53ef\u4ee5\u5899\u8df3',
  'Can ledge grab': '\u53ef\u6293\u8fb9',
  '_PARAM0_ can ledge grab': '_PARAM0_ \u53ef\u4ee5\u6293\u8fb9',
  'On stable slope': '\u5728\u7a33\u5b9a\u659c\u5761\u4e0a',
  '_PARAM0_ is on a stable slope':
    '_PARAM0_ \u5728\u7a33\u5b9a\u659c\u5761\u4e0a',
  'Bone local X': '\u9aa8\u9abc\u5c40\u90e8 X',
  'Bone local Y': '\u9aa8\u9abc\u5c40\u90e8 Y',
  'Bone rotation': '\u9aa8\u9abc\u65cb\u8f6c',
  'Bone scale X': '\u9aa8\u9abc\u7f29\u653e X',
  'Bone scale Y': '\u9aa8\u9abc\u7f29\u653e Y',
  'Bone scene X': '\u9aa8\u9abc\u573a\u666f X',
  'Bone scene Y': '\u9aa8\u9abc\u573a\u666f Y',
  'Bone scene rotation': '\u9aa8\u9abc\u573a\u666f\u65cb\u8f6c',
  'Bone length': '\u9aa8\u9abc\u957f\u5ea6',
  'Bone child count': '\u9aa8\u9abc\u5b50\u7ea7\u6570\u91cf',
  'Animation duration': '\u52a8\u753b\u65f6\u957f',
  'Animation frame': '\u52a8\u753b\u5e27',
  'Event integer value': '\u4e8b\u4ef6\u6574\u6570\u503c',
  'Event float value': '\u4e8b\u4ef6\u5c0f\u6570\u503c',
  'Bone auto reset progress':
    '\u9aa8\u9abc\u81ea\u52a8\u590d\u4f4d\u8fdb\u5ea6',
  'Scene block normal X': '\u573a\u666f\u963b\u6321\u6cd5\u7ebf X',
  'Scene block normal Y': '\u573a\u666f\u963b\u6321\u6cd5\u7ebf Y',
  'Current slope angle': '\u5f53\u524d\u659c\u5761\u89d2\u5ea6',
  'Current slope speed scale':
    '\u5f53\u524d\u659c\u5761\u901f\u5ea6\u500d\u7387',
  'Last wall contact normal X':
    '\u6700\u8fd1\u5899\u9762\u63a5\u89e6\u6cd5\u7ebf X',
  'Last collision strength': '\u6700\u8fd1\u78b0\u649e\u5f3a\u5ea6',
  'Bone parent name': '\u9aa8\u9abc\u7236\u7ea7\u540d\u79f0',
  'Current attachment name': '\u5f53\u524d\u9644\u4ef6\u540d\u79f0',
  'Event string value': '\u4e8b\u4ef6\u6587\u672c\u503c',
  'Debug info': '\u8c03\u8bd5\u4fe1\u606f',
  'Last collision object name':
    '\u6700\u8fd1\u78b0\u649e\u5bf9\u8c61\u540d\u79f0',
  'Scene blocked wall name': '\u573a\u666f\u963b\u6321\u5899\u540d\u79f0',
  'Animation name': '\u52a8\u753b\u540d\u79f0',
  Loop: '\u5faa\u73af',
  'Track index': '\u8f68\u9053\u7d22\u5f15',
  'Delay in seconds': '\u5ef6\u8fdf\uff08\u79d2\uff09',
  'Skin name': '\u76ae\u80a4\u540d\u79f0',
  'Duration in seconds': '\u6301\u7eed\u65f6\u95f4\uff08\u79d2\uff09',
  'Bone name': '\u9aa8\u9abc\u540d\u79f0',
  'Bone names': '\u9aa8\u9abc\u540d\u79f0\u5217\u8868',
  'Delta X': '\u504f\u79fb X',
  'Delta Y': '\u504f\u79fb Y',
  Rotation: '\u65cb\u8f6c',
  'Delta rotation': '\u65cb\u8f6c\u504f\u79fb',
  'Scale X': '\u7f29\u653e X',
  'Scale Y': '\u7f29\u653e Y',
  'Delta scale X': '\u7f29\u653e\u504f\u79fb X',
  'Delta scale Y': '\u7f29\u653e\u504f\u79fb Y',
  'Scene X': '\u573a\u666f X',
  'Scene Y': '\u573a\u666f Y',
  'Offset angle': '\u504f\u79fb\u89d2\u5ea6',
  'Slot name': '\u63d2\u69fd\u540d\u79f0',
  'Attachment name': '\u9644\u4ef6\u540d\u79f0',
  'Red 0-255': '\u7ea2\u8272 0-255',
  'Green 0-255': '\u7eff\u8272 0-255',
  'Blue 0-255': '\u84dd\u8272 0-255',
  'Alpha 0-1': '\u900f\u660e\u5ea6 0-1',
  'Progress 0-1': '\u8fdb\u5ea6 0-1',
  'Constraint name': '\u7ea6\u675f\u540d\u79f0',
  Mix: '\u6df7\u5408',
  Channel: '\u901a\u9053',
  Enabled: '\u542f\u7528',
  Delay: '\u5ef6\u8fdf',
  Duration: '\u6301\u7eed\u65f6\u95f4',
  'Radius X': '\u534a\u5f84 X',
  'Radius Y': '\u534a\u5f84 Y',
  Radius: '\u534a\u5f84',
  Color: '\u989c\u8272',
  'Current X': '\u5f53\u524d X',
  'Current Y': '\u5f53\u524d Y',
  'Previous X': '\u4e0a\u4e00\u5e27 X',
  'Previous Y': '\u4e0a\u4e00\u5e27 Y',
  'Event name': '\u4e8b\u4ef6\u540d\u79f0',
  X: 'X',
  Y: 'Y',
};

const getSpine43Translation = (translate, source) => {
  const translated = translate(source);
  if (translated && translated !== source) return translated;

  const documentLanguage =
    typeof document !== 'undefined' &&
    document.documentElement &&
    document.documentElement.lang
      ? document.documentElement.lang
      : '';
  const language =
    documentLanguage ||
    (typeof navigator !== 'undefined' && navigator.language
      ? navigator.language
      : '');
  if (/^zh(?:-|$)/i.test(language)) {
    return SPINE43_ZH_CN[source] || source;
  }
  return source;
};

const getContent = (objectConfiguration) => {
  const object = gd.castObject(objectConfiguration, gd.ObjectJsImplementation);
  return object.content || {};
};

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const tr = (source) => getSpine43Translation(_, source);
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'Spine43Object',
        tr('Spine (experimental)'),
        tr(
          'Display and animate Spine skeletons, including Spine 4.3 physics constraints.'
        ),
        'OpenAI Codex / Spine43SpriteShell migration',
        'Open source (MIT License)'
      )
      .setShortDescription(
        tr(
          'Native Spine object with Spine 4.3 support, editor preview, physics constraint updates, bones, slots and blocking hooks.'
        )
      )
      .setDimension('2D')
      .setExtensionHelpPath('/objects/spine43')
      .setCategory('Advanced');

    extension
      .addInstructionOrExpressionGroupMetadata(tr('Spine'))
      .setIcon(ICON);

    const spine43Object = new gd.ObjectJsImplementation();
    spine43Object.content = {
      opacity: 255,
      runtimeScriptPath: DEFAULT_RUNTIME_SCRIPT_PATH,
      skeletonResource: '',
      atlasResource: '',
      binaryData: false,
      importScale: 1,
      skinName: '',
      animationName: '',
      loop: true,
      mixDuration: 0.2,
      timeScale: 1,
      visible: true,
      editorPhysicsPreview: true,
      editorMaxDelta: 0.05,
      editorAnimationPreview: {
        playing: true,
        progress: 0,
        lockProgress: false,
      },
      inspectorOverrides: {
        bones: {},
        constraints: {},
        slots: {},
      },
      meshPreview: {
        showAllSlots: true,
        slotName: '',
      },
    };

    spine43Object.updateProperty = function (propertyName, newValue) {
      const content = this.content;
      if (propertyName === 'RuntimeScriptPath') {
        content.runtimeScriptPath = newValue;
        return true;
      }
      if (propertyName === 'SkeletonResource') {
        content.skeletonResource = newValue;
        return true;
      }
      if (propertyName === 'AtlasResource') {
        content.atlasResource = newValue;
        return true;
      }
      if (propertyName === 'BinaryData') {
        content.binaryData = newValue === '1';
        return true;
      }
      if (propertyName === 'ImportScale') {
        content.importScale = parseFloat(newValue) || 1;
        return true;
      }
      if (propertyName === 'SkinName') {
        content.skinName = newValue;
        return true;
      }
      if (propertyName === 'AnimationName') {
        content.animationName = newValue;
        return true;
      }
      if (propertyName === 'Loop') {
        content.loop = newValue === '1';
        return true;
      }
      if (propertyName === 'MixDuration') {
        content.mixDuration = parseFloat(newValue) || 0;
        return true;
      }
      if (propertyName === 'TimeScale') {
        content.timeScale = parseFloat(newValue) || 1;
        return true;
      }
      if (propertyName === 'Opacity') {
        content.opacity = parseFloat(newValue) || 255;
        return true;
      }
      if (propertyName === 'Visible') {
        content.visible = newValue === '1';
        return true;
      }
      if (propertyName === 'EditorPhysicsPreview') {
        content.editorPhysicsPreview = newValue === '1';
        return true;
      }
      if (propertyName === 'EditorMaxDelta') {
        content.editorMaxDelta = parseFloat(newValue) || 0.05;
        return true;
      }
      return false;
    };

    spine43Object.getProperties = function () {
      const properties = new gd.MapStringPropertyDescriptor();
      const content = this.content;

      properties
        .getOrCreate('SkeletonResource')
        .setValue(content.skeletonResource)
        .setType('resource')
        .addExtraInfo('spine')
        .setLabel(tr('Skeleton resource (.json or .skel)'))
        .setGroup(tr('Spine resources'));
      properties
        .getOrCreate('AtlasResource')
        .setValue(content.atlasResource)
        .setType('resource')
        .addExtraInfo('atlas')
        .setLabel(tr('Atlas resource'))
        .setGroup(tr('Spine resources'));
      properties
        .getOrCreate('BinaryData')
        .setValue(content.binaryData ? 'true' : 'false')
        .setType('boolean')
        .setLabel(tr('Skeleton is binary .skel'))
        .setGroup(tr('Spine resources'));
      properties
        .getOrCreate('ImportScale')
        .setValue(String(content.importScale || 1))
        .setType('number')
        .setLabel(tr('Import scale'))
        .setGroup(tr('Spine resources'));

      properties
        .getOrCreate('Loop')
        .setValue(content.loop ? 'true' : 'false')
        .setType('boolean')
        .setLabel(tr('Loop initial animation'))
        .setGroup(tr('Playback'));
      properties
        .getOrCreate('MixDuration')
        .setValue(String(content.mixDuration || 0))
        .setType('number')
        .setLabel(tr('Default mix duration'))
        .setGroup(tr('Playback'));
      properties
        .getOrCreate('TimeScale')
        .setValue(String(content.timeScale || 1))
        .setType('number')
        .setLabel(tr('Time scale'))
        .setGroup(tr('Playback'));

      properties
        .getOrCreate('Visible')
        .setValue(content.visible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(tr('Visible'))
        .setGroup(tr('Display'));
      properties
        .getOrCreate('Opacity')
        .setValue(String(content.opacity || 255))
        .setType('number')
        .setLabel(tr('Opacity'))
        .setGroup(tr('Display'));

      properties
        .getOrCreate('EditorPhysicsPreview')
        .setValue(content.editorPhysicsPreview ? 'true' : 'false')
        .setType('boolean')
        .setLabel(tr('Preview physics constraints in the editor'))
        .setGroup(tr('Editor preview'));
      properties
        .getOrCreate('EditorMaxDelta')
        .setValue(String(content.editorMaxDelta || 0.05))
        .setType('number')
        .setLabel(tr('Maximum editor update delta'))
        .setGroup(tr('Editor preview'));

      return properties;
    };

    spine43Object.updateInitialInstanceProperty = function (
      instance,
      propertyName,
      newValue
    ) {
      if (propertyName === 'AnimationName') {
        instance.setRawStringProperty('animationName', newValue);
        return true;
      }
      return false;
    };

    spine43Object.getInitialInstanceProperties = function (instance) {
      const properties = new gd.MapStringPropertyDescriptor();
      return properties;
    };

    const object = extension
      .addObject(
        OBJECT_TYPE,
        tr('Spine (experimental)'),
        tr(
          'Display Spine skeletons as a native object, including Spine 4.3 files.'
        ),
        ICON,
        // @ts-ignore - ObjectJsImplementation is accepted by JS extensions.
        spine43Object
      )
      .setIncludeFile('Extensions/Spine43Object/spine43runtimeobject.js')
      .addIncludeFile('Extensions/Spine43Object/spine43-gdevelop-runtime.js')
      .addIncludeFile('Extensions/Spine43Object/spine-pixi-v7.js')
      .setCategory('Advanced')
      .addDefaultBehavior('EffectCapability::EffectBehavior')
      .addDefaultBehavior('ResizableCapability::ResizableBehavior')
      .addDefaultBehavior('ScalableCapability::ScalableBehavior')
      .addDefaultBehavior('FlippableCapability::FlippableBehavior')
      .addDefaultBehavior('OpacityCapability::OpacityBehavior');

    const addObjectParameter = (metadata) =>
      metadata.addParameter('object', tr('Spine object'), OBJECT_TYPE, false);

    const addAction = (name, fullName, sentence, parameters, functionName) => {
      let metadata = object.addAction(
        name,
        fullName,
        fullName,
        sentence,
        tr('Spine'),
        ICON,
        ICON
      );
      metadata = addObjectParameter(metadata);
      for (const parameter of parameters) {
        metadata = metadata.addParameter(
          parameter.type,
          parameter.label,
          parameter.supplementaryInformation || '',
          !!parameter.optional
        );
      }
      metadata.getCodeExtraInformation().setFunctionName(functionName);
      return metadata;
    };

    const addCondition = (
      name,
      fullName,
      sentence,
      parameters,
      functionName
    ) => {
      let metadata = object.addCondition(
        name,
        fullName,
        fullName,
        sentence,
        tr('Spine'),
        ICON,
        ICON
      );
      metadata = addObjectParameter(metadata);
      for (const parameter of parameters) {
        metadata = metadata.addParameter(
          parameter.type,
          parameter.label,
          parameter.supplementaryInformation || '',
          !!parameter.optional
        );
      }
      metadata.getCodeExtraInformation().setFunctionName(functionName);
      return metadata;
    };

    const addNumberExpression = (name, fullName, parameters, functionName) => {
      let metadata = object.addExpression(
        name,
        fullName,
        fullName,
        tr('Spine'),
        ICON
      );
      metadata = addObjectParameter(metadata);
      for (const parameter of parameters) {
        metadata = metadata.addParameter(
          parameter.type,
          parameter.label,
          parameter.supplementaryInformation || '',
          !!parameter.optional
        );
      }
      metadata.getCodeExtraInformation().setFunctionName(functionName);
      return metadata;
    };

    const addStringExpression = (name, fullName, parameters, functionName) => {
      let metadata = object.addStrExpression(
        name,
        fullName,
        fullName,
        tr('Spine'),
        ICON
      );
      metadata = addObjectParameter(metadata);
      for (const parameter of parameters) {
        metadata = metadata.addParameter(
          parameter.type,
          parameter.label,
          parameter.supplementaryInformation || '',
          !!parameter.optional
        );
      }
      metadata.getCodeExtraInformation().setFunctionName(functionName);
      return metadata;
    };

    const stringParam = (label) => ({ type: 'string', label });
    const spine43StringParam = (label, nameKind) => ({
      type: 'string',
      label,
      supplementaryInformation: nameKind,
    });
    const animationParam = (label) =>
      spine43StringParam(label, 'spine43AnimationName');
    const skinParam = (label) => spine43StringParam(label, 'spine43SkinName');
    const slotParam = (label) => spine43StringParam(label, 'spine43SlotName');
    const attachmentParam = (label) =>
      spine43StringParam(label, 'spine43AttachmentName');
    const numberParam = (label) => ({ type: 'expression', label });
    const yesNoParam = (label) => ({ type: 'yesorno', label });

    addAction(
      'Reload',
      tr('Reload Spine resources'),
      tr('Reload _PARAM0_'),
      [],
      'reload'
    );
    addAction(
      'PlayAnimation',
      tr('Play animation'),
      tr('Play animation _PARAM1_ on _PARAM0_'),
      [animationParam(tr('Animation name')), yesNoParam(tr('Loop'))],
      'playAnimation'
    );
    addAction(
      'SetAnimationOnTrack',
      tr('Play animation on track'),
      tr('Play _PARAM2_ on track _PARAM1_ of _PARAM0_'),
      [
        numberParam(tr('Track index')),
        animationParam(tr('Animation name')),
        yesNoParam(tr('Loop')),
      ],
      'setAnimationOnTrack'
    );
    addAction(
      'AddAnimation',
      tr('Queue animation'),
      tr('Queue _PARAM2_ on track _PARAM1_ of _PARAM0_'),
      [
        numberParam(tr('Track index')),
        animationParam(tr('Animation name')),
        yesNoParam(tr('Loop')),
        numberParam(tr('Delay in seconds')),
      ],
      'addAnimation'
    );
    addAction(
      'ClearTrack',
      tr('Clear track'),
      tr('Clear track _PARAM1_ of _PARAM0_'),
      [numberParam(tr('Track index'))],
      'clearTrack'
    );
    addAction(
      'ClearTracks',
      tr('Clear all tracks'),
      tr('Clear all tracks of _PARAM0_'),
      [],
      'clearTracks'
    );
    addAction(
      'SetSkin',
      tr('Set skin'),
      tr('Set skin of _PARAM0_ to _PARAM1_'),
      [skinParam(tr('Skin name'))],
      'setSkin'
    );
    addAction(
      'SetTimeScale',
      tr('Set time scale'),
      tr('Set time scale of _PARAM0_ to _PARAM1_'),
      [numberParam(tr('Time scale'))],
      'setTimeScale'
    );
    addAction(
      'SetMixDuration',
      tr('Set mix duration'),
      tr('Set mix duration of _PARAM0_ to _PARAM1_'),
      [numberParam(tr('Duration in seconds'))],
      'setMixDuration'
    );
    addAction(
      'SetVisible',
      tr('Set Spine visibility'),
      tr('Set visibility of _PARAM0_ to _PARAM1_'),
      [yesNoParam(tr('Visible'))],
      'setVisible'
    );

    addAction(
      'SetBonePosition',
      tr('Set bone local position'),
      tr('Set bone _PARAM1_ position of _PARAM0_'),
      [
        stringParam(tr('Bone name')),
        numberParam(tr('X')),
        numberParam(tr('Y')),
      ],
      'setBonePosition'
    );
    addAction(
      'OffsetBonePosition',
      tr('Offset bone local position'),
      tr('Offset bone _PARAM1_ of _PARAM0_'),
      [
        stringParam(tr('Bone name')),
        numberParam(tr('Delta X')),
        numberParam(tr('Delta Y')),
      ],
      'offsetBonePosition'
    );
    addAction(
      'SetBoneRotation',
      tr('Set bone rotation'),
      tr('Set bone _PARAM1_ rotation of _PARAM0_'),
      [stringParam(tr('Bone name')), numberParam(tr('Rotation'))],
      'setBoneRotation'
    );
    addAction(
      'OffsetBoneRotation',
      tr('Offset bone rotation'),
      tr('Offset bone _PARAM1_ rotation of _PARAM0_'),
      [stringParam(tr('Bone name')), numberParam(tr('Delta rotation'))],
      'offsetBoneRotation'
    );
    addAction(
      'SetBoneScale',
      tr('Set bone scale'),
      tr('Set bone _PARAM1_ scale of _PARAM0_'),
      [
        stringParam(tr('Bone name')),
        numberParam(tr('Scale X')),
        numberParam(tr('Scale Y')),
      ],
      'setBoneScale'
    );
    addAction(
      'OffsetBoneScale',
      tr('Offset bone scale'),
      tr('Offset bone _PARAM1_ scale of _PARAM0_'),
      [
        stringParam(tr('Bone name')),
        numberParam(tr('Delta scale X')),
        numberParam(tr('Delta scale Y')),
      ],
      'offsetBoneScale'
    );
    addAction(
      'ResetBone',
      tr('Reset bone'),
      tr('Reset bone _PARAM1_ of _PARAM0_'),
      [stringParam(tr('Bone name'))],
      'resetBone'
    );
    addAction(
      'ResetAllBones',
      tr('Reset all bones'),
      tr('Reset all bones of _PARAM0_'),
      [],
      'resetAllBones'
    );
    addAction(
      'SetBoneScenePosition',
      tr('Set bone scene position'),
      tr('Set bone _PARAM1_ of _PARAM0_ to scene position'),
      [
        stringParam(tr('Bone name')),
        numberParam(tr('Scene X')),
        numberParam(tr('Scene Y')),
      ],
      'setBoneScenePosition'
    );
    addAction(
      'SetBoneSceneRotationToward',
      tr('Rotate bone toward scene position'),
      tr('Rotate bone _PARAM1_ of _PARAM0_ toward scene position'),
      [
        stringParam(tr('Bone name')),
        numberParam(tr('Scene X')),
        numberParam(tr('Scene Y')),
        numberParam(tr('Offset angle')),
      ],
      'setBoneSceneRotationToward'
    );

    addAction(
      'SetAttachment',
      tr('Set slot attachment'),
      tr('Set slot _PARAM1_ attachment of _PARAM0_ to _PARAM2_'),
      [slotParam(tr('Slot name')), attachmentParam(tr('Attachment name'))],
      'setAttachment'
    );
    addAction(
      'ClearAttachments',
      tr('Clear slot attachments'),
      tr('Clear attachments of _PARAM0_'),
      [],
      'clearAttachments'
    );
    addAction(
      'SetSlotColor',
      tr('Set slot color'),
      tr('Set slot _PARAM1_ color of _PARAM0_'),
      [
        slotParam(tr('Slot name')),
        numberParam(tr('Red 0-255')),
        numberParam(tr('Green 0-255')),
        numberParam(tr('Blue 0-255')),
        numberParam(tr('Alpha 0-1')),
      ],
      'setSlotColor'
    );
    addAction(
      'SetAnimationProgress',
      tr('Set animation progress'),
      tr('Set animation progress of _PARAM0_'),
      [numberParam(tr('Track index')), numberParam(tr('Progress 0-1'))],
      'setAnimationProgress'
    );
    addAction(
      'SetIkConstraintMix',
      tr('Set IK constraint mix'),
      tr('Set IK constraint _PARAM1_ mix of _PARAM0_'),
      [stringParam(tr('Constraint name')), numberParam(tr('Mix'))],
      'setIkConstraintMix'
    );
    addAction(
      'SetTransformConstraintMix',
      tr('Set transform constraint mix'),
      tr('Set transform constraint _PARAM1_ mix of _PARAM0_'),
      [stringParam(tr('Constraint name')), numberParam(tr('Mix'))],
      'setTransformConstraintMix'
    );
    addAction(
      'ConfigureBoneAutoReset',
      tr('Configure bone auto reset'),
      tr('Configure auto reset for bone _PARAM1_ of _PARAM0_'),
      [
        stringParam(tr('Bone names')),
        stringParam(tr('Channel')),
        yesNoParam(tr('Enabled')),
        numberParam(tr('Delay')),
        numberParam(tr('Duration')),
      ],
      'configureBoneAutoReset'
    );
    addAction(
      'SetDebugVisible',
      tr('Show debug bones'),
      tr('Show debug bones for _PARAM0_: _PARAM1_'),
      [yesNoParam(tr('Visible'))],
      'setDebugVisible'
    );
    addAction(
      'SetDebugExtrasVisible',
      tr('Show debug extras'),
      tr('Show debug extras for _PARAM0_: _PARAM1_'),
      [yesNoParam(tr('Visible'))],
      'setDebugExtrasVisible'
    );
    addAction(
      'DrawBoneEllipse',
      tr('Draw bone ellipse area'),
      tr('Draw ellipse on bone _PARAM1_ of _PARAM0_'),
      [
        stringParam(tr('Bone name')),
        numberParam(tr('Radius X')),
        numberParam(tr('Radius Y')),
        stringParam(tr('Color')),
      ],
      'drawBoneEllipse'
    );
    addAction(
      'ResolveSceneBlocking',
      tr('Resolve scene blocking'),
      tr('Resolve scene mesh blocking for _PARAM0_'),
      [
        numberParam(tr('Current X')),
        numberParam(tr('Current Y')),
        numberParam(tr('Previous X')),
        numberParam(tr('Previous Y')),
      ],
      'resolveSceneBlocking'
    );

    addCondition(
      'IsReady',
      tr('Is ready'),
      tr('_PARAM0_ is ready'),
      [],
      'isReady'
    );
    addCondition(
      'IsLoading',
      tr('Is loading'),
      tr('_PARAM0_ is loading'),
      [],
      'isLoading'
    );
    addCondition(
      'HasError',
      tr('Has loading error'),
      tr('_PARAM0_ has a loading error'),
      [],
      'hasError'
    );
    addCondition(
      'BoneExists',
      tr('Bone exists'),
      tr('Bone _PARAM1_ exists in _PARAM0_'),
      [stringParam(tr('Bone name'))],
      'boneExists'
    );
    addCondition(
      'SlotExists',
      tr('Slot exists'),
      tr('Slot _PARAM1_ exists in _PARAM0_'),
      [slotParam(tr('Slot name'))],
      'slotExists'
    );
    addCondition(
      'CurrentAnimationIs',
      tr('Current animation is'),
      tr('Current animation of _PARAM0_ is _PARAM1_'),
      [animationParam(tr('Animation name'))],
      'currentAnimationIs'
    );
    addCondition(
      'EventFired',
      tr('Event fired'),
      tr('Event _PARAM1_ fired on _PARAM0_'),
      [stringParam(tr('Event name'))],
      'eventFired'
    );
    addCondition(
      'AnimationCompleted',
      tr('Animation completed'),
      tr('Animation _PARAM1_ completed on _PARAM0_'),
      [animationParam(tr('Animation name'))],
      'animationCompleted'
    );
    addCondition(
      'HasAnimation',
      tr('Has animation'),
      tr('Animation _PARAM1_ exists in _PARAM0_'),
      [animationParam(tr('Animation name'))],
      'hasAnimation'
    );
    addCondition(
      'HasSkin',
      tr('Has skin'),
      tr('Skin _PARAM1_ exists in _PARAM0_'),
      [skinParam(tr('Skin name'))],
      'hasSkin'
    );
    addCondition(
      'IsPlayingOnTrack',
      tr('Track is playing'),
      tr('Track _PARAM1_ is playing on _PARAM0_'),
      [numberParam(tr('Track index'))],
      'isPlayingOnTrack'
    );
    addCondition(
      'IsTrackAnimationComplete',
      tr('Track animation complete'),
      tr('Track _PARAM1_ animation is complete on _PARAM0_'),
      [numberParam(tr('Track index'))],
      'isTrackAnimationComplete'
    );
    addCondition(
      'IsBoneNearPosition',
      tr('Bone is near scene position'),
      tr('Bone _PARAM1_ of _PARAM0_ is near scene position'),
      [
        stringParam(tr('Bone name')),
        numberParam(tr('Scene X')),
        numberParam(tr('Scene Y')),
        numberParam(tr('Radius')),
      ],
      'isBoneNearPosition'
    );
    addCondition(
      'BoneAutoResetActive',
      tr('Bone auto reset active'),
      tr('Bone _PARAM1_ of _PARAM0_ is auto resetting'),
      [stringParam(tr('Bone name')), stringParam(tr('Channel'))],
      'isBoneAutoResetActive'
    );
    addCondition(
      'SceneBlocked',
      tr('Scene blocked'),
      tr('_PARAM0_ is scene blocked'),
      [],
      'isSceneBlocked'
    );
    addCondition(
      'WallSlideActive',
      tr('Wall slide active'),
      tr('_PARAM0_ is wall sliding'),
      [],
      'isWallSlideActive'
    );
    addCondition(
      'CanWallJump',
      tr('Can wall jump'),
      tr('_PARAM0_ can wall jump'),
      [],
      'canWallJump'
    );
    addCondition(
      'CanLedgeGrab',
      tr('Can ledge grab'),
      tr('_PARAM0_ can ledge grab'),
      [],
      'canLedgeGrab'
    );
    addCondition(
      'OnStableSlope',
      tr('On stable slope'),
      tr('_PARAM0_ is on a stable slope'),
      [],
      'isOnStableSlope'
    );

    addNumberExpression('TimeScaleValue', tr('Time scale'), [], 'getTimeScale');
    addNumberExpression(
      'BoneX',
      tr('Bone local X'),
      [stringParam(tr('Bone name'))],
      'getBoneX'
    );
    addNumberExpression(
      'BoneY',
      tr('Bone local Y'),
      [stringParam(tr('Bone name'))],
      'getBoneY'
    );
    addNumberExpression(
      'BoneRotation',
      tr('Bone rotation'),
      [stringParam(tr('Bone name'))],
      'getBoneRotation'
    );
    addNumberExpression(
      'BoneScaleX',
      tr('Bone scale X'),
      [stringParam(tr('Bone name'))],
      'getBoneScaleX'
    );
    addNumberExpression(
      'BoneScaleY',
      tr('Bone scale Y'),
      [stringParam(tr('Bone name'))],
      'getBoneScaleY'
    );
    addNumberExpression(
      'BoneSceneX',
      tr('Bone scene X'),
      [stringParam(tr('Bone name'))],
      'getBoneSceneX'
    );
    addNumberExpression(
      'BoneSceneY',
      tr('Bone scene Y'),
      [stringParam(tr('Bone name'))],
      'getBoneSceneY'
    );
    addNumberExpression(
      'BoneSceneRotation',
      tr('Bone scene rotation'),
      [stringParam(tr('Bone name'))],
      'getBoneSceneRotation'
    );
    addNumberExpression(
      'BoneLength',
      tr('Bone length'),
      [stringParam(tr('Bone name'))],
      'getBoneLength'
    );
    addNumberExpression(
      'BoneChildCount',
      tr('Bone child count'),
      [stringParam(tr('Bone name'))],
      'getBoneChildCount'
    );
    addNumberExpression(
      'AnimationDuration',
      tr('Animation duration'),
      [animationParam(tr('Animation name'))],
      'getAnimationDuration'
    );
    addNumberExpression(
      'AnimationFrame',
      tr('Animation frame'),
      [numberParam(tr('Track index'))],
      'getAnimationFrame'
    );
    addNumberExpression(
      'EventInt',
      tr('Event integer value'),
      [],
      'getEventInt'
    );
    addNumberExpression(
      'EventFloat',
      tr('Event float value'),
      [],
      'getEventFloat'
    );
    addNumberExpression(
      'BoneAutoResetProgress',
      tr('Bone auto reset progress'),
      [stringParam(tr('Bone name')), stringParam(tr('Channel'))],
      'getBoneAutoResetProgress'
    );
    addNumberExpression(
      'SceneBlockNormalX',
      tr('Scene block normal X'),
      [],
      'getSceneBlockNormalX'
    );
    addNumberExpression(
      'SceneBlockNormalY',
      tr('Scene block normal Y'),
      [],
      'getSceneBlockNormalY'
    );
    addNumberExpression(
      'CurrentSlopeAngle',
      tr('Current slope angle'),
      [],
      'getCurrentSlopeAngle'
    );
    addNumberExpression(
      'CurrentSlopeSpeedScale',
      tr('Current slope speed scale'),
      [],
      'getCurrentSlopeSpeedScale'
    );
    addNumberExpression(
      'LastWallContactNormalX',
      tr('Last wall contact normal X'),
      [],
      'getLastWallContactNormalX'
    );
    addNumberExpression(
      'LastCollisionStrength',
      tr('Last collision strength'),
      [],
      'getLastCollisionStrength'
    );

    addStringExpression(
      'BoneParentName',
      tr('Bone parent name'),
      [stringParam(tr('Bone name'))],
      'getBoneParentName'
    );
    addStringExpression(
      'CurrentAttachmentName',
      tr('Current attachment name'),
      [slotParam(tr('Slot name'))],
      'getCurrentAttachmentName'
    );
    addStringExpression(
      'EventString',
      tr('Event string value'),
      [],
      'getEventString'
    );
    addStringExpression('DebugInfo', tr('Debug info'), [], 'getDebugInfo');
    addStringExpression(
      'LastCollisionObjectName',
      tr('Last collision object name'),
      [],
      'getLastCollisionObjectName'
    );
    addStringExpression(
      'SceneBlockedWallName',
      tr('Scene blocked wall name'),
      [],
      'getSceneBlockedWallName'
    );

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    return [];
  },

  registerEditorConfigurations: function (objectsEditorService) {
    const objectsEditorServiceAny = /** @type {any} */ (objectsEditorService);
    if (
      objectsEditorServiceAny.editorConfigurations &&
      objectsEditorServiceAny.editorConfigurations[FULL_OBJECT_TYPE]
    ) {
      return;
    }

    objectsEditorService.registerEditorConfiguration(
      FULL_OBJECT_TYPE,
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/spine43',
      })
    );
  },

  registerInstanceRenderers: function (objectsRenderingService) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;
    const EDITOR_RUNTIME_BASE_URL =
      'http://127.0.0.1:5002/Runtime/Extensions/Spine43Object/';
    const normalizePath = (value) => String(value || '').replace(/\\/g, '/');
    const isAbsoluteUrl = (value) =>
      /^(?:https?:|file:|data:|blob:)/i.test(String(value || ''));
    const getNodeRequire = () => {
      if (
        typeof global !== 'undefined' &&
        typeof global.require === 'function'
      ) {
        return global.require;
      }
      if (
        typeof window !== 'undefined' &&
        typeof window.require === 'function'
      ) {
        return window.require;
      }
      return null;
    };
    const toFileUrl = (absolutePath) => {
      const nodeRequire = getNodeRequire();
      if (nodeRequire) {
        try {
          const nodeUrl = nodeRequire('url');
          if (nodeUrl && nodeUrl.pathToFileURL) {
            return nodeUrl.pathToFileURL(absolutePath).toString();
          }
        } catch (error) {
          // Fall back to a manually-built file URL below.
        }
      }
      return 'file:///' + normalizePath(absolutePath).replace(/^\/+/, '');
    };
    const resolveEditorResourceUrl = (project, resourceNameOrFile) => {
      const value = String(resourceNameOrFile || '').trim();
      if (!value) return '';

      let file = value;
      try {
        const resourcesManager =
          project &&
          project.getResourcesManager &&
          project.getResourcesManager();
        if (resourcesManager && resourcesManager.hasResource(value)) {
          const resource = resourcesManager.getResource(value);
          if (resource && resource.getFile) {
            file = resource.getFile();
          }
        }
      } catch (error) {
        file = value;
      }

      if (!file || isAbsoluteUrl(file)) return file;

      const nodeRequire = getNodeRequire();
      try {
        if (nodeRequire && project && project.getProjectFile) {
          const nodePath = nodeRequire('path');
          const projectFile = project.getProjectFile();
          if (projectFile) {
            const projectDirectory = nodePath.dirname(projectFile);
            return toFileUrl(nodePath.resolve(projectDirectory, file));
          }
        }
      } catch (error) {
        // Keep the original value when the editor cannot resolve local paths.
      }

      if (/^[a-zA-Z]:[\\/]/.test(file)) {
        return toFileUrl(file);
      }

      return file;
    };
    const toErrorMessage = (error, fallback) => {
      if (!error) return fallback;
      if (error.message) return error.message;
      if (error.type && error.target && error.target.src) {
        return `${error.type}: ${error.target.src}`;
      }
      return String(error);
    };
    const rejectScriptLoad = (reject, url, event) => {
      if (event && event.preventDefault) event.preventDefault();
      if (event && event.stopPropagation) event.stopPropagation();
      reject(new Error(`Failed to load Spine 4.3 editor script: ${url}`));
      return true;
    };
    const getEditorWindow = () => /** @type {any} */ (window);
    const loadEditorScriptFromLocalFile = (filename) => {
      const nodeRequire = getNodeRequire();
      if (!nodeRequire || typeof __dirname === 'undefined') return null;

      try {
        const nodeFs = nodeRequire('fs');
        const nodePath = nodeRequire('path');
        const filePath = nodePath.join(__dirname, filename);
        const source = nodeFs.readFileSync(filePath, 'utf8');
        const sourceUrl = toFileUrl(filePath);
        const existing = document.querySelector(
          'script[data-gd-spine43-editor="' + sourceUrl + '"]'
        );
        if (existing && existing.getAttribute('data-loaded') === '1') {
          return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
          try {
            const script = document.createElement('script');
            script.setAttribute('data-gd-spine43-editor', sourceUrl);
            script.text = `${source}\n//# sourceURL=${sourceUrl}`;
            document.head.appendChild(script);
            script.setAttribute('data-loaded', '1');
            resolve(undefined);
          } catch (error) {
            reject(
              new Error(
                `Failed to evaluate Spine 4.3 editor script ${sourceUrl}: ${toErrorMessage(
                  error,
                  'unknown error'
                )}`
              )
            );
          }
        });
      } catch (error) {
        return Promise.reject(
          new Error(
            `Failed to read Spine 4.3 editor script ${filename}: ${toErrorMessage(
              error,
              'unknown error'
            )}`
          )
        );
      }
    };

    const loadEditorScript = (filename) => {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.reject(new Error('Editor window is not available.'));
      }
      getEditorWindow().PIXI = PIXI;
      if (
        filename === 'spine43-gdevelop-runtime.js' &&
        getEditorWindow().GDSpine43Adapter
      ) {
        return Promise.resolve();
      }
      if (filename === 'spine-pixi-v7.js' && window.spine) {
        return Promise.resolve();
      }

      const localScriptPromise = loadEditorScriptFromLocalFile(filename);
      if (localScriptPromise) return localScriptPromise;

      const url = EDITOR_RUNTIME_BASE_URL + filename;
      const existing = document.querySelector(
        'script[data-gd-spine43-editor="' + url + '"]'
      );
      if (existing) {
        if (existing.getAttribute('data-loaded') === '1') {
          return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
          existing.addEventListener('load', () => resolve(undefined), {
            once: true,
          });
          existing.addEventListener(
            'error',
            (event) => rejectScriptLoad(reject, url, event),
            { once: true, capture: true }
          );
        });
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.src = url;
        script.setAttribute('data-gd-spine43-editor', url);
        script.addEventListener(
          'load',
          () => {
            script.setAttribute('data-loaded', '1');
            resolve(undefined);
          },
          { once: true }
        );
        script.addEventListener(
          'error',
          (event) => rejectScriptLoad(reject, url, event),
          { once: true, capture: true }
        );
        document.head.appendChild(script);
      });
    };

    const ensureEditorRuntime = () =>
      loadEditorScript('spine-pixi-v7.js').then(() =>
        loadEditorScript('spine43-gdevelop-runtime.js')
      );

    class RenderedSpine43Instance extends RenderedInstance {
      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );

        this._placeholder = new PIXI.Sprite(
          this._pixiResourcesLoader.getInvalidPIXITexture()
        );
        this._placeholder.alpha = 0;
        this._pixiObject = new PIXI.Container();
        this._pixiObject.addChild(this._placeholder);
        this._pixiContainer.addChild(this._pixiObject);
        this._handle = null;
        this._loadingKey = '';
        this._loadingPromise = null;
        this._lastError = null;
        this._lastUpdateTime = undefined;
        this._lastAnimationName = undefined;
        this._lastSkinName = undefined;
        this._defaultWidth = 256;
        this._defaultHeight = 256;
        this._spineOriginOffsetX = 0;
        this._spineOriginOffsetY = 0;
        this._displayScaleX = 1;
        this._displayScaleY = 1;
        this._lastPhysicsSceneX = undefined;
        this._lastPhysicsSceneY = undefined;
        this._lastPhysicsSceneAngle = undefined;

        this._loadSpine();
      }

      _getSpineBounds() {
        if (this._handle && getEditorWindow().GDSpine43Adapter) {
          try {
            if (getEditorWindow().GDSpine43Adapter.getSceneAttachmentBounds) {
              const attachmentBounds =
                getEditorWindow().GDSpine43Adapter.getSceneAttachmentBounds(
                  this._handle
                );
              if (
                attachmentBounds &&
                Number.isFinite(attachmentBounds.left) &&
                Number.isFinite(attachmentBounds.top) &&
                Number.isFinite(attachmentBounds.right) &&
                Number.isFinite(attachmentBounds.bottom) &&
                attachmentBounds.right > attachmentBounds.left &&
                attachmentBounds.bottom > attachmentBounds.top
              ) {
                return {
                  x: attachmentBounds.left,
                  y: attachmentBounds.top,
                  width: attachmentBounds.right - attachmentBounds.left,
                  height: attachmentBounds.bottom - attachmentBounds.top,
                };
              }
            }
          } catch (error) {}
        }

        if (
          this._handle &&
          this._handle.container &&
          this._handle.container.getLocalBounds
        ) {
          try {
            const bounds = this._handle.container.getLocalBounds();
            if (
              bounds &&
              Number.isFinite(bounds.x) &&
              Number.isFinite(bounds.y) &&
              Number.isFinite(bounds.width) &&
              Number.isFinite(bounds.height) &&
              bounds.width > 0 &&
              bounds.height > 0
            ) {
              return bounds;
            }
          } catch (error) {}
        }

        return null;
      }

      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return ICON;
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        this._destroyHandle();
        this._pixiObject.destroy({ children: true, texture: false });
      }

      _destroyHandle() {
        if (this._handle && getEditorWindow().GDSpine43Adapter) {
          getEditorWindow().GDSpine43Adapter.destroyInstance(this._handle);
        }
        this._handle = null;
      }

      _makeLoadingKey(content) {
        return [
          content.runtimeScriptPath || DEFAULT_RUNTIME_SCRIPT_PATH,
          this._resolveProjectResourceFile(content.skeletonResource || ''),
          this._resolveProjectResourceFile(content.atlasResource || ''),
          content.binaryData ? '1' : '0',
          content.importScale || 1,
        ].join('|');
      }

      _resolveProjectResourceFile(resourceNameOrFile) {
        return resolveEditorResourceUrl(this._project, resourceNameOrFile);
      }

      _loadSpine() {
        const content = getContent(this._associatedObjectConfiguration);
        const skeletonFile = this._resolveProjectResourceFile(
          content.skeletonResource || ''
        );
        const atlasFile = this._resolveProjectResourceFile(
          content.atlasResource || ''
        );
        const loadingKey = this._makeLoadingKey(content);
        if (
          this._loadingKey === loadingKey &&
          (this._handle || this._loadingPromise)
        ) {
          return;
        }

        this._loadingKey = loadingKey;
        this._lastError = null;
        this._destroyHandle();

        if (!skeletonFile || !atlasFile) {
          this._placeholder.alpha = 0.35;
          return;
        }

        this._loadingPromise = ensureEditorRuntime()
          .then(() =>
            getEditorWindow().GDSpine43Adapter.createInstance({
              runtimeScriptPath:
                content.runtimeScriptPath || DEFAULT_RUNTIME_SCRIPT_PATH,
              skeletonFile,
              atlasFile,
              binaryData: !!content.binaryData,
              importScale: Number(content.importScale) || 1,
              skinName: content.skinName || '',
              animationName: content.animationName || '',
              loop: !!content.loop,
              mixDuration: Number(content.mixDuration) || 0,
              inspectorOverrides: content.inspectorOverrides || {},
            })
          )
          .then((handle) => {
            if (this._wasDestroyed) {
              getEditorWindow().GDSpine43Adapter.destroyInstance(handle);
              return;
            }
            this._handle = handle;
            this._pixiObject.addChild(handle.container);
            this._disableAutomaticPhysicsInheritance();
            this._resetEditorPhysicsBaseline();
            if (handle.container.resetPhysicsTransform) {
              this._pixiObject.updateTransform();
              handle.container.resetPhysicsTransform();
            }
            this._placeholder.alpha = 0;
            this._lastAnimationName = content.animationName || '';
            this._lastSkinName = content.skinName || '';
            this._loadingPromise = null;
          })
          .catch((error) => {
            this._lastError = error;
            this._placeholder.alpha = 0.35;
            this._loadingPromise = null;
            console.error(
              'Unable to load Spine 4.3 in editor:',
              toErrorMessage(error, 'unknown error')
            );
          });
      }

      _disableAutomaticPhysicsInheritance() {
        if (
          this._handle &&
          getEditorWindow().GDSpine43Adapter &&
          getEditorWindow().GDSpine43Adapter.setPhysicsTransformInheritance
        ) {
          getEditorWindow().GDSpine43Adapter.setPhysicsTransformInheritance(
            this._handle,
            0,
            0,
            0
          );
        }
      }

      _resetEditorPhysicsBaseline() {
        this._lastPhysicsSceneX = this._instance.getX();
        this._lastPhysicsSceneY = this._instance.getY();
        this._lastPhysicsSceneAngle = this._instance.getAngle();
      }

      _getAngleDelta(currentAngle, previousAngle) {
        let delta = currentAngle - previousAngle;
        delta = ((delta + 180) % 360) - 180;
        return delta < -180 ? delta + 360 : delta;
      }

      _queueEditorPhysicsMovement() {
        if (
          !this._handle ||
          !getEditorWindow().GDSpine43Adapter ||
          !getEditorWindow().GDSpine43Adapter.queuePhysicsMovement
        ) {
          return;
        }

        const currentX = this._instance.getX();
        const currentY = this._instance.getY();
        const currentAngle = this._instance.getAngle();
        if (
          this._lastPhysicsSceneX === undefined ||
          this._lastPhysicsSceneY === undefined ||
          this._lastPhysicsSceneAngle === undefined
        ) {
          this._resetEditorPhysicsBaseline();
          return;
        }

        const deltaX = currentX - this._lastPhysicsSceneX;
        const deltaY = currentY - this._lastPhysicsSceneY;
        const deltaAngle = this._getAngleDelta(
          currentAngle,
          this._lastPhysicsSceneAngle
        );
        this._resetEditorPhysicsBaseline();

        if (
          Math.abs(deltaX) <= 1e-8 &&
          Math.abs(deltaY) <= 1e-8 &&
          Math.abs(deltaAngle) <= 1e-8
        ) {
          return;
        }

        const inverseAngle = -RenderedInstance.toRad(currentAngle);
        const cos = Math.cos(inverseAngle);
        const sin = Math.sin(inverseAngle);
        const localDeltaX = deltaX * cos - deltaY * sin;
        const localDeltaY = deltaX * sin + deltaY * cos;
        getEditorWindow().GDSpine43Adapter.queuePhysicsMovement(
          this._handle,
          localDeltaX,
          localDeltaY,
          deltaAngle
        );
      }

      _updateDisplayScale() {
        const customWidth = this._instance.hasCustomSize()
          ? Number(this._instance.getCustomWidth())
          : 0;
        const customHeight = this._instance.hasCustomSize()
          ? Number(this._instance.getCustomHeight())
          : 0;
        this._displayScaleX =
          this._instance.hasCustomSize() &&
          Number.isFinite(customWidth) &&
          customWidth > 0 &&
          this._defaultWidth > 0
            ? customWidth / this._defaultWidth
            : 1;
        this._displayScaleY =
          this._instance.hasCustomSize() &&
          Number.isFinite(customHeight) &&
          customHeight > 0 &&
          this._defaultHeight > 0
            ? customHeight / this._defaultHeight
            : 1;
        this._pixiObject.scale.set(this._displayScaleX, this._displayScaleY);
      }

      update() {
        const content = getContent(this._associatedObjectConfiguration);
        this._loadSpine();

        this._pixiObject.position.set(
          this._instance.getX(),
          this._instance.getY()
        );
        this._pixiObject.rotation = RenderedInstance.toRad(
          this._instance.getAngle()
        );
        this._pixiObject.visible = content.visible !== false;
        this._pixiObject.alpha = Math.max(
          this._instance.getOpacity() / 255,
          0.5
        );
        this._updateDisplayScale();

        if (this._handle && getEditorWindow().GDSpine43Adapter) {
          const animationName = content.animationName || '';
          if (animationName && animationName !== this._lastAnimationName) {
            getEditorWindow().GDSpine43Adapter.setAnimation(
              this._handle,
              animationName,
              !!content.loop
            );
            this._lastAnimationName = animationName;
          }

          const skinName = content.skinName || '';
          if (skinName !== this._lastSkinName) {
            getEditorWindow().GDSpine43Adapter.setSkin(this._handle, skinName);
            this._lastSkinName = skinName;
          }

          if (getEditorWindow().GDSpine43Adapter.setInspectorOverrides) {
            getEditorWindow().GDSpine43Adapter.setInspectorOverrides(
              this._handle,
              content.inspectorOverrides || {}
            );
          }

          if (content.editorPhysicsPreview === false) {
            this._resetEditorPhysicsBaseline();
          } else {
            this._queueEditorPhysicsMovement();
          }

          const now =
            typeof performance !== 'undefined' ? performance.now() : Date.now();
          const maxDelta = Math.max(0, Number(content.editorMaxDelta) || 0.05);
          const delta =
            this._lastUpdateTime === undefined
              ? 0
              : Math.min(
                  maxDelta,
                  Math.max(0, (now - this._lastUpdateTime) / 1000)
                );
          this._lastUpdateTime = now;

          this._pixiObject.updateTransform();
          const animationPreview = content.editorAnimationPreview || {};
          const animationDelta = animationPreview.playing === false ? 0 : delta;
          getEditorWindow().GDSpine43Adapter.updateInstance(
            this._handle,
            content.editorPhysicsPreview === false ? 0 : animationDelta
          );
          if (
            animationPreview.lockProgress &&
            getEditorWindow().GDSpine43Adapter.setAnimationProgress
          ) {
            getEditorWindow().GDSpine43Adapter.setAnimationProgress(
              this._handle,
              0,
              Number(animationPreview.progress) || 0
            );
          }

          const bounds = this._getSpineBounds();
          if (bounds && Number.isFinite(bounds.width) && bounds.width > 0) {
            this._defaultWidth = bounds.width;
            this._defaultHeight = bounds.height;
            this._spineOriginOffsetX = bounds.x;
            this._spineOriginOffsetY = bounds.y;
            this._placeholder.position.set(bounds.x, bounds.y);
            const frame = this._placeholder.texture.frame;
            this._placeholder.scale.x = bounds.width / frame.width;
            this._placeholder.scale.y = bounds.height / frame.height;
          }
        }
      }

      getOriginX() {
        return -this._spineOriginOffsetX * Math.abs(this._displayScaleX);
      }

      getOriginY() {
        return -this._spineOriginOffsetY * Math.abs(this._displayScaleY);
      }

      getCenterX() {
        return this.getOriginX();
      }

      getCenterY() {
        return this.getOriginY();
      }

      getDefaultWidth() {
        return this._defaultWidth;
      }

      getDefaultHeight() {
        return this._defaultHeight;
      }
    }

    // The object is registered with OBJECT_TYPE, while some older/editor paths
    // can still reference the fully qualified type.
    objectsRenderingService.registerInstanceRenderer(
      OBJECT_TYPE,
      RenderedSpine43Instance
    );
    objectsRenderingService.registerInstanceRenderer(
      FULL_OBJECT_TYPE,
      RenderedSpine43Instance
    );
  },
};
