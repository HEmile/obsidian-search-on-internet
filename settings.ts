import {App, PluginSettingTab, Setting} from 'obsidian';
import SearchOnInternetPlugin from './main';

export interface SearchSetting {
    tags: string[];
    query: string;
    name: string;
    encode: boolean;
}

export interface SOISettings {
    searches: SearchSetting[];
    useIframe: boolean;
}

export const DEFAULT_QUERY: SearchSetting = {
  tags: [],
  query: '{{query}}',
  name: '',
  encode: true,
};

export const DEFAULT_SETTING: SOISettings = {
  searches: [{
    tags: [] as string[],
    query: 'https://www.google.com/search?&q={{query}}',
    name: 'Google',
    encode: true,
  } as SearchSetting, {
    tags: [] as string[],
    query: 'https://en.wikipedia.org/wiki/Special:Search/{{query}}',
    name: 'Wikipedia',
    encode: true,
  } as SearchSetting],
  useIframe: true,
};

const parseTags = function(inputs: string): string[] {
  return inputs.split(',')
      .map((s) => s.trim())
      .filter((s) => /^#([A-Za-z])\w+$/.test(s));
};


export class SOISettingTab extends PluginSettingTab {
    plugin: SearchOnInternetPlugin;

    constructor(app: App, plugin: SearchOnInternetPlugin) {
      super(app, plugin);
      this.plugin = plugin;
    }

    display(): void {
      const {containerEl} = this;

      containerEl.empty();

      const plugin = this.plugin;

      new Setting(containerEl)
          .setName('Open in iframe')
          .setDesc('If set to true, this will open your searches in an iframe within Obsidian. ' +
                'Otherwise, it will open in your default browser.')
          .addToggle((toggle) => {
            toggle.setValue(this.plugin.settings.useIframe)
                .onChange((new_value) => {
                  this.plugin.settings.useIframe = new_value;
                  this.plugin.saveData(this.plugin.settings);
                });
          });

      // Code mostly taken from https://github.com/SilentVoid13/Templater/blob/master/src/settings.ts
      plugin.settings.searches.forEach((search) => {
        const div = containerEl.createEl('div');
        div.addClass('soi_div');

        new Setting(div)//
            .addExtraButton((extra) => {
              extra.setIcon('cross')
                  .setTooltip('Delete')
                  .onClick(() => {
                    const index = plugin.settings.searches.indexOf(search);

                    if (index > -1) {
                      plugin.settings.searches.splice(index, 1);
                      // Force refresh
                      this.display();
                    }
                  });
            })
            .addText((text) => {
              return text.setPlaceholder('Search name')
                  .setValue(search.name)
                  .onChange((newValue) => {
                    const index = plugin.settings.searches.indexOf(search);
                    if (index > -1) {
                      search.name = newValue;
                      plugin.saveSettings();
                      // title.textContent = newValue;
                    }
                  });
            }).setName('Name')
            .setDesc('Name of the search. Click the cross to delete the search.');

        new Setting(div)
            .setName('Encode')
            .setDesc('If set to true, this will encode raw text to be used in URLs. ' +
                  'Otherwise, it will not encode your query.')
            .addToggle((toggle) => {
              toggle.setValue(search.encode)
                  .onChange((newValue) => {
                    const index = plugin.settings.searches.indexOf(search);
                    if (index > -1) {
                      search.encode = newValue;
                      plugin.saveSettings();
                    }
                  });
            });
        new Setting(div)
            .addTextArea((text) => {
              const t = text.setPlaceholder('Search query')
                  .setValue(search.query)
                  .onChange((newQuery) => {
                    const index = plugin.settings.searches.indexOf(search);
                    if (index > -1) {
                      search.query = newQuery;
                      plugin.saveSettings();
                    }
                  });
              t.inputEl.setAttr('rows', 2);
              return t;//
            }).setName('URL')
            .setDesc('URL to open when executing the search. ' +
                'Use {{query}} to refer to the query, which is either the selected text, or the title of a note.');
        new Setting(div).addText((text) => {
          return text.setPlaceholder('')
              .setValue(search.tags.join(', '))
              .onChange((newValue) => {
                const index = plugin.settings.searches.indexOf(search);
                if (index > -1) {
                  search.tags = parseTags(newValue);
                  plugin.saveSettings();
                }
              });
        }).setName('Tags')
            .setDesc('Only add search to notes with these comma-separated tags. Leave empty to use all tags.');
      });

      const div = containerEl.createEl('div');
      div.addClass('soi_div2');

      const setting = new Setting(containerEl)
          .addButton((button) => {
            return button.setButtonText('Add Search').onClick(() => {
              plugin.settings.searches.push({
                name: '',
                query: '',
                tags: [],
                encode: true,
              } as SearchSetting);
              // Force refresh
              this.display();
            });
          });
      setting.infoEl.remove();

      div.appendChild(containerEl.lastChild);
    }
}
