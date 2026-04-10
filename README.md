# BizAudit

A business-aware defect review CLI for AI-assisted development.

BizAudit is a business-aware defect review CLI for AI-assisted development. It reads bugs discovered during code review or static analysis, searches nearby business documents in the codebase, and produces an impact evaluation for each defect.

Its main value is identifying technically minor bugs that may still cause destructive business impact.

The current repository is best understood as a working CLI skeleton for a larger audit platform. The end-to-end flow is already wired together, while some integrations, especially the real LLM gateway, are still mocked.

## Project Status

BizAudit is in an early but usable prototype stage.

- the CLI workflow is implemented end to end
- documentation is in place for English and Chinese readers
- the architecture is ready for real parser and LLM upgrades
- some production-facing integrations are still intentionally mocked

## Why BizAudit

In AI-assisted development and vibe coding workflows, code review can surface a large number of bugs. The hard part is not just finding defects, but deciding which ones are harmless engineering noise and which ones can break a critical business flow.

Traditional static analysis tools are good at finding technical defects, but they do not explain what those defects mean for business behavior. A bug that looks minor at code level can still cause a destructive business outcome, such as:

- incorrect payment status transitions
- duplicated order creation
- missing entitlement checks
- silent inventory corruption
- invalid settlement, refund, or reconciliation data

BizAudit adds that missing layer by combining:

- technical defects from static analysis tools
- business context from `.feature`, `domain.md`, or `README.md` files
- an impact assessment step that maps technical issues to business risk

Its goal is to answer a more useful question than "Is this bug technically serious?":

> If this bug reaches production, what business damage can it actually cause?

## Current Capabilities

- Parse a local ESLint-style JSON report
- Convert report entries into internal `TechDefect` entities
- Discover nearby business documents from the defect file path upward
- Build an audit workflow for each defect
- Re-evaluate code-review bugs through a business-risk lens
- Render results as colored terminal output or JSON
- Filter completed results by severity level

## Project Structure

```text
src/
  application/      workflow orchestration and ports
  domain/           entities, value objects, domain services
  infrastructure/   report parsing, document scanning, LLM adapter
  presentation/     CLI entrypoint and console renderer
```

## Architecture Summary

The project follows a layered, domain-driven design:

- `Domain Layer`: `TechDefect`, `AuditTask`, `BusinessRule`, `EvaluationResult`, severity and status types
- `Application Layer`: workflow orchestration plus ports for ingestion, context discovery, LLM access, and delivery
- `Infrastructure Layer`: adapters for linter reports, local docs, and the LLM gateway
- `Presentation Layer`: CLI command parsing and console rendering

This structure is designed so the core audit flow does not depend directly on any specific LLM vendor or external report format.

## Installation

Requirements:

- Node.js 18+
- npm

Install dependencies:

```bash
npm install
```

Validate the project locally:

```bash
npm run typecheck
npm run build
```

## Quick Start

Show CLI help:

```bash
npx ts-node src/presentation/cli.ts --help
```

Run an audit:

```bash
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json
```

Output JSON instead of console text:

```bash
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json --format json
```

Show only medium and above:

```bash
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json --severity-filter medium
```

## Input Report Format

BizAudit currently expects an ESLint-like JSON array:

```json
[
  {
    "filePath": "src/modules/order/service.ts",
    "messages": [
      {
        "line": 18,
        "ruleId": "no-floating-promises",
        "message": "Promises must be awaited."
      }
    ]
  }
]
```

Only messages that contain both `ruleId` and `line` are turned into defects by the current parser.

## Business Context Discovery

For each defect, BizAudit starts from the defect file directory and walks upward until the current working directory. It uses the first matching document it finds:

- `*.feature`
- `domain.md`
- `README.md`

That file is then treated as the business context for impact evaluation.

## CLI Options

`audit <reportPath>` supports:

- `--format <type>`: `text` or `json`
- `--severity-filter <level>`: `none`, `low`, `medium`, `high`, `fatal`
- `--api-key <key>`: API key for a future real LLM integration
- `--config <path>`: reserved for future configuration support

## Output

Text output includes:

- defect rule ID
- file and line
- original linter message
- detected business domain
- impact assessment
- summary counts

JSON output includes:

- task ID
- task status
- normalized defect fields
- severity
- impact
- failure reason

The most important output is the business impact statement. It helps teams distinguish:

- technically minor but business-critical defects
- technically noisy but low-business-impact defects
- issues that should block release versus issues that can be scheduled later

## Current Limitations

This is important before publishing or demoing the project:

- `LlmGatewayAdapter` is still a mock implementation
- the current mock response usually falls back to `MEDIUM` severity during parsing
- `--api-key` is accepted but not used for a real remote call yet
- `--config` is reserved but not implemented
- tasks are processed serially
- business context discovery is intentionally simple and stops at the first matching document

## Documentation

- Full user guide: [USER_MANUAL.md](./USER_MANUAL.md)
- Chinese user guide: [使用手册.md](./使用手册.md)
- Architecture notes: [main.md](./main.md)
- CLI task checklist: [todo-cli.md](./todo-cli.md)
- Contribution guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Changelog: [CHANGELOG.md](./CHANGELOG.md)

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, expectations, and the recommended workflow.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
