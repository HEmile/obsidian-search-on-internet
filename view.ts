import {ItemView, WorkspaceLeaf} from 'obsidian';
import SearchOnInternetPlugin from './main';

export class SearchView extends ItemView {
    query: string;
    site: string;
    url: string;
    plugin: SearchOnInternetPlugin;

    frame: HTMLElement;

    constructor(plugin: SearchOnInternetPlugin, leaf: WorkspaceLeaf, query: string, site: string, url: string) {
      super(leaf);
      this.query= query;
      this.site = site;
      this.url = url;
      this.plugin = plugin;
    }

    async onOpen() {
      this.frame = document.createElement('iframe');
      this.frame.addClass(`soi-site`);
      this.frame.setAttr('style', 'height: 100%; width:100%');
      this.frame.setAttr('src', this.url);
      this.frame.setAttr('tabindex', '0');
      this.containerEl.children[1].appendChild(this.frame);


      // Turns out IFrames are very hard to control the contextmenu of. So leaving this for now!
      // this.frame.addEventListener('contextmenu', (e) => {
      //   console.log('asdf');
      //   this.plugin.handleContext(e, this);
      // });
    }

    getDisplayText(): string {
      return `${this.site}: ${this.query}`;
    }

    getViewType(): string {
      return 'Search on Internet';
    }
}
