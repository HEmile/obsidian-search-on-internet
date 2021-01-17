import {EventRef, Plugin, TFile} from 'obsidian';
import {SOISettingTab, SOISettings, DEFAULT_SETTING} from './settings';
import open from 'open';


export default class SearchOnInternetPlugin extends Plugin {
    settings: SOISettings;
    fileMenuEvent: EventRef;

    async onload() {
      console.log('loading search-on-internet');

      await this.loadSettings();

      this.addSettingTab(new SOISettingTab(this.app, this));

      this.fileMenuEvent=this.app.workspace.on('file-menu', (menu, file: TFile) => {
        const fileTags = this.app.metadataCache.getFileCache(file)
            ?.tags.map((t) => t.tag);
        this.settings.searches.forEach((search) => {
          if (fileTags === null || search.tags.length === 0 ||
              fileTags.some((t) => search.tags.contains(t))) {
            menu.addItem((item) => {
              item.setTitle(`Search ${search.name}`).setIcon('search')
                  .onClick((evt) => {
                    const url = search.query.replace('{{title}}', encodeURIComponent(file.basename));
                    console.log(`SOI: Opening URL ${url}`);
                    open(url);
                  });
            });
          }
        });
      });
    }

    onunload() {
      console.log('unloading search-on-internet');
      this.app.workspace.offref(this.fileMenuEvent);
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

// class SampleModal extends Modal {
//   constructor(app: App) {
//     super(app);
//   }
//
//   onOpen() {
//     const {contentEl} = this;
//     contentEl.setText('Woah!');
//   }
//
//   onClose() {
//     const {contentEl} = this;
//     contentEl.empty();
//   }
// }
//
