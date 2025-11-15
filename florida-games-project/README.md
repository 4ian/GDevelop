# Florida Games Project

A collection of Florida-themed games built on GDevelop, sharing common assets, mechanics, and code.

## 🎮 Games in Development

1. **Everglades Explorer** - Platformer adventure through the swamps
2. **Miami Beach Runner** - Endless runner along iconic beaches
3. **Key West Treasure Hunt** - Puzzle adventure across the Keys
4. **Hurricane Hero** - Strategic disaster management
5. **Space Coast Launch** - Physics-based rocket game
6. **Citrus Crush Saga** - Match-3 puzzle with Florida fruits
7. **Manatee Rescue** - Conservation simulation
8. **Art Deco Detective** - Mystery investigation in vintage Miami
9. **Flamingo Flight** - Casual flying game
10. **Gator Golf** - Mini-golf with Florida hazards

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create a new game from template
npm run create-game -- --name "my-florida-game" --template "platformer"

# Open in GDevelop
# File > Open > games/my-florida-game/game.json
```

## 📚 Documentation

- [**Master Plan**](../FLORIDA_GAMES_MASTER_PLAN.md) - Complete vision and game designs
- [**Playbook**](../FLORIDA_GAMES_PLAYBOOK.md) - Development guide and best practices
- [API Reference](docs/api-reference/) - Extension documentation
- [Tutorials](docs/tutorials/) - Step-by-step guides

## 🏗️ Project Structure

```
florida-games-project/
├── games/              # Individual game projects
├── shared/            # Shared resources
│   ├── assets/       # Common visual and audio assets
│   ├── extensions/   # Reusable GDevelop extensions
│   └── templates/    # Game and scene templates
├── scripts/          # Build and deployment scripts
├── docs/             # Documentation
└── tests/            # Testing suite
```

## 🧩 Shared Extensions

- **FloridaCore** - Weather, day/night cycle, achievements
- **FloridaWildlife** - Wildlife AI and behaviors
- **FloridaEnvironment** - Water physics, beach mechanics
- **FloridaUI** - Consistent UI components, dialogs, inventory

## 🔄 Version Management

Each game follows semantic versioning: `MAJOR.MINOR.PATCH-GAME_ID`

Example: `1.0.0-everglades`, `2.1.3-miami-runner`

See [Versioning Strategy](../FLORIDA_GAMES_MASTER_PLAN.md#versioning-strategy) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-game-name/new-feature`
3. Follow the [Playbook](../FLORIDA_GAMES_PLAYBOOK.md) guidelines
4. Submit a pull request

## 📜 License

MIT License - see LICENSE file for details

## 🌴 Florida Elements

All games incorporate authentic Florida themes:
- Wildlife (alligators, manatees, flamingos, dolphins)
- Environments (Everglades, beaches, Keys, Space Coast)
- Culture (Art Deco, Cuban influence, space program)
- Natural phenomena (hurricanes, tides, seasons)

## 📞 Contact

- Discord: #florida-games-dev
- Issues: GitHub Issues
- Email: dev@floridagames.example

---

**Project Status**: Planning/Early Development
**Last Updated**: 2025-11-15
**Version**: 0.1.0
