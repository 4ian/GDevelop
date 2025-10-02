# Contributing Guidelines

Thank you for your interest in contributing to our project! 

This document provides guidelines and steps for contributing.

## Getting Started

### Prerequisites

- Git installed on your machine
- Node.js (version 14 or higher)
- npm or yarn package manager
- A GitHub account

### Setting Up Local Development

1. Fork the repository by clicking the 'Fork' button on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR-USERNAME/project-name.git

cd project-name
```

3. Install dependencies:
```bash

npm install

```

4. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

1. Make your changes in the code
2. Test your changes locally:
```bash
npm run start || yarn start

 ```

3. Format your code:
``` bash
npm run format

``` 

4. Commit your changes:
```bash
git add .

git commit -m "feat: add your meaningful commit message"
```

5. Push to your fork:
```bash

git push origin feature/your-feature-name

```


## Pull Request Process

1. Go to the original repository on GitHub
2. Click 'New Pull Request'
3. Select your fork and branch
4. Fill in the PR template with:
   - Description of changes
   - Screenshots (if UI changes)
   - Related issue numbers

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/). Examples:

- `feat: add new feature`
- `fix: resolve bug issue`
- `docs: update readme`
- `style: format code`
- `refactor: restructure component`

## Code Style Guidelines

- Use consistent indentation (2 spaces)
- Follow ESLint rules
- Write meaningful comments
- Use descriptive variable and function names

## Bug Reports

When filing an issue, please include:

- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Screenshots if applicable
- Your environment details

## Feature Requests

For feature requests, please include:

- Clear description of the feature
- Use cases
- Any additional context or screenshots

## Community

- Be respectful to others
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)
- Help review other people's PRs
- Share knowledge and help others learn

## Questions?

Feel free to reach out to the maintainers if you have any questions.

## License
 