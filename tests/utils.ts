import type { Octokit } from "@octokit/core";
import { composePaginateRest } from "@octokit/plugin-paginate-rest";
import { vi } from "vitest";

export const createOctokit = ({
  paginate = (func) => func,
  request = (func) => {
    return func.mockImplementation(async (route: string) => {
      const method = route.split(" ", 1)[0];
      if (method === "GET") return { data: [] };
      if (method === "POST") return { data: { id: 1, body: "created" } };
      if (method === "PATCH") return { data: { id: 1, body: "updated" } };
      return { data: null };
    });
  },
}: {
  paginate?: (<T extends ReturnType<typeof vi.fn>>(func: T) => T) | undefined;
  request?: (<T extends ReturnType<typeof vi.fn>>(func: T) => T) | undefined;
} = {}) => {
  const octokit = { paginate: paginate(vi.fn()), request: request(vi.fn()) };

  vi.mocked(composePaginateRest.iterator).mockImplementation(() => ({
    async *[Symbol.asyncIterator]() {
      const data = await octokit.paginate("GET /", {});
      yield { data, headers: {}, url: "", status: 200 };
    },
  }));

  return octokit as unknown as Octokit & {
    paginate: ReturnType<typeof vi.fn>;
    request: ReturnType<typeof vi.fn>;
  };
};
