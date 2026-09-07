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

To learn more about GDevelop Architecture, read the [architecture overview here](Core/GDevelop-Architecture-Overview.md).

Pre-generated documentation of the game engine is [available here](https://docs.gdevelop.io).

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


## 🌐 Web Resources & Interactive Index
- [PHONE CASE DIY 5](https://eduquests.pages.dev/phone-case-diy-5.html)
- [EGG FARM](https://ieduquests.web.app/egg-farm.html)
- [CATEGORY DESTROY](https://brainquestskr.pages.dev/category-destroy.html)
- [PALKOVIL THE WAY HOME](https://eduquestkr.pages.dev/palkovil-the-way-home.html)
- [YOGA MASTER](https://learnaction.netlify.app/yoga-master.html)
- [BRIDGE WARS](https://eduquestsfr.pages.dev/bridge-wars.html)
- [DRIVERZ ED](https://eduquests.github.io/driverz-ed.html)
- [SUDOKU MASTER](https://brainquests.pages.dev/sudoku-master.html)
- [CATEGORY STRATEGY 2](https://eduquestsfr.pages.dev/category-strategy-2.html)
- [CATEGORY IDLE448](https://eduquestkr.pages.dev/category-idle448.html)
- [EMOJI CHALLENGE](https://eduquestsfr.pages.dev/emoji-challenge.html)
- [CATEGORY CAN T STOP PLAYING215](https://eduquestsfr.pages.dev/category-can-t-stop-playing215.html)
- [CATEGORY IDLE](https://brainquests.pages.dev/category-idle.html)
- [PET RUNNER](https://eduquestses.pages.dev/pet-runner.html)
- [CATEGORY POOL 3](https://eduquestsfr.pages.dev/category-pool-3.html)
- [ANIMAL SORT CUTE PUZZLE GAME](https://eduquestsfr.pages.dev/animal-sort-cute-puzzle-game.html)
- [FURY TANKS](https://eduquestsfr.pages.dev/fury-tanks.html)
- [INDEX13](https://brainquests.pages.dev/index13.html)
- [CATEGORY ADVENTURE 3](https://brainquests.pages.dev/category-adventure-3.html)
- [CATEGORY PUZZLE 9](https://brainquests.pages.dev/category-puzzle-9.html)
- [CATEGORY MERGE GAMES](https://brainquests.pages.dev/category-merge-games.html)
- [CATEGORY QUIZ40](https://eduquestsfr.pages.dev/category-quiz40.html)
- [GYM MUSCLE MERGE TYCOON](https://eduquestsfr.pages.dev/gym-muscle-merge-tycoon.html)
- [INDEX8](https://brainquests.pages.dev/index8.html)
- [CATEGORY SCHOOL UNBLOCKER](https://brainquests.pages.dev/category-school-unblocker.html)
- [CATEGORY SIMULATION 2](https://brainquests.pages.dev/category-simulation-2.html)
- [CATEGORY HORROR](https://eduquestsfr.pages.dev/category-horror.html)
- [CATEGORY PUZZLE 6](https://brainquests.pages.dev/category-puzzle-6.html)
- [TERMS](https://cryptotify.netlify.app/terms.html)
- [LAST TO LEAVE CIRCLE OBBY](https://eduquestsfr.pages.dev/last-to-leave-circle-obby.html)
- [CATEGORY FPS](https://brainquests.pages.dev/category-fps.html)
- [KING OF THE HILL](https://eduquestsfr.pages.dev/king-of-the-hill.html)
- [CATEGORY CASUAL](https://eduquestsfr.pages.dev/category-casual.html)
- [CATEGORY CASUAL971](https://eduquestkr.pages.dev/category-casual971.html)
- [CATEGORY MEDIEVAL15](https://eduquestkr.pages.dev/category-medieval15.html)
- [CATEGORY FPS 3](https://brainquests.pages.dev/category-fps-3.html)
- [ONLINE PORTAL](https://brainquests.netlify.app/)
- [CATEGORY MAHJONG](https://brainquests.pages.dev/category-mahjong.html)
- [HEAD RUNNER DASH](https://eduquestsfr.pages.dev/head-runner-dash.html)
- [CATEGORY BASKETBALL](https://brainquests.pages.dev/category-basketball.html)
- [SITEMAP](https://brainquests.github.io/sitemap.html)
- [INDEX19](https://eduquestkr.pages.dev/index19.html)
- [CATEGORY HALLOWEEN45](https://brainquests.pages.dev/category-halloween45.html)
- [ZOMBIE DEFENSE WAR](https://eduquestses.pages.dev/zombie-defense-war.html)
- [CATEGORY MOUSE](https://brainquests.pages.dev/category-mouse.html)
- [CATEGORY BRAIN261](https://brainquests.pages.dev/category-brain261.html)
- [ASTRAL ESCAPE](https://eduquestsfr.pages.dev/astral-escape.html)
- [CATEGORY CAN T STOP PLAYING212](https://brainquests.pages.dev/category-can-t-stop-playing212.html)
- [CATEGORY STICKMAN 3](https://brainquests.pages.dev/category-stickman-3.html)
- [CATEGORY CAT](https://brainquests.pages.dev/category-cat.html)
- [PRIVACY](https://cryptotify.pages.dev/privacy.html)
- [CATEGORY PREMIUM PERKS74](https://brainquests.pages.dev/category-premium-perks74.html)
- [FIERCE BATTLE BREAKOUT](https://learnaction.github.io/fierce-battle-breakout.html)
- [SAVE HER TOUR](https://eduquests.onrender.com/save-her-tour.html)
- [CATEGORY SURVIVAL](https://brainquests.pages.dev/category-survival.html)
- [MOTO ATTACK](https://eduquests.netlify.app/moto-attack.html)
- [INDEX2](https://eduquests.onrender.com/index2.html)
- [CATEGORY DRESS UP 2](https://brainquests.pages.dev/category-dress-up-2.html)
- [RUMMY CLASSIC](https://eduquestsfr.pages.dev/rummy-classic.html)
- [MEGA LAMBA RAMP](https://eduquests.github.io/mega-lamba-ramp.html)
- [CATEGORY WEB PROXY](https://brainquests.pages.dev/category-web-proxy.html)
- [CATEGORY CASUAL 5](https://eduquestkr.pages.dev/category-casual-5.html)
- [ECO BLOCK PUZZLE](https://ieduquests.web.app/eco-block-puzzle.html)
- [HUNGRY CORGI CUTE MUSIC GAME](https://eduquests.pages.dev/hungry-corgi-cute-music-game.html)
- [CATEGORY CASUAL 10](https://eduquestkr.pages.dev/category-casual-10.html)
- [SCREW PUZZLE](https://eduquests.netlify.app/screw-puzzle.html)
- [GALAXY CARNAGE](https://eduquestses.pages.dev/galaxy-carnage.html)
- [CATEGORY DIRT BIKE](https://eduquestsfr.pages.dev/category-dirt-bike.html)
- [DEEP IN THE LAB CHAPTER 1](https://eduquests.netlify.app/deep-in-the-lab-chapter-1.html)
- [SAVE MY PET](https://eduquestses.pages.dev/save-my-pet.html)
- [GRANNY PILLS DEFEND CACTUSES](https://eduquests.pages.dev/granny-pills-defend-cactuses.html)
- [ANIME DRESS UP DOLL DRESS UP](https://eduquests.pages.dev/anime-dress-up-doll-dress-up.html)
- [INDEX12](https://eduquests.github.io/index12.html)
- [INDEX11](https://brainquests.pages.dev/index11.html)
- [ONLINE PORTAL](https://cryptotify.github.io/)
- [CATEGORY DRESS UP](https://eduquestsfr.pages.dev/category-dress-up.html)
- [VALENTINE S DAY COUPLE DATE](https://eduquests.pages.dev/valentine-s-day-couple-date.html)
- [CATEGORY WEBGAME](https://brainquests.pages.dev/category-webgame.html)
- [CATEGORY BUILDING182](https://brainquests.pages.dev/category-building182.html)
- [MAGECLASH IO](https://brainquests.pages.dev/mageclash-io.html)
- [321 CHOOSE THE DIFFERENT](https://eduquestses.pages.dev/321-choose-the-different.html)
- [PONGOAL](https://ieduquests.web.app/pongoal.html)
- [VIRTUAL NEKO KITTY COLLECTOR](https://ieduquests.web.app/virtual-neko-kitty-collector.html)
- [CATEGORY TOWER DEFENSE 2](https://eduquests.netlify.app/category-tower-defense-2.html)
- [VEX HYPER DASH](https://eduquests.pages.dev/vex-hyper-dash.html)
- [KINGDOM CATS](https://ieduquests.web.app/kingdom-cats.html)
- [CATEGORY RACING DRIVING](https://brainquests.pages.dev/category-racing-driving.html)
- [CONTRACT DEER HUNTER](https://eduquests.github.io/contract-deer-hunter.html)
- [STICKMAN BATTLE 1 4 PLAYERS](https://eduquests.netlify.app/stickman-battle-1-4-players.html)
- [CATEGORY SPACE57](https://brainquests.pages.dev/category-space57.html)
- [HILL CLIMB TRUCK TRANSFORM ADVENTURE](https://eduquestsfr.pages.dev/hill-climb-truck-transform-adventure.html)
- [CATEGORY FREE](https://brainquests.pages.dev/category-free.html)
- [ULTIMATE TRANSPORT DRIVING SIM](https://ieduquests.web.app/ultimate-transport-driving-sim.html)
- [HOLE PUZZLE](https://ieduquests.web.app/hole-puzzle.html)
- [CATEGORY DESTROY](https://eduquests.onrender.com/category-destroy.html)
- [PRIVACY](https://cryptotify.web.app/privacy.html)
- [MONSTER VS ZOMBIE](https://eduquests.netlify.app/monster-vs-zombie.html)
- [HERITAGE MAHJONG CLASSIC](https://eduquestses.pages.dev/heritage-mahjong-classic.html)
- [NONOGRAM DAILY](https://eduquests.pages.dev/nonogram-daily.html)
- [HEX SENSE](https://eduquests.netlify.app/hex-sense.html)
- [CATEGORY WEBGAME](https://eduquestsfr.pages.dev/category-webgame.html)
- [BATTLE OF PIRATE CARIBBEAN BATTLE](https://learnaction.github.io/battle-of-pirate-caribbean-battle.html)
- [CATEGORY SOCCER60](https://eduquests.netlify.app/category-soccer60.html)
- [MMA SUPER FIGHT](https://eduquests.github.io/mma-super-fight.html)
- [GO TO ZERO](https://eduquestses.pages.dev/go-to-zero.html)
- [DADDY RABBIT](https://brainquests.pages.dev/daddy-rabbit.html)
- [CRAZY BUS STATION](https://eduquestses.pages.dev/crazy-bus-station.html)
- [LINK FLOW](https://brainquests.pages.dev/link-flow.html)
- [WOOD BLOCKS JAM](https://brainquests.pages.dev/wood-blocks-jam.html)
- [MR DUDE KING OF THE HILL](https://brainquests.pages.dev/mr-dude-king-of-the-hill.html)
- [MAKE AMERICA GREAT AGAIN](https://eduquests.github.io/make-america-great-again.html)
- [SHADOW STICKMAN FIGHT](https://brainquests.pages.dev/shadow-stickman-fight.html)
- [MAHJONG MASTERS](https://brainquests.pages.dev/mahjong-masters.html)
- [POP CULTURE HALLOWEEN MAKEUP](https://ieduquests.web.app/pop-culture-halloween-makeup.html)
- [TOPSY TURVY](https://ieduquests.web.app/topsy-turvy.html)
- [AGENT ZERO INFILTRATION](https://eduquests.github.io/agent-zero-infiltration.html)
- [PANDA RESTAURANT](https://eduquests.netlify.app/panda-restaurant.html)
- [HERO TOWER WAR](https://ieduquests.web.app/hero-tower-war.html)
- [CATEGORY FLASH 3](https://eduquestkr.pages.dev/category-flash-3.html)
- [KNIFEIO](https://brainquests.pages.dev/knifeio.html)
- [SAMURAI LEGACY](https://brainquests.pages.dev/samurai-legacy.html)
- [MERGE RUSH Z](https://ieduquests.web.app/merge-rush-z.html)
- [JIGSAW FANTASY](https://eduquests.pages.dev/jigsaw-fantasy.html)
- [ITALIAN BRAINROT QUIZ](https://learnaction.netlify.app/italian-brainrot-quiz.html)
- [PORT SHIPPING TYCOON](https://eduquests.github.io/port-shipping-tycoon.html)
- [DRAW TO SMASH ZOMBIE](https://learnaction.netlify.app/draw-to-smash-zombie.html)
- [SPACE PIN MASTER PULL PIN PUZZLE](https://eduquests.netlify.app/space-pin-master-pull-pin-puzzle.html)
- [COIN MERGE](https://eduquests.netlify.app/coin-merge.html)
- [CATEGORY CAR 3](https://eduquestkr.pages.dev/category-car-3.html)
- [CONNECT CLUES THE MISSING PROFESSOR](https://eduquests.github.io/connect-clues-the-missing-professor.html)
