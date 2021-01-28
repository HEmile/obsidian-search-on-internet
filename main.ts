import {EventRef, MarkdownPreviewView, MarkdownView, Plugin, TFile} from 'obsidian';
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
          let query = null;
          const wSelection = window.getSelection();
          const docSelection = document?.getSelection();
          if (wSelection) {
            query = wSelection.toString();
          } else if (document && docSelection.type != 'Control') {
            query = docSelection.toString();
          }
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
      // this.registerCodeMirror((cm) => {
      //   // @ts-ignore
      //   cm.resetSelectionOnContextMenu=false;
      //   cm.on('contextmenu', (editor, event)=>{
      //     console.log(editor);
      //     console.log(event);
      //   });
      // });
    }

    async openSearch(search: SearchSetting, query: string) {
      const url = search.query.replace('{{title}}', encodeURIComponent(query));
      console.log(`SOI: Opening URL ${url}`);
      if (this.settings.useIframe) {
        const leaf = this.app.workspace.getLeaf(true);
        // const leaf = this.app.workspace.splitActiveLeaf(this.settings.splitDirection);
        const view = new SearchView(leaf, query, search.name, url);
        await leaf.open(view);
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


