<!DOCTYPE html>
<html>
<head>
  <title>Crystal Cavern</title>
  <style>
    body {
      margin: 0;
      background: #0a0a1a;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: Arial, sans-serif;
      color: #fff;
    }
    canvas {
      border: 2px solid #4af;
      border-radius: 8px;
      box-shadow: 0 0 30px rgba(68, 170, 255, 0.4);
    }
  </style>
</head>
<body>
<canvas id="game" width="480" height="640"></canvas>

<script>
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// ===== GAME STATE =====
let state = 'start'; // start, playing, gameover
let score = 0;
let best = localStorage.getItem('crystalBest') || 0;
let spawnTimer = 0;
let difficulty = 1;

// ===== PLAYER =====
const player = {
  x: W / 2,
  y: H - 60,
  w: 36,
  h: 36,
  speed: 6,
  color: '#4af'
};

// ===== INPUT =====
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ' || e.key === 'Enter') {
    if (state === 'start' || state === 'gameover') startGame();
  }
});
document.addEventListener('keyup', e => keys[e.key] = false);

// ===== OBJECTS =====
let crystals = [];
let rocks = [];

function spawnCrystal() {
  crystals.push({
    x: 20 + Math.random() * (W - 40),
    y: -20,
    size: 14,
    speed: 2 + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2
  });
}

function spawnRock() {
  rocks.push({
    x: 20 + Math.random() * (W - 40),
    y: -30,
    size: 16 + Math.random() * 14,
    speed: 3 + Math.random() * 2 * difficulty,
    rot: 0
  });
}

// ===== GAME LOOP =====
function startGame() {
  state = 'playing';
  score = 0;
  difficulty = 1;
  crystals = [];
  rocks = [];
  spawnTimer = 0;
  player.x = W / 2;
}

function update() {
  if (state !== 'playing') return;

  // Move player
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x -= player.speed;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x += player.speed;
  player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));

  // Difficulty ramps up with score
  difficulty = 1 + Math.floor(score / 100) * 0.3;

  // Spawn objects
  spawnTimer++;
  if (spawnTimer % Math.max(20, 50 - Math.floor(score / 10)) === 0) {
    spawnCrystal();
  }
  if (spawnTimer % Math.max(35, 90 - Math.floor(score / 5)) === 0) {
    spawnRock();
  }

  // Update crystals
  for (let i = crystals.length - 1; i >= 0; i--) {
    const c = crystals[i];
    c.y += c.speed;
    c.phase += 0.1;

    // Collision with player
    if (Math.hypot(c.x - player.x, c.y - player.y) < player.w / 2 + c.size) {
      crystals.splice(i, 1);
      score += 10;
      continue;
    }
    if (c.y > H + 20) crystals.splice(i, 1);
  }

  // Update rocks
  for (let i = rocks.length - 1; i >= 0; i--) {
    const r = rocks[i];
    r.y += r.speed;
    r.rot += 0.05;

    // Collision with player
    if (Math.hypot(r.x - player.x, r.y - player.y) < player.w / 2 + r.size * 0.7) {
      gameOver();
      return;
    }
    if (r.y > H + 40) rocks.splice(i, 1);
  }

  // Passive score for survival
  if (spawnTimer % 60 === 0) score += 1;
}

function gameOver() {
  state = 'gameover';
  if (score > best) {
    best = score;
    localStorage.setItem('crystalBest', best);
  }
}

// ===== RENDERING =====
function drawBackground() {
  // Gradient cavern
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0a0a1a');
  grad.addColorStop(1, '#1a1030');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 97) % W;
    const y = (i * 173) % H;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawPlayer() {
  ctx.save();
  ctx.shadowColor = '#4af';
  ctx.shadowBlur = 20;
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.w / 2, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(player.x - 6, player.y - 4, 3, 0, Math.PI * 2);
  ctx.arc(player.x + 6, player.y - 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(player.x - 6, player.y - 4, 1.5, 0, Math.PI * 2);
  ctx.arc(player.x + 6, player.y - 4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCrystal(c) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.phase * 0.5);
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 15;

  // Diamond shape
  ctx.fillStyle = '#0ff';
  ctx.beginPath();
  ctx.moveTo(0, -c.size);
  ctx.lineTo(c.size * 0.7, 0);
  ctx.lineTo(0, c.size);
  ctx.lineTo(-c.size * 0.7, 0);
  ctx.closePath();
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.moveTo(0, -c.size);
  ctx.lineTo(c.size * 0.3, -c.size * 0.3);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRock(r) {
  ctx.save();
  ctx.translate(r.x, r.y);
  ctx.rotate(r.rot);
  ctx.fillStyle = '#666';
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const rad = r.size * (0.75 + Math.random() * 0.05);
    const x = Math.cos(angle) * rad;
    const y = Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawUI() {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 15, 30);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0ff';
  ctx.fillText('Best: ' + best, W - 15, 30);
}

function drawStartScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';

  ctx.fillStyle = '#0ff';
  ctx.font = 'bold 42px Arial';
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 20;
  ctx.fillText('CRYSTAL', W / 2, H / 2 - 100);
  ctx.fillText('CAVERN', W / 2, H / 2 - 50);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.font = '18px Arial';
  ctx.fillText('Collect crystals. Dodge rocks.', W / 2, H / 2 + 10);

  ctx.fillStyle = '#4af';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('← → or A/D to move', W / 2, H / 2 + 50);

  ctx.fillStyle = '#ff0';
  ctx.font = 'bold 22px Arial';
  ctx.fillText('Press SPACE to start', W / 2, H / 2 + 110);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';

  ctx.fillStyle = '#f44';
  ctx.font = 'bold 44px Arial';
  ctx.shadowColor = '#f44';
  ctx.shadowBlur = 20;
  ctx.fillText('GAME OVER', W / 2, H / 2 - 50);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px Arial';
  ctx.fillText('Score: ' + score, W / 2, H / 2 + 10);
  ctx.fillStyle = '#0ff';
  ctx.fillText('Best: ' + best, W / 2, H / 2 + 50);

  ctx.fillStyle = '#ff0';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Press SPACE to play again', W / 2, H / 2 + 120);
}

function render() {
  drawBackground();

  if (state === 'playing' || state === 'gameover') {
    crystals.forEach(drawCrystal);
    rocks.forEach(drawRock);
    drawPlayer();
    drawUI();
  }

  if (state === 'start') drawStartScreen();
  if (state === 'gameover') drawGameOver();
}

// ===== MAIN LOOP =====
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

loop();
</script>
</body>
</html>![GDevelop logo](https://raw.githubusercontent.com/4ian/GDevelop/master/newIDE/GDevelop%20banner.png "GDevelop logo")

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
