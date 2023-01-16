import { Dialog } from '@jupyterlab/apputils';
import { TranslationBundle } from '@jupyterlab/translation';
import { Widget } from '@lumino/widgets';
import { Airtorch } from '../tokens';

/**
 * The UI for the credentials form
 */
export class AirtorchCredentialsForm
  extends Widget
  implements Dialog.IBodyWidget<Airtorch.IAuth>
{
  constructor(
    trans: TranslationBundle,
    textContent = trans.__('Enter credentials for Airtorch'),
    warningContent = ''
  ) {
    super();
    this._trans = trans;
    this.node.appendChild(this.createBody(textContent, warningContent));
  }

  private createBody(textContent: string, warningContent: string): HTMLElement {

    const node = document.createElement('div');
    const label = document.createElement('label');

    const checkboxLabel = document.createElement('label');
    this._checkboxCacheCredentials = document.createElement('input');
    const checkboxText = document.createElement('span');

    this._user = document.createElement('input');
    this._user.type = 'text';
    this._password = document.createElement('input');
    this._password.type = 'password';

    // const select = document.createElement('select');
    // select.name = "name"
    // select.textContent = this._trans.__('Name');
    // select.textContent = this._trans.__('Select Options');
    // const option1 = document.createElement('option');
    // option1.textContent = 'Volvo'
    // option1.value = 'Volvo';
    // const option2 = document.createElement('option');
    // option2.textContent = 'Audi';
    // option2.value = 'Audi';

    // node.appendChild(select);
    // select.appendChild(option1);
    // select.appendChild(option2);


    const text = document.createElement('span');
    const warning = document.createElement('div');


    node.className = 'jp-CredentialsBox';
    warning.className = 'jp-CredentialsBox-warning';
    text.textContent = textContent;
    warning.textContent = warningContent;
    this._user.placeholder = this._trans.__('email');
    this._password.placeholder = this._trans.__(
      'password'
    );

    checkboxLabel.className = 'jp-CredentialsBox-label-checkbox';
    this._checkboxCacheCredentials.type = 'checkbox';
    checkboxText.textContent = this._trans.__('Save my login temporarily');

    label.appendChild(text);
    label.appendChild(this._user);
    label.appendChild(this._password);
    node.appendChild(label);
    node.appendChild(warning);

    checkboxLabel.appendChild(this._checkboxCacheCredentials);
    checkboxLabel.appendChild(checkboxText);
    node.appendChild(checkboxLabel);

    return node;
  }

  /**
   * Returns the input value.
   */
  getValue(): Airtorch.IAuth {
    return {
      email: this._user.value,
      password: this._password.value,
      cache_credentials: this._checkboxCacheCredentials.checked
    };
  }
  protected _trans: TranslationBundle;
  private _user!: HTMLInputElement;
  private _password!: HTMLInputElement;
  private _checkboxCacheCredentials!: HTMLInputElement;
}
