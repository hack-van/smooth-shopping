import React from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import LoginPage from './pages/login';
import CartPage from './pages/cart';
import AccountPage from './pages/account';
import NotFoundPage from './pages/404';
import Layout from './components/Layout';

import {
  ApolloProvider,
} from "@apollo/client"; // See: https://www.apollographql.com/docs/react/get-started/
import { apolloClient, apolloCachePersistor } from './helpers/cache';
import Category from './pages/categories/Category';
import RequireAuth from './components/RequireAuth';
import HomePage from './pages/home';
import './App.css';
import { restoreCartItems, storeCartItems } from './helpers/cartHelper';
import SearchProducts from './pages/search-page';
import PastOrders from './pages/past-orders';

const App = () => {
  const [client, setClient] = React.useState();

  React.useEffect(() => {
    async function init() {
      // Restore the cartItems if not present
      restoreCartItems();

      // Set client + restore persistor
      await apolloCachePersistor.restore();
      setClient(apolloClient);

      // Store cart items before unloading
      window.addEventListener('beforeunload', () => {
        storeCartItems();
      });
    }

    init().catch(console.error);
  }, []);

  // const clearCache = useCallback(() => {
  //   if (!persistor) {
  //     return;
  //   }
  //   persistor.purge();
  // }, [persistor]);

  if (!client) {
    return (
      // <div className='page'>
        <p style={{textAlign: 'center'}}>Loading...</p>
      // </div>
    );
  }

  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <Routes>
          <Route path="/login" element={<Layout />}> {/* Wrapper element */}
            <Route index element={<LoginPage />} />
          </Route>
          <Route path="/" element={<Layout />}> {/* Wrapper element */}
            <Route element={<RequireAuth />}>  {/* Authentication guard */}
              <Route index element={<HomePage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="categories">
                <Route path=":categorySlug" element={<Category />} />
              </Route>
              <Route path="search" element={<SearchProducts />} />
              <Route path="past-orders" element={<PastOrders />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
