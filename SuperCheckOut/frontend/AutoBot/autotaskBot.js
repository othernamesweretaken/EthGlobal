const { ethers, BigNumber } = require("ethers");
const { hexZeroPad } = require("ethers/lib/utils");

const { appABI} = require("../src/contracts/appABI.json");
const {contractAddress} = require("../src/contracts/contract-address.json");
// Entrypoint for the Autotask
exports.handler = async function(event) {
  // Load value provided in the webhook payload (not available in schedule or sentinel invocations)
  const { value } = event.request.body;

  // Compare it with a local secret
  if (value !== event.secrets.expectedValue) return;

  // Initialize defender relayer provider and signer
  const provider = new DefenderRelayProvider(event);
  const signer = new DefenderRelaySigner(event, provider, { speed: 'fast' });

  // Create contract instance from the signer and use it to send a tx

  //1. Get Event FundingRateUpdated from AMM Contract 
    //a. Initialize contract  //b. wait for funding payment event then execute
//2. Intialize Lemma Perputual for reinvesting 
try{
const superApp = new ethers.Contract(contractAddress.superCheckOut,appABI, signer);

// filter = {
//     address: contractAddress.superCheckOut,
//     topics: [
//         id("OrderRecieved(uint,address,uint)"),
//         null,
//         null,
//         hexZeroPad()
//     ]
// };
tx = await superApp.closeOrderTest(BigNumber(0));
}
catch(err){
    console.log(err);
}
}
// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env;
  exports.handler({ apiKey, apiSecret })
    .then(() => process.exit(0))
    .catch(error => { console.error(error); process.exit(1); });
}