# ep_font_color

Adds a font color picker to the Etherpad toolbar, with HTML export support.

## Install

```
pnpm run plugins i ep_font_color
```

## Settings

To reposition the color picker in the toolbar, add `fontColor` to your `settings.json` toolbar configuration:

```json
{
  "toolbar": {
    "left": [
      ["fontColor", "bold", "italic", "underline", "strikethrough"]
    ]
  }
}
```

## License

Apache-2.0
