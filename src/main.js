import {ContractsView, ErrorMessageView } from './views'
import {Modal} from "./modal.js";

const TestNetUrl = "https://europe3.testnet.signum.network"
const MainNetUrl = "https://europe.signum.network"

function getCurrentAccountId() {
  let accountId = document.getElementById('address-field').value.trim();
  try{
    const address = sig$.Address.create(accountId)
    accountId = address.getNumericId();
  }catch(e){
    console.error('Invalid address found', accountId)
  }
  return accountId;
}

function updateNetwork(newNodeHost) {
  if (window.ApiSettings.nodeHost !== newNodeHost) {
    window.ApiSettings.nodeHost = newNodeHost;
    window.SignumApi = sig$.composeApi(window.ApiSettings);
  }
}

async function fetchContracts(accountId) {
  const contractsTable = document.getElementById('contracts-table-body');
  const contracts = new ContractsView(contractsTable, accountId);
  try {
    await contracts.mount()
  } catch (e) {
    const errorView = new ErrorMessageView(null, e.message);
    window.modal.open("Oh no!", errorView.renderView())
  }
}

async function onUpdateContractsClick(e) {
  const element = e.target;
  if (element.classList.contains('busy')) {
    return;
  }
  element.classList.add('busy');
  const currentAccountId = getCurrentAccountId();
  await fetchContracts(currentAccountId);
  element.classList.remove('busy');
}

function parseArguments() {
  const query = window.location.search
  if (!query.length) return {}

  const args = query.substr(1).split('&')
  return args.reduce((obj, arg) => {
    const strings = arg.split('=');
    obj[strings[0]] = strings[1] || true
    return obj
  }, {})
}

function applyQueryArguments() {

  const args = parseArguments()

  const networkSelector = document.getElementById('network-selector');
  networkSelector.value = args.testnet === true ? TestNetUrl : MainNetUrl
  networkSelector.dispatchEvent(new Event('change'));

  if (args.address) {
    const addressField = document.getElementById('address-field')
    addressField.value = args.address;
    document.getElementById('address-button').click()
  }

}

(() => {

  const addressInput = document.getElementById('address-button');
  addressInput.addEventListener('click', e => {
    fetchContracts(getCurrentAccountId(e.target.value))
  });

  const networkSelector = document.getElementById('network-selector');
  networkSelector.addEventListener('change', e => {
    updateNetwork(e.target.value)
  });

  const updateAction = document.getElementById('update-action');
  updateAction.addEventListener('click', onUpdateContractsClick);

  window.ApiSettings = new sig$.ApiSettings(networkSelector.value, "burst");
  window.SignumApi = sig$.composeApi(window.ApiSettings);
  window.modal = new Modal();

  applyQueryArguments()
})()
