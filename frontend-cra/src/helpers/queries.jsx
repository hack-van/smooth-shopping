
import { gql } from "@apollo/client";

/**
 * Get the current user's information, e.g. how much credit left for this month
 * 
 * TODO: set currentUuid in context, then use {context.currentUserUuid}
 * See: https://www.apollographql.com/docs/react/api/link/apollo-link-rest/#example
 */
export const GET_USER_STATS = gql`
query GetUserStats($userUuid: String!) {
  currentUser(userUuid: $userUuid) @jsonapi(path: "user/user/{args.userUuid}") {      
    id,
    familyName: fieldSsFamilyName
    creditsRemaining: fieldSsCurrentCredit
    totalCredits: fieldSsMonthlyCredit
    numberOfFamilyMembers: fieldSsPersonCount
  }
}
`

// Get the images of the main product categories

export const GET_PRODUCT_CATEGORIES = gql`
  query GetCategories {
    categories(vocabulary: "product_categories") @jsonapi(path: "taxonomy_term/product_categories/?filter[vid.meta.drupal_internal__target_id]={args.vocabulary}&include=field_image") {
      id
      name
      path {
        alias
      }
      fieldImage {
        imageStyleUri {
          productCategory
        }
        alt       # This and below does not currently work
        title     
        width       
        height    # Up to here
      }
    }
  }
`;

/**
 * Products fields
 */
const coreProductFieldsFragment = gql`
  fragment CoreProductFields on NodeProduct {
    # Start fragment
    id
    nid: drupalInternalNid
    title
    path {
      alias
    }
    fieldImage {
      imageStyleUri {
        productCategory
        popupLargeImage
      }
      alt       # This and below does not currently work
      title
      width
      height    # Up to here
    }
    fieldCredit
    fieldQuantity
    fieldExpired
    fieldLimitPerClient
    body {
      processed
    }
    links {
      next {
        href
      }
    }
    # End fragment
  }
`;

/**
 * Get the products of a category
 * 
 * TODO: Support pagination
 * See: /jsonapi_data/node/product/?filter[status]=1&include=field_image&page[offset]=50&page[limit]=50
 */ 
export const GET_ALL_PRODUCTS = gql`
  ${coreProductFieldsFragment}

  # Get the products in a category
  query GetAllProducts($offset: Int) {
    products(offset: $offset, limit: 50) @jsonapi(path: "node/product/?filter[status]=1&include=field_image&page[offset]={args.offset}&page[limit]={args.limit}") {
      ...CoreProductFields
    }
  }
`;

/**
 * Search for products using terms
 * 
 * &filter[search-terms][group][conjunction]=OR

&filter[st1][condition][path]=title
&filter[st1][condition][operator]=CONTAINS
&filter[st1][condition][value]={args.st1}
&filter[st1][condition][memberOf]=search-terms
 */
export const SEARCH_FOR_PRODUCT = gql`
  ${coreProductFieldsFragment}
  query SearchByWord($searchTerm1:String, $searchTerm2:String, $searchTerm3:String, $offset: Int) {
    products(st1: $searchTerm1, st2: $searchTerm2, st3: $searchTerm3, offset: $offset, limit: 50) @jsonapi(path: "node/product/?filter[status]=1&include=field_image&filter[search-terms][group][conjunction]=OR&filter[st1][condition][path]=title&filter[st1][condition][operator]=CONTAINS&filter[st1][condition][value]={args.st1}&filter[st1][condition][memberOf]=search-terms&filter[st2][condition][path]=title&filter[st2][condition][operator]=CONTAINS&filter[st2][condition][value]={args.st2}&filter[st2][condition][memberOf]=search-terms&filter[st3][condition][path]=title&filter[st3][condition][operator]=CONTAINS&filter[st3][condition][value]={args.st3}&filter[st3][condition][memberOf]=search-terms&page[offset]={args.offset}&page[limit]={args.limit}") {
      ...CoreProductFields
    }
  }
`

/**
 * Get the products of a category
 * 
 */ 
export const GET_PRODUCTS_OF_CATEGORY = gql`
  ${coreProductFieldsFragment}
  
  # Get the products in a category
  query GetCategoryProducts($categoryId: Int!, $offset: Int) {
    products(categoryId: $categoryId, offset: $offset, limit: 50) @jsonapi(path: "node/product/?filter[status]=1&filter[field_categories.id]={args.categoryId}&include=field_image&page[offset]={args.offset}&page[limit]={args.limit}") {
      ...CoreProductFields
    }
  }
`;

