import type { Octokit } from "@octokit/core";
import { composeCommentMethods } from "@/compose-comment-methods";

export { OctokitCommentManager } from "@/comment-manager";
export {
  composeCommentMethods,
  composeCommitComment,
  composeGistComment,
  composeIssueComment,
  composePullRequestReviewComment,
} from "@/compose-comment-methods";
export type {
  OctokitCommentData,
  OctokitCommentManagerOptions,
  OctokitCommentPayload,
} from "@/types";

export const commentMethods = (octokit: Octokit) => {
  return composeCommentMethods(octokit);
};
