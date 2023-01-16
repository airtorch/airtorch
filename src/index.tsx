import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { PageConfig } from '@jupyterlab/coreutils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
//import { Drive } from '@jupyterlab/services';

//import { requestAPI } from './handler';
import {
  createToolbarFactory,
  Dialog,
  IToolbarWidgetRegistry,
  showDialog,
  ToolbarButton,
  ToolbarRegistry,
  ICommandPalette,
  ReactWidget
} from '@jupyterlab/apputils';

//import { DocumentRegistry } from '@jupyterlab/docregistry';

import { LoggerContext } from './logger';
import { StylesProvider } from '@material-ui/core/styles';

import { AirtorchCredentialsForm } from './widgets/credentials';
//import { PromiseDelegate } from '@lumino/coreutils';

import {IFileBrowserFactory} from '@jupyterlab/filebrowser'
import { Cell, IAttachmentsCellModel } from '@jupyterlab/cells';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { INotebookTools, INotebookTracker} from '@jupyterlab/notebook';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { Widget } from '@lumino/widgets';
import { AttachmentsEditor, AttachmentsTool } from './attachmentseditor';
import { AttributeEditor } from './attributeeditor';
import { CellBarExtension, DEFAULT_TOOLBAR } from './celltoolbartracker';
import { CellMetadataEditor } from './metadataeditor';
import { TagTool } from './tagbar';
import { TagsModel } from './tagsmodel';
import { CellToolbar, EXTENSION_ID, FACTORY_NAME } from './tokens';
import { AirtorchExtension } from './model';


import { TorchDialog } from './components/TorchDialog';
import { getVariable, TorchVariables } from './torchvariables';
import * as React from 'react';
import { Airtorch } from './tokens';
import { rainbowIcon } from './style/icons';
//import * as React from 'react';

const DEFAULT_TOOLBAR_ITEM_RANK = 50;
/**
 * Export the icons so they got loaded
 */
 export { formatIcon } from './icon';

 namespace CommandIDs {
   /**
    * Toggle cell attachments editor
    */
   export const toggleAttachments = `${EXTENSION_ID}:toggle-attachments`;
   /**
    * Toggle cell metadata editor
    */
   export const toggleMetadata = `${EXTENSION_ID}:toggle-metadata`;
   /**
    * Toggle cell toolbar
    */
   export const toggleToolbar = `${EXTENSION_ID}:toggle-toolbar`;
   /**
    * Toggle cell Raw NBConvert format
    */
   export const toggleRawFormat = `${EXTENSION_ID}:toggle-raw-format`;
   /**
    * Toggle cell slide type
    */
   export const toggleSlideType = `${EXTENSION_ID}:toggle-slide-type`;
   /**
    * Toggle cell tags
    */
   export const toggleTags = `${EXTENSION_ID}:toggle-tags`;
 }

