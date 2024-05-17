export interface TypeauthOptions {
  appId: string;
  baseUrl?: string;
  tokenHeader?: string;
  disableTelemetry?: boolean;
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

  constructor(options: TypeauthOptions) {
    this.baseUrl = options.baseUrl || "https://api.typeauth.com";
    this.appId = options.appId;
    this.tokenHeader = options.tokenHeader || "Authorization";
    this.disableTelemetry = options.disableTelemetry || false;
  }

  async authenticate(req: Request): Promise<TypeauthResponse<boolean>> {
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
            headers: Object.fromEntries(req.headers.entries()),
          },
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) {
        return {
          error: {
            message: `Typeauth authentication failed with status: ${response.status}`,
            docs: "https://docs.typeauth.com/errors/authentication",
          },
        };
      }

      const data: { success: boolean; valid: boolean } = await response.json();
      if (!data.success || !data.valid) {
        return {
          error: {
            message: "Typeauth authentication failed",
            docs: "https://docs.typeauth.com/errors/authentication",
          },
        };
      }

      return { result: true };
    } catch (error) {
      return {
        error: {
          message: "Network error",
          docs: "https://docs.typeauth.com/errors/network",
        },
      };
    }
  }

  private extractTokenFromRequest(req: Request): string | null {
    const token = req.headers.get(this.tokenHeader);
    if (
      token &&
      this.tokenHeader === "Authorization" &&
      token.startsWith("Bearer ")
    ) {
      return token.slice(7);
    }
    return token;
  }
}
