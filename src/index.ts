import { IncomingMessage } from "http";

export interface TypeauthOptions {
  appId: string;
  baseUrl?: string;
  tokenHeader?: string;
  disableTelemetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface TypeauthResponse<T> {
  result?: T;
  error?: {
    message: string;
    docs: string;
  };
}

export class Typeauth {
  private readonly baseUrl: string;
  private readonly appId: string;
  private readonly tokenHeader: string;
  private readonly disableTelemetry: boolean;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(options: TypeauthOptions) {
    this.baseUrl = options.baseUrl || "https://api.typeauth.com";
    this.appId = options.appId;
    this.tokenHeader = options.tokenHeader || "Authorization";
    this.disableTelemetry = options.disableTelemetry || false;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  async authenticate(req: IncomingMessage): Promise<TypeauthResponse<boolean>> {
    const token = this.extractTokenFromRequest(req);

    if (!token) {
      return {
        error: {
          message: "Missing token",
          docs: "https://docs.typeauth.com/errors/missing-token",
        },
      };
    }

    const url = `${this.baseUrl}/authenticate`;
    const body = JSON.stringify({
      token,
      appID: this.appId,
      telemetry: this.disableTelemetry
        ? undefined
        : {
            url: req.url,
            method: req.method,
            headers: req.headers,
            ipaddress: req.socket?.remoteAddress ?? "",
            timestamp: Date.now(),
          },
    });

    const result = await this.fetch<{ success: boolean; valid: boolean }>({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (result.error) {
      return {
        error: {
          message: result.error.message,
          docs: "https://docs.typeauth.com/errors/authentication",
        },
      };
    }

    const data = result.data;
    if (!data?.success || !data.valid) {
      return {
        error: {
          message: "Typeauth authentication failed",
          docs: "https://docs.typeauth.com/errors/authentication",
        },
      };
    }

    return { result: true };
  }

  private async fetch<TResult>(request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
  }): Promise<{ data?: TResult; error?: { message: string } }> {
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });

        if (response.ok) {
          const data = await response.json();
          return { data };
        } else {
          const errorMessage = `typeauth API request failed with status: ${response.status}`;
          return { error: { message: errorMessage } };
        }
      } catch (error) {
        retries++;
        if (retries === this.maxRetries) {
          return {
            error: {
              message: "typeauth API request failed after multiple retries",
            },
          };
        }
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      }
    }

    return { error: { message: "Unexpected error occurred" } };
  }

  private extractTokenFromRequest(req: IncomingMessage): string | null {
    const token = req.headers[this.tokenHeader.toLowerCase()] as
      | string
      | undefined;
    if (
      token &&
      this.tokenHeader === "Authorization" &&
      token.startsWith("Bearer ")
    ) {
      return token.slice(7);
    }
    return token || null;
  }
}
