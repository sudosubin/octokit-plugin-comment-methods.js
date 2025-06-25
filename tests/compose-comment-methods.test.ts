import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  composeGetCommitComment,
  composeGetGistComment,
  composeGetIssueComment,
  composeGetPullRequestReviewComment,
  composeUpsertCommitComment,
  composeUpsertGistComment,
  composeUpsertIssueComment,
  composeUpsertPullRequestReviewComment,
} from "@/compose-comment-methods";
import { createOctokit } from "./utils";

vi.mock("@octokit/plugin-paginate-rest", () => ({
  composePaginateRest: { iterator: vi.fn() },
}));

describe("composeCommitComment", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should get commit comment with composeGetCommitComment", async () => {
    // given
    const comment = {
      id: 1,
      body: '<!-- octokit-plugin-comment-methods: {"key":"test"} -->\nTest comment',
    };
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([comment]),
    });
    const options = {
      owner: "octocat",
      repo: "hello-world",
      commit_sha: "abc123",
      key: "test",
    };

    // when
    const result = await composeGetCommitComment(octokit, options);

    // then
    expect(result.comment).toEqual(comment);
    expect(result.parsed).toEqual({
      key: "test",
      text: "Test comment",
      payload: undefined,
    });
  });

  it("should upsert commit comment with composeUpsertCommitComment", async () => {
    // given
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([]),
    });
    const options = {
      owner: "octocat",
      repo: "hello-world",
      commit_sha: "abc123",
      key: "test",
      text: "New comment",
      payload: { version: "1.0" },
    };

    // when
    const result = await composeUpsertCommitComment(octokit, options);

    // then
    expect(octokit.request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments",
      expect.objectContaining({
        owner: "octocat",
        repo: "hello-world",
        commit_sha: "abc123",
        body: expect.stringContaining("New comment"),
      }),
    );
    expect(result).toEqual({ id: 1, body: "created" });
  });

  it("should use custom delimiter for commit comments", async () => {
    // given
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([]),
    });
    const options = {
      owner: "octocat",
      repo: "hello-world",
      commit_sha: "abc123",
      key: "test",
      text: "Test with custom delimiter",
      delimiter: "custom-app",
    };

    // when
    await composeUpsertCommitComment(octokit, options);

    // then
    expect(octokit.request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments",
      expect.objectContaining({
        body: expect.stringContaining("<!-- custom-app:"),
      }),
    );
  });

  it("should handle API errors gracefully for commit comments", async () => {
    // given
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([]),
      request: (func) => func.mockRejectedValueOnce(new Error("API Error")),
    });
    const options = {
      owner: "octocat",
      repo: "hello-world",
      commit_sha: "abc123",
      key: "test",
      text: "Test comment",
    };

    // when & then
    await expect(composeUpsertCommitComment(octokit, options)).rejects.toThrow(
      "API Error",
    );
  });
});

describe("composeGistComment", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should get gist comment with composeGetGistComment", async () => {
    // given
    const comment = {
      id: 1,
      body: '<!-- octokit-plugin-comment-methods: {"key":"gist-test"} -->\nGist comment',
    };
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([comment]),
    });
    const options = { gist_id: "gist123", key: "gist-test" };

    // when
    const result = await composeGetGistComment(octokit, options);

    // then
    expect(result.comment).toEqual(comment);
    expect(result.parsed).toEqual({
      key: "gist-test",
      text: "Gist comment",
      payload: undefined,
    });
  });

  it("should upsert gist comment with composeUpsertGistComment", async () => {
    // given
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([]),
    });
    const options = {
      gist_id: "gist123",
      key: "gist-test",
      text: "New gist comment",
    };

    // when
    const result = await composeUpsertGistComment(octokit, options);

    // then
    expect(octokit.request).toHaveBeenCalledWith(
      "POST /gists/{gist_id}/comments",
      expect.objectContaining({
        gist_id: "gist123",
        body: expect.stringContaining("New gist comment"),
      }),
    );
    expect(result).toEqual({ id: 1, body: "created" });
  });

  it("should handle paginate errors gracefully for gist comments", async () => {
    // given
    const octokit = createOctokit({
      paginate: (func) =>
        func.mockRejectedValueOnce(new Error("Paginate Error")),
    });
    const options = { gist_id: "gist123", key: "test" };

    // when & then
    await expect(composeGetGistComment(octokit, options)).rejects.toThrow(
      "Paginate Error",
    );
  });
});

