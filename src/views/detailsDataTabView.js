import {View} from './view.js'
import {ContractDataView} from "@signumjs/contracts";

// this small function ignores eventual conversion exceptions,
// which would stop code execution otherwise
function getVariable(position, getterFn) {
  try {
    return getterFn(position);
  } catch (_) {
    return null
  }
}

function reverse(str) {
  return str.split("").reverse().join("")
}

// This Tab shows the contracts data (variables) in a structured way (8 Byte Blocks represented by Hex Values),
// and shows the converted values as string, decimal, and ordered hex representation.
export class DetailsDataTabView extends View {

  constructor(parent, contract) {
    super(parent);
    this._contract = contract;
  }

  _tokenizeMachinedata() {
    const VariableLength = 16; //sig$contracts.ContractDataView.VariableLength;
    // The contract helper is your friend, if you want access variables the easy way
    // The data in the contract is stored in 8 byte blocks (expressed by Hex Values) and in little endian order
    // The helper not only converts to big endian order, but also converts into decimal, or tries to convert into string format
    const helper = new ContractDataView(this._contract);
    const {machineData} = this._contract;
    const machineDataTokens = [];

    for (let i = 0; i < machineData.length; i += VariableLength) {
      const position = Math.floor((i / VariableLength));
      const token = machineData.substr(i, VariableLength);

      machineDataTokens.push({
        token,
        hex: getVariable(position, p => helper.getVariable(p)),
        decimal: getVariable(position, p => helper.getVariableAsDecimal(p)),
        string: getVariable(position, p => helper.getVariableAsString(p)),
        revString: getVariable(position, p => reverse(helper.getVariableAsString(p)))
      })
    }

    return machineDataTokens;
  }

  onHover(e) {
    const tokenElement = e.target;
    const valuesElement = document.getElementsByClassName('contract-data__values');
    valuesElement[0].querySelector('input[name="index"]').value = tokenElement.attributes['data-index'].value;
    valuesElement[0].querySelector('input[name="hex"]').value = tokenElement.attributes['data-hex'].value;
    valuesElement[0].querySelector('input[name="decimal"]').value = tokenElement.attributes['data-decimal'].value;
    valuesElement[0].querySelector('input[name="string"]').value = tokenElement.attributes['data-string'].value;
    valuesElement[0].querySelector('input[name="rev-string"]').value = tokenElement.attributes['data-rev-string'].value;
  }

  onClick(e) {
    const tokenElement = e.target;
    const dataElements = document.getElementsByClassName('token');
    for(let el of dataElements){
      el.classList.remove('active')
    }
    tokenElement.classList.add('active')
  }

  _getStaticHtmlWrapper() {
    return`<div class="contract-data__raw">
    <div></div>
    <small>Length ${this._contract.machineData.length / 2} bytes</small>
  </div>
  <div class="contract-data__values">
    <fieldset class="o-fieldset">
      <div class="o-form-element">
        <label class="c-label" for="hex">Data Index</label>
        <input name="index" placeholder="Select a token" class="c-field" readonly>
      </div>
      <div class="o-form-element">
        <label class="c-label" for="hex">Hex Value</label>
        <input name="hex" placeholder="Select a token" class="c-field" readonly>
      </div>
      <div class="o-form-element">
        <label class="c-label" for="decimal">Decimal Value</label>
        <input name="decimal" placeholder="Select a token" class="c-field" readonly>
      </div>
      <div class="o-form-element">
        <label class="c-label" for="string">String Value</label>
        <input name="string" placeholder="Select a token" class="c-field" readonly>
      </div>
      <div class="o-form-element">
        <label class="c-label" for="rev-string">Reversed String Value</label>
        <input name="rev-string" placeholder="Select a token" class="c-field" readonly>
      </div>
    </fieldset>
  </div>
</div>`;
  }

  _renderCodeVariables(parentElement) {
    const tokens = this._tokenizeMachinedata();
    const onHoverFunction = this.onHover.bind(this);
    const onClickFunction = this.onClick.bind(this);
    for (let i = 0; i < tokens.length; ++i) {
      const {token, hex, decimal, string, revString} = tokens[i];
      const spanElement = document.createElement('span');
      spanElement.classList.add('token');
      spanElement.setAttribute('title', `Index ${i}`);
      spanElement.setAttribute('data-index', `${i}`);
      spanElement.setAttribute('data-hex', `${hex}`);
      spanElement.setAttribute('data-decimal', `${decimal}`);
      spanElement.setAttribute('data-string', `${string}`);
      spanElement.setAttribute('data-rev-string', `${revString}`);
      spanElement.innerText = token;
      spanElement.onmouseover = onHoverFunction;
      spanElement.onclick = onClickFunction;
      parentElement.appendChild(spanElement);
    }
  }

  renderView() {

    const wrapperElement = document.createElement('div');
    wrapperElement.classList.add('contract-data__wrapper');
    wrapperElement.innerHTML = this._getStaticHtmlWrapper();
    const contractDataRawElement = wrapperElement.getElementsByClassName('contract-data__raw');
    this._renderCodeVariables(contractDataRawElement[0].firstElementChild);

    return wrapperElement;

  }
}
