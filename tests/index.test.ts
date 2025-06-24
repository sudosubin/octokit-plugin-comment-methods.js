import type { Octokit } from "@octokit/core";
import { describe, expect, it } from "vitest";
import { commentMethods } from "@/index";

describe("commentMethods", () => {
  it("should return the correct structure matching composeCommentMethods", () => {
    // given
    const octokit = {} as Octokit;

    // when
    const result = commentMethods(octokit);

    // then
    expect(result).toEqual({
      comments: {
        getCommitComment: expect.any(Function),
        getGistComment: expect.any(Function),
        getIssueComment: expect.any(Function),
        getPullRequestReview: expect.any(Function),
        upsertCommitComment: expect.any(Function),
        upsertGistComment: expect.any(Function),
        upsertIssueComment: expect.any(Function),
        upsertPullRequestReview: expect.any(Function),
      },
    });
  });
});
