import {ItemView, WorkspaceLeaf} from 'obsidian';

export class SearchView extends ItemView {
    query: string;
    site: string;
    url: string;

    constructor(leaf: WorkspaceLeaf, query: string, site: string, url: string) {
      super(leaf);
      this.query= query;
      this.site = site;
      this.url = url;
    }

    async onOpen() {
      const frame = document.createElement('iframe');
      frame.addClass(`soi-site`);
      frame.setAttr('style', 'height: 100%; width:100%');
      frame.setAttr('src', this.url);
      frame.setAttr('tabindex', '0');
      this.containerEl.children[1].appendChild(frame);
    }

    getDisplayText(): string {
      return `${this.site}: ${this.query}`;
    }

    getViewType(): string {
      return 'Search on Internet';
    }
}
