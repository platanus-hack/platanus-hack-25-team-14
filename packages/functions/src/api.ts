import { createYoga } from "graphql-yoga";
import { schema } from "./graphql/schema";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/",
  // Disable Yoga's built-in CORS handling and let AWS/SST configure CORS
  // for the Lambda URL. This avoids duplicate Access-Control-Allow-Origin
  // headers like "http://localhost:3000, *".
  cors: false,
});

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const { body, headers, rawPath, rawQueryString, requestContext } = event;

  // Reconstruct the URL
  // Function URLs usually come in as https://<id>.lambda-url.<region>.on.aws/
  const url = `https://${requestContext.domainName}${rawPath}${
    rawQueryString ? `?${rawQueryString}` : ""
  }`;

  // Handle body: if base64, decode
  const isBase64 = event.isBase64Encoded;
  const requestBody = body
    ? isBase64
      ? Buffer.from(body, "base64")
      : body
    : undefined;

  const request = new Request(url, {
    method: requestContext.http.method,
    headers: headers as HeadersInit,
    body: requestBody,
  });

  const response = await yoga.fetch(request, {
    context, // Pass Lambda context to resolvers
  });

  const responseBody = await response.text();

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: responseBody,
    isBase64Encoded: false,
  };
};
