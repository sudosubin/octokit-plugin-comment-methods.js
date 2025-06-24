# octokit-plugin-comment-methods.js

> Convenience methods to manage comments

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
`Octokit` instance as follows.

```js
const MyOctokit = Octokit.plugin(commentMethods);
const octokit = new MyOctokit({ auth: "secret123" });
```

## Use Cases

### Manage Commit Comments

You can manage comments on a commit in the repository.

```js
await octokit.comments.upsertCommitComment({
  owner: "octocat",
  repo: "hello-world",
  commit_sha: "921103db8259eb9de72f42db8b939895f5651489",
  key: "release",
  text: "New Release Notification (1.0)",
  payload: { version: "1.0" },
});

const { comment: _, parsed } = await octokit.comments.getCommitComment({
  owner: "octocat",
  repo: "hello-world",
  commit_sha: "921103db8259eb9de72f42db8b939895f5651489",
  key: "release",
});

if (parsed) {
  console.log(parsed.key); // release
  console.log(parsed.payload); // { version: "1.0" }
  console.log(parsed.text); // New Release Notification (1.0)
}
```

### Manage Gist Comments

You can manage comments on a gist.

```js
await octokit.comments.upsertGistComment({
  gist_id: "gist123",
  key: "release",
  text: "New Release Notification (1.0)",
  payload: { version: "1.0" },
});

const { comment: _, parsed } = await octokit.comments.getGistComment({
  gist_id: "gist123",
  key: "release",
});

if (parsed) {
  console.log(parsed.key); // release
  console.log(parsed.payload); // { version: "1.0" }
  console.log(parsed.text); // New Release Notification (1.0)
}
```

### Manage Issue Comments

You can manage comments on a specific issue or pull request in the repository.

```js
await octokit.comments.upsertIssueComment({
  owner: "octocat",
  repo: "hello-world",
  issue_number: 1,
  key: "release",
  text: "New Release Notification (1.0)",
  payload: { version: "1.0" },
});

const { comment: _, parsed } = await octokit.comments.getIssueComment({
  owner: "octocat",
  repo: "hello-world",
  issue_number: 1,
  key: "release",
});

if (parsed) {
  console.log(parsed.key); // release
  console.log(parsed.payload); // { version: "1.0" }
  console.log(parsed.text); // New Release Notification (1.0)
}
```

### Manage Pull Request Review Comments

You can manage review comments on a specific pull request in the repository.

```js
await octokit.comments.upsertPullRequestReviewComment({
  owner: "octocat",
  repo: "hello-world",
  pull_number: 1,
  key: "release",
  text: "New Release Notification (1.0)",
  payload: { version: "1.0" },
});

const { comment: _, parsed } =
  await octokit.comments.getPullRequestReviewComment({
    owner: "octocat",
    repo: "hello-world",
    pull_number: 1,
    key: "release",
  });

if (parsed) {
  console.log(parsed.key); // release
  console.log(parsed.payload); // { version: "1.0" }
  console.log(parsed.text); // New Release Notification (1.0)
}
```

### Complex Usage

Here is an actual use case.

You may want to deploy every time there is a change in Pull Request and continue
to leave a record of the deployment in the comments. In that case, if there is
an existing comment, you can append the deployment record using the payload of
that comment and update the existing comment instead of creating a new comment,
as shown below.

```js
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
  { sha: "0001", time: "1970-01-01 00:01:15", result: "SUCCESS" },
  ...((parsed?.payload?.deployments || []) as Deployment[]),
];

/**
 * The generated comment looks like this:
 * <!-- octokit-plugin-comment-methods: {"key": "deployment", "payload": {
 *   "deployments": [
 *     {"sha": "0001", "time": "1970-01-01 00:01:15", "result": "SUCCESS"},
 *     {"sha": "0000", "time": "1970-01-01 00:01:00", "result": "FAILURE"}
 *   ]
 * }} -->
 * - `0001`: `1970-01-01 00:01:15` (`SUCCESS`)
 * - `0000`: `1970-01-01 00:01:00` (`FAILURE`)
 */
octokit.comments.upsertIssueComment({
  owner: "octocat",
  repo: "hello-world",
  issue_number: 1,
  key: "deployment",
  text: deployments
    .map(({ sha, time, result }) => `- \`${sha}\`: \`${time}\` (\`${result}\`)`)
    .join("\n"),
  payload: { deployments },
});
```

## License

[MIT](LICENSE)
