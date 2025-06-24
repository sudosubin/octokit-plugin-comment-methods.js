# octokit-plugin-comment-methods.js

> Convenience methods to manage comments on GitHub with structured metadata
> support

An Octokit plugin that provides a unified interface for managing comments on
commits, gists, issues, and pull request reviews with embedded metadata for
smart comment management.

## Usage

<table>
<tbody valign=top align=left>
<tr><th>

Browsers

</th><td width=100%>

Load `octokit-plugin-comment-methods` and
[`@octokit/core`](https://github.com/octokit/core.js) (or core-compatible
module) directly from [esm.sh](https://esm.sh)

```html
<script type="module">
  import { Octokit } from "https://esm.sh/@octokit/core";
  import {
    commentMethods,
    composeCommentMethods,
  } from "https://esm.sh/octokit-plugin-comment-methods";
</script>
```

</td></tr>
<tr><th>
Node
</th><td>

Install with `npm install octokit-plugin-comment-methods`. Optionally replace
`@octokit/core` with a core-compatible module

```js
import { Octokit } from "@octokit/core";
import {
  commentMethods,
  composeCommentMethods,
} from "octokit-plugin-comment-methods";
```

</td></tr>
</tbody>
</table>

After loading `octokit-plugin-comment-methods`, you can create and use an
`Octokit` instance as follows:

```js
const MyOctokit = Octokit.plugin(commentMethods);
const octokit = new MyOctokit({ auth: "your-token-here" });
```

## How does it work?

This plugin works by embedding structured metadata into GitHub comments using
markdown comment. Here's how it operates:

### Comment Format

The plugin stores data in comments using a special HTML comment format that
contains JSON metadata:

```markdown
<!-- octokit-plugin-comment-methods: {"key": "your-key", "payload": {...}} -->
Your visible comment text here
```

### Core Operations

#### Upsert (Update or Insert)

- Searches for an existing comment with the matching `key`
- If found, updates the existing comment with new content
- If not found, creates a new comment
- This prevents duplicate comments and maintains a single comment

#### Get

- Iterates through all comments, and returns the first comment that matches the
  specified `key`
- Extracts both the visible text and the structured payload data

### Data Structure

- `key`: A unique identifier for the comment type/purpose
- `text`: The visible markdown content of the comment
- `payload`: Optional structured data (any JSON-serializable object)

### Supported Comment Types

The plugin provides managers for different GitHub comment contexts:

- Commit Comments
- Gist Comments
- Issue Comments
- Pull Request Review Comments

Each manager uses the appropriate GitHub API endpoints for that comment type
while maintaining the same interface and comment format.

## API Reference

### Commit Comments

#### `getCommitComment(options)`

Get a comment by key from a commit.

```typescript
const { comment, parsed } = await octokit.comments.getCommitComment({
  owner: string;
  repo: string;
  commit_sha: string;
  key: string;
});
```

#### `upsertCommitComment(options)`

Create or update a comment on a commit.

```typescript
await octokit.comments.upsertCommitComment({
  owner: string;
  repo: string;
  commit_sha: string;
  key: string;
  text: string;
  payload?: Record<string, unknown>;
});
```

### Gist Comments

#### `getGistComment(options)`

Get a comment by key from a gist.

```typescript
const { comment, parsed } = await octokit.comments.getGistComment({
  gist_id: string;
  key: string;
});
```

#### `upsertGistComment(options)`

Create or update a comment on a gist.

```typescript
await octokit.comments.upsertGistComment({
  gist_id: string;
  key: string;
  text: string;
  payload?: Record<string, unknown>;
});
```

### Issue Comments

#### `getIssueComment(options)`

Get a comment by key from an issue or pull request.

```typescript
const { comment, parsed } = await octokit.comments.getIssueComment({
  owner: string;
  repo: string;
  issue_number: number;
  key: string;
});
```

#### `upsertIssueComment(options)`

Create or update a comment on an issue or pull request.

```typescript
await octokit.comments.upsertIssueComment({
  owner: string;
  repo: string;
  issue_number: number;
  key: string;
  text: string;
  payload?: Record<string, unknown>;
});
```

### Pull Request Review Comments

#### `getPullRequestReviewComment(options)`

Get a review comment by key from a pull request.

```typescript
const { comment, parsed } = await octokit.comments.getPullRequestReviewComment({
  owner: string;
  repo: string;
  pull_number: number;
  key: string;
});
```

#### `upsertPullRequestReviewComment(options)`

Create or update a review comment on a pull request.

```typescript
await octokit.comments.upsertPullRequestReviewComment({
  owner: string;
  repo: string;
  pull_number: number;
  key: string;
  text: string;
  payload?: Record<string, unknown>;
});
```

## Examples

### Quick Start

```js
await octokit.comments.upsertIssueComment({
  owner: "octocat",
  repo: "hello-world",
  issue_number: 1,
  key: "build-status",
  text: "✅ Build passed successfully!",
  payload: { id: "abc123", status: "SUCCESS", duration: 180 },
});

const { comment, parsed } = await octokit.comments.getIssueComment({
  owner: "octocat",
  repo: "hello-world",
  issue_number: 1,
  key: "build-status",
});

if (parsed) {
  console.log(`Build ${parsed.payload.id}: ${parsed.payload.status}`);
}
```

### Advanced: Deployment History Tracking

Build a persistent deployment log by appending new deployments to existing
comment data:

```typescript
interface Deployment {
  sha: string;
  time: string;
  result: string;
}

const { parsed } = await octokit.comments.getIssueComment({
  owner: "octocat",
  repo: "hello-world",
  issue_number: 1,
  key: "deployment",
});

const deployments = [
  { sha: process.env.GIT_SHA, time: new Date().toISOString() },
  ...((parsed?.payload?.deployments || []) as Deployment[]),
];

/**
 * The generated comment looks like this:
 * <!-- octokit-plugin-comment-methods: {"key": "deployment", "payload": {
 *   "deployments": [
 *     {"sha": "0001", "time": "1970-01-01T00:01:15.000Z"},
 *     {"sha": "0000", "time": "1970-01-01T00:01:00.000Z"}
 *   ]
 * }} -->
 * #### Deployment History
 *
 * - `0001`: Deployed at `1970-01-01T00:01:15.000Z`
 * - `0000`: Deployed at `1970-01-01T00:01:00.000Z`
 */
octokit.comments.upsertIssueComment({
  owner: "octocat",
  repo: "hello-world",
  issue_number: 1,
  key: "deployment",
  text: `#### Deployment History\n\n${deployments
    .map(({ sha, time }) => `- \`${sha}\`: Deployed at \`${time}\``)
    .join("\n")}`,
  payload: { deployments },
});
```

## License

[MIT](LICENSE)