/**
 * Get the products by ids
 * 
 * @param $category the name of the product category
 */ 
export const GET_PRODUCTS_FOR_CART = gql`
  ${coreProductFieldsFragment}

  # Get the products by ids
  query GetProductsByIds($productIds:[String], $userUuid: String!, $offset: Int) {
    currentUser(userUuid: $userUuid, offset: $offset, limit: 50) @jsonapi(path: "user/user/{args.userUuid}") {
      id,
      # familyName: fieldSsFamilyName
      creditsRemaining: fieldSsCurrentCredit
      # totalCredits: fieldSsMonthlyCredit
      # numberOfFamilyMembers: fieldSsPersonCount
    }
    products(productIds: $productIds, offset: $offset, limit: 50) @jsonapi(path: "node/product/?filter[status]=1&filter[cart][condition][path]=nid&filter[cart][condition][operator]=IN{args.productIds}&include=field_image&page[offset]={args.offset}&page[limit]={args.limit}") {
      ...CoreProductFields
    }
  }
`;

/**
 * Get orders of current user
 * 
 * Note: Backend restricts users to only view their own orders.
 */
export const GET_USERS_ORDERS = gql`
  query GetUsersOrders {
    orders @jsonapi(path: "node/order/?filter[status]=1&include=field_order_items.field_product") {
      id
      created
      fieldTotalOrderAmount
      fieldOrderItems {
        id
        pid: drupalInternalId
        fieldQuantity
        fieldProduct {
          id
          title
          fieldCredit
          fieldQuantity
          fieldLimitPerClient
        }
      }
    }
  }
`;

/**
 * Get orders of current user, sorted by created date descending (most recent first)
 * 
 * Note: Backend restricts users to only view their own orders.
 */
export const GET_PAST_ORDER_QUANTITIES = gql`
  query GetPastOrdersQuantities {
    orders @jsonapi(path: "node/order/?filter[status]=1&sort=-created&include=field_order_items") {
      id
      created
      fieldOrderItems {
        id
        fieldQuantity
        fieldProduct {
          id
          meta {
            nid: drupalInternalTargetId
          }
          
        }
      }
    }
  }
`;

/**
 * Get orders of current user, sorted by created date descending (most recent first),
 * and filtered by >= firstDayOfCurrentMonth
 * 
 * Note: Backend restricts users to only view their own orders.
 */
export const GET_PAST_ORDER_QUANTITIES_OF_THIS_MONTH = gql`
  query GetPastOrdersQuantities($firstDayOfCurrentMonthTimestamp: Int!) {
    orders(firstDay: $firstDayOfCurrentMonthTimestamp) @jsonapi(path: "node/order/?filter[status]=1&sort=-created&filter[recent][condition][path]=created&filter[recent][condition][operator]=%3E%3D&filter[recent][condition][value]={args.firstDay}&include=field_order_items") {
      id
      created
      fieldOrderItems {
        id
        fieldQuantity
        fieldProduct {
          id
          meta {
            nid: drupalInternalTargetId
          }
          
        }
      }
    }
  }
`;

/**
 * Create and Update an Order
 * 
 * Types Schema
 * @code
 *   SsOrderCreateAndUpdateInput {
 *     "title" = "String",
 *     "fieldStatus" = "String",
 *     "orderItems" = "[SsOrderItem]"
 *   }
 * 
 *   SsOrderItem {
 *     "productId" = "Int!",
 *     "quantity" = "Float!",
 *   }
 * @endcode
 * 
 * Example Variables
 * @code
 *   {
 *     "order": {
 *       "title": "Some Order",
 *       "fieldStatus": "SUBMITTED",
 *       "orderItems": [
 *          {
 *            "productId": 6,
 *            "quantity": 5.0
 *          },
 *          {
 *            "productId": 7,
 *            "quantity": 2.0
 *          }
 *       ]
 *     }
 *   }
 * @endcode
 */
export const CREATE_AND_UPDATE_ORDER = gql`
  mutation CreateAndUpdateOrder($order:SsOrderCreateAndUpdateInput!) {
    createAndUpdateOrder(input: $order) @rest(path: "custom/create-and-update-orders", method: "POST", type: "CreateAndUpdateInputResponse") {
      error
      data {
        id
        title
        uid
      }
    }
  }
`;

