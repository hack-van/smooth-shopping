import * as React from "react"
import { useNavigate } from "react-router-dom";
import { Box, Stack, TextField, Button } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import Seo from "../components/Seo"
import { isLoggedIn, loginAsync } from "../helpers/loginHelper";
import { snackbarMsgVar, snackbarOpenVar, SnackbarType, snackbarTypeVar } from "../components/Snackbar";
import { usePastOrderQuantitiesUpdater } from "../helpers/cartHelper";
import { debuggingIsOn } from "../helpers/genericHelper";
import Logo from "../components/Logo";

const LoginPage = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoggedIn()) {
      navigate('/');
    }
  }, []);

  // Form elements
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Loading state
  const [isLoading, setIsLoading] = React.useState(false);

  // Load the previous quantity updator
  const previousOrderQuanitiesUpdater = usePastOrderQuantitiesUpdater();

  const submitLoginForm = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (username.length === 0 && password.length === 0) {
      if (debuggingIsOn()) {
        console.error("Can't login: inputs are empty");
      }
    }
    else {
      if (debuggingIsOn()) {
        console.log("Login");
      }
      const success = await loginAsync(username, password)
      if (success) {
        await previousOrderQuanitiesUpdater();
        return navigate('/');
      } else {
        snackbarOpenVar(true);
        snackbarTypeVar(SnackbarType.warning);
        snackbarMsgVar("Your username or password is incorrect.");
        setIsLoading(false);
      }
    }
  }

  return (
    <>
      <Seo title="Login" />
      <Stack
        sx={{
          direction: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          spacing: '3',
        }}
      >
        <Logo />
        <h2 
          style={{ marginTop: '3rem'}}>Food Bank Login</h2>
        <Box
          component="form"
          noValidate>
          <Box
            component="div">
            <TextField 
              id="login__username" 
              variant="filled"
              label="Username"
              color="primary"
              sx={{ background: '#fff', mb: '2rem' }}
              onInput={(e) => setUsername(e.target.value)} />
          </Box>
          <Box
            component="div">
            <TextField 
              id="login__password" 
              type="password"
              variant="filled" 
              label="Password"
              color="primary"
              sx={{ background: '#fff', mb: '2rem' }} 
              onInput={(e) => setPassword(e.target.value)}/>
          </Box>
          <Box
            component="div">
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isLoading}
              component={Button}
              sx={{
                borderRadius: '20px',
                fontWeight: 'bold',
                padding: '0.3rem 10%'
              }}
              onClick={submitLoginForm}
            >
              SUBMIT
            </LoadingButton>
          </Box>
        </Box>
      </Stack>
    </>
  )
}

export default LoginPage;