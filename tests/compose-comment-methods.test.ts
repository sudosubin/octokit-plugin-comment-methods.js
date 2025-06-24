import type { Octokit } from "@octokit/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OctokitCommentManager } from "@/comment-manager";
import {
  composeCommentMethods,
  composeIssueComment,
} from "@/compose-comment-methods";

vi.mock("@/comment-manager");

const createOctokit = () => {
  const octokit = {
    paginate: vi.fn(),
    request: vi.fn().mockImplementation(async (route: string) => {
      const method = route.split(" ", 1)[0];
      if (method === "GET") return { data: [] };
      if (method === "POST") return { data: { id: 1, body: "created" } };
      if (method === "PATCH") return { data: { id: 1, body: "updated" } };
      return { data: null };
    }),
  };
  return octokit as unknown as Octokit & {
    request: ReturnType<typeof vi.fn>;
    paginate: ReturnType<typeof vi.fn>;
  };
};

const createCommentManager = () => {
  const fn = vi.fn().mockImplementation(async () => ({ id: 1, body: "test" }));
  return { upsert: fn, get: fn } as unknown as OctokitCommentManager;
};

describe("composeIssueComment", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(OctokitCommentManager).mockImplementation(createCommentManager);
  });

  it("should create OctokitCommentManager with routes for issue comments", () => {
    // given
    const octokit = createOctokit();

    // when
    composeIssueComment({ octokit });

    // then
    expect(OctokitCommentManager).toHaveBeenCalledWith({
      octokit,
      routes: {
        paginate: "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
        create: "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        update: "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
      },
    });
  });

  it("should create manager with custom delimiter when provided", () => {
    // given
    const delimiter = "my-custom-delimiter";
    const octokit = createOctokit();

    // when
    composeIssueComment({ delimiter, octokit });

    // then
    expect(OctokitCommentManager).toHaveBeenCalledWith({
      delimiter,
      octokit,
      routes: {
        paginate: "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
        create: "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        update: "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
      },
    });
  });
});

describe("composeCommentMethods", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(OctokitCommentManager).mockImplementation(createCommentManager);
  });

  it("should return flattened comment methods with correct structure", () => {
    // given
    const octokit = createOctokit();

    // when
    const result = composeCommentMethods(octokit);

    // then
    expect(result.comments.getCommitComment).toBeTypeOf("function");
    expect(result.comments.getGistComment).toBeTypeOf("function");
    expect(result.comments.getIssueComment).toBeTypeOf("function");
    expect(result.comments.getPullRequestReview).toBeTypeOf("function");
    expect(result.comments.upsertCommitComment).toBeTypeOf("function");
    expect(result.comments.upsertGistComment).toBeTypeOf("function");
    expect(result.comments.upsertIssueComment).toBeTypeOf("function");
    expect(result.comments.upsertPullRequestReview).toBeTypeOf("function");
  });

  it("should create managers for all comment types", () => {
    // given
    const octokit = createOctokit();

    // when
    composeCommentMethods(octokit);

    // then
    expect(OctokitCommentManager).toHaveBeenCalledWith(
      expect.objectContaining({
        routes: {
          paginate: "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments",
          create: "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments",
          update: "PATCH /repos/{owner}/{repo}/comments/{comment_id}",
        },
      }),
    );

    expect(OctokitCommentManager).toHaveBeenCalledWith(
      expect.objectContaining({
        routes: {
          paginate: "GET /gists/{gist_id}/comments",
          create: "POST /gists/{gist_id}/comments",
          update: "PATCH /gists/{gist_id}/comments/{comment_id}",
        },
      }),
    );

    expect(OctokitCommentManager).toHaveBeenCalledWith(
      expect.objectContaining({
        routes: {
          paginate: "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
          create: "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
          update: "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
        },
      }),
    );

    expect(OctokitCommentManager).toHaveBeenCalledWith(
      expect.objectContaining({
        routes: {
          paginate: "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
          create: "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
          update: "PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}",
        },
      }),
    );
  });
});
