import { Airtorch, IAirtorchExtension } from "./tokens";
import { ISignal, Signal } from "@lumino/signaling";
import { requestAPI } from "./handler";


export class AirtorchExtension{
      /**
   * Returns an extension model.
   *
   * @param app - frontend application
   * @param settings - plugin settings
   * @returns extension model
   */

  /**
   * Test whether the context is disposed.
   */
   get isDisposed(): boolean {
    return this._isDisposed;
  }

    /**
   * A signal emitted when the poll is disposed.
   */
     get disposed(): ISignal<AirtorchExtension, void> {
        return this._disposed;
      }

  /**
   * Dispose of the resources held by the object.
   */
   dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;

    this._disposed.emit();
    Signal.clearData(this);
  }

      get variableList(): Airtorch.IVariable[]{
          return this._variableList;
      }

      get currentVariable(): Airtorch.IVariable{
          return this._currentVariable;
      }

      get pathProject(): string{
          return this._pathProject;
      }

      get isReady(): boolean{
          return this._pendingReadyPromise === 0;
      }

      get ready(): Promise<void>{
          return this._readyPromise;
      }

      get variableTorched(): ISignal<IAirtorchExtension, void>{
          return this._variableTorched;
      }

      get credentialsRequired(): boolean{
          return this.credentialsRequired;
      }
      set credentialsRequired(value: boolean) {
        if (this._credentialsRequired !== value) {
          this._credentialsRequired = value;
          this._credentialsRequiredChanged.emit(value);
        }
      }

      get credentialsRequiredChanged(): ISignal<IAirtorchExtension, boolean>{
          return this._credentialsRequiredChanged;
      }


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
    
      async torchit(options?: Airtorch.ITorchItOptions): Promise<Airtorch.ITorchItResult>{

        const body ={
          variableTorchName: '',
          variableName: '',
          lineCode: '',
          filePath: '',
          serverPath: '',
          baseUrl: '',
          treeUrl: '',
          variableType: ''
        }

        if (options!=undefined){
          if(options.variableTorchName){
            body.variableTorchName = options.variableTorchName
          }
          if(options.variableName){
            body.variableName = options.variableName
          }
          if(options.lineCode){
            body.lineCode = options.lineCode
          }
          if(options.filePath){
            body.filePath = options.filePath
          }
          if(options.serverPath){
            body.serverPath = options.serverPath
          }
          if(options.baseUrl){
            body.baseUrl = options.baseUrl
          }
          if(options.treeUrl){
            body.treeUrl = options.treeUrl
          }
          if(options.variableType){
            body.variableType = options.variableType
          }                               
        }

        const data = await requestAPI<any>(
          'torch', {
          body: JSON.stringify(body),
          method: 'POST',  
          })

        /*const body = {
            code: 1,
            message: "sab theek hai"
          };
          return bofy;
          */
        return data;
      }

      async signedIn(){
          const signedIn = await requestAPI<any>('login');
          return signedIn;
      }

      async login(options?: Airtorch.IAuth){
        
        const login = await requestAPI<any>('login', {
          body: JSON.stringify(options),
          method: 'POST',  
          });
          console.log("login ka response dekho na   "+login);
          return login;
      }

      async signout(){
        const signout = await requestAPI<any>('logout');
        return signout;
      }


      private _currentVariable: Airtorch.IVariable | null = null;
      private _variableList: Airtorch.IVariable[] = [];
      private _pathProject: string | null = null;
      private _pendingReadyPromise = 0;
      private _readyPromise: Promise<void> = Promise.resolve();
      private _credentialsRequired = false;
      private _isDisposed = false;
      private _disposed: Signal<AirtorchExtension, void>;

      //Configurable
      private _variableTorched = new Signal<IAirtorchExtension, void>(this);
      private _credentialsRequiredChanged = new Signal<IAirtorchExtension, boolean>(this);


      
}
