import type { Octokit } from "@octokit/core";
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
import type { ComposeGetOptions, ComposeUpsertOptions } from "@/types";

export { OctokitCommentManager } from "@/comment-manager";
export {
  composeGetCommitComment,
  composeGetGistComment,
  composeGetIssueComment,
  composeGetPullRequestReviewComment,
  composeUpsertCommitComment,
  composeUpsertGistComment,
  composeUpsertIssueComment,
  composeUpsertPullRequestReviewComment,
} from "@/compose-comment-methods";
export type {
  OctokitCommentData,
  OctokitCommentManagerOptions,
  OctokitCommentPayload,
} from "@/types";

export const commentMethods = (octokit: Octokit) => {
  return {
    comments: {
      getCommitComment: (
        options: ComposeGetOptions<"GET /repos/{owner}/{repo}/commits/{commit_sha}/comments">,
      ) => composeGetCommitComment(octokit, options),
      getGistComment: (
        options: ComposeGetOptions<"GET /gists/{gist_id}/comments">,
      ) => composeGetGistComment(octokit, options),
      getIssueComment: (
        options: ComposeGetOptions<"GET /repos/{owner}/{repo}/issues/{issue_number}/comments">,
      ) => composeGetIssueComment(octokit, options),
      getPullRequestReviewComment: (
        options: ComposeGetOptions<"GET /repos/{owner}/{repo}/pulls/{pull_number}/comments">,
      ) => composeGetPullRequestReviewComment(octokit, options),
      upsertCommitComment: (
        options: ComposeUpsertOptions<"GET /repos/{owner}/{repo}/commits/{commit_sha}/comments">,
      ) => composeUpsertCommitComment(octokit, options),
      upsertGistComment: (
        options: ComposeUpsertOptions<"GET /gists/{gist_id}/comments">,
      ) => composeUpsertGistComment(octokit, options),
      upsertIssueComment: (
        options: ComposeUpsertOptions<"GET /repos/{owner}/{repo}/issues/{issue_number}/comments">,
      ) => composeUpsertIssueComment(octokit, options),
      upsertPullRequestReviewComment: (
        options: ComposeUpsertOptions<"GET /repos/{owner}/{repo}/pulls/{pull_number}/comments">,
      ) => composeUpsertPullRequestReviewComment(octokit, options),
    },
  };
};
