import type { Octokit } from "@octokit/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OctokitCommentManager } from "@/index";
import { createOctokit } from "./utils";

vi.mock("@octokit/plugin-paginate-rest", () => ({
  composePaginateRest: { iterator: vi.fn() },
}));

const createOctokitCommentManager = ({
  delimiter,
  paginate,
  request,
}: {
  delimiter?: string;
  paginate?: (<T extends ReturnType<typeof vi.fn>>(func: T) => T) | undefined;
  request?: (<T extends ReturnType<typeof vi.fn>>(func: T) => T) | undefined;
} = {}) => {
  const octokit = createOctokit({ paginate, request });

  const routes = {
    paginate: "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
    create: "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
    update: "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
  } as const;

  const manager = new OctokitCommentManager({ delimiter, octokit, routes });
  return manager as OctokitCommentManager & {
    octokit: Octokit;
    create: OctokitCommentManager["create"];
    parse: OctokitCommentManager["parse"];
    stringify: OctokitCommentManager["stringify"];
    update: OctokitCommentManager["update"];
  };
};

describe("OctokitCommentManager", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should use provided delimiter", () => {
    // given
    const delimiter = "custom-delimiter";
    const manager = createOctokitCommentManager({ delimiter });

    // when
    const result = manager.stringify({
      key: "k",
      text: "hi",
      payload: undefined,
    });

    // then
    expect(result).toContain(`<!-- ${delimiter}: `);
  });

  it("should use package name as default delimiter", () => {
    // given
    const manager = createOctokitCommentManager();

    // when
    const result = manager.stringify({
      key: "k",
      text: "hi",
      payload: undefined,
    });

    // then
    expect(result).toContain("<!-- octokit-plugin-comment-methods: ");
  });

  it("should parse correctly when key matches", () => {
    // given
    const input = {
      key: "test-key",
      body: `<!-- octokit-plugin-comment-methods: {"key":"test-key"} -->\nHello world!`,
    };
    const manager = createOctokitCommentManager();

    // when
    const result = manager.parse(input);

    // then
    expect(result).toEqual({
      key: "test-key",
      text: "Hello world!",
      payload: undefined,
    });
  });

  it("should return null when key doesn't match", () => {
    // given
    const input = {
      key: "different-key",
      body: `<!-- octokit-plugin-comment-methods: {"key":"test-key"} -->\nHello world!`,
    };
    const manager = createOctokitCommentManager();

    // when
    const result = manager.parse(input);

    // then
    expect(result).toBeNull();
  });

  it("should return null with invalid JSON annotation", () => {
    // given
    const input = {
      key: "test-key",
      body: `<!-- octokit-plugin-comment-methods: {invalid json} -->\nHello world`,
    };
    const manager = createOctokitCommentManager();

    // when
    const result = manager.parse(input);

    // then
    expect(result).toBeNull();
  });

  it("should parse payload data", () => {
    // given
    const input = {
      key: "test-key",
      body: `<!-- octokit-plugin-comment-methods: {"key":"test-key","payload":{"version":"1.0","data":"test"}} -->\nComment with payload`,
    };
    const manager = createOctokitCommentManager();

    // when
    const result = manager.parse(input);

    // then
    expect(result).toEqual({
      key: "test-key",
      text: "Comment with payload",
      payload: { version: "1.0", data: "test" },
    });
  });

  it("should format comment text with annotation", () => {
    // given
    const input = { key: "test-key", text: "Hello world!", payload: undefined };
    const manager = createOctokitCommentManager();

    // when
    const result = manager.stringify(input);

    // then
    expect(result).toBe(
      '<!-- octokit-plugin-comment-methods: {"key":"test-key"} -->\nHello world!',
    );
  });

  it("should handle payload data in stringify", () => {
    // given
    const input = {
      key: "test-key",
      text: "Comment with payload",
      payload: { version: "1.0", data: "test" },
    };
    const manager = createOctokitCommentManager();

    // when
    const result = manager.stringify(input);

    // then
    expect(result).toBe(
      '<!-- octokit-plugin-comment-methods: {"key":"test-key","payload":{"version":"1.0","data":"test"}} -->\nComment with payload',
    );
  });

  it("should create comment via octokit.request", async () => {
    // given
    const options = {
      owner: "test",
      repo: "test",
      issue_number: 1,
      body: "test",
    };
    const manager = createOctokitCommentManager({
      request: (func) =>
        func.mockResolvedValue({ data: { id: 1, body: "test" } }),
    });

    // when
    const result = await manager.create(options);

    // then
    expect(manager.octokit.request).toHaveBeenCalledWith(
      expect.stringMatching(/^POST /),
      options,
    );
    expect(result).toEqual({ id: 1, body: "test" });
  });

  it("should update comment via octokit.request", async () => {
    // given
    const options = {
      owner: "test",
      repo: "test",
      comment_id: 1,
      body: "updated",
    };
    const manager = createOctokitCommentManager({
      request: (func) =>
        func.mockResolvedValue({ data: { id: 1, body: "updated" } }),
    });

    // when
    const result = await manager.update(options);

    // then
    expect(manager.octokit.request).toHaveBeenCalledWith(
      expect.stringMatching(/^PATCH /),
      options,
    );
    expect(result).toEqual({ id: 1, body: "updated" });
  });

  it("should create a new comment when no existing comment is found", async () => {
    // given
    const options = {
      key: "new-key",
      text: "New comment",
      owner: "test",
      repo: "test",
      issue_number: 1,
    };
    const manager = createOctokitCommentManager({
      paginate: (func) => func.mockResolvedValue([]),
      request: (func) =>
        func.mockResolvedValue({ data: { id: 1, body: "test" } }),
    });

    // when
    const result = await manager.upsert(options);

    // then
    expect(manager.octokit.request).toHaveBeenCalledWith(
      expect.stringMatching(/^POST /),
      expect.objectContaining({
        owner: "test",
        repo: "test",
        issue_number: 1,
        body: expect.stringContaining("New comment"),
      }),
    );
    expect(result).toEqual({ id: 1, body: "test" });
  });

  it("should update an existing comment when one is found", async () => {
    // given
    const options = {
      key: "test-key",
      text: "Updated comment",
      owner: "test",
      repo: "test",
      issue_number: 1,
    };
    const manager = createOctokitCommentManager({
      paginate: (func) =>
        func.mockResolvedValue([
          {
            id: 123,
            body: `<!-- octokit-plugin-comment-methods: {"key":"test-key"} -->\nHello world!`,
            user: { login: "test-user" },
            created_at: "2023-01-01T00:00:00Z",
            updated_at: "2023-01-01T00:00:00Z",
          },
        ]),
      request: (func) =>
        func.mockResolvedValue({ data: { id: 1, body: "updated" } }),
    });

    // when
    const result = await manager.upsert(options);

    // then
    expect(manager.octokit.request).toHaveBeenCalledWith(
      expect.stringMatching(/^PATCH /),
      expect.objectContaining({
        owner: "test",
        repo: "test",
        comment_id: 123,
        body: expect.stringContaining("Updated comment"),
      }),
    );
    expect(result).toEqual({ id: 1, body: "updated" });
  });

  it("should include payload in the comment body during upsert", async () => {
    // given
    const options = {
      key: "test-key",
      text: "Comment with payload",
      payload: { version: "1.0" },
      owner: "test",
      repo: "test",
      issue_number: 1,
    };
    const manager = createOctokitCommentManager({
      paginate: (func) => func.mockResolvedValue([]),
      request: (func) =>
        func.mockResolvedValue({ data: { id: 1, body: "test" } }),
    });

    // when
    await manager.upsert(options);

    // then
    expect(manager.octokit.request).toHaveBeenCalledWith(
      expect.stringMatching(/^POST /),
      expect.objectContaining({
        body: expect.stringContaining('"payload":{"version":"1.0"}'),
      }),
    );
  });

  it("should throw error when upsert fails", async () => {
    // given
    const options = {
      key: "test-key",
      text: "Test comment",
      owner: "test",
      repo: "test",
      issue_number: 1,
    };
    const error = new Error("Failed to get comments");
    const manager = createOctokitCommentManager({
      paginate: (func) => func.mockRejectedValue(error),
    });

    // when & then
    await expect(manager.upsert(options)).rejects.toThrow(
      "Failed to get comments",
    );
  });
});
