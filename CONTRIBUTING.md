# Contributing to BizAudit

Thanks for your interest in contributing.

BizAudit is currently a CLI-first prototype focused on combining static analysis defects with business context. Contributions are welcome, especially if they improve clarity, correctness, and future extensibility.

## Before You Start

Please keep these points in mind:

- the current LLM gateway is mocked
- the repository is organized around domain-driven design and layered architecture
- changes should stay aligned with the existing domain, application, infrastructure, and presentation boundaries

## Development Setup

Requirements:

- Node.js 18+
- npm

Install dependencies:

```bash
npm install
```

Useful commands:

```bash
npm run help
npm run typecheck
npm run build
```

## Contribution Guidelines

Good contributions include:

- bug fixes
- clearer documentation
- improved CLI ergonomics
- better report parsing
- stronger context discovery
- tests and validation improvements
- future-ready LLM integration improvements

Please try to keep changes:

- focused
- easy to review
- consistent with the current architecture
- documented when behavior changes

## Recommended Workflow

1. Fork the repository or create a feature branch.
2. Make a focused change.
3. Run `npm run typecheck`.
4. Run `npm run build`.
5. Update documentation if behavior or usage changed.
6. Open a pull request with a clear summary.

## Pull Request Notes

A strong pull request usually includes:

- what changed
- why it changed
- any limitations or tradeoffs
- examples of CLI behavior if relevant

If your change affects the user-facing workflow, please update:

- `README.md`
- `USER_MANUAL.md`

If it affects architecture or domain concepts, consider updating:

- `main.md`
- `todo-cli.md`

## Style Expectations

Please follow the current project style:

- TypeScript with strict typing
- small, readable modules
- layered boundaries kept intact
- no unnecessary framework or dependency additions

## Reporting Issues

If you open an issue, it helps to include:

- the command you ran
- the input report shape
- the expected behavior
- the actual behavior
- error output, if any

## License

By contributing to this repository, you agree that your contributions will be licensed under the MIT License.
