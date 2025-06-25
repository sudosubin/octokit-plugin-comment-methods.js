import type { Octokit } from "@octokit/core";
import type { PaginatingEndpoints } from "@octokit/plugin-paginate-rest";
import type { Endpoints } from "@octokit/types";
import type { OctokitCommentManager } from "@/comment-manager";

export interface OctokitCommentData {
  key: string;
  text: string;
  payload?: OctokitCommentPayload | undefined;
}

export type OctokitCommentManagerOptions = ConstructorParameters<
  typeof OctokitCommentManager
>[0];

export type OctokitCommentPayload = Record<string, unknown>;

export type PaginatingEndpointParameters<E extends keyof PaginatingEndpoints> =
  PaginatingEndpoints[E]["parameters"];

export type PaginatingEndpointResponseData<
  E extends keyof PaginatingEndpoints,
> = PaginatingEndpoints[E]["response"]["data"];

export type EndpointParameters<E extends keyof Endpoints> = Parameters<
  typeof Octokit.prototype.request<E>
>[1];

export type EndpointResponseData<E extends keyof Endpoints> =
  Endpoints[E]["response"]["data"];

export type PaginatingEndpointWithCommentResponse = {
  [K in keyof PaginatingEndpoints]: PaginatingEndpoints[K]["response"]["data"] extends (infer T)[]
    ? "body" extends keyof T
      ? "id" extends keyof T
        ? K
        : never
      : never
    : never;
}[keyof PaginatingEndpoints];

export type EndpointWithBodyParameter = {
  [K in keyof Endpoints]: "body" extends keyof Endpoints[K]["parameters"]
    ? K
    : never;
}[keyof Endpoints];

export type EndpointWithBodyAndCommentIdParameter = {
  [K in keyof Endpoints]: "body" extends keyof Endpoints[K]["parameters"]
    ? "comment_id" extends keyof Endpoints[K]["parameters"]
      ? K
      : never
    : never;
}[keyof Endpoints];

export type ComposeGetOptions<E extends PaginatingEndpointWithCommentResponse> =
  { delimiter?: string } & Parameters<OctokitCommentManager<E>["get"]>[0];

export type ComposeUpsertOptions<
  E extends PaginatingEndpointWithCommentResponse,
> = { delimiter?: string } & Parameters<OctokitCommentManager<E>["upsert"]>[0];
