import { xvariableIcon } from '../style/icons';
//import { Airtorch, IAirtorchExtension} from '../tokens';
//import { Logger } from '../logger';
import { TranslationBundle } from '@jupyterlab/translation';
import * as React from 'react';
//import {VariableSizeList} from 'react-window';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import ListItem from '@material-ui/core/ListItem';
import ClearIcon from '@material-ui/icons/Clear';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { classes } from 'typestyle';
import { 
  actionsWrapperClass,
  activeListItemClass,
  buttonClass,
  cancelButtonClass,
  closeButtonClass,
  contentWrapperClass,
  createButtonClass,
  errorMessageClass,
  filterClass,
  filterClearClass,
  filterInputClass,
  filterWrapperClass,
  listItemBoldTitleClass,
  listItemClass,
  listItemColorTitleClass,
  listItemContentClass,
  listItemContentLineCodeClass,
  listItemDescClass,
  listItemIconClass,
  listItemTitleClass,
  listWrapperClass,
  nameInputClass,
  titleClass,
  titleWrapperClass,
  torchDialogClass
} from '../style/TorchDialog';

import { Airtorch, Level } from '../tokens';
import { Logger} from '../logger';
import { AirtorchExtension } from '../model';


const ITEM_HEIGHT = 27.5; // HTML element height for a single variable
const CURRENT_VARIABLE_HEIGHT = 66.5; // HTML element height for the current variable with description
const HEIGHT = 200; // HTML element height for the variables list

/**
 * Interface describing component properties.
 */
export interface ITorchDialogProps {

  /**
   * Current variable name.
   */
  currentVariable: string;

  /**
   * Current list of variables.
   */
  variableList: Airtorch.IVariable[];

  /**
   * Extension logger
   */
   logger: Logger;

  /**
   * Torch extension data model.
   */
   //model: IAirtorchExtension;

   /**
    * Boolean indicating whether to show the dialog.
    */
   open: boolean;

   /**
    * Callback to invoke upon closing the dialog.
    */
    onClose: () => void;

  /**
   * The application language translator.
   */
   trans: TranslationBundle;

   model: AirtorchExtension;

   /**
    * Path from where the server is hosted
    */
   serverPath: string;

   /**
    * Path of the file
    */
   filePath: string;
   /**
    * Path of the file
    */
   baseUrl: string;
   /**
    * Path of the file
    */
   treeUrl: string;

}

/**
 * Interface describing component state.
 */
 export interface ITorchDialogState {
    /**
     * Variable name after Torching.
     */
    name: string;
    /**
     * Variable name in code.
     */
    variableName: string;
  
    /**
     * Menu filter.
     */
    filter: string;
  
    /**
     * Error message.
     */
    error: string;
    /**
     * Line of code.
     */
    lineCode: string;
     /**
      * Line number - Line number of the code
      */
     lineNumber: number;


  }


