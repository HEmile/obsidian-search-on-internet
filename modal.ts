import {App, FuzzyMatch, FuzzySuggestModal, Modal} from 'obsidian';
import {SearchSetting} from './settings';
import SearchOnInternetPlugin from './main';


export class SearchModal extends FuzzySuggestModal<SearchSetting> {
  plugin: SearchOnInternetPlugin;
  query: string;
  constructor(app: App, plugin: SearchOnInternetPlugin, query: string) {
    super(app);
    this.plugin = plugin;
    this.setPlaceholder('');
    this.query = query;
    '${this.query}';
    this.setInstructions([{command: '↑↓', purpose: 'to navigate'},
      {command: '↵', purpose: `to search ${this.query}`},
      {command: 'esc', purpose: 'to dismiss'}]);
  }

  onOpen() {
    super.onOpen();
    // const {contentEl} = this;
    this.inputEl.focus();
  }

  onClose() {
    super.onClose();
    const {contentEl} = this;
    contentEl.empty();
  }


  getItemText(item: SearchSetting): string {
    return item.name;
  }

  renderSuggestion(item: FuzzyMatch<SearchSetting>, el: HTMLElement) {
    super.renderSuggestion(item, el);
    el.innerHTML = `Search on: ` + el.innerHTML;
  }

  getItems(): SearchSetting[] {
    return this.plugin.settings.searches;
  }

  onChooseItem(item: SearchSetting, evt: MouseEvent | KeyboardEvent): void {
    this.plugin.openSearch(item, this.query);
  }
}
