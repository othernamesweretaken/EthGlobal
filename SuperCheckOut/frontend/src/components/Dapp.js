import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers, Signer } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers


// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import App from './App';
import { Transfer } from "./Transfer";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { NoTokensMessage } from "./NoTokensMessage";

import TokenArtifact from "../contracts/Token.json";
import fDaixABI from "../contracts/fDaix.json";
import shopABI from "../contracts/shopABI.json";
import contractAddress from "../contracts/contract-address.json";

import {Form, Button, Input, Message} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { AbiCoder } from "ethers/lib/utils";
// This is the Hardhat Network id, you might change it in the hardhat.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = '31337';
// const {
//   web3tx,
//   toWad,
//   wad4human,
//   toBN,
// } = require("@decentral.ee/web3-helpers");
// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
const Web3 = require('web3');
const web3 = new Web3();
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const { Web3Provider } = require("@ethersproject/providers");
const abiCoder = ethers.utils.defaultAbiCoder;

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
      tokenData1: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      balance1: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      sf: undefined,
      closeOrderId: 0
    };

    this.state = this.initialState;

  }

// ------------------------------SuperFluid -----------------------------------

async initializeSuperFluid(){
  const sf = new SuperfluidSDK.Framework({
  ethers: new Web3Provider(window.ethereum)
});
  await sf.initialize();
  this.setState({sf})
  console.log("SuperFluid Initializes");
} 
checkOut = async (event) => {
event.preventDefault();
const carol = this.state.sf.user({
  address: this.state.selectedAddress,
  token: contractAddress.fDaix
});
var userData1 = web3.eth.abi.encodeParameters(['uint[3]','uint[3]','address[3]','uint[3]','uint'], 
[['1','2','3'],['1','1','1'] ,['0x9D1Ad4E0eb71c4A41BCa9920a023b553fbb0Cdff',
'0x2F8EB06c311214707f83461cC77646c9Aef9985f','0xDb1B2424d33e8E981cad7AbC7A3b7B4493D0528a'],['200','200','600'],'1000']);
console.log(userData1);
await carol.flow({
recipient: contractAddress.superCheckOut,
flowRate: '385802469135802',
userData: userData1
});

const details = await carol.details();
console.log(details);

}    

closeOrder = async (event) => {
  event.preventDefault();
  const carol = this.state.sf.user({
    address: this.state.selectedAddress,
    token: contractAddress.fDaix
  });
  var userData1 = web3.eth.abi.encodeParameters(['uint[3]','uint[3]','address[3]','uint[3]','uint'], 
  [['1','2','3'],['1','1','1'] ,['0x9D1Ad4E0eb71c4A41BCa9920a023b553fbb0Cdff',
  '0x2F8EB06c311214707f83461cC77646c9Aef9985f','0xDb1B2424d33e8E981cad7AbC7A3b7B4493D0528a'],['200','200','600'],'1000']);
  await carol.flow({
  recipient: contractAddress.superCheckOut,
  flowRate: '0'
  });
  
  const details = await carol.details();
  console.log(details);
  
  }   
  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this._connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    if (!this.state.tokenData || !this.state.balance) {
      return <Loading />;
    }

    // If everything is loaded, we render the application.
    return (
      <div>
      <div className="container p-4">
      <div className="row">
        <div className="col-12">
          <h1>
            {this.state.tokenData.name} ({this.state.tokenData.symbol})
          </h1>
            Welcome to SuperCheckOut.<b>{this.state.selectedAddress}</b>, you have{" "}
            <b>
              {this.state.balance.toString()/10**18} {this.state.tokenData.symbol}
            </b>
            <br/>
            <b>
              <Message content ={this.state.balance1.toString()/10**18+"($"+this.state.tokenData1.symbol1+")"}/>
            </b>  
        </div>
      </div>

      <hr />
      <Button primary onClick={(event)=> this.checkOut(event)}>Check Out</Button>&nbsp;&nbsp;&nbsp;
      <Input
              value={this.state.closeOrderId}
              onChange={event => this.setState({ closeOrderId: event.target.value })}
            /><Button primary onClick={(event)=> this.closeOrder(event)}>Close Order</Button> 
  </div>
      <App/>
    </div>

    );
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.

    const selectedAddress = (await window.ethereum.send('eth_requestAccounts')).result[0];
   // console.log(selectedAddress);
    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);
    this.initializeSuperFluid();
    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      this._resetState();

      this.setState({   
        networkError: 'Account Change Detected'
      });
     // this._initialize(newAddress);
    });
    
    // We reset the dapp state if the network is changed
    window.ethereum.on("networkChanged", ([networkId]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._intializeEthers();
    this._getTokenData();
    this._startPollingData();
  }

  async _intializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);
// Prompt user for account connections
    this._signer = this._provider.getSigner(0);

//    this._provider = new ethers.providers.InfuraProvider("goerli","36cf751fcee44680a9cfd6c14bebd207");

    // When, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
      this._token = new ethers.Contract(
      contractAddress.fDaix,
      fDaixABI,
      this._provider.getSigner(0)
    );
    this._token1 = new ethers.Contract(
      contractAddress.shop,
      shopABI,
      this._provider.getSigner(0)
    )
  }

  // The next to methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 100);

    // We run it once immediately so we don't have to wait for it
    this._updateBalance();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  async _getTokenData() {
    console.log("Wait");
    const name1 = await this._token1.name();
    const symbol1 = await this._token1.symbol();
    const balance1 = await this._token1.balanceOf(this.state.selectedAddress);
    const name = await this._token.name();
    const symbol = await this._token.symbol();
    const balance = await this._token.balanceOf(this.state.selectedAddress);
    console.log("Fetching");
    this.setState({ tokenData: { name, symbol}, tokenData1: {name1, symbol1},balance, balance1 });
  }

  async _updateBalance() {
    const balance1 = await this._token1.balanceOf(this.state.selectedAddress);
    const balance = await this._token.balanceOf(this.state.selectedAddress);
    this.setState({ balance, balance1 });
  }



  // This method sends an ethereum transaction to transfer tokens.
  // While this action is specific to this application, it illustrates how to
  // send a transaction.
  async _transferTokens(to, amount) {
    // Sending a transaction is a complex operation:
    //   - The user can reject it
    //   - It can fail before reaching the ethereum network (i.e. if the user
    //     doesn't have ETH for paying for the tx's gas)
    //   - It has to be mined, so it isn't immediately confirmed.
    //     Note that some testing networks, like Hardhat Network, do mine
    //     transactions immediately, but your dapp should be prepared for
    //     other networks.
    //   - It can fail once mined.
    //
    // This method handles all of those things, so keep reading to learn how to
    // do it.

    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      this._dismissTransactionError();

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await this._token.transfer(to, amount);
      this.setState({ txBeingSent: tx.hash });

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      const receipt = await tx.wait();

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that make the transaction fail once it
        // was mined, so we throw this generic one.
        throw new Error("Transaction failed");
      }

      // If we got here, the transaction was successful, so you may want to
      // update your state. Here, we update the user's balance.
      await this._updateBalance();
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined });
    }
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is Localhost:8545 
  _checkNetwork() {
    console.log(window.ethereum.networkVersion);
    const id = '5';
    if (window.ethereum.networkVersion === id) {
      return true;
    }

    this.setState({ 
      networkError: 'Please connect Metamask to Goerli'
    });

    return false;
  }
}
