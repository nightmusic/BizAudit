# BizAudit

BizAudit is a domain-driven CLI prototype for business-aware code review. It reads a linter report, searches nearby business documents in the codebase, and produces an impact evaluation for each detected defect.

The current repository is best understood as a working CLI skeleton for a larger audit platform. The end-to-end flow is already wired together, while some integrations, especially the real LLM gateway, are still mocked.

## Why BizAudit

Traditional static analysis tools are good at finding technical defects, but they do not explain what those defects mean for business behavior. BizAudit adds that missing layer by combining:

- technical defects from static analysis tools
- business context from `.feature`, `domain.md`, or `README.md` files
- an impact assessment step that maps technical issues to business risk

## Current Capabilities

- Parse a local ESLint-style JSON report
- Convert report entries into internal `TechDefect` entities
- Discover nearby business documents from the defect file path upward
- Build an audit workflow for each defect
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

## Suggested Repository Positioning

If you publish this project to Git, a good description would be:

> A domain-driven CLI prototype that combines static analysis defects with business context to produce business impact evaluations.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
