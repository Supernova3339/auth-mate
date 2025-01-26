# Contributing to Auth Mate

We love your input! We want to make contributing to Auth Mate as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/supernova3339/auth-mate/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/supernova3339/auth-mate/issues/new).

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
    - Be specific!
    - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Setup

1. Requirements:
    - Node.js 16+
    - pnpm

2. Setup steps:
```bash
# Clone your fork
git clone https://github.com/supernova3339/auth-mate.git

# Navigate to the project directory
cd auth-mate

# Install dependencies
pnpm install

# Run tests
pnpm test
```

## Project Structure

```
react-modern-auth/
├── src/
│   ├── providers/     # OAuth provider implementations
│   ├── __tests__/    # Test files
│   ├── types.ts      # TypeScript type definitions
│   ├── storage.ts    # Storage implementation
│   ├── utils.ts      # Utility functions
│   └── index.ts      # Main entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Testing

We use Vitest for testing. Please ensure all new features include appropriate tests.

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## Code Style

- We use TypeScript for type safety
- All code must be properly typed
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Documentation

- Keep README.md updated
- Document all public APIs
- Include JSDoc comments for TypeScript definitions
- Add examples for new features
- Update CHANGELOG.md

## Pull Request Process

1. Update the README.md with details of changes to the interface
2. Update the CHANGELOG.md with a note describing your changes
3. The PR will be merged once you have the sign-off of two maintainers

## License

By contributing, you agree that your contributions will be licensed under its MIT License.