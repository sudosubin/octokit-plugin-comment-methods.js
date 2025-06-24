import type { Octokit } from "@octokit/core";
import { OctokitCommentManager } from "@/comment-manager";
import type { OctokitCommentManagerOptions } from "@/types";

export const composeCommitComment = (
  options: Omit<OctokitCommentManagerOptions, "routes">,
) => {
  return new OctokitCommentManager({
    ...options,
    routes: {
      paginate: "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments",
      create: "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments",
      update: "PATCH /repos/{owner}/{repo}/comments/{comment_id}",
    },
  });
};

export const composeGistComment = (
  options: Omit<OctokitCommentManagerOptions, "routes">,
) => {
  return new OctokitCommentManager({
    ...options,
    routes: {
      paginate: "GET /gists/{gist_id}/comments",
      create: "POST /gists/{gist_id}/comments",
      update: "PATCH /gists/{gist_id}/comments/{comment_id}",
    },
  });
};

export const composeIssueComment = (
  options: Omit<OctokitCommentManagerOptions, "routes">,
) => {
  return new OctokitCommentManager({
    ...options,
    routes: {
      paginate: "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
      create: "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      update: "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
    },
  });
};

export const composePullRequestReviewComment = (
  options: Omit<OctokitCommentManagerOptions, "routes">,
) => {
  return new OctokitCommentManager({
    ...options,
    routes: {
      paginate: "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      create: "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      update: "PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}",
    },
  });
};

export const composeCommentMethods = (octokit: Octokit) => {
  const commit = composeCommitComment({ octokit });
  const gist = composeGistComment({ octokit });
  const issue = composeIssueComment({ octokit });
  const pullRequestReview = composePullRequestReviewComment({ octokit });

  return {
    comments: {
      getCommitComment: commit.get.bind(commit),
      getGistComment: gist.get.bind(gist),
      getIssueComment: issue.get.bind(issue),
      getPullRequestReviewComment:
        pullRequestReview.get.bind(pullRequestReview),
      upsertCommitComment: commit.upsert.bind(commit),
      upsertGistComment: gist.upsert.bind(gist),
      upsertIssueComment: issue.upsert.bind(issue),
      upsertPullRequestReviewComment:
        pullRequestReview.upsert.bind(pullRequestReview),
    },
  };
};
