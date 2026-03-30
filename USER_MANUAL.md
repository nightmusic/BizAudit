# BizAudit User Manual

## 1. Purpose

This document explains how to run BizAudit, how to prepare input data, how to interpret the output, and what limitations exist in the current version.

BizAudit is a command-line tool for business-aware defect review. It reads a linter report, tries to discover nearby business documentation, and then generates an impact evaluation for each defect.

Its main purpose is not to find more bugs than code review already found. Its purpose is to judge the business consequences of those bugs.

This is especially useful in AI-assisted development and vibe coding scenarios, where review tools may report many defects, but a seemingly minor bug can still cause a major business failure once it hits real workflows.

## 2. Prerequisites

### 2.1 Environment

- Node.js 18 or later
- npm
- Project dependencies installed

Install dependencies if needed:

```bash
npm install
```

### 2.2 How to Run the Current Version

The repository does not yet expose a packaged executable command. Run the CLI directly with `ts-node`:

```bash
npx ts-node src/presentation/cli.ts --help
```

## 3. What the Tool Does

BizAudit currently supports the following workflow:

- read a local linter JSON report
- convert report entries into internal defect objects
- search for business documents near the defect location
- build an impact assessment prompt
- evaluate the defect against business context
- print the result as terminal text or JSON

In practical terms, BizAudit helps answer questions like:

- Does this bug only affect code quality, or can it damage a real business process?
- Is this defect just a technical warning, or can it break payment, ordering, settlement, permissions, or data integrity?
- Should this issue be fixed later, fixed now, or treated as a release blocker?

## 4. Input Requirements

### 4.1 Report File

The `audit` command requires a path to a local JSON report:

```bash
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json
```

### 4.2 Supported Report Shape

The current implementation expects an ESLint-like JSON structure:

```json
[
  {
    "filePath": "src/modules/order/service.ts",
    "messages": [
      {
        "line": 18,
        "ruleId": "no-floating-promises",
        "message": "Promises must be awaited."
      },
      {
        "line": 42,
        "ruleId": "eqeqeq",
        "message": "Expected '===' and instead saw '=='."
      }
    ]
  }
]
```

Important details:

- the top-level value must be an array
- each file result should contain `filePath`
- `messages` must be an array
- only messages with both `ruleId` and `line` are included in the audit flow

## 5. Business Context Discovery Rules

BizAudit starts from the directory of the defect file and walks upward until it reaches the current working directory.

The current implementation recognizes these files as business context:

- `*.feature`
- `domain.md`
- `README.md`

Once the first matching file is found, its full content is used as the business context.

## 6. Commands

### 6.1 Show Help

```bash
npx ts-node src/presentation/cli.ts --help
```

### 6.2 Run an Audit

```bash
npx ts-node src/presentation/cli.ts audit <reportPath>
```

Example:

```bash
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json
```

## 7. Command Options

### 7.1 `--format`

Controls output format:

- `text`: colored terminal output
- `json`: JSON output

Example:

```bash
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json --format json
```

### 7.2 `--severity-filter`

Filters completed results and keeps only items at or above the given severity.

Allowed values:

- `none`
- `low`
- `medium`
- `high`
- `fatal`

Example:

```bash
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json --severity-filter high
```

Notes:

- completed tasks are filtered by severity
- failed tasks are still shown
- non-completed items without results are preserved for troubleshooting

### 7.3 `--api-key`

Pass an LLM API key from the command line:

```bash
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json --api-key your_key
```

You can also use an environment variable:

```bash
set LLM_API_KEY=your_key
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json
```

### 7.4 `--config`

Pass a custom configuration file path:

```bash
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json --config ./bizaudit.config.json
```

This option is reserved for future use and is not active yet.

## 8. Output Explanation

### 8.1 Text Output

The default terminal output includes:

- defect rule identifier
- file location
- original linter message
- discovered business domain
- impact evaluation text
- summary counts

The impact evaluation is the key value of the tool. It is meant to explain the business blast radius of a bug, not just restate the technical finding.

Severity levels:

- `FATAL`
- `HIGH`
- `MEDIUM`
- `LOW`
- `NONE`

### 8.2 JSON Output

When `--format json` is used, the output looks like this:

```json
[
  {
    "id": "defect-id",
    "status": "COMPLETED",
    "defect": {
      "file": "C:\\project\\src\\modules\\order\\service.ts",
      "line": 18,
      "rule": "no-floating-promises",
      "message": "Promises must be awaited."
    },
    "severity": "MEDIUM",
    "impact": "This defect may affect business flow execution and should be reviewed manually.",
    "errorReason": null
  }
]
```

Field descriptions:

- `id`: task identifier
- `status`: task status
- `defect`: normalized defect information
- `severity`: evaluated severity level
- `impact`: impact assessment text
- `errorReason`: failure reason, only populated on failed tasks

When reviewing output, the most important field is usually `impact`, because it tells you why a bug matters in business terms.

## 9. Task Status

The current status model includes:

- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`
- `FAILED`

In practice, once a defect enters the workflow, it usually ends as:

- `COMPLETED` on success
- `FAILED` on evaluation failure

## 10. Typical Usage Scenarios

### Scenario 1: Review the colored terminal report locally

```bash
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json
```

Use this when you want to quickly inspect which code-review findings may have real business consequences.

### Scenario 2: Focus on high-risk issues first

```bash
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json --severity-filter high
```

Use this when a review tool reported many bugs and you want to prioritize defects that may create severe business impact.

### Scenario 3: Export JSON for scripts or CI pipelines

```bash
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json --format json
```

Use this when you want another system to consume the impact evaluation and decide whether a release, merge, or alert should be blocked.

## 11. Troubleshooting

### 11.1 `Report file not found`

Cause:

The provided report path does not exist.

Fix:

- verify the report path
- use a path relative to the current working directory
- switch to an absolute path if needed

### 11.2 `Failed to parse linter report`

Cause:

The report is not valid JSON, or it does not match the currently supported structure.

Fix:

- validate JSON syntax
- confirm the top-level value is an array
- confirm each item contains `messages`

### 11.3 No business document was discovered

Cause:

No `.feature`, `domain.md`, or `README.md` file was found while walking upward from the defect file path.

Fix:

- add business documentation near the relevant module
- make sure you run the command from the correct project root

If no business document is found, BizAudit falls back to a technical-only assessment prompt.

## 12. Known Limitations

Please keep the following in mind:

- `LlmGatewayAdapter` is still mocked and does not call a real LLM service
- because of the mock response format, severity parsing usually falls back to `MEDIUM`
- `--api-key` is accepted but not used by a live integration yet
- `--config` is not implemented yet
- tasks are processed sequentially
- business document discovery is intentionally simple and stops at the first match

This makes the repository well suited for:

- CLI prototyping
- workflow demonstrations
- architecture discussion
- future extension toward real LLM integrations

## 13. Recommended Directory Layout

To improve business context discovery, keep code and business docs close together. For example:

```text
project/
  src/
    order/
      README.md
      service.ts
      validator.ts
  reports/
    eslint-report.json
```

Or:

```text
project/
  src/
    payment/
      payment.feature
      handler.ts
```

## 14. Quick Command Reference

```bash
npx ts-node src/presentation/cli.ts --help
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json --format json
npx ts-node src/presentation/cli.ts audit ./reports/eslint-report.json --severity-filter high
```
