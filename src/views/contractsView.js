import {View} from './view.js'
import {DetailsView} from './detailsView.js'

export class ContractsView extends View {

  constructor(parent, accountId) {
    super(parent);
    this._contractId = accountId;
  }

  async mount() {
    let contracts = []
    let idIsContract = false;
    try{
      // trying as contract
      const contract = await SignumApi.contract.getContract(this._contractId);
      contracts = [contract]
      idIsContract = true
    }catch (e){
      // trying as creator account
      const {ats} = await SignumApi.contract.getContractsByAccount({accountId: this._contractId});
      contracts = ats
    }

    this.render(contracts);
    if(idIsContract){
      const contractElement = document.getElementById(this._contractId)
      contractElement && contractElement.click()
    }
  }

  // Override from View!
  renderView(contracts) {
    return contracts.length === 0
      ? this._createEmptyRow()
      : contracts.map(this._createContractRow.bind(this))
  }


  _createEmptyRow() {
    const rowNode = document.createElement('tr');
    rowNode.setAttribute('class', 'c-table__row');
    rowNode.innerHTML = `
    <td class="c-table__cell">No contract found</td>
    `;
    return rowNode;
  }

  _createContractRow(contract) {
    const {name, description, at} = contract;
    const rowNode = document.createElement('tr');
    rowNode.addEventListener('click', this._onViewDetails.bind(this, contract, rowNode));
    rowNode.setAttribute('class', 'c-table__row');
    rowNode.setAttribute('id', `${at}`);
    rowNode.innerHTML = `
    <td class="c-table__cell">${at}</td>
    <td class="c-table__cell">${name}</td>
    <td class="c-table__cell">${description}</td>
    <td class="c-table__cell">${this._createStatusHTML(contract)}</td>
    `;
    return rowNode;
  }

  _createStatusHTML({finished, stopped, frozen, dead}) {

    const badges = [];

    if (finished) {
      badges.push(`<span class="c-badge c-badge--rounded">Finished</span>`)
    }
    if (stopped) {
      badges.push(`<span class="c-badge c-badge--rounded c-badge--warning">Stopped</span>`)
    }
    if (dead) {
      badges.push(`<span class="c-badge c-badge--rounded c-badge--dead">Dead</span>`)
    }
    if (frozen) {
      badges.push(`<span class="c-badge c-badge--rounded c-badge--info">Frozen</span>`)
    }

    if (!finished && badges.length === 0) {
      badges.push(`<span class="c-badge c-badge--rounded c-badge--success">Running</span>`)
    }

    return `<div class="contract-status">${badges.join(' ')}</div>`

  }

  _onViewDetails(contract, parentNode){
    const details = new DetailsView(parentNode, contract);
    details.mount();
  }

}


