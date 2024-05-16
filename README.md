# Typescript typeauth library

typeauth is a TypeScript library that simplifies the authentication process for your web applications. It provides an easy-to-use interface for integrating with the typeauth authentication service.

## Features

- Simple and intuitive API for authentication
- Customizable options for initialization
- Support for custom token headers
- Telemetry data collection (can be disabled)
- Comprehensive error handling and documentation references

## Installation

You can install typeauth using npm:

```bash
npm installs @typeauth/api
```

## Usage

First, import the `typeauth` class from the library:

```typescript
import { typeauth } from 'typeauth';
```

Then, initialize the `typeauth` instance with your desired options:

```typescript
const typeauth = new typeauth({
  appId: 'YOUR_APP_ID',
  // Optional configuration options
  baseUrl: 'https://api.typeauth.com',
  tokenHeader: 'Authorization',
  disableTelemetry: false,
});
```

To authenticate a request, call the `authenticate` method with the request object:

```typescript
async function handleRequest(req: Request): Promise<Response> {
  const { result, error } = await typeauth.authenticate(req);

  if (error) {
    console.error(error.message);
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Protected route logic
  return new Response(JSON.stringify({ message: 'Access granted' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

## Configuration Options

The `typeauth` constructor accepts an options object with the following properties:

- `appId` (required): Your typeauth application ID.
- `baseUrl` (optional): The base URL of the typeauth API. Defaults to `'https://api.typeauth.com'`.
- `tokenHeader` (optional): The name of the header that contains the authentication token. Defaults to `'Authorization'`.
- `disableTelemetry` (optional): Set to `true` to disable telemetry data collection. Defaults to `false`.

## Error Handling

The `authenticate` method returns an object with either a `result` property (on success) or an `error` property (on failure). The `error` object contains the following properties:

- `message`: A description of the error.
- `docs`: A URL to the relevant documentation page for more information about the error.

Make sure to handle errors appropriately in your application logic.

## Examples

Here's an example of how to use typeauth with the Web API:

```typescript
import { typeauth } from 'typeauth';

const typeauth = new typeauth({
  appId: 'YOUR_APP_ID',
});

async function handleRequest(req: Request): Promise<Response> {
  const { result, error } = await typeauth.authenticate(req);

  if (error) {
    console.error(error.message);
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Protected route logic
  return new Response(JSON.stringify({ message: 'Access granted' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Example usage with the Web API
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please open an issue or submit a pull request on the this GitHub repository.