/**
 * Initialization data for the kela extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'kela:plugin',
  autoStart: true,
  optional: [ITranslator, IEditorServices, ISettingRegistry],
  requires: [INotebookTracker, IToolbarWidgetRegistry, ICommandPalette, IFileBrowserFactory],
  activate: (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    toolbarRegistry: IToolbarWidgetRegistry,
    palette: ICommandPalette,
    factory1: IFileBrowserFactory,
    //context1: DocumentRegistry.IContext<DocumentRegistry.IModel>,
    translator: ITranslator | null,
    editorServices: IEditorServices | null,
    settingregistry: ISettingRegistry | null,
    ) => {

    let airtorchExtension =  new AirtorchExtension();

    const trans = (translator ?? nullTranslator).load('cell-toolbar');
    //const {tracker} = factory1;
    console.log('JupyterLab extension kela is activated!');

    // Add an application command
    const commandID = 'my-command';
    app.commands.addCommand(commandID, {
      label: 'Torch',
      caption: trans.__('Torch it'),
      icon: rainbowIcon,
      execute: () => {

        // const widget1 = tracker.currentWidget;
        // const model1 = widget1?.selectedItems().next();
        // if (!model1) {
        //   return;
        // }



        const widgetId = 'airtorch-dialog-TorchVariable';
        let anchor = document.querySelector<HTMLDivElement>(`#${widgetId}`);
        if (!anchor) {
          anchor = document.createElement('div');
          anchor.id = widgetId;
          document.body.appendChild(anchor);
        }

        //#future --> factory pattern (constructor without new)
        // https://refactoring.guru/design-patterns/factory-method
        // https://refactoring.guru/design-patterns/factory-method/typescript/example
        //const esp1 = "Hello, how are you";
        const cellValue = notebookTracker.activeCell?.model.value.text;
        const cellArray = cellValue.split(/\r?\n/);
        const variables: Airtorch.IVariable[] = [];
        let variableObject;
        let variableJson;
        cellArray.forEach((variableValue, variableIndex) => {
          if(!variableValue.startsWith('#') && (variableValue.length > 0)) 
          {
            let codeVariable = getVariable(variableValue);
            variableObject = new TorchVariables(codeVariable,codeVariable,variableValue,variableIndex);
            variableJson = variableObject.createJsonObject()
            variables.push(variableJson);
          }
        });

        const baseUrl = PageConfig.getBaseUrl();
        console.log("baseurl  "+baseUrl);
        const serverPath = PageConfig.getOption('serverRoot');
        console.log("options1 "+serverPath);
        const treeUrl = PageConfig.getTreeUrl();
        console.log("drive "+treeUrl);
        //console.log("drive2  "+ URLExt.);    
        //console.log("drive3  "+ context1.localPath); 
        //const router2 = notebook1.cells;
        //console.dir(notebookcells); 
         const filePath = PageConfig.getUrl({
           toShare: true
        });
        console.log("fileUrl "+filePath); 


        const dialog = ReactWidget.create(
          <StylesProvider injectFirst>
          <LoggerContext.Consumer>
            {logger => (
          <TorchDialog
            currentVariable=''
            variableList={variables}
            logger={logger}
            trans={trans}
            open={true}
            onClose={() => dialog.dispose()}
            model ={airtorchExtension}
            serverPath={serverPath}
            filePath={filePath}
            baseUrl={baseUrl}
            treeUrl={treeUrl}
          />
          )}
          </LoggerContext.Consumer>
        </StylesProvider>
        );
        Widget.attach(dialog,anchor);
      }
    });
    
        // Add an application command
        const commandID2 = 'my-command2';
        app.commands.addCommand(commandID2, {
            label: 'Signin',
            execute: async () => {
              const retry = false;
              const credentials = showDialog({
                title: trans.__('Airtorch credentials required'),
                body: new AirtorchCredentialsForm(
                  trans,
                  trans.__('Enter credentials for Airtorch'),
                  retry ? trans.__('Incorrect username or password.') : ''
                )
              });
              const result = await credentials; 
              const login1 = await airtorchExtension.login({"email":result.value.email, "password": result.value.password});
              console.log("  index file mein login1 ka result   ", login1);

              
              // new code {open} -- calling login from server instead of server
              //requestAPI<any>('')


              // new code {close}
      
              /*if(result.button.accept){
                  // POST request
                  const dataToSend = { email: result.value.username, password: result.value.password};
                  const loginRes = await fetch('https://localhost:8000/loginAPI', {
                    method: 'POST',
                    body: JSON.stringify(dataToSend), // string or object
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  });

                  if(loginRes.ok)
                  {
                        const loginResponse = await loginRes.json();
                        console.log('response of login request from revire server'+loginResponse);
                        requestAPI<any>('get_example', {
                          body: JSON.stringify(loginResponse),
                          method: 'POST',  
                          })
                          .then(data => {
                            console.log('response of post request to the server  '+ data);
                          })
                          .catch(reason => {
                            console.error(`The kela server extension appears to be missing.\n${reason}`);
                          });
                  }
                  console.log("kela command chali okay");
              }*/
                console.log("kela command chali hai");
            } 

              // requestAPI<any>('get_example')
              //   .then(data => {
              //           console.log(data);
              //   })
              //   .catch(reason => {
              //           console.error(
              //           `The kela server extension appears to be missing.\n${reason}`
              //            );
              //   });





               /*fetch('https://localhost:8000/loginAPI', {
                    method: 'POST',
                    body: JSON.stringify(dataToSend), // string or object
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  }).then(data => {
                    console.log(data);
                  })
                  .catch(reason => {
                    console.error(`The kela server extension appears to be missing.\n${reason}`);
                  });*/
                  //extract JSON from the http response
                  // do something with myJson
                         
                /*const dialog2 = showDialog({
                    title: 'Airtorch Signin',
                    body: trans.__('Do you want to Signin?')    
                });
                const result2 = await dialog2;
                if (result2.button.accept) {
                    console.log("kela command chali okay");
                }
                console.log("kela command chali hai");*/
        });
    
    
    
    
    // Register specific toolbar items
    toolbarRegistry.registerFactory(
      FACTORY_NAME,
      CellToolbar.ViewItems.TAGS,
      (cell: Widget) => {
        const model = new TagsModel((cell as Cell).model);
        const widget = new TagTool(model);
        widget.disposed.connect(() => {
          model.dispose();
        });
        return widget;
      }
    );

    // Extract the list from nbconvert service as in @jupyterlab/notebook-extension
    app.serviceManager.nbconvert
      .getExportFormats()
      .then(response => {
        if (response) {
          const coreTrans = (translator ?? nullTranslator).load('jupyterlab');
          /**
           * The excluded Cell Inspector Raw NbConvert Formats
           * (returned from nbconvert's export list)
           */
          const rawFormatExclude = [
            'pdf',
            'slides',
            'script',
            'notebook',
            'custom' // Exclude this as the input is editable
          ];
          const optionValueArray: [string, string][] = [
            ['pdf', coreTrans.__('PDF')],
            ['slides', coreTrans.__('Slides')],
            ['script', coreTrans.__('Script')],
            ['notebook', coreTrans.__('Notebook')]
          ];

          // convert exportList to palette and menu items
          const formatList = Object.keys(response);
          formatList.forEach(key => {
            if (rawFormatExclude.indexOf(key) === -1) {
              const altOption = coreTrans.__(
                key[0].toUpperCase() + key.slice(1)
              );
              const coreLabel = coreTrans.__(key);
              const option = coreLabel === key ? altOption : coreLabel;
              const mimeTypeValue = response[key].output_mimetype;
              optionValueArray.push([mimeTypeValue, option]);
            }
          });

          toolbarRegistry.registerFactory(
            FACTORY_NAME,
            CellToolbar.ViewItems.RAW_FORMAT,
            (cell: Widget) => {
              if ((cell as Cell).model.type === 'raw') {
                const w = new AttributeEditor({
                  metadata: (cell as Cell).model.metadata,
                  keys: ['raw_mimetype', 'format'],
                  label: trans.__('Raw NBConvert Format'),
                  values: optionValueArray,
                  editable: true,
                  placeholder: trans.__('Click or press 🠗 for suggestions.'),
                  noValue: ''
                });
                w.addClass('jp-enh-cell-raw-format');
                return w;
              } else {
                const widget = new Widget();
                widget.hide();
                return widget;
              }
            }
          );
        } else {
          throw new Error('Fallback to default raw format.');
        }
      })
      .catch(() => {
        toolbarRegistry.registerFactory(
          FACTORY_NAME,
          CellToolbar.ViewItems.RAW_FORMAT,
          (cell: Widget) => {
            if ((cell as Cell).model.type === 'raw') {
              const w = new AttributeEditor({
                metadata: (cell as Cell).model.metadata,
                keys: ['raw_mimetype', 'format'],
                label: trans.__('Raw NBConvert Format'),
                values: [
                  ['text/latex', 'LaTeX'],
                  ['text/restructuredtext', 'ReStructured Text'],
                  ['text/html', 'HTML'],
                  ['text/markdown', 'Markdown'],
                  ['text/x-python', 'Python']
                ],
                editable: true,
                placeholder: trans.__('Click or press 🠗 for suggestions.'),
                noValue: ''
              });
              w.addClass('jp-enh-cell-raw-format');
              return w;
            } else {
              const widget = new Widget();
              widget.hide();
              return widget;
            }
          }
        );
      });

    toolbarRegistry.registerFactory(
      FACTORY_NAME,
      CellToolbar.ViewItems.SLIDESHOW,
      (cell: Widget) => {
        const w = new AttributeEditor({
          metadata: (cell as Cell).model.metadata,
          keys: ['slideshow/slide_type'],
          label: trans.__('Slide Type'),
          values: [
            ['slide', trans.__('Slide')],
            ['subslide', trans.__('Sub-Slide')],
            ['fragment', trans.__('Fragment')],
            ['skip', trans.__('Skip')],
            ['notes', trans.__('Notes')]
          ],
          noValue: '-'
        });
        w.addClass('jp-enh-cell-slide-type');
        return w;
      }
    );

    toolbarRegistry.registerFactory(
      FACTORY_NAME,
      CellToolbar.ViewItems.ATTACHMENTS,
      (cell: Widget) => {
        if (['markdown', 'raw'].includes((cell as Cell).model?.type)) {
          return new ToolbarButton({
            label: trans.__('Edit Attachments…'),
            actualOnClick: true,
            onClick: async (): Promise<void> => {
              await showDialog({
                title: trans.__('Edit Cell Attachments'),
                body: new AttachmentsEditor(
                  ((cell as Cell).model as IAttachmentsCellModel).attachments,
                  translator ?? nullTranslator
                ),
                buttons: [Dialog.okButton({ label: trans.__('Close') })]
              });
            }
          });
        } else {
          return new Widget();
        }
      }
    );

    if (editorServices) {
      toolbarRegistry.registerFactory(
        FACTORY_NAME,
        CellToolbar.ViewItems.METADATA,
        (cell: Widget) =>
          new ToolbarButton({
            label: trans.__('Edit Metadata…'),
            actualOnClick: true,
            onClick: async (): Promise<void> => {
              const body = new CellMetadataEditor(
                (cell as Cell).model.metadata,
                editorServices.factoryService.newInlineEditor,
                translator ?? nullTranslator
              );
              body.addClass('jp-cell-enh-metadata-editor');
              await showDialog({
                title: trans.__('Edit Cell Metadata'),
                body,
                buttons: [Dialog.okButton({ label: trans.__('Close') })]
              });
            }
          })
      );
    }

    // Add the widget extension
    let notebookExtension: CellBarExtension;
    if (settingregistry) {
      const cellToolbarFactory = createToolbarFactory(
        toolbarRegistry,
        settingregistry,
        FACTORY_NAME,
        plugin.id,
        translator ?? nullTranslator
      );

      settingregistry
        .load(plugin.id)
        .then(async settings => {
          await upgradeSettings(settings);
          notebookExtension = new CellBarExtension(
            app.commands,
            cellToolbarFactory,
            toolbarRegistry,
            settings
          );
          app.docRegistry.addWidgetExtension('Notebook', notebookExtension);
        })
        .catch(reason => {
          console.error(`Failed to load settings for ${plugin.id}.`, reason);
        });
    } else {
      notebookExtension = new CellBarExtension(
        app.commands,
        (c: Cell): ToolbarRegistry.IToolbarItem[] =>
          DEFAULT_TOOLBAR.filter(
            item => !item.cellType || item.cellType === c.model.type
          ).map(item => {
            return {
              name: item.name,
              widget: toolbarRegistry.createWidget(FACTORY_NAME, c, item)
            };
          }),
        toolbarRegistry,
        null
      );
      app.docRegistry.addWidgetExtension('Notebook', notebookExtension);
    }
    

    // Add commands
    app.commands.addCommand(CommandIDs.toggleAttachments, {
      label: trans.__('Show Attachments'),
      execute: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            handler.setViewState(
              CellToolbar.ViewItems.ATTACHMENTS,
              !handler.getViewState(CellToolbar.ViewItems.ATTACHMENTS)
            );
          }
        }
      },
      isToggled: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            return handler.getViewState(CellToolbar.ViewItems.ATTACHMENTS);
          }
        }
        return false;
      }
    });
    app.commands.addCommand(CommandIDs.toggleMetadata, {
      label: trans.__('Show Metadata'),
      execute: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            handler.setViewState(
              CellToolbar.ViewItems.METADATA,
              !handler.getViewState(CellToolbar.ViewItems.METADATA)
            );
          }
        }
      },
      isToggled: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            return handler.getViewState(CellToolbar.ViewItems.METADATA);
          }
        }
        return false;
      }
    });
    app.commands.addCommand(CommandIDs.toggleRawFormat, {
      label: trans.__('Show Raw Cell Format'),
      execute: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            handler.setViewState(
              CellToolbar.ViewItems.RAW_FORMAT,
              !handler.getViewState(CellToolbar.ViewItems.RAW_FORMAT)
            );
          }
        }
      },
      isToggled: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            return handler.getViewState(CellToolbar.ViewItems.RAW_FORMAT);
          }
        }
        return false;
      }
    });
    app.commands.addCommand(CommandIDs.toggleSlideType, {
      label: trans.__('Show Slideshow'),
      execute: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            handler.setViewState(
              CellToolbar.ViewItems.SLIDESHOW,
              !handler.getViewState(CellToolbar.ViewItems.SLIDESHOW)
            );
          }
        }
      },
      isToggled: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            return handler.getViewState(CellToolbar.ViewItems.SLIDESHOW);
          }
        }
        return false;
      }
    });
    app.commands.addCommand(CommandIDs.toggleTags, {
      label: trans.__('Show Tags'),
      execute: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            handler.setViewState(
              CellToolbar.ViewItems.TAGS,
              !handler.getViewState(CellToolbar.ViewItems.TAGS)
            );
          }
        }
      },
      isToggled: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            return handler.getViewState(CellToolbar.ViewItems.TAGS);
          }
        }
        return false;
      }
    });
    app.commands.addCommand(CommandIDs.toggleToolbar, {
      label: trans.__('Show Toolbar'),
      execute: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            handler.isActive = !handler.isActive;
          }
        }
      },
      isToggled: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            return handler.isActive;
          }
        }
        return false;
      }
    });


    


    /**
     * Upgrade the settings from the old format of v3
     * @param settings Extension settings
     */
     async function upgradeSettings(
      settings: ISettingRegistry.ISettings
    ): Promise<void> {
      /*const iconsMapping: { [name: string]: string } = {
        '@jlab-enhanced/cell-toolbar:code': 'ui-components:code',
        '@jlab-enhanced/cell-toolbar:delete': 'ui-components:delete'
      };*/
      const current = settings.composite as any;
      let wasUpgraded = false;
      const toolbarDefinition: ISettingRegistry.IToolbarItem[] = [];
      let rank = 0;
      //mera code
      /*current['rightMenu'] = [{
        command: 'notebook:insert-cell-below',
        icon: runIcon
      },
      {
        command: 'notebook:insert-cell-below',
        icon: addIcon
      }];*/
      //my comments of leftMenu and Right Menu
      /*if (current['leftMenu']) {
        wasUpgraded = true;
        (current['leftMenu'] as CellToolbar.IButton[]).forEach(item => {
          if (app.commands.hasCommand(item.command)) {
            toolbarDefinition.push({
              name: [item.command.split(':')[1], item.cellType].join('-'),
              command: item.command,
              icon: iconsMapping[item.icon as string] ?? item.icon,
              rank: rank++
            });
          }
        });
        await settings.remove('leftMenu');
      }*/
      rank = Math.max(rank, DEFAULT_TOOLBAR_ITEM_RANK);
      toolbarDefinition.push({ name: 'spacer', type: 'spacer', rank });
      //mera code
      current['showTags'] = false;

      if (current['showTags']) {
        wasUpgraded = true;
        toolbarDefinition.push({
          name: CellToolbar.ViewItems.TAGS,
          rank: rank++
        });
        await settings.remove('showTags');
      }
      /*if (current['rightMenu']) {
        wasUpgraded = true;
        (current['rightMenu'] as CellToolbar.IButton[]).forEach(item => {
          if (app.commands.hasCommand(item.command)) {
            toolbarDefinition.push({
              name: [item.command.split(':')[1], item.cellType].join('-'),
              command: item.command,
              icon: iconsMapping[item.icon as string] ?? item.icon,
              rank: rank++
            });
          }
        });
        await settings.remove('rightMenu');
      }*/
      if (wasUpgraded) {
        // Disabled default toolbar items
        const names = toolbarDefinition.map(t => t.name);
        for (const item of DEFAULT_TOOLBAR) {
          if (!names.includes(item.name)) {
            toolbarDefinition.push({ name: item.name, disabled: true });
          }
        }
        await settings.set('toolbar', toolbarDefinition);
        await showDialog({
          title: 'Information',
          body: trans.__(
            'The toolbar extension has been upgraded. You need to refresh the web page to take into account the new configuration.'
          )
        });
      }
    }







  }
};


/**
 * Notebook tools plugin
 */
 const nbTools: JupyterFrontEndPlugin<void> = {
  id: `${EXTENSION_ID}:tools`,
  autoStart: true,
  activate: async (
    app: JupyterFrontEnd,
    notebookTools: INotebookTools,
    translator: ITranslator | null
  ) => {
    notebookTools.addItem({
      tool: new AttachmentsTool(translator ?? nullTranslator),
      section: 'common'
    });
  },
  optional: [ITranslator],
  requires: [INotebookTools]
};


export default [plugin, nbTools];
