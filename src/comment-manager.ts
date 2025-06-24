import type { Octokit } from "@octokit/core";
import { composePaginateRest } from "@octokit/plugin-paginate-rest";
import type {
  EndpointParameters,
  EndpointResponseData,
  EndpointWithBodyAndCommentIdParameter,
  EndpointWithBodyParameter,
  OctokitCommentData,
  PaginatingEndpointParameters,
  PaginatingEndpointResponseData,
  PaginatingEndpointWithCommentResponse,
} from "@/types";
import { name } from "../package.json";

export class OctokitCommentManager<
  P extends
    PaginatingEndpointWithCommentResponse = PaginatingEndpointWithCommentResponse,
  C extends EndpointWithBodyParameter = EndpointWithBodyParameter,
  U extends
    EndpointWithBodyAndCommentIdParameter = EndpointWithBodyAndCommentIdParameter,
> {
  protected delimiter: string;
  protected octokit: Octokit;
  protected routes: { paginate: P; create: C; update: U };

  constructor({
    delimiter,
    octokit,
    routes,
  }: {
    delimiter?: string | undefined;
    octokit: Octokit;
    routes: { paginate: P; create: C; update: U };
  }) {
    this.delimiter = delimiter || name;
    this.octokit = octokit;
    this.routes = routes;
  }

  public async upsert(
    options: OctokitCommentData & Omit<PaginatingEndpointParameters<P>, "body">,
  ): Promise<EndpointResponseData<C> | EndpointResponseData<U>> {
    const { key, text, payload, ...parameters } = options;
    const { comment } = await this.get({ ...parameters, key });
    const body = this.stringify({ key, text, payload });

    if (comment === null) {
      const params = { ...parameters, body } as unknown;
      return await this.create(params as EndpointParameters<C>);
    } else {
      const params = { ...parameters, body, comment_id: comment.id } as unknown;
      return await this.update(params as EndpointParameters<U>);
    }
  }

  protected async create(
    options: EndpointParameters<C>,
  ): Promise<EndpointResponseData<C>> {
    const { data } = await this.octokit.request(this.routes.create, options);
    return data;
  }

  protected async update(
    options: EndpointParameters<U>,
  ): Promise<EndpointResponseData<U>> {
    const { data } = await this.octokit.request(this.routes.update, options);
    return data;
  }

  public async get(
    options: { key: string } & PaginatingEndpointParameters<P>,
  ): Promise<{
    comment: PaginatingEndpointResponseData<P>[number] | null;
    parsed: OctokitCommentData | null;
  }> {
    const { key, ...parameters } = options;
    const iterator = composePaginateRest.iterator(
      this.octokit,
      this.routes.paginate,
      parameters,
    );

    for await (const response of iterator) {
      for (const comment of response.data as PaginatingEndpointResponseData<P>) {
        const parsed = this.parse({
          key,
          body: (comment.body as string) || "",
        });
        if (parsed !== null) {
          return { comment, parsed };
        }
      }
    }

    return { comment: null, parsed: null };
  }

  protected parse({ key, body }: { key: string; body: string }) {
    const [annotation, ...lines] = body.split("\n");
    const match = annotation?.match(/^<!-- ([^:]*): (.*) -->$/);
    if (!match || match[1] !== this.delimiter) {
      return null;
    }

    try {
      const parsed = JSON.parse(match[2]?.replace("\\n", "\n") || "");
      const data: OctokitCommentData = { ...parsed, text: lines.join("\n") };
      if (data.key === key) {
        return data;
      }
    } catch (_) {}

    return null;
  }

  protected stringify(data: OctokitCommentData) {
    const obj = { key: data.key, payload: data.payload };
    const annotation = JSON.stringify(obj).replaceAll("\n", "\\n");
    return `<!-- ${this.delimiter}: ${annotation} -->\n${data.text}`;
  }
}
