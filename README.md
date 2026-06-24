## GDevelop 架构设计图（源码与官方文档对照）

这部分从源码中的 `Core/GDCore/Project`、`GDJS/Runtime`、`GDJS/GDJS/Events/CodeGeneration`
以及官方文档中的 [Scene Editor](https://wiki.gdevelop.io/gdevelop5/interface/scene-editor/)、
[Objects](https://wiki.gdevelop.io/gdevelop5/objects/)、[Behaviors](https://wiki.gdevelop.io/gdevelop5/behaviors/)、
[Custom Objects ("Prefabs")](https://wiki.gdevelop.io/gdevelop5/objects/custom-objects-prefab-template/)、
[Functions](https://wiki.gdevelop.io/gdevelop5/events/functions/) 和
[Object Picking](https://wiki.gdevelop.io/gdevelop5/events/object-picking/) 整理而来。核心分层是：
**编辑期数据模型 -> IDE/元数据/作用域 -> GDJS code generation -> Runtime 执行模型**。

```mermaid
flowchart LR
  APP["GDevelop project<br/>.json/.json folder project<br/>game configuration + authored content"]

  subgraph IDE["Editor concepts in newIDE"]
    PM["Project Manager<br/>resources, extensions, scenes"]
    SE["Scene Editor<br/>place instances, layers, cameras"]
    EE["Events Editor<br/>conditions/actions/expressions<br/>object picking"]
    OE["Object Editor<br/>object variables, effects, behaviors"]
    EXTE["Extension Editor<br/>functions, behaviors, prefabs"]
  end

  subgraph CORE["Core data model in Core/GDCore/Project"]
    PROJ["gd::Project<br/>global variables<br/>resources<br/>global objects<br/>layouts/scenes<br/>events functions extensions"]

    subgraph SCENE["Scene / gd::Layout"]
      LAY["Layers + cameras"]
      SV["Scene variables"]
      SO["Scene object definitions<br/>gd::ObjectsContainer"]
      SI["Initial instances<br/>gd::InitialInstancesContainer"]
      EVL["Scene events<br/>gd::EventsList"]
      BSD["Behavior shared data<br/>per scene"]
    end

    subgraph OBJMODEL["Object model"]
      OBJ["gd::Object / ObjectConfiguration<br/>object type<br/>object variables<br/>effects<br/>behaviors list"]
      INST["gd::InitialInstance<br/>objectName<br/>x/y/z, angle, layer, zOrder<br/>initial variables<br/>behaviorOverridings"]
      BEHCFG["gd::Behavior<br/>behavior type<br/>behavior name<br/>properties"]
      SHARED["gd::BehaviorsSharedData<br/>shared per behavior type/name"]
    end

    subgraph EXTMODEL["Extension model"]
      EXT["gd::EventsFunctionsExtension<br/>namespace/name/version<br/>dependencies<br/>extension global/scene variables"]
      FREEFN["Free EventsFunction<br/>custom action/condition/expression"]
      EBB["EventsBasedBehavior<br/>custom behavior type<br/>properties + shared properties<br/>methods + lifecycle"]
      EBO["EventsBasedObject<br/>custom object / prefab type<br/>properties + methods<br/>default variant + variants"]
      FN["gd::EventsFunction<br/>parameters<br/>events<br/>return value for condition/expression"]
    end

    subgraph PREFAB["Prefab / Custom Object internals"]
      VAR["EventsBasedObjectVariant<br/>variant name<br/>inner area<br/>child layers"]
      CHOBJ["Child object definitions<br/>variant ObjectsContainer"]
      CHINST["Child initial instances<br/>variant InitialInstancesContainer"]
      OBJMETHOD["Object methods<br/>onCreated, doStepPostEvents,<br/>actions, conditions, expressions"]
    end
  end

  subgraph IDECORE["IDE analysis / metadata / scope"]
    META["MetadataDeclarationHelper<br/>declares actions/conditions/expressions<br/>declares object + behavior metadata"]
    PSC["ProjectScopedContainers<br/>which objects, variables, properties,<br/>resources and parameters are visible"]
    PICK["Object picking<br/>picked object lists<br/>scoped to event and sub-events"]
    VALID["Validators / completion / refactorers<br/>InstructionValidator<br/>ExpressionValidator<br/>EventsContextAnalyzer"]
  end

  subgraph CODEGEN["GDJS code generation"]
    ECG["EventsCodeGenerator<br/>turns EventsList into JS functions"]
    FCTX["eventsFunctionContext<br/>_objectsMap<br/>_objectArraysMap<br/>_behaviorNamesMap<br/>localVariables<br/>getObjects/createObject/getBehaviorName"]
    FCG["EventsFunctionsExtensionCodeGenerator<br/>free functions"]
    BCG["BehaviorCodeGenerator<br/>EventsBasedBehavior -> RuntimeBehavior subclass"]
    OCG["ObjectCodeGenerator<br/>EventsBasedObject -> CustomRuntimeObject subclass"]
    OUT["Generated JS game code<br/>scene event functions<br/>extension functions<br/>object/behavior classes"]
  end

  subgraph RUNTIME["Runtime model in GDJS/Runtime"]
    RG["gdjs.RuntimeGame<br/>game data<br/>resource managers<br/>extension variables<br/>scene stack"]
    RS["gdjs.RuntimeScene<br/>runtime scene variables<br/>timers/onceTriggers<br/>layers/cameras"]
    RIC["RuntimeInstanceContainer<br/>registered object data<br/>constructors cache<br/>living instances<br/>createObject/createObjectsFrom"]
    RO["gdjs.RuntimeObject<br/>runtime position/layer/zOrder<br/>variables/effects<br/>lifecycle<br/>behavior instances"]
    RB["gdjs.RuntimeBehavior<br/>owner object<br/>properties/shared data<br/>pre/post events lifecycle"]
    CRO["gdjs.CustomRuntimeObject<br/>prefab object instance<br/>has its own child container<br/>runs object methods/events"]
    CC["CustomRuntimeObjectInstanceContainer<br/>child registered objects<br/>child runtime instances<br/>child layers"]
    REN["Renderer layer<br/>PixiJS 2D<br/>Three.js 3D<br/>effects/cameras"]
  end

  APP --> PM
  APP --> PROJ
  PM --> PROJ
  SE --> SO
  SE --> SI
  SE --> LAY
  EE --> EVL
  OE --> OBJ
  EXTE --> EXT

  PROJ --> SO
  PROJ --> SI
  PROJ --> SV
  PROJ --> LAY
  PROJ --> EVL
  PROJ --> BSD
  PROJ --> EXT
  LAY --> RS
  SV --> RS
  SO --> OBJ
  SO --> RIC
  SI --> INST
  INST -.->|references objectName| OBJ
  OBJ --> BEHCFG
  BSD --> SHARED
  BEHCFG --> SHARED

  EXT --> FREEFN
  EXT --> EBB
  EXT --> EBO
  FREEFN --> FN
  EBB --> FN
  EBO --> FN
  EBO --> VAR
  EBO --> OBJMETHOD
  OBJMETHOD --> FN
  VAR --> CHOBJ
  VAR --> CHINST
  CHINST -.->|references child object| CHOBJ

  PROJ --> META
  EXT --> META
  PROJ --> PSC
  META --> EE
  META --> OE
  META --> EXTE
  PSC --> VALID
  EE --> PICK
  PICK --> ECG
  VALID --> EE

  EVL --> ECG
  FN --> ECG
  PSC --> ECG
  ECG --> FCTX
  FREEFN --> FCG
  EBB --> BCG
  EBO --> OCG
  FCG --> OUT
  BCG --> OUT
  OCG --> OUT
  ECG --> OUT

  PROJ --> RG
  OUT --> RG
  RG --> RS
  RS --> RIC
  RIC --> RO
  OBJ --> RIC
  INST --> RIC
  RO --> RB
  BEHCFG --> RB
  EBO --> CRO
  CRO --> CC
  CC --> RIC
  CHOBJ --> CC
  CHINST --> CC
  FCTX --> RIC
  RO --> REN
  RS --> REN
```

运行时一帧的高层执行路径：

```mermaid
sequenceDiagram
  participant Scene as RuntimeScene
  participant Obj as RuntimeObject
  participant Beh as RuntimeBehavior
  participant Events as Generated events
  participant Prefab as CustomRuntimeObject
  participant Child as Child RuntimeInstanceContainer
  participant Renderer as Renderer

  Scene->>Obj: stepBehaviorsPreEvents()
  Obj->>Beh: doStepPreEvents()
  Scene->>Events: run scene EventsList with picked object lists
  Events->>Scene: createObject / filter objects / call functions
  Scene->>Obj: update()
  Obj->>Prefab: if custom object
  Prefab->>Child: update child objects pre-events
  Prefab->>Prefab: run prefab doStepPreEvents/doStepPostEvents
  Scene->>Obj: stepBehaviorsPostEvents()
  Scene->>Obj: updatePreRender()
  Obj->>Renderer: sync render state
```

关键边界：

- **Object vs Instance**: behavior 列表属于 `ObjectData/ObjectConfiguration`；实例只保存位置、初始变量和 `behaviorOverridings`。官方文档也把对象描述为蓝图，把放进场景的对象称为实例。
- **Scene vs RuntimeScene**: `gd::Layout` 是编辑期场景数据；`gdjs.RuntimeScene` 是运行时场景容器，继承 `RuntimeInstanceContainer` 并负责创建、缓存、删除和遍历运行时对象。
- **Function scope**: 普通函数事件只能看到函数参数里的对象；如果要在函数里使用对象行为，需要在 object 参数后增加 behavior 参数。
- **Behavior scope**: events-based behavior 的事件上下文有约定参数 `Object` 和 `Behavior`；Behavior 类型属性可以表达“这个行为还需要宿主对象上的另一个行为”。
- **Prefab scope**: events-based object/custom object 的事件上下文能看到 `Object` 自身和 prefab child objects。Prefab 自己是一个 `RuntimeObject`，内部再持有 `CustomRuntimeObjectInstanceContainer` 来管理 child object definitions 和 child instances。
- **Variant constraint**: 所有 variants 共享同一组 child object definitions，因为它们共享同一套 events；variant 主要改变 child instances、布局、属性和视觉配置。
- **Object picking**: 事件并不是直接操作全部对象，而是操作当前 event/sub-event 的 picked object lists；条件会过滤后续 actions 可见的对象列表。

源码入口：

- 编辑期场景模型: [`Core/GDCore/Project/Layout.h`](Core/GDCore/Project/Layout.h)
- 扩展/函数/behavior/prefab 容器: [`Core/GDCore/Project/EventsFunctionsExtension.h`](Core/GDCore/Project/EventsFunctionsExtension.h)
- Prefab 数据模型: [`Core/GDCore/Project/EventsBasedObject.h`](Core/GDCore/Project/EventsBasedObject.h)
- 事件作用域: [`Core/GDCore/Project/ProjectScopedContainers.cpp`](Core/GDCore/Project/ProjectScopedContainers.cpp)
- 函数对象上下文构造: [`Core/GDCore/IDE/EventsFunctionTools.cpp`](Core/GDCore/IDE/EventsFunctionTools.cpp)
- 事件代码生成: [`GDJS/GDJS/Events/CodeGeneration/EventsCodeGenerator.cpp`](GDJS/GDJS/Events/CodeGeneration/EventsCodeGenerator.cpp)
- Object/Behavior 代码生成: [`GDJS/GDJS/Events/CodeGeneration/ObjectCodeGenerator.cpp`](GDJS/GDJS/Events/CodeGeneration/ObjectCodeGenerator.cpp),
  [`GDJS/GDJS/Events/CodeGeneration/BehaviorCodeGenerator.cpp`](GDJS/GDJS/Events/CodeGeneration/BehaviorCodeGenerator.cpp)
- 运行时实例容器: [`GDJS/Runtime/RuntimeInstanceContainer.ts`](GDJS/Runtime/RuntimeInstanceContainer.ts)
- 运行时对象/行为: [`GDJS/Runtime/runtimeobject.ts`](GDJS/Runtime/runtimeobject.ts),
  [`GDJS/Runtime/runtimebehavior.ts`](GDJS/Runtime/runtimebehavior.ts)
- Prefab 运行时: [`GDJS/Runtime/CustomRuntimeObject.ts`](GDJS/Runtime/CustomRuntimeObject.ts),
  [`GDJS/Runtime/CustomRuntimeObjectInstanceContainer.ts`](GDJS/Runtime/CustomRuntimeObjectInstanceContainer.ts)

![GDevelop logo](https://raw.githubusercontent.com/4ian/GDevelop/master/newIDE/GDevelop%20banner.png "GDevelop logo")

GDevelop is a **full-featured, no-code, open-source** game development software. You can build **2D, 3D and multiplayer games** for mobile (iOS, Android), desktop and the web. GDevelop is designed to be fast and incredibly intuitive: make games using an easy-to-understand yet powerful event-based system and modular behaviors. Create with AI that assists or builds alongside you.

![The GDevelop editor when editing a game level](https://raw.githubusercontent.com/4ian/GDevelop/master/newIDE/GDevelop%20screenshot.png "The GDevelop editor when editing a 3D game level")

![The GDevelop editor when editing a game level](./newIDE/GDevelop%202D%20screenshot.png "The GDevelop editor when editing a 2D game level")

## Getting started

| ❔ I want to...                                   | 🚀 What to do                                                                                                                                                     |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🎮 Use GDevelop to make games                     | Go to [GDevelop homepage](https://gdevelop.io) to download the app!                                                                                               |
| ⚙️ Create/improve an extension                    | Read about [creating an extension](https://wiki.gdevelop.io/gdevelop5/extensions/create), with no-code or code.                                                   |
| 🧑‍💻 Contribute to the editor or game engine        | Follow this [README](newIDE/README.md).                                                                                                                           |
| 👾 Create or sell a game template                 | Submit a [free example or a paid template on the Asset Store](https://wiki.gdevelop.io/gdevelop5/community/guide-for-submitting-an-example/).                     |
| 🎨 Share or sell an asset pack                    | Submit a [free or paid asset pack on the Asset Store](https://wiki.gdevelop.io/gdevelop5/community/sell-asset-pack-store).                                        |
| 🌐 Help translate GDevelop                        | Go on the [GDevelop project on Crowdin](https://crowdin.com/project/gdevelop) or translate [in-app tutorials](https://github.com/GDevelopApp/GDevelop-tutorials). |
| 👥 Get online game services or commercial support | See offers for [professionals, teams or individual creators](https://gdevelop.io/pricing).                                                                        |

> Are you interested in contributing to GDevelop for the first time? Take a look at the list of **[good first issues](https://github.com/4ian/GDevelop/issues?q=is%3Aissue+is%3Aopen+label%3A%22%F0%9F%91%8Cgood+first+issue%22)**, **[good first contributions](https://github.com/4ian/GDevelop/discussions/categories/good-first-contribution)** or the **["🏐 not too hard" cards](https://trello.com/b/qf0lM7k8/gdevelop-roadmap?menu=filter&filter=label:Not%20too%20hard%20%E2%9A%BD%EF%B8%8F)** on the Roadmap.

## Games made with GDevelop

- Find GDevelop games on [gd.games](https://gd.games), the gaming platform for games powered by GDevelop.
- See the [showcase of games](https://gdevelop.io/games) created with GDevelop and published on Steam, iOS (App Store), Android (Google Play), Itch.io, Newgrounds, CrazyGames, Poki...
  - Suggest your game to be [added to the showcase here](https://docs.google.com/forms/d/e/1FAIpQLSfjiOnkbODuPifSGuzxYY61vB5kyMWdTZSSqkJsv3H6ePRTQA/viewform).

[![Some games made with GDevelop](https://raw.githubusercontent.com/4ian/GDevelop/master/newIDE/GDevelop%20games.png "Some games made with GDevelop")](https://gdevelop.io/games)

## Technical architecture

GDevelop is composed of an **editor**, a **game engine**, an **ecosystem** of extensions as well as **online services** and commercial support.

| Directory     | ℹ️ Description                                                                                                                                                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Core`        | Core classes, describing the structure of a game and tools to implement the IDE and work with GDevelop games.                                                                                                                                                                                            |
| `GDJS`        | The game engine, written in TypeScript, using PixiJS and Three.js for 2D and 3D rendering (WebGL), powering all GDevelop games.                                                                                                                                                                          |
| `GDevelop.js` | Bindings of `Core`, `GDJS` and `Extensions` to JavaScript (with WebAssembly), used by the IDE.                                                                                                                                                                                                           |
| `newIDE`      | The game editor, written in JavaScript with React, Electron, PixiJS and Three.js.                                                                                                                                                                                                                        |
| `Extensions`  | Built-in extensions for the game engine, providing objects, behaviors and new features. For example, this includes the physics engines running in WebAssembly (Box2D or Jolt Physics for 3D). All the [official and experimental extensions are on this repository](https://github.com/GDevelopApp/GDevelop-extensions). [Community extensions are available here](https://github.com/GDevelopApp/GDevelop-community-list). |
| `docs`        | Repository documentation and implementation notes. Script and third-party integration documentation lives in `docs/scripts`.                                                                                                                                                                              |
| `scripts`     | Executable helper scripts for build, release, development, and packaging tasks. Non-executable documentation should live in `docs`.                                                                                                                                                                       |
| `thirdParties` | Git submodules for external upstream tools integrated into the editor, including `ai_game_workbench`, `image-extender`, and `gorest-2d-animation-spritesheet-generator`. These are source checkouts for maintenance; Electron uses compiled ASAR artifacts from `newIDE/electron-app/app/external`.                                                   |

To learn more about GDevelop Architecture, read the [architecture overview here](Core/GDevelop-Architecture-Overview.md).

Pre-generated documentation of the game engine is [available here](https://docs.gdevelop.io).

### Local third-party tools

The Resource Working Desk integrates selected third-party tools through
Electron-packaged ASAR files:

- `thirdParties/ai_game_workbench`, `thirdParties/image-extender`, and
  `thirdParties/gorest-2d-animation-spritesheet-generator` are git submodules
  that track upstream source.
- `scripts/build-third-party-asars.py` builds the runtime ASAR files from those
  submodules.
- `newIDE/electron-app/app/external` contains the packaged artifacts loaded by
  the Electron app.
- `docs/scripts` contains the operational notes for submodules and ASAR
  packaging.

For AI agents and AI models working in this repository: unless the user
explicitly asks to inspect or modify upstream third-party source, do not scan or
read files under `thirdParties/`. Treat those folders as external submodules and
use the docs, scripts, and integration code outside `thirdParties/` first. This
saves context and token budget.

Status of the tests and builds: [![macOS and Linux build status](https://circleci.com/gh/4ian/GDevelop.svg?style=shield)](https://app.circleci.com/pipelines/github/4ian/GDevelop) [![Fast tests status](https://gdevelop.semaphoreci.com/badges/GDevelop/branches/master.svg?style=shields)](https://gdevelop.semaphoreci.com/projects/GDevelop) [![Windows Build status](https://ci.appveyor.com/api/projects/status/84uhtdox47xp422x/branch/master?svg=true)](https://ci.appveyor.com/project/4ian/gdevelop/branch/master) [![https://good-labs.github.io/greater-good-affirmation/assets/images/badge.svg](https://good-labs.github.io/greater-good-affirmation/assets/images/badge.svg)](https://good-labs.github.io/greater-good-affirmation)

## Links

### Community

- [GDevelop forums](https://forum.gdevelop.io) and [Discord chat](https://discord.gg/gdevelop).
- [GDevelop homepage](https://gdevelop.io).
- [GDevelop wiki (documentation)](https://wiki.gdevelop.io/gdevelop5/start).
- Help translate GDevelop in your language: [GDevelop project on Crowdin](https://crowdin.com/project/gdevelop).
- Open-source [extensions (official or experimental)](https://github.com/GDevelopApp/GDevelop-extensions), [community extensions](https://github.com/GDevelopApp/GDevelop-community-list), [examples](https://github.com/GDevelopApp/GDevelop-examples), [tutorials](https://github.com/GDevelopApp/GDevelop-tutorials) are on GitHub.

### Development Roadmap

- [GDevelop Roadmap on Trello.com](https://trello.com/b/qf0lM7k8/gdevelop-roadmap), for a global view of the features that could be added. Please vote and comment here for new features/requests.
- [GitHub issue page](https://github.com/4ian/GDevelop/issues), for technical issues and bugs.
- [Github discussions](https://github.com/4ian/GDevelop/discussions) to talk about new features and ideas.

## License

- The Core library, the native and HTML5 game engines, the IDE, and all extensions (respectively `Core`, `GDJS`, `newIDE` and `Extensions` folders) are under the **MIT license**.
- The name, GDevelop, and its logo are the exclusive property of Florian Rival.

Games exported with GDevelop are based on the GDevelop game engine (see `Core` and `GDJS` folders): this engine is distributed under the MIT license so that you can **distribute, sell or do anything** with the games you created with GDevelop. In particular, you are not forced to make your game open-source.

[node.js]: https://nodejs.org

## Star History

Help us spread the word about GDevelop by starring the repository on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=4ian/gdevelop&type=Date)](https://star-history.com/#4ian/gdevelop&Date)
