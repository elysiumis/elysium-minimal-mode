# Minimal Mode Plugin

A comprehensive theming plugin for Elysium that demonstrates all available Theme Token APIs, including the new **Hierarchical Token System** introduced in v3.0.0. Use this as a reference implementation when building your own plugins.

## What's New in v3.0.0

- **Hierarchical Tokens** - CSS-like cascading token system (`calendar.block.goal.backgroundColor`)
- **Per-Entity-Type Styling** - Different colors for goals, tasks, events, habits, appointments, reminders
- **Batch Token Updates** - Efficient `elysium.ui.tokens.setBatch()` for setting multiple tokens at once
- **Element Discovery** - Query customizable UI elements with `elysium.ui.elements.getAll()`
- **OpenTime Integration** - Export/import plugin settings with your data via hooks

## Features

- **28 Configurable Settings** - Control every aspect of the UI including per-entity colors
- **Real-time Preview** - Changes apply instantly as you adjust settings
- **State Preservation** - Saves and restores original settings when disabled
- **Developer Reference** - Fully documented code showing all API patterns
- **Backward Compatible** - Legacy `setToken()` API still works alongside new hierarchical system

## Installation

1. Open Elysium Settings Plugins & Recipes
2. Browse the Community directory
3. Find "Minimal Mode" and click Install
4. The plugin enables automatically on first load

## Settings

Access settings via: Plugin Details Settings tab

### Styling Tokens

| Setting | Type | Description |
|---------|------|-------------|
| Accent Color | Color | Primary color used throughout the app |
| Button Shape | Dropdown | Shape of button backgrounds (circle, roundedRect, square, none) |
| Card Shape | Dropdown | Shape of card containers |
| Chip Shape | Dropdown | Shape of status chips and tags |
| Button Backgrounds | Toggle | Show/hide backgrounds behind buttons |
| Card Backgrounds | Toggle | Show/hide card container backgrounds |
| Show Shadows | Toggle | Enable/disable shadow effects |
| Shadow Radius | Slider | Blur radius for shadows (0-20) |
| Background Opacity | Slider | Opacity of backgrounds (0-100%) |

### Per-Entity Calendar Colors (NEW in v3.0.0)

| Setting | Token Path | Default |
|---------|-----------|---------|
| Goal Block Color | `calendar.block.goal.backgroundColor` | #FF6B6B (coral) |
| Task Block Color | `calendar.block.task.backgroundColor` | #4ECDC4 (teal) |
| Event Block Color | `calendar.block.event.backgroundColor` | #45B7D1 (sky blue) |
| Habit Block Color | `calendar.block.habit.backgroundColor` | #96CEB4 (sage) |
| Appointment Block Color | `calendar.block.appointment.backgroundColor` | #DDA0DD (plum) |
| Reminder Block Color | `calendar.block.reminder.backgroundColor` | #F7DC6F (golden) |

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
| Apply to Calendar Blocks | Toggle | Also apply monochrome to calendar blocks |
| Disable Glow Effects | Toggle | Turn off glow effects on focused elements |

## API Reference

### Hierarchical Tokens (v3.0.0+)

The hierarchical token system uses CSS-like paths for granular UI control:

```
[component].[subComponent].[variant].[state].[property]
```

Examples:
- `calendar.block.goal.backgroundColor` - Goal blocks in calendar
- `calendar.block.task.hover.backgroundColor` - Task blocks on hover
- `sidebar.row.selected.textColor` - Selected sidebar row text
- `global.cornerRadius` - App-wide corner radius fallback

```javascript
// Set a single hierarchical token
elysium.ui.tokens.set("calendar.block.goal.backgroundColor", "#FF6B6B")

// Get a resolved token (with cascade fallback)
var color = elysium.ui.tokens.get("calendar.block.goal.backgroundColor")

// Set multiple tokens efficiently (RECOMMENDED)
elysium.ui.tokens.setBatch({
  "calendar.block.goal.backgroundColor": "#FF6B6B",
  "calendar.block.task.backgroundColor": "#4ECDC4",
  "calendar.block.event.backgroundColor": "#45B7D1",
  "global.cornerRadius": 12,
  "global.showShadows": true
})

// Query tokens matching a pattern
var calendarTokens = elysium.ui.tokens.query("calendar.block.*")

// Clear all tokens set by your plugin
elysium.ui.tokens.clear()
```

