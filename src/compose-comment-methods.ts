import type { Octokit } from "@octokit/core";
import { OctokitCommentManager } from "@/comment-manager";
import type { ComposeGetOptions, ComposeUpsertOptions } from "@/types";

export const composeGetCommitComment = async (
  octokit: Octokit,
  {
    delimiter,
    ...options
  }: ComposeGetOptions<"GET /repos/{owner}/{repo}/commits/{commit_sha}/comments">,
) => {
  const manager = new OctokitCommentManager({
    delimiter,
    octokit,
    routes: {
      paginate: "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments",
      create: "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments",
      update: "PATCH /repos/{owner}/{repo}/comments/{comment_id}",
    },
  });

  return await manager.get(options);
};

export const composeUpsertCommitComment = async (
  octokit: Octokit,
  {
    delimiter,
    ...options
  }: ComposeUpsertOptions<"GET /repos/{owner}/{repo}/commits/{commit_sha}/comments">,
) => {
  const manager = new OctokitCommentManager({
    delimiter,
    octokit,
    routes: {
      paginate: "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments",
      create: "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments",
      update: "PATCH /repos/{owner}/{repo}/comments/{comment_id}",
    },
  });

  return await manager.upsert(options);
};

export const composeGetGistComment = async (
  octokit: Octokit,
  { delimiter, ...options }: ComposeGetOptions<"GET /gists/{gist_id}/comments">,
) => {
  const manager = new OctokitCommentManager({
    delimiter,
    octokit,
    routes: {
      paginate: "GET /gists/{gist_id}/comments",
      create: "POST /gists/{gist_id}/comments",
      update: "PATCH /gists/{gist_id}/comments/{comment_id}",
    },
  });

  return await manager.get(options);
};

export const composeUpsertGistComment = async (
  octokit: Octokit,
  {
    delimiter,
    ...options
  }: ComposeUpsertOptions<"GET /gists/{gist_id}/comments">,
) => {
  const manager = new OctokitCommentManager({
    delimiter,
    octokit,
    routes: {
      paginate: "GET /gists/{gist_id}/comments",
      create: "POST /gists/{gist_id}/comments",
      update: "PATCH /gists/{gist_id}/comments/{comment_id}",
    },
  });

  return await manager.upsert(options);
};

export const composeGetIssueComment = async (
  octokit: Octokit,
  {
    delimiter,
    ...options
  }: ComposeGetOptions<"GET /repos/{owner}/{repo}/issues/{issue_number}/comments">,
) => {
  const manager = new OctokitCommentManager({
    delimiter,
    octokit,
    routes: {
      paginate: "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
      create: "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      update: "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
    },
  });

  return await manager.get(options);
};

export const composeUpsertIssueComment = async (
  octokit: Octokit,
  {
    delimiter,
    ...options
  }: ComposeUpsertOptions<"GET /repos/{owner}/{repo}/issues/{issue_number}/comments">,
) => {
  const manager = new OctokitCommentManager({
    delimiter,
    octokit,
    routes: {
      paginate: "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
      create: "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      update: "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
    },
  });

  return await manager.upsert(options);
};

export const composeGetPullRequestReviewComment = async (
  octokit: Octokit,
  {
    delimiter,
    ...options
  }: ComposeGetOptions<"GET /repos/{owner}/{repo}/pulls/{pull_number}/comments">,
) => {
  const manager = new OctokitCommentManager({
    delimiter,
    octokit,
    routes: {
      paginate: "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      create: "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      update: "PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}",
    },
  });

  return await manager.get(options);
};

export const composeUpsertPullRequestReviewComment = async (
  octokit: Octokit,
  {
    delimiter,
    ...options
  }: ComposeUpsertOptions<"GET /repos/{owner}/{repo}/pulls/{pull_number}/comments">,
) => {
  const manager = new OctokitCommentManager({
    delimiter,
    octokit,
    routes: {
      paginate: "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      create: "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      update: "PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}",
    },
  });

  return await manager.upsert(options);
};
