import { LabIcon } from '@jupyterlab/ui-components';
import { IDisposable } from '@lumino/disposable';
import { ISignal } from '@lumino/signaling';
import { ServerConnection } from '@jupyterlab/services';
import { ReadonlyJSONObject, Token } from '@lumino/coreutils';

export const EXTENSION_ID = 'kela';

export const IAirtorchExtension = new Token<IAirtorchExtension>(EXTENSION_ID);

export const FACTORY_NAME = 'Cell';

export namespace CellToolbar {
  /**
   * View toggleable items
   */
  export enum ViewItems {
    /**
     * Attachments toolbar item name
     */
    ATTACHMENTS = 'attachments',
    /**
     * Metadata toolbar item name
     */
    METADATA = 'metadata',
    /**
     * Raw format toolbar item name
     */
    RAW_FORMAT = 'raw-format',
    /**
     * Slide type toolbar item name
     */
    SLIDESHOW = 'slide-type',
    /**
     * Tags toolbar item name
     */
    TAGS = 'tags'
  }
  /**
   * Menu action interface
   */
  export interface IButton {
    /**
     * Command to be triggered
     */
    command: string;
    /**
     * Icon for the item
     */
    icon: LabIcon | string;
    /**
     * Icon tooltip
     */
    tooltip?: string;
    /**
     * Type of cell it applies on
     *
     * Undefined if it applies on all cell types
     */
    cellType?: 'code' | 'markdown' | 'raw';
  }

  export interface IConfig {
    /**
     * Default list of tags to always display for quick selection.
     */
    defaultTags: string[];
    /**
     * Place the cell toolbar above the cell. If set, `leftSpace` is ignored.
     */
    floatPosition: { right: number; top: number } | null;
    /**
     * Set the list of visible helper buttons.
     */
    helperButtons:
      | (
          | 'insert-cell-below'
          | 'move-cell-down'
          | 'move-cell-up'
          | 'run-cell-and-select-next'
        )[]
      | null;
    /**
     * Size of the empty space left of the cell toolbar in px. Ignored if `floatPosition` is not null.
     */
    leftSpace: number;
    /**
     * Mapping of the toolbar item name with the cell type they are applied on.
     *
     * null if it applies on all cell types
     */
    cellType: CellTypeMapping;
  }

  /**
   * Mapping of the toolbar item name with the cell type they are applied on.
   *
   * null if it applies on all cell types
   */
  export type CellTypeMapping = {
    [itemName: string]: 'code' | 'markdown' | 'raw' | null;
  };
}


/**
 * Log message severity.
 */
 export enum Level {
  SUCCESS = 10,
  INFO = 20,
  RUNNING = 30,
  WARNING = 40,
  ERROR = 50
}

/**
 * Interface describing a component log message.
 */
 export interface ILogMessage {
  /**
   * Detailed message
   */
  details?: string;

  /**
   * Error object.
   */
  error?: Error;

  /**
   * Message level.
   */
  level: Level;

  /**
   * Message text.
   */
  message: string;
}


export namespace Airtorch {
  /**
   * Interface for the Airtorch Auth request with credentials caching option.
   */
   export interface IAuth {
    email: string;
    password: string;
    cache_credentials?: boolean;
  }

  /**
   * Variable description interface
   */
   export interface IVariable {
    is_torched_variable: boolean;
    name: string;
    variable_name: string;
    line_code: string;
    tag: string | null;
    line_number: number;
  }

  /**
   * Interface to call the torchit method
   *
   * If a variable name is provided, torch it (with or without creating it)
   * If a filename is provided, check the file out
   * If nothing is provided, check all files out
   */
   export interface ITorchItOptions {
    /**
     * Torch name
     */
    variableTorchName?: string;
    /**
     * Variable name
     */
    variableName?: string;
    /**
     * Line code where the variable is used
     */
    lineCode?: string;
    /**
     * Filepath
     */
    filePath?: string;

    serverPath?: string;

    baseUrl?: string;

    treeUrl?: string;
  }

  /** Interface for TorchCheckout request result.
   * For reporting errors in checkout
   */
  export interface ITorchItResult {
    code: number;
    message?: string;
  }

  /**
   * A wrapped error for a fetch response.
   */
   export class AirtorchResponseError extends ServerConnection.ResponseError {
    /**
     * Create a new response error.
     */
    constructor(
      response: Response,
      message = `Invalid response: ${response.status} ${response.statusText}`,
      traceback = '',
      json: ReadonlyJSONObject = {}
    ) {
      super(response, message);
      this.traceback = traceback; // traceback added in mother class in 2.2.x
      this._json = json;
    }

    /**
     * The error response JSON body
     */
    get json(): ReadonlyJSONObject {
      return this._json;
    }

    /**
     * The traceback associated with the error.
     */
    traceback: string;

    protected _json: ReadonlyJSONObject;
  }

}


export interface IAirtorchExtension extends IDisposable{
    /**
   * Current variable name.
   */
    currentVariable: Airtorch.IVariable;

    /**
   * Current list of variables.
   */
    variableList: Airtorch.IVariable[];

  /**
   * A signal emitted when the variable is torched to Airtorch server.
   */
   readonly variableTorched: ISignal<IAirtorchExtension, void>;

  /**
   * Top level path of the current Project
   */
   pathProject: string | null;

  /**
   * Test whether the variable is torched;
   */
   isReady: boolean;

   /**
    * A promise that fulfills when the variable is torched;
    */
   ready: Promise<void>;

  /**
   * Boolean indicating whether credentials are required from the user.
   */
   credentialsRequired: boolean;

   /**
    * A signal emitted whenever credentials are required, or are not required anymore.
    */
   readonly credentialsRequiredChanged: ISignal<IAirtorchExtension, boolean>;

  /**
   * Torch a variable.
   *
   * ## Notes
   *
   * -   If a variable name is provided, torch the provided variable
   *
   * TODO: Refactor into separate endpoints for each kind of torch request
   *
   * @param options - torchit options
   * @returns promise which resolves upon performing a checkout
   *
   * @throws {Airtorch.AirtorchResponseError} If the server response is not ok
   * @throws {ServerConnection.NetworkError} If the request cannot be made
   */
   torchit(options?: Airtorch.ITorchItOptions): Promise<Airtorch.ITorchItResult>;




     /**
   * Torch a variable.
   *
   * ## Notes
   *
   * -   If a variable name is provided, torch the provided variable
   *
   * TODO: Refactor into separate endpoints for each kind of torch request
   *
   * @param options - torchit options
   * @returns promise which resolves upon performing a checkout
   *
   * @throws {Airtorch.AirtorchResponseError} If the server response is not ok
   * @throws {ServerConnection.NetworkError} If the request cannot be made
   */
      torchit(options?: Airtorch.ITorchItOptions): Promise<Airtorch.ITorchItResult>;

}

/**
 * The command IDs used by the airtorch plugin.
 */
 export enum CommandIDs {
  airtorchUI = 'airtorch:ui',
  airtorchTorch = 'airtorch:torch'
}



