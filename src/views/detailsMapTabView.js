import {View} from './view.js'
import {ContractDataView} from "@signumjs/contracts";

// This Tab shows the contracts map (variables) in a structured way (8 Byte Blocks represented by Hex Values),
// and shows the converted values as string, decimal, and ordered hex representation.
export class DetailsMapTabView extends View {

    constructor(parent, contract) {
        super(parent);
        this._contract = contract;

        // add listeners when modal opens
        window.addEventListener('modal:open', () => {
            console.debug("hydrating detailsMapTabView");
            const key1Button = document.getElementById('key1-button');
            key1Button.addEventListener('click', this._loadContractMap.bind(this));

            const key1Input = document.getElementById('key1-field');
            key1Input.addEventListener('keyup', this._validateInput.bind(this));
        })
    }

    _validateInput(e) {
        const key1FieldHint = document.getElementById('key1-field-hint');
        const key1Button = document.getElementById('key1-button');
        const isValid = /^\d+$/.test(e.target.value);
        key1Button.disabled = !isValid;
        if (!isValid) {
            e.target.classList.add('c-field--error');
            key1FieldHint.classList.remove('u-hidden');
        } else {
            e.target.classList.remove('c-field--error');
            key1FieldHint.classList.add('u-hidden');
        }
    }

    async _loadContractMap() {
        const input = document.getElementById("key1-field");

        const {keyValues} = await window.SignumApi.contract.getContractMapValuesByFirstKey({
            contractId: this._contract.at,
            key1: input.value
        })

        const mapElement = document.getElementById(`contract-map-${this._contract.at}`)
        mapElement.innerHTML = this._getContractMapHtml(keyValues)
    }

    _getKeyValueTableRowHtml(key, value) {
        return `
    <tr class="c-table__row">
      <td class="c-table__cell u-small">${key}</td>
      <td class="c-table__cell u-small">${value}</td>
    </tr>
    `
    }


    _getContractMapHtml(keyValues) {
        const keyValuesHtml = keyValues
                .map(({key2, value}) => this._getKeyValueTableRowHtml(key2, value)).join(' ');

        return `
<caption class="c-table__caption">Map Attributes</caption>
<thead class="c-table__head">
  <tr class="c-table__row c-table__row--heading">
  <th class="c-table__cell">2nd Key</th>
  <th class="c-table__cell">Value</th>
  </tr>
</thead>
<tbody class="c-table__body">
${keyValuesHtml}
</tbody>`
    }


    renderView() {




        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
<div id="input-form">
<label class="c-label u-xsmall" for="key1-field">Enter 1st Key</label>
    <div class="c-input-group">
      <div class="o-field">
        <input id="key1-field"
               name="key1-field"
               class="c-field c-tooltip c-tooltip--top u-large"
               placeholder="Enter the 1st Key of Contracts Map"
               aria-label="The 1st Key of the Contracts Map"
               type="text"
               pattern="\d+"
               title="Only numeric identifiers"
               autocomplete="on"
        >
      </div>
      <button id="key1-button" class="c-button c-button--brand">Load</button>
    </div>
      <small id="key1-field-hint" class="c-label u-xsmall c-field--error u-hidden">Only numeric identifiers</small>
</div>
<table id="contract-map-${this._contract.at}" class="c-table" style="overflow-y: auto; max-height: 300px"></table>
`
        return wrapper;
    }
}
