# Minimal Mode Plugin

A comprehensive theming plugin for Elysium that demonstrates all available Theme Token APIs. Use this as a reference implementation when building your own plugins.

## Features

- **22 Configurable Settings** - Control every aspect of the UI
- **Real-time Preview** - Changes apply instantly as you adjust settings
- **State Preservation** - Saves and restores original settings when disabled
- **Developer Reference** - Fully documented code showing all API patterns

## Installation

1. Open Elysium → Settings → Plugins & Recipes
2. Browse the Community directory
3. Find "Minimal Mode" and click Install
4. The plugin enables automatically on first load

## Settings

Access settings via: Plugin Details → Settings tab

### Styling Tokens

| Setting | Type | Description |
|---------|------|-------------|
| Accent Color | Color | Primary color used throughout the app |
| Button Shape | Dropdown | Shape of floating button backgrounds (circle, roundedRect, square, none) |
| Card Shape | Dropdown | Shape of card containers |
| Chip Shape | Dropdown | Shape of status chips and tags |
| Button Backgrounds | Toggle | Show/hide backgrounds behind buttons |
| Card Backgrounds | Toggle | Show/hide card container backgrounds |
| Show Shadows | Toggle | Enable/disable shadow effects |
| Shadow Radius | Slider | Blur radius for shadows (0-20) |
| Background Opacity | Slider | Opacity of backgrounds (0-100%) |

### Layout Tokens

| Setting | Type | Description |
|---------|------|-------------|
| Sidebar Width | Slider | Width of the sidebar (200-400 points) |
| Button Size | Slider | Standard button size (30-60 points) |
| Icon Size | Slider | Standard icon size (16-32 points) |
| Corner Radius | Slider | Default corner radius (0-24 points) |
| Spacing | Slider | Standard spacing between elements (8-32 points) |
| Row Height | Slider | Height of list rows (40-80 points) |
| Hour Height | Slider | Height of calendar hour blocks (40-120 points) |

### Position Tokens

| Setting | Type | Description |
|---------|------|-------------|
| Quick Entry Position | Dropdown | bottomRight, topRight, sidebar, hidden |
| Floating Button Position | Dropdown | bottomRight, bottomLeft, topRight, hidden |
| Toolbar Position | Dropdown | top, bottom, hidden |

### Legacy APIs

| Setting | Type | Description |
|---------|------|-------------|
| Liquid Glass Effect | Toggle | Enable/disable glassmorphism effect |
| Monochrome Icons | Toggle | Render all icons in the accent color |
| Disable Glow Effects | Toggle | Turn off glow effects on focused elements |

## API Reference

### Theme Tokens

```javascript
// Set a token value
elysium.ui.setToken("accentColor", "#20a2a1")
elysium.ui.setToken("cornerRadius", 8)
elysium.ui.setToken("showShadows", false)

// Get a token value
var radius = elysium.ui.getToken("cornerRadius")

// Get all current tokens
var allTokens = elysium.ui.getAllTokens()
```

### Plugin Settings

Define settings in `manifest.json`:

```json
{
  "settingsSchema": {
    "settings": [
      {
        "id": "myColor",
        "type": "color",
        "label": "My Color",
        "description": "Choose a color",
        "default": "#007AFF"
      },
      {
        "id": "mySlider",
        "type": "slider",
        "label": "My Slider",
        "default": 50,
        "min": 0,
        "max": 100,
        "step": 5
      }
    ]
  }
}
```

Read settings in JavaScript:

```javascript
// Get a single setting
var color = elysium.settings.getPluginSetting("myColor")

// Listen for changes
elysium.events.on("settings.changed", function(data) {
  if (data.key.indexOf("plugin.YOUR_PLUGIN_ID.setting.") === 0) {
    // Refresh your plugin with new settings
  }
})
```

### Setting Types

| Type | Properties | Description |
|------|------------|-------------|
| `toggle` | - | Boolean on/off switch |
| `text` | `placeholder` | Text input field |
| `number` | `min`, `max` | Numeric input |
| `slider` | `min`, `max`, `step` | Slider control |
| `dropdown` | `options: [{value, label}]` | Selection menu |
| `color` | - | Color picker (returns hex string) |

### Monochrome Mode

```javascript
// Enable monochrome icons with a color
elysium.ui.setMonochromeMode(true, "#20a2a1")

// Disable monochrome mode
elysium.ui.setMonochromeMode(false)

// Get current settings
var settings = elysium.ui.getMonochromeModeSettings()
// Returns: { enabled: true, color: "#20a2a1" }
```

### Glow Effects

```javascript
// Enable glow effects
elysium.ui.setGlowEffects(true)

// Disable glow effects
elysium.ui.setGlowEffects(false)
```

### App Settings

```javascript
// Read an app setting
var enabled = elysium.settings.get("liquidGlassEnabled")

// Write an app setting (requires write:settings permission)
elysium.settings.set("liquidGlassEnabled", false)
```

### Plugin Storage

Persist plugin-specific data:

```javascript
// Save data
elysium.storage.set("myKey", "myValue")
elysium.storage.set("myObject", JSON.stringify({foo: "bar"}))

// Read data
var value = elysium.storage.get("myKey")
var obj = JSON.parse(elysium.storage.get("myObject"))
```

### Lifecycle Events

```javascript
elysium.events.on("onLoad", function() {
  // Plugin loaded - initialize here
})

elysium.events.on("onDisable", function() {
  // Plugin being disabled - cleanup here
})

elysium.events.on("onUnload", function() {
  // Plugin being unloaded - save state here
})
```

### Commands

Register commands users can invoke:

```javascript
elysium.commands.register({
  id: "myCommand",
  name: "Do Something",
  callback: function() {
    // Command logic
    return true // success
  }
})
```

## Best Practices

1. **Save Original State** - Before modifying tokens, save the original values so you can restore them when disabled

2. **Use Defaults** - Always provide fallback values when reading settings

3. **Listen for Changes** - Subscribe to `settings.changed` for real-time updates

4. **Cleanup on Disable** - Restore original state in `onDisable` handler

5. **Document Your Settings** - Use clear labels and descriptions in your schema

## License

MIT License
