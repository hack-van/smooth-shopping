import { 
  ApolloClient, 
  ApolloLink,
  createHttpLink, 
  InMemoryCache, 
  makeVar,
  from,
  gql
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { getJwtString, logoutCurrentUser } from './login';


// ---------------------------------------------------------------------------
// Cart Items reactive variable and operations
export const cartItemsVar = makeVar({});

export const cartTotal = makeVar(0.0);

// Add order item
export const AddOrderItem = (product, addQuantity) => {
  let currItems = cartItemsVar();

  // Update quantity
  if (!currItems.hasOwnProperty(product.entityId)) {
    currItems[product.entityId] = 0.0;
  }
  currItems[product.entityId] += addQuantity;
  cartItemsVar(currItems);

  // Update cart total
  updateCartTotal(product.fieldCredit * addQuantity);

  return currItems;
}

const updateCartTotal = (numberToAdd) => {
  cartTotal(cartTotal() + numberToAdd);
};
// ---------------------------------------------------------------------------

const typeDefs = gql`
  extend type Query {
    cartItems: [OrderItem!]!
  }
  extend type OrderItem {
    productId: Int!
    quantity: Float!
    fieldCredit: Float!
    fieldExpired: Boolean!
    title: String!
  }
`;

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        cartItems: {
          read() {
            return cartItemsVar();
          }
        },
      }
    }
  }
});

// Set up authenication
const httpLink = createHttpLink({
  uri: 'https://ss.albernirentals.com/graphql',
});


// Set up authenication
// https://www.apollographql.com/docs/react/networking/advanced-http-networking/#customizing-request-logic
const authMiddleware = new ApolloLink((operation, forward) => {
  // get the authentication token from local storage if it exists
  const token = getJwtString();

  if (!token) {
    console.error(`The JWT string is somehow null or empty. Value: ${JSON.stringify(token)}`)
  }

  // Add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    }
  }));

  return forward(operation);
})

// Logout if we get a 401 or 403
// https://www.apollographql.com/docs/react/networking/advanced-http-networking/#customizing-response-logic
const logoutLink = onError((err) => {
  if (err.hasOwnProperty('networkError')) {
    const statusCode = err.networkError.statusCode;
    if (statusCode === 401 || statusCode === 403) {
      logoutCurrentUser();
    }
  }
  else if (err.hasOwnProperty('graphQLErrors')) {
    // TODO: Show an alert popup
    console.error(err);
  }
})

// The final Apollo client
export const apolloClient = new ApolloClient({
  link: from([
    authMiddleware,
    logoutLink,
    httpLink,
  ]),
  cache: cache,
  typeDefs
});