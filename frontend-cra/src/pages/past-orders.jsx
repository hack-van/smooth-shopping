import React from 'react';
import { useQuery } from "@apollo/client";
import MainContentLoader from "../components/MainContentLoader";
import { IconButton, Stack, Typography, Accordion, AccordionSummary, AccordionDetails, Box } from "@mui/material"
import { GET_USERS_ORDERS } from "../helpers/queries";
import CachedIcon from '@mui/icons-material/Cached';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format, parseISO } from 'date-fns';

const PastOrders = () => {
  const {loading, error, data, refetch} = useQuery(GET_USERS_ORDERS);
  if (error) {
    return (
      'There was an error'
    );
  }
  if (loading) {
    return (
      <MainContentLoader />
    )
  }
  const pastOrders = data.orders;

  return (
    <>
      <Stack 
        direction="row" 
        sx={{ alignContent: 'center', justifyContent: 'space-between', mb: 1 }}>
        <h1>Past Orders</h1>
        <div>
          <IconButton
            color="primary"
            aria-label={'Refresh page'}
            onClick={() => {
              console.log('Clear caches');
              refetch();
            }} >
            <CachedIcon />
          </IconButton>
        </div>
      </Stack>

      {/* <Typography component="div" variant="body2" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
        { pastOrders.length } orders
      </Typography>
      <hr /> */}
      <Box sx={{ display: 'flex', flexDirection: 'row', padding: '0.4em 0.8em', backgroundColor: '#aaa', }}>
        <Typography 
          sx={{ width: '73%', fontWeight: 'bold', fontSize: '0.9em', }}>Date of Order</Typography>
        <Typography 
          color="text.secondary" 
          sx={{ fontWeight: 'bold', fontSize: '0.9em', }}>Credits</Typography>
      </Box>

      {pastOrders.map((order) => (
        <Accordion key={order.id} disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id={order.id} // id="panel1bh-header"
            sx={{ background: '#eee'}}
          >
            <Typography sx={{ width: '80%', flexShrink: 0 }}>{format(parseISO(order.created), 'PP p')}</Typography>
            <Typography sx={{ color: 'text.secondary' }}>${order.fieldTotalOrderAmount}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {order.fieldOrderItems.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', flexDirection: 'row', }}>
                  <Typography sx={{ flex: '2', fontSize: '0.95em', }}>{item.fieldProduct.title}</Typography>
                  <Typography sx={{ flex: '1', color: 'text.secondary', fontSize: '0.9em', }}>{Math.trunc(item.fieldQuantity)} x ${item.fieldProduct.fieldCredit}</Typography>
                  {/* TODO: figure out how to add polyfill for Math.trunc (https://github.com/behnammodi/polyfill/blob/master/math.polyfill.js) */}
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  )
}

export default PastOrders;