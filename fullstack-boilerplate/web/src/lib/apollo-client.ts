import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:3001/graphql",
});

const authLink = new ApolloLink((operation, forward) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token");
    if (token) {
      operation.setContext(
        ({ headers = {} }: { headers?: Record<string, string> }) => ({
          headers: {
            ...headers,
            authorization: `Bearer ${token}`,
          },
        }),
      );
    }
  }
  return forward(operation);
});

export function createApolloClient() {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}
