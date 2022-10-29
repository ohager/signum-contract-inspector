import {ContractsView, ErrorMessageView } from './views'
import {Modal} from "./modal.js";
import {Address, LedgerClientFactory} from "@signumjs/core";

const DefaultTestNetUrl = "https://europe3.testnet.signum.network"
const DefaultMainNetUrl = "https://europe.signum.network"

function getCurrentAccountId() {
  let accountId = document.getElementById('address-field').value.trim();
  try{
    const address = Address.create(accountId)
    accountId = address.getNumericId();
  }catch(e){
    console.error('Invalid address found', accountId)
  }
  return accountId;
}

function updateNetwork(newNodeHost) {
  const currentHost = SignumApi.service.settings.nodeHost
  if (currentHost !== newNodeHost) {
    window.SignumApi = LedgerClientFactory.createClient({
      nodeHost: newNodeHost
    });
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

  let node = args.testnet === true ? DefaultTestNetUrl : DefaultMainNetUrl
  if(args.node){
    if([...networkSelector.options].map( o => o.value ).includes(args.node)){
      node = args.node;
    } else{
      const newOption = document.createElement('optgroup');
      newOption.setAttribute('label', 'Custom Node');
      newOption.innerHTML = `<option value=${args.node}>${args.node}</option>`
      networkSelector.appendChild(newOption)
      node = args.node
    }
  }
  networkSelector.value = node
  networkSelector.dispatchEvent(new Event('change'));


  if (args.address) {
    const addressField = document.getElementById('address-field')
    addressField.value = args.address;
    document.getElementById('address-button').click()
  }

}

(() => {

  const addressInput = document.getElementById('address-button');
  addressInput.addEventListener('click', async e => {
    addressInput.innerText = 'Loading...'
    addressInput.setAttribute('disabled', 'disabled')
    await fetchContracts(getCurrentAccountId(e.target.value))
    addressInput.innerText = 'Inspect'
    addressInput.removeAttribute('disabled')
  });

  const networkSelector = document.getElementById('network-selector');
  networkSelector.addEventListener('change', e => {
    updateNetwork(e.target.value)
  });

  const updateAction = document.getElementById('update-action');
  updateAction.addEventListener('click', onUpdateContractsClick);

  window.SignumApi = LedgerClientFactory.createClient({
    nodeHost: networkSelector.value
  });
  window.modal = new Modal();

  applyQueryArguments()
})()
