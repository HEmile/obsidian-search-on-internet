import {Plugin} from 'obsidian';
import {SOISettingTab, SOISettings, DEFAULT_SETTING} from './settings';


export default class SearchOnInternetPlugin extends Plugin {
    settings: SOISettings;

    async onload() {
      console.log('loading search-on-internet');

      await this.loadSettings();

      this.addSettingTab(new SOISettingTab(this.app, this));
    }

    onunload() {
      console.log('unloading plugin');
    }

    async loadSettings() {
      this.settings = Object.assign(DEFAULT_SETTING, await this.loadData());
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
