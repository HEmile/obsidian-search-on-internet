import {EventRef, MarkdownPreviewView, MarkdownView, Menu, Plugin, TFile} from 'obsidian';
import {SOISettingTab, SOISettings, DEFAULT_SETTING, SearchSetting} from './settings';
import open from 'open';
import {SearchModal} from './modal';
import {SearchView} from './view';


export default class SearchOnInternetPlugin extends Plugin {
    settings: SOISettings;

    async onload() {
      console.log('loading search-on-internet');

      await this.loadSettings();

      this.addSettingTab(new SOISettingTab(this.app, this));
      const plugin = this;
      this.registerEvent(
          this.app.workspace.on('file-menu', (menu, file: TFile, source:string) => {
            if (file === null) {
              return;
            }
            const fileTags = this.app.metadataCache.getFileCache(file)
                ?.tags?.map((t) => t.tag);
            this.settings.searches.forEach((search) => {
              if (search.tags.length === 0 ||
              fileTags?.some((t) => search.tags.contains(t))) {
                menu.addItem((item) => {
                  item.setTitle(`Search ${search.name}`).setIcon('search')
                      .onClick((evt) => {
                        plugin.openSearch(search, file.basename);
                      });
                });
              }
            });
          }));

      this.addCommand({
        id: 'search-on-internet',
        name: 'Perform search',
        callback: () => {
          let query = this.getSelectedText();

          if (query === null || query === '') {
            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView == null) {
              return;
            }
            query = activeView.getDisplayText();
          }
          const modal = new SearchModal(plugin.app, plugin, query);
          modal.open();
        },
      });


      // Changing the context menu is a bit problematic:
      // Obsidian sometimes uses its own context menu, eg when right-clicking
      // on internal link. But other times, it's a context menu that
      // cannot really be edited easily. It would be nice if Obsidian
      // provided its own context menu everywhere to hook into.

      this.registerCodeMirror((cm) => {
        // @ts-ignore
        cm.resetSelectionOnContextMenu=false;
        cm.on('contextmenu', (editor, event)=>{
          console.log(editor);
          console.log(event);
          this.handleContext(event);
        });
      });
      document.on('contextmenu', '.markdown-preview-view', (event) => {
        console.log(event);
        this.handleContext(event);
      });
    }

    getSelectedText(): string {
      const wSelection = window.getSelection();
      const docSelection = document?.getSelection();
      if (wSelection) {
        return wSelection.toString();
      } else if (document && docSelection.type != 'Control') {
        return docSelection.toString();
      }
      return null;
    }

    async handleContext(e: MouseEvent, activeView: SearchView=null) {
      const query = this.getSelectedText();
      if (query === null || query === '') {
        return;
      }
      const fileMenu = new Menu();
      for (const setting of this.settings.searches) {
        fileMenu.addItem((item) => {
          item.setTitle(`Search ${setting.name}`).setIcon('search')
              .onClick((evt) => {
                this.openSearch(setting, query, activeView);
              });
        });
      }
      fileMenu.showAtPosition({x: e.x, y: e.y});
      e.preventDefault();
    }

    async openSearch(search: SearchSetting, query: string, activeView: SearchView=null) {
      const url = search.query.replace('{{title}}', encodeURIComponent(query));
      console.log(`SOI: Opening URL ${url}`);
      if (this.settings.useIframe) {
        if (activeView) {
          activeView.frame.setAttr('src', url);
          activeView.url = url;
        } else {
          const leaf = this.app.workspace.getLeaf(!(this.app.workspace.activeLeaf.view.getViewType() === 'empty'));
          // const leaf = this.app.workspace.splitActiveLeaf(this.settings.splitDirection);
          const view = new SearchView(this, leaf, query, search.name, url);
          await leaf.open(view);
        }
      } else {
        await open(url);
      }
    }

    onunload() {
      console.log('unloading search-on-internet');
    }

    async loadSettings() {
      const loadedSettings = await this.loadData() as any;
      if (loadedSettings && loadedSettings.hasOwnProperty('searches')) {
        this.settings = loadedSettings;
      } else {
        this.settings = DEFAULT_SETTING;
      }
    }

    async saveSettings() {
      await this.saveData(this.settings);
    }
}


