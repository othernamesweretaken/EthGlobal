import React from 'react';
import ReactDOM from 'react-dom';
//import App from './App';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Dapp } from "./components/Dapp";



// We import bootstrap here, but you can remove if you want
import "bootstrap/dist/css/bootstrap.css";

const client = new QueryClient();
// This is the entry point of your application, but it just renders the Dapp
// react component. All of the logic is contained in it.

ReactDOM.render(
  <QueryClientProvider client={client}>
    <Dapp />
    </QueryClientProvider>,
  document.getElementById("root")
);
