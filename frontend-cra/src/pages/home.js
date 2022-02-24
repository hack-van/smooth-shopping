import * as React from "react"
// import { graphql } from "gatsby"
// import { Link } from "gatsby"
// import Img from "gatsby-image"
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';

import Seo from "../components/seo"
import { GET_ALL_PRODUCTS, GET_PRODUCT_CATEGORIES } from "../helpers/queries";
import MainContentLoader from "../components/main-content-loader";
import { ProductDialog, Products } from "./categories/category";
import GoCheckoutButton from "../components/go-checkout-button";
import { cartItemsVar } from "../helpers/cartItems";

const HomePage = () => (
  <>
    <Seo title="Home" />
    <h1 style={{ textAlign: 'center' }}>Start Shopping</h1>
    <div className="categories-wrap">
      {/* <h2>Categories</h2> */}
      <Categories/>
    </div>
    <div>
      <AllProductsInfiniteScroll />
    </div>
  </>
);

function Categories() {
  const { loading, error, data } = useQuery(GET_PRODUCT_CATEGORIES);

  if (loading) {
    return (
      <MainContentLoader />
    )
  }
  if (error) {
    console.error(error);
    return <p>There was an error.</p>;
  }

  return <ImageList>
    {data.taxonomyTerms.map((category) => (
      <ImageListItem key={category.uuid} variant="masonry">
        <Link to={category.entityUrl.path} state={{ title: category.entityLabel }}>
          <img 
            src={category.fieldImage.derivative.url} 
            alt={category.fieldImage.alt} 
            title={category.fieldImage.title}
            width={category.fieldImage.derivative.width}
            height={category.fieldImage.derivative.height} />
          <ImageListItemBar
            title={category.entityLabel}
            sx={{
              top: 0,
              textAlign: 'center',
              background: 'rgba(0,0,0,0.6)',
              fontWeight: 'bold',
            }}
          />
        </Link>
      </ImageListItem>
    ))}
  </ImageList>
}

function AllProductsInfiniteScroll() {
  const { loading, error, data } = useQuery(GET_ALL_PRODUCTS);

  
  const [selectedProduct, setProduct] = React.useState({});
  const [isOpen, setOpen] = React.useState(false);

  if (loading) {
    return (
      <>
        <h2 style={{textAlign: 'center', marginTop: '2em', }}>All Products</h2>
        <MainContentLoader />
      </>

    )
  }
  if (error) {
    console.error(error);
    return <p>There was an error.</p>;
  }

  // console.log(data.taxonomyTermQuery.entities);
  return (
    <>
      <h2 style={{textAlign: 'center', marginTop: '2em', }}>All Products</h2>
      <Products 
        setProduct={setProduct} 
        setOpen={setOpen}
        data={data} />
      { cartItemsVar().size > 0 
          ? <GoCheckoutButton />
          : <></>
      }
      <ProductDialog 
        selectedProduct={selectedProduct} 
        isOpen={isOpen}
        setOpen={setOpen} />
    </>
  )

}

export default HomePage;