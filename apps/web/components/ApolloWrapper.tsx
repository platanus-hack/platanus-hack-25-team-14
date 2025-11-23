"use client";

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

function makeClient() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://pdtvhj5pshure3vnffqhdw32l40yukfh.lambda-url.us-east-1.on.aws/";

  if (!apiUrl) {
    console.warn("NEXT_PUBLIC_API_URL is not set. Using fallback API URL.");
  } else {
    console.log("Using API URL:", apiUrl);
  }

  const httpLink = new HttpLink({
    uri:
      apiUrl ||
      "https://pdtvhj5pshure3vnffqhdw32l40yukfh.lambda-url.us-east-1.on.aws/",
    fetchOptions: {
      timeout: 10000,
    },
  });

  const authLink = setContext((_, { headers }) => {
    if (typeof window === "undefined") {
      return { headers };
    }

    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const sessionToken = cookies["better-auth.session_token"];

    return {
      headers: {
        ...headers,
        authorization: sessionToken ? `Bearer ${sessionToken}` : "",
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: from([authLink, httpLink]),
    defaultOptions: {
      watchQuery: {
        errorPolicy: "all",
      },
      query: {
        errorPolicy: "all",
      },
    },
    devtools: {
      enabled: process.env.NODE_ENV === "development",
    },
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return <ApolloProvider client={makeClient()}>{children}</ApolloProvider>;
}