### Token Resolution (Cascade)

Tokens resolve from most specific to least specific:

```
calendar.block.goal.hover.backgroundColor  (exact match)
       |
       v  (if not found, drop state)
calendar.block.goal.backgroundColor
       |
       v  (if not found, drop variant)
calendar.block.backgroundColor
       |
       v  (if not found, use global)
global.backgroundColor
```

### Element Discovery

Discover what UI elements can be customized:

```javascript
// Get all customizable elements
var elements = elysium.ui.elements.getAll()

// Get elements for a specific component
var calendarElements = elysium.ui.elements.getForComponent("calendar")

// Get details about a specific element
var details = elysium.ui.elements.getDetails("calendar.block.goal")
// Returns: {
//   id: "calendar.block.goal",
//   displayName: "Goal Calendar Block",
//   availableProperties: ["backgroundColor", "textColor", "borderColor", ...],
//   availableStates: ["hover", "selected", "dragging"]
// }
```

### OpenTime Export/Import Hooks

Include your plugin's settings in OpenTime exports:

```javascript
// Register export hook - called when user exports data
elysium.opentime.registerExportHook({
  id: "my-plugin-settings",
  callback: function() {
    // Return data to include in export (or null to skip)
    return {
      version: "1.0.0",
      settings: elysium.storage.get("mySettings"),
      customData: { /* ... */ }
    }
  }
})

// Register import hook - called when user imports data
elysium.opentime.registerImportHook({
  id: "my-plugin-settings",
  callback: function(data) {
    // data contains what you returned from the export hook
    if (data && data.settings) {
      elysium.storage.set("mySettings", data.settings)
    }
  }
})
```

Exported data appears in the OpenTime document as:
```json
{
  "opentimeVersion": "0.2",
  "items": [...],
  "x_com_yourplugin": {
    "version": "1.0.0",
    "settings": { ... }
  }
}
```

### Legacy Theme Tokens

The original token API still works for backward compatibility:

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

// Also apply to calendar blocks
elysium.ui.setMonochromeCalendar(true)

// Disable monochrome mode
elysium.ui.setMonochromeMode(false)

// Get current settings
var settings = elysium.ui.getMonochromeModeSettings()
// Returns: { enabled: true, color: "#20a2a1", applyToCalendar: false }
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

## Debug Commands

This plugin includes debug commands to help developers explore the API:

- **Log All Tokens** - Outputs all legacy and hierarchical tokens to console
- **Log Customizable Elements** - Outputs all customizable UI elements

Access these from the plugin's command list or run programmatically.

## Best Practices

1. **Use Hierarchical Tokens** - Prefer `elysium.ui.tokens.setBatch()` over individual `setToken()` calls for better performance

2. **Save Original State** - Before modifying tokens, save the original values so you can restore them when disabled

3. **Use Defaults** - Always provide fallback values when reading settings

4. **Listen for Changes** - Subscribe to `settings.changed` for real-time updates

5. **Cleanup on Disable** - Restore original state and call `elysium.ui.tokens.clear()` in `onDisable` handler

6. **Use OpenTime Hooks** - Register export/import hooks so your plugin settings travel with user data

7. **Document Your Settings** - Use clear labels and descriptions in your schema, including the token path for color settings

## Token Path Reference

| Component | Sub-component | Variants | Properties |
|-----------|--------------|----------|------------|
| `calendar` | `block` | goal, task, event, habit, appointment, reminder, odyssey | backgroundColor, textColor, borderColor, cornerRadius, opacity |
| `calendar` | `header` | - | backgroundColor, textColor |
| `sidebar` | `row` | - | backgroundColor, textColor, height |
| `button` | - | primary, secondary | backgroundColor, textColor, shape, size |
| `card` | - | - | backgroundColor, borderColor, cornerRadius, shadowRadius |
| `global` | - | - | accentColor, backgroundColor, cornerRadius, spacing, showShadows |

States: `hover`, `pressed`, `selected`, `disabled`, `focused`, `dragging`

## License

MIT License