export class TorchDialog extends React.Component<
ITorchDialogProps, 
ITorchDialogState
> {
  /**
   * Returns a React component for rendering a torch menu.
   *
   * @param props - component properties
   * @returns React component
   */
  constructor(props: ITorchDialogProps){
      super(props);

      this._variableList = React.createRef<VariableSizeList>();
      this.state = {
        name: '',
        variableName: props.currentVariable || '',
        filter: '',
        error: '',
        lineCode: '',
        lineNumber: -1
      };
  }

  componentDidMount(): void {
    try {
      this.setState({ name: '' });
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Renders a dialog for creating a new Torch.
   *
   * @returns React element
   */
  render(): JSX.Element {
    return(

      <Dialog
        classes={{
          paper: torchDialogClass
        }}
        open={true}
        onClose={this.props.onClose}
      >
        <div className={titleWrapperClass}>
          <p className={titleClass}>{this.props.trans.__('Torch your code')}</p>
          <button className={closeButtonClass}>
            <ClearIcon
              titleAccess={this.props.trans.__('Close this dialog')}
              fontSize="small"
              onClick={this.props.onClose}
            />
          </button>
        </div>
        <div className={contentWrapperClass}>
          {this.state.error ? (
            <p className={errorMessageClass}>{this.state.error}</p>
          ) : null}
          <p>{this.props.trans.__('Name')}</p>
          <input
            className={nameInputClass}
            type="text"
            onChange={this._onNameChange}
            value={this.state.name}
            placeholder=""
            title={this.props.trans.__('Enter name for torched variable')}
          />
          <p>{this.props.trans.__('Select variable to torch')}</p>
          <div className={filterWrapperClass}>
            <div className={filterClass}>
              <input
                className={filterInputClass}
                type="text"
                onChange={this._onFilterChange}
                value={this.state.filter}
                placeholder={this.props.trans.__('Filter')}
                title={this.props.trans.__('Filter variable menu')}
              />
              {this.state.filter ? (
                <button className={filterClearClass}>
                  <ClearIcon
                    titleAccess={this.props.trans.__(
                      'Clear the current filter'
                    )}
                    fontSize="small"
                    onClick={this._resetFilter}
                  />
                </button>
              ) : null}
            </div>
          </div>
          {this._renderItems()}
        </div>
        <DialogActions className={actionsWrapperClass}>
          <input
            className={classes(buttonClass, cancelButtonClass)}
            type="button"
            title={this.props.trans.__(
              'Close this dialog without torching'
            )}
            value={this.props.trans.__('Cancel')}
            onClick={this.props.onClose}
          />
          <input
            className={classes(buttonClass, createButtonClass)}
            type="button"
            title={this.props.trans.__('Torch this variable')}
            value={this.props.trans.__('Torch Variable')}
            onClick={() => {
              this._createTorch();
            }}
            disabled={(this.state.name === '' && this.state.filter === '') || this.state.error !== '' }
          />
        </DialogActions>
      </Dialog>
    );
  }


  /**
   * Renders torch menu items.
   *
   * @returns array of React elements
   */
   private _renderItems(): JSX.Element {
    const current = this.props.currentVariable;
    // Perform a "simple" filter... (TODO: consider implementing fuzzy filtering)
    const filter = this.state.filter;
    const variables = this.props.variableList
      .filter(variable => !filter || variable.name.includes(filter))
      .slice()
      .sort(comparator);
    return (
      <VariableSizeList
        className={listWrapperClass}
        height={HEIGHT}
        estimatedItemSize={ITEM_HEIGHT}
        itemCount={variables.length}
        itemData={variables}
        itemKey={(index, data) => data[index].line_number}
        itemSize={index => {
          const variable = variables[index];
          return [this.props.currentVariable, 'hello', 'world'].includes(
            variable.name
          )
            ? CURRENT_VARIABLE_HEIGHT
            : ITEM_HEIGHT;
        }}
        ref={this._variableList}
        style={{ overflowX: 'hidden' }}
        width={'auto'}
      >
        {this._renderItem}
      </VariableSizeList>
    );

    /**
     * Comparator function for sorting variables.
     *
     * @private
     * @param a - first variable
     * @param b - second variable
     * @returns integer indicating sort order
     */
    function comparator(a: Airtorch.IVariable, b: Airtorch.IVariable): number {
      if (a.name === current) {
        return -1;
      } else if (b.name === current) {
        return 1;
      }
      if (a.name === 'hello') {
        return -1;
      } else if (b.name === 'world') {
        return 1;
      }
      if (a.name === 'hello') {
        return -1;
      } else if (b.name === 'world') {
        return 1;
      }
      return 0;
    }
  }



  /**
   * Renders a torch menu item.
   *
   * @param props Row properties
   * @returns React element
   */
   private _renderItem = (props: ListChildComponentProps): JSX.Element => {
    const { data, index, style } = props;
    const variable = data[index] as Airtorch.IVariable;

    //const isBase = variable.name === this.state.variableName;
    const isBase = variable.line_number === this.state.lineNumber;
    const isCurrent = variable.name === this.props.currentVariable;

    let isBold;
    let desc;
    if (isCurrent) {
      isBold = true;
      desc = this.props.trans.__(
        'The current torch. Pick this if you want to build on work done in this torch.'
      );
    } else if (['master', 'main'].includes(variable.name)) {
      isBold = true;
      desc = this.props.trans.__(
        'The default torch. Pick this if you want to start fresh from the default torch.'
      );
    }

    return (
      <ListItem
        button
        title={this.props.trans.__(
          'Torch variable based on: %1',
          variable.name
        )}
        className={classes(listItemClass, isBase ? activeListItemClass : null)}
        onClick={this._onVariableClickFactory(variable)}
        style={style}
      >
        <xvariableIcon.react className={listItemIconClass} tag="span" />
        <div className={listItemContentClass}>
          <div
            className={classes(
              listItemTitleClass,
              isBold ? listItemBoldTitleClass : null
            )}
          >
            {variable.name}
          </div>
          {desc ? (
            <p className={listItemDescClass}>{this.props.trans.__(desc)}</p>
          ) : null}
        </div>
        <div className={listItemContentLineCodeClass}>
          <div
          className={classes(isBase ? activeListItemClass : listItemColorTitleClass)}
          >
            {variable.line_code}
          </div>
        </div>
      </ListItem>
    );
  };



  /**
   * Callback invoked upon a change to the menu filter.
   *
   * @param event - event object
   */
   private _onFilterChange = (event: any): void => {
    this._variableList.current.resetAfterIndex(0);
    this.setState({
      filter: event.target.value
    });
  };

  /**
   * Callback invoked to reset the menu filter.
   */
  private _resetFilter = (): void => {
    this._variableList.current.resetAfterIndex(0);
    this.setState({
      filter: ''
    });
  };

    /**
   * Returns a callback which is invoked upon clicking a variable name.
   *
   * @param torch - variable name
   * @returns callback
   */
     private _onVariableClickFactory(variable: Airtorch.IVariable) {
      const self = this;
      return onClick;
  
      /**
       * Callback invoked upon clicking a variable name.
       *
       * @private
       * @param event - event object
       */
      function onClick(): void {
        self.setState({
          variableName: variable.name,
          lineCode: variable.line_code,
          lineNumber: variable.line_number          
        });
      }
    }

  /**
   * Callback invoked upon a change to the torch name input element.
   *
   * @param event - event object
   */
   private _onNameChange = (event: any): void => {
    this.setState({
      name: event.target.value,
      error: ''
    });
  };

    /**
   * Creates a new torch.
   *
   * @param torch - torch name
   * @returns promise which resolves upon attempting to create a new torch
   */
    private async _createTorch(): Promise<void> {
      const opts = {
         //newTorch: true,
         variableTorchName: this.state.name,
         variableName: this.state.variableName,
         lineCode: this.state.lineCode,
         serverPath: this.props.serverPath,
         filePath: this.props.filePath,
         baseUrl: this.props.baseUrl,
         treeUrl: this.props.treeUrl
       };
  
    //   this.props.logger.log({
    //     level: Level.RUNNING,
    //     message: this.props.trans.__('Creating torch…')
    //   });
       try {
         await this.props.model.torchit(opts);
       } catch (err) {
    //     this.setState({
    //       error: err.message.replace(/^fatal:/, '')
    //     });
    //     this.props.logger.log({
    //       level: Level.ERROR,
    //       message: this.props.trans.__('Failed to create torch.')
    //     });
         return;
       }
  
       this.props.logger.log({
         level: Level.SUCCESS,
         message: this.props.trans.__('torch created.')
       });
       // Close the torch dialog:
       this.props.onClose();
  
       // Reset the torch name and filter:
       this._variableList.current.resetAfterIndex(0);
       this.setState({
         name: '',
         filter: ''
       });
     }

  private _variableList: React.RefObject<VariableSizeList>;
}