import { IncomingMessage } from "http";
import { Typeauth, TypeauthOptions } from ".";

describe("Typeauth", () => {
  let typeauth: Typeauth;
  const mockAppId = "mock-app-id";
  const mockToken = "mock-token";

  beforeEach(() => {
    const options: TypeauthOptions = {
      appId: mockAppId,
    };
    typeauth = new Typeauth(options);
  });

  it("should initialize with default options", () => {
    expect(typeauth["baseUrl"]).toBe("https://api.typeauth.com");
    expect(typeauth["tokenHeader"]).toBe("Authorization");
    expect(typeauth["disableTelemetry"]).toBe(false);
  });

  it("should initialize with custom options", () => {
    const customOptions: TypeauthOptions = {
      appId: mockAppId,
      baseUrl: "https://custom-api.typeauth.com",
      tokenHeader: "X-Custom-Token",
      disableTelemetry: true,
    };
    const customTypeauth = new Typeauth(customOptions);

    expect(customTypeauth["baseUrl"]).toBe("https://custom-api.typeauth.com");
    expect(customTypeauth["tokenHeader"]).toBe("X-Custom-Token");
    expect(customTypeauth["disableTelemetry"]).toBe(true);
  });

  it("should return an error when token is missing", async () => {
    const mockRequest = {
      url: "https://api.typeauth.com",
      headers: {},
    } as IncomingMessage;

    const response = await typeauth.authenticate(mockRequest);

    expect(response).toHaveProperty("error");
    expect(response.error).toHaveProperty("message", "Missing token");
    expect(response.error).toHaveProperty(
      "docs",
      "https://docs.typeauth.com/errors/missing-token"
    );
  });

  it("should authenticate successfully with valid token", async () => {
    const mockRequest = {
      url: "https://example.com",
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
    } as IncomingMessage;

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        message: "",
        data: [
          {
            valid: true,
            ratelimit: {
              remaining: 0,
            },
            remaining: 0,
            enabled: true,
          },
        ],
      }),
    });

    const response = await typeauth.authenticate(mockRequest);

    expect(response).toHaveProperty("result", true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.typeauth.com/authenticate",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(`"token":"${mockToken}"`),
      })
    );
  });

  // Add more test cases as needed
});
