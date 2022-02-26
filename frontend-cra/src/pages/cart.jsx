import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_PRODUCTS_FOR_CART } from "../helpers/queries";
import { cartItemsVar, cartTotalVar } from "../helpers/cartHelper";
import Seo from "../components/seo"

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box'
import { CardMedia } from "@mui/material";
import { CartCheckoutButton } from "../components/cart-checkout-button";

import './categories/category'; // for math-button-style
import MainContentLoader from '../components/main-content-loader';
import { getUserUuid } from '../helpers/loginHelper';
import ProductAddRemoveButtons from '../components/product-add-remove-buttons';

const CartPage = () => {

  const userUuid = getUserUuid();

  const cartIdsAndQuantities = useReactiveVar(cartItemsVar);
  const cartTotalReactive = useReactiveVar(cartTotalVar);

  const { loading, error, data } = useQuery(GET_PRODUCTS_FOR_CART, {
    variables: {
      productIds: [...cartIdsAndQuantities.keys()].map(
        (curr, i) => `&filter[cart][condition][value][${i}]=${curr}`).join(''),
      userUuid,
      offset: 0,
    },
  });

  if (error) {
    console.error(error);
    return (
      'There was an error'
    );
  }

  const totalCredits = loading ? 0 : parseFloat(data.currentUser.creditsRemaining);
  const cartItems = loading ? [] : data.products;


  // Disabled data for cart-checkout-button
  const disabledData = {
    notEnoughCredits: cartTotalReactive > totalCredits,
    noItemsInCart: cartItems.length === 0,
  }
  disabledData['isDisabled'] = disabledData.notEnoughCredits || disabledData.noItemsInCart;

  return (
    <>
      <Seo title="Cart Page" />
      <h1>Your Cart</h1>

      <Typography component="div" variant="body2" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
        { cartItems.length } items
      </Typography>

      <hr />

      <Box className="cart-items" sx={{ paddingBottom: '3rem'}}>
        { loading
            ? <MainContentLoader />
            : <></>
        }
        {cartItems.map((cartItem) => (
          <Card sx={{ display: 'flex', margin: '1em 0' }} key={cartItem.nid}>
            <CardMedia
              component="img"
              sx={{ width: '125px', lineHeight: '0' }}
              src={cartItem.fieldImage.imageStyleUri.popupLargeImage}
              alt={cartItem.fieldImage.alt}
              title={cartItem.fieldImage.title}
              width={cartItem.fieldImage.width}
              height={cartItem.fieldImage.height} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flex: '1' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CardContent sx={{ flex: '1 1 auto' }}>
                  <h4 className="cart-item__title">
                    { cartItem.title }
                  </h4>
                  <Box sx={{ mb:1, fontSize: '15' }}>
                    <span>${ parseFloat(cartItem.fieldCredit) } </span>
                    <span>x { cartIdsAndQuantities.get(cartItem.nid) }</span> {/* TODO: Find less hacky solution? */}
                  </Box>
                  <Typography variant="body2" color="text.secondary" component="div">
                    {cartItem.fieldExpired 
                      ? <strong>Expired</strong>
                      : <em>Not Expired</em>}
                  </Typography>
                </CardContent>
              </Box>
              <ProductAddRemoveButtons 
                selectedProduct={cartItem} />
            </Box>
          </Card>
        ))}
      </Box>
      
      <Box className="cart-confirm-order-wrapper mui-fixed">
        <Box className="cart-confirm-order">
          <Typography component="div" color="text.secondary"  variant="body1">
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>Total credits used:</div>
                <div><strong>${ cartTotalReactive.toFixed(2) }</strong></div>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>Total credits remaining:</div>
                <div>${ (totalCredits - cartTotalReactive).toFixed(2) }</div>
            </Box>
          </Typography>

          <Box sx={{ textAlign: 'center' }}>
            <CartCheckoutButton 
              disabledData={disabledData}
              orderData={{
                uid: userUuid,
                title: `App Order`, // - ${format(new Date(), 'yyyy-MM-dd')} TODO: Set timezone
                orderItems: cartIdsAndQuantities,
              }}/>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default CartPage;