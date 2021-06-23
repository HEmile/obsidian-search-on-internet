import {Editor, EventRef, MarkdownPreviewView, MarkdownView, Menu, MenuItem, Notice, Plugin, TFile} from 'obsidian';
import {SOISettingTab, SOISettings, DEFAULT_SETTING, SearchSetting, DEFAULT_QUERY} from './settings';
import open from 'open';
import {SearchModal} from './modal';
import {SearchView} from './view';


export default class SearchOnInternetPlugin extends Plugin {
    settings: SOISettings;
    onDom: any;
    onDomSettings: any;

    async onload() {
      console.log('loading search-on-internet');

      await this.loadSettings();

      this.addSettingTab(new SOISettingTab(this.app, this));
      const plugin = this;
      this.registerEvent(
          this.app.workspace.on('file-menu', (menu, file: TFile, source: string) => {
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

      // Preview mode
      this.onDom = function(event: MouseEvent) {
        const fileMenu = new Menu(plugin.app);
        // @ts-ignore
        fileMenu.dom.classList.add('soi-file-menu');
        // Functionality: Open external link in Iframe.
        let emptyMenu = true;
        if (event.target) {
          // @ts-ignore
          const classes: DOMTokenList = event.target.classList;
          // @ts-ignore
          if (classes.contains('cm-url') || classes.contains('external-link')) {
            // @ts-ignore
            const url = classes.contains('cm-url') ? event.target.textContent : event.target.href;

            fileMenu.addItem((item: MenuItem) => {
              item.setIcon('search').setTitle('Open in IFrame').onClick(() => {
                this.openSearch({
                  tags: [],
                  query: '{{query}}',
                  name: '',
                  encode: false,
                }, url, null);
              });
            });
            emptyMenu = false;
          }
        }
        emptyMenu = emptyMenu && !plugin.handleContext(fileMenu);
        if (!emptyMenu) {
          fileMenu.showAtPosition({x: event.x, y: event.y});
          event.preventDefault();
        }
      };
      this.onDomSettings = {};
      document.on('contextmenu', '.markdown-preview-view', this.onDom, this.onDomSettings);


      // Remove this ignore when the obsidian package is updated on npm
      // Editor mode
      // @ts-ignore
      this.registerEvent(this.app.workspace.on('editor-menu',
          (menu: Menu, editor: Editor, view: MarkdownView) => {
            this.handleContext(menu );
          }));
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

    handleContext(menu: Menu): boolean {
      const query = this.getSelectedText();
      const hasSelection = !(query === null || query.trim() === '');
      console.log(query);
      console.log(hasSelection);
      if (!hasSelection) {
        return false;
      }
      for (const searchsetting of this.settings.searches) {
        menu.addItem((item: MenuItem) => {
          item.setTitle('Search on ' + searchsetting.name)
              .setIcon('search')
              .onClick((evt: MouseEvent) => this.openSearch(searchsetting, query, null));
        });
      }
      return true;
    }

    async openSearch(search: SearchSetting, query: string, activeView: SearchView=null) {
      let encodedQuery = query;
      if (search.encode) {
        encodedQuery= encodeURIComponent(query);
      }
      const url = search.query.replace('{{title}}', encodedQuery)
          .replace('{{query}}', encodedQuery);
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
      document.off('contextmenu', '.markdown-preview-view', this.onDom, this.onDomSettings);
    }

    async loadSettings() {
      const loadedSettings = await this.loadData() as any;
      if (loadedSettings && loadedSettings.hasOwnProperty('searches')) {
        loadedSettings.searches = Array.from(
            loadedSettings.searches.map(
                (s: SearchSetting) => Object.assign({}, DEFAULT_QUERY, s)));
        this.settings = loadedSettings;
      } else {
        this.settings = DEFAULT_SETTING;
      }
    }

    async saveSettings() {
      await this.saveData(this.settings);
    }
}


