## Search on Internet
Adds option to the file context menu to search the title of the note on external websites, like Google and Wikipedia. 

![](https://raw.githubusercontent.com/HEmile/obsidian-search-on-internet/master/resources/demo.gif)

You can also right-click on an internal link to perform search on that link:

![](https://raw.githubusercontent.com/HEmile/obsidian-search-on-internet/master/resources/internal_link.png)


### Settings
By default, the plugin comes with searches on Google and Wikipedia. 
You can add your own websites to search on in the settings. 

![](https://raw.githubusercontent.com/HEmile/obsidian-search-on-internet/master/resources/img.png)

For each website, fill in the following three fields:
- Name: The name of the search. This will be displayed in the context menu.
- URL: The URL to open. `{{title}}` will be replaced by the current notes title. This is used as the 'query'.
- Tags (optional): A list of tags to display the search option on. 
  In the example screenshot, this is used to only add the IMDB search on notes tagged with `#actor`, `#movie` or `#director` (in Dutch!)
  

### Credits
Settings code is mainly taken from the [Templater plugin](https://github.com/SilentVoid13/Templater) by [SilentVoid13](https://github.com/SilentVoid13)