describe("composeIssueComment", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should get issue comment with composeGetIssueComment", async () => {
    // given
    const comment = {
      id: 1,
      body: '<!-- octokit-plugin-comment-methods: {"key":"issue-test"} -->\nIssue comment',
    };
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([comment]),
    });
    const options = {
      owner: "octocat",
      repo: "hello-world",
      issue_number: 1,
      key: "issue-test",
    };

    // when
    const result = await composeGetIssueComment(octokit, options);

    // then
    expect(result.comment).toEqual(comment);
    expect(result.parsed).toEqual({
      key: "issue-test",
      text: "Issue comment",
      payload: undefined,
    });
  });

  it("should upsert issue comment with composeUpsertIssueComment", async () => {
    // given
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([]),
    });
    const options = {
      owner: "octocat",
      repo: "hello-world",
      issue_number: 1,
      key: "issue-test",
      text: "New issue comment",
      payload: { status: "open" },
    };

    // when
    const result = await composeUpsertIssueComment(octokit, options);

    // then
    expect(octokit.request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      expect.objectContaining({
        owner: "octocat",
        repo: "hello-world",
        issue_number: 1,
        body: expect.stringContaining("New issue comment"),
      }),
    );
    expect(result).toEqual({ id: 1, body: "created" });
  });

  it("should update existing issue comment", async () => {
    // given
    const comment = {
      id: 123,
      body: '<!-- octokit-plugin-comment-methods: {"key":"issue-test"} -->\nOld comment',
    };
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([comment]),
    });
    const options = {
      owner: "octocat",
      repo: "hello-world",
      issue_number: 1,
      key: "issue-test",
      text: "Updated comment",
    };

    // when
    const result = await composeUpsertIssueComment(octokit, options);

    // then
    expect(octokit.request).toHaveBeenCalledWith(
      "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
      expect.objectContaining({
        owner: "octocat",
        repo: "hello-world",
        issue_number: 1,
        comment_id: 123,
        body: expect.stringContaining("Updated comment"),
      }),
    );
    expect(result).toEqual({ id: 1, body: "updated" });
  });
});

describe("composePullRequestReviewComment", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should get pull request review comment with composeGetPullRequestReviewComment", async () => {
    // given
    const comment = {
      id: 1,
      body: '<!-- octokit-plugin-comment-methods: {"key":"pr-review-test"} -->\nPR review comment',
    };
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([comment]),
    });
    const options = {
      owner: "octocat",
      repo: "hello-world",
      pull_number: 1,
      key: "pr-review-test",
    };

    // when
    const result = await composeGetPullRequestReviewComment(octokit, options);

    // then
    expect(result.comment).toEqual(comment);
    expect(result.parsed).toEqual({
      key: "pr-review-test",
      text: "PR review comment",
      payload: undefined,
    });
  });

  it("should upsert pull request review comment with composeUpsertPullRequestReviewComment", async () => {
    // given
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([]),
    });
    const options = {
      owner: "octocat",
      repo: "hello-world",
      pull_number: 1,
      key: "pr-review-test",
      text: "New PR review comment",
      payload: { line: 42, path: "src/index.ts" },
    };

    // when
    const result = await composeUpsertPullRequestReviewComment(
      octokit,
      options,
    );

    // then
    expect(octokit.request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      expect.objectContaining({
        owner: "octocat",
        repo: "hello-world",
        pull_number: 1,
        body: expect.stringContaining("New PR review comment"),
      }),
    );
    expect(result).toEqual({ id: 1, body: "created" });
  });

  it("should update existing pull request review comment", async () => {
    // given
    const comment = {
      id: 456,
      body: '<!-- octokit-plugin-comment-methods: {"key":"pr-review-test"} -->\nOld PR review comment',
    };
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([comment]),
    });
    const options = {
      owner: "octocat",
      repo: "hello-world",
      pull_number: 1,
      key: "pr-review-test",
      text: "Updated PR review comment",
    };

    // when
    const result = await composeUpsertPullRequestReviewComment(
      octokit,
      options,
    );

    // then
    expect(octokit.request).toHaveBeenCalledWith(
      "PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}",
      expect.objectContaining({
        owner: "octocat",
        repo: "hello-world",
        pull_number: 1,
        comment_id: 456,
        body: expect.stringContaining("Updated PR review comment"),
      }),
    );
    expect(result).toEqual({ id: 1, body: "updated" });
  });

  it("should use custom delimiter for pull request review comments", async () => {
    // given
    const octokit = createOctokit({
      paginate: (func) => func.mockResolvedValueOnce([]),
    });
    const options = {
      owner: "octocat",
      repo: "hello-world",
      pull_number: 1,
      key: "test",
      text: "Test with custom delimiter",
      delimiter: "custom-pr-app",
    };

    // when
    await composeUpsertPullRequestReviewComment(octokit, options);

    // then
    expect(octokit.request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      expect.objectContaining({
        body: expect.stringContaining("<!-- custom-pr-app:"),
      }),
    );
  });
});
