/**
 * Minimal Mode Plugin for Elysium - v2.0.0
 *
 * A comprehensive theming plugin demonstrating ALL available Token APIs.
 * This serves as a developer example showing how to:
 * - Use styling tokens (colors, shapes, effects)
 * - Use layout tokens (sizes, spacing)
 * - Use position tokens (element placement)
 * - Use legacy monochrome APIs
 * - Save/restore original state
 * - Listen for settings changes
 *
 * Settings are configurable via the plugin Settings tab.
 */

// === Default Values ===
// These match the defaults in manifest.json settingsSchema

var DEFAULTS = {
  // Styling tokens
  accentColor: "#20a2a1",
  buttonShape: "none",
  cardShape: "roundedRect",
  chipShape: "roundedRect",
  buttonHasBackground: false,
  cardHasBackground: true,
  showShadows: false,
  shadowRadius: 4,
  backgroundOpacity: 80,

  // Layout tokens
  sidebarWidth: 280,
  buttonSize: 44,
  iconSize: 24,
  cornerRadius: 4,
  spacing: 16,
  rowHeight: 60,
  hourHeight: 60,

  // Position tokens
  quickEntryPosition: "bottomRight",
  floatingButtonPosition: "bottomRight",
  toolbarPosition: "top",

  // Legacy settings
  liquidGlassEnabled: false,
  monochromeEnabled: true,
  applyToCalendarBlocks: false,
  disableGlowEffects: true
};

// === Storage Keys ===
var STORAGE_KEY_ACTIVE = "minimalMode.active";
var STORAGE_KEY_ORIGINAL_TOKENS = "minimalMode.originalTokens";
var STORAGE_KEY_ORIGINAL_SETTINGS = "minimalMode.originalSettings";

/**
 * Get a setting value with fallback to default
 * @param {string} key - Setting key
 * @returns {*} Setting value or default
 */
function getSetting(key) {
  try {
    var value = elysium.settings.getPluginSetting(key);
    if (value !== undefined && value !== null) {
      return value;
    }
  } catch (e) {
    // Ignore errors
  }
  return DEFAULTS[key];
}

/**
 * Get all settings from UI settings panel with fallback to defaults
 * @returns {Object} All settings
 */
function getAllSettings() {
  return {
    // Styling tokens
    accentColor: getSetting("accentColor"),
    buttonShape: getSetting("buttonShape"),
    cardShape: getSetting("cardShape"),
    chipShape: getSetting("chipShape"),
    buttonHasBackground: getSetting("buttonHasBackground"),
    cardHasBackground: getSetting("cardHasBackground"),
    showShadows: getSetting("showShadows"),
    shadowRadius: getSetting("shadowRadius"),
    backgroundOpacity: getSetting("backgroundOpacity"),

    // Layout tokens
    sidebarWidth: getSetting("sidebarWidth"),
    buttonSize: getSetting("buttonSize"),
    iconSize: getSetting("iconSize"),
    cornerRadius: getSetting("cornerRadius"),
    spacing: getSetting("spacing"),
    rowHeight: getSetting("rowHeight"),
    hourHeight: getSetting("hourHeight"),

    // Position tokens
    quickEntryPosition: getSetting("quickEntryPosition"),
    floatingButtonPosition: getSetting("floatingButtonPosition"),
    toolbarPosition: getSetting("toolbarPosition"),

    // Legacy settings
    liquidGlassEnabled: getSetting("liquidGlassEnabled"),
    monochromeEnabled: getSetting("monochromeEnabled"),
    applyToCalendarBlocks: getSetting("applyToCalendarBlocks"),
    disableGlowEffects: getSetting("disableGlowEffects")
  };
}

/**
 * Get current plugin state
 * @returns {Object} Plugin state with active property
 */
function getPluginState() {
  try {
    var active = elysium.storage.get(STORAGE_KEY_ACTIVE);
    return {
      active: active === true || active === "true"
    };
  } catch (e) {
    return { active: false };
  }
}

/**
 * Save original tokens and settings before applying plugin settings
 * This allows restoration when the plugin is disabled
 */
function saveOriginalState() {
  try {
    // Save all original tokens using getAllTokens()
    var tokens = elysium.ui.getAllTokens();
    elysium.storage.set(STORAGE_KEY_ORIGINAL_TOKENS, JSON.stringify(tokens));

    // Save original monochrome/legacy settings
    var monoSettings = elysium.ui.getMonochromeModeSettings();
    var liquidGlass = elysium.settings.get("liquidGlassEnabled");

    var original = {
      monochromeEnabled: monoSettings ? (monoSettings.enabled || false) : false,
      monochromeColor: monoSettings ? (monoSettings.color || DEFAULTS.accentColor) : DEFAULTS.accentColor,
      applyToCalendar: monoSettings ? (monoSettings.applyToCalendar || false) : false,
      disableGlowEffects: monoSettings ? (monoSettings.disableGlowEffects || false) : false,
      liquidGlassEnabled: liquidGlass !== false
    };

    elysium.storage.set(STORAGE_KEY_ORIGINAL_SETTINGS, JSON.stringify(original));
    console.log("[MinimalMode] Saved original state");
    return true;
  } catch (error) {
    console.error("[MinimalMode] Failed to save original state: " + error);
    return false;
  }
}

/**
 * Get saved original state
 * @returns {Object} Original tokens and settings
 */
function getOriginalState() {
  var tokens = {};
  var settings = {
    monochromeEnabled: false,
    monochromeColor: DEFAULTS.accentColor,
    applyToCalendar: false,
    disableGlowEffects: false,
    liquidGlassEnabled: true
  };

  try {
    var savedTokens = elysium.storage.get(STORAGE_KEY_ORIGINAL_TOKENS);
    if (savedTokens) {
      tokens = JSON.parse(savedTokens);
    }

    var savedSettings = elysium.storage.get(STORAGE_KEY_ORIGINAL_SETTINGS);
    if (savedSettings) {
      settings = JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error("[MinimalMode] Failed to parse original state: " + error);
  }

  return { tokens: tokens, settings: settings };
}

/**
 * Apply all settings using the Token API
 * This demonstrates the full power of the theming system
 */
function applySettings() {
  try {
    var s = getAllSettings();

    // === STYLING TOKENS ===
    // These control visual appearance

    // Accent color - the primary color used throughout the app
    elysium.ui.setToken("accentColor", s.accentColor);

    // Button shape - controls floating button backgrounds
    // Options: "circle", "roundedRect", "square", "none"
    elysium.ui.setToken("buttonShape", s.buttonShape);

    // Card shape - controls card container shapes
    // Options: "roundedRect", "square", "none"
    elysium.ui.setToken("cardShape", s.cardShape);

    // Chip shape - controls status chip and tag shapes
    // Options: "capsule", "roundedRect", "square"
    elysium.ui.setToken("chipShape", s.chipShape);

    // Button backgrounds - whether buttons have visible backgrounds
    elysium.ui.setToken("buttonHasBackground", s.buttonHasBackground);

    // Card backgrounds - whether cards have visible backgrounds
    elysium.ui.setToken("cardHasBackground", s.cardHasBackground);

    // Shadows - enable/disable shadow effects
    elysium.ui.setToken("showShadows", s.showShadows);

    // Shadow radius - blur amount for shadows (when enabled)
    elysium.ui.setToken("shadowRadius", s.shadowRadius);

    // Background opacity - transparency of backgrounds (0-1 scale)
    elysium.ui.setToken("backgroundOpacity", s.backgroundOpacity / 100);

    // === LAYOUT TOKENS ===
    // These control sizes and spacing

    // Sidebar width in points
    elysium.ui.setToken("sidebarWidth", s.sidebarWidth);

    // Button size in points
    elysium.ui.setToken("buttonSize", s.buttonSize);

    // Icon size in points
    elysium.ui.setToken("iconSize", s.iconSize);

    // Corner radius for rounded elements
    elysium.ui.setToken("cornerRadius", s.cornerRadius);

    // Standard spacing between elements
    elysium.ui.setToken("spacing", s.spacing);

    // List row height
    elysium.ui.setToken("rowHeight", s.rowHeight);

    // Calendar hour block height
    elysium.ui.setToken("hourHeight", s.hourHeight);

    // === POSITION TOKENS ===
    // These control where elements appear

    // Quick entry button position
    // Options: "bottomRight", "topRight", "sidebar", "hidden"
    elysium.ui.setToken("quickEntryPosition", s.quickEntryPosition);

    // Floating action button position
    // Options: "bottomRight", "bottomLeft", "topRight", "hidden"
    elysium.ui.setToken("floatingButtonPosition", s.floatingButtonPosition);

    // Toolbar position
    // Options: "top", "bottom", "hidden"
    elysium.ui.setToken("toolbarPosition", s.toolbarPosition);

    // === LEGACY APIs ===
    // These are the original monochrome mode APIs

    // Liquid glass effect - the glassmorphism visual effect
    elysium.settings.set("liquidGlassEnabled", s.liquidGlassEnabled);

    // Monochrome mode - renders icons in a single color
    elysium.ui.setMonochromeMode(s.monochromeEnabled, s.accentColor);

    // Apply monochrome to calendar blocks (off by default to preserve user-set colors)
    elysium.ui.setMonochromeCalendar(s.applyToCalendarBlocks);

    // Glow effects - subtle glow around focused elements
    elysium.ui.setGlowEffects(!s.disableGlowEffects);

    console.log("[MinimalMode] Applied settings - accent: " + s.accentColor + ", corners: " + s.cornerRadius + ", calendarBlocks: " + s.applyToCalendarBlocks);
    return true;
  } catch (error) {
    console.error("[MinimalMode] Failed to apply settings: " + error);
    return false;
  }
}

/**
 * Restore original state when plugin is disabled
 */
function restoreOriginalState() {
  try {
    var original = getOriginalState();

    // Restore all tokens that were saved
    var tokens = original.tokens;
    var tokenKeys = [
      "accentColor", "buttonShape", "cardShape", "chipShape",
      "buttonHasBackground", "cardHasBackground", "showShadows",
      "shadowRadius", "backgroundOpacity", "sidebarWidth", "buttonSize",
      "iconSize", "cornerRadius", "spacing", "rowHeight", "hourHeight",
      "quickEntryPosition", "floatingButtonPosition", "toolbarPosition"
    ];

    for (var i = 0; i < tokenKeys.length; i++) {
      var key = tokenKeys[i];
      if (tokens[key] !== undefined) {
        elysium.ui.setToken(key, tokens[key]);
      }
    }

    // Restore original legacy settings
    var settings = original.settings;
    elysium.settings.set("liquidGlassEnabled", settings.liquidGlassEnabled);
    elysium.ui.setMonochromeMode(settings.monochromeEnabled, settings.monochromeColor);
    elysium.ui.setMonochromeCalendar(settings.applyToCalendar);
    elysium.ui.setGlowEffects(!settings.disableGlowEffects);

    console.log("[MinimalMode] Restored original settings");
    return true;
  } catch (error) {
    console.error("[MinimalMode] Failed to restore original state: " + error);
    return false;
  }
}

/**
 * Enable minimal mode - saves original state and applies settings
 */
function enableMinimalMode() {
  var state = getPluginState();

  if (!state.active) {
    saveOriginalState();
  }

  var success = applySettings();
  if (success) {
    elysium.storage.set(STORAGE_KEY_ACTIVE, true);
  }
  return success;
}

/**
 * Disable minimal mode - restores original state
 */
function disableMinimalMode() {
  var success = restoreOriginalState();
  if (success) {
    elysium.storage.set(STORAGE_KEY_ACTIVE, false);
  }
  return success;
}

/**
 * Toggle minimal mode on/off
 */
function toggleMinimalMode() {
  var state = getPluginState();
  if (state.active) {
    return disableMinimalMode();
  } else {
    return enableMinimalMode();
  }
}

/**
 * Refresh settings - re-apply with current UI settings
 * Called automatically when settings change in the UI
 */
function refreshSettings() {
  var state = getPluginState();
  if (state.active) {
    applySettings();
    console.log("[MinimalMode] Settings refreshed");
  }
  return true;
}

/**
 * Debug function to log all current token values
 * Useful for developers to see what's available
 */
function logAllTokens() {
  try {
    var tokens = elysium.ui.getAllTokens();
    console.log("[MinimalMode] Current tokens: " + JSON.stringify(tokens, null, 2));
  } catch (e) {
    console.error("[MinimalMode] Could not get tokens: " + e);
  }
}

// === Plugin Initialization ===

// Register commands that users can invoke
try {
  elysium.commands.register({
    id: "toggle",
    name: "Toggle Minimal Mode",
    callback: toggleMinimalMode
  });

  elysium.commands.register({
    id: "enable",
    name: "Enable Minimal Mode",
    callback: enableMinimalMode
  });

  elysium.commands.register({
    id: "disable",
    name: "Disable Minimal Mode",
    callback: disableMinimalMode
  });

  elysium.commands.register({
    id: "refresh",
    name: "Refresh Settings",
    callback: refreshSettings
  });

  elysium.commands.register({
    id: "debug",
    name: "Log All Tokens (Debug)",
    callback: logAllTokens
  });
} catch (e) {
  console.error("[MinimalMode] Error registering commands: " + e);
}

// Register lifecycle event handlers
try {
  if (elysium.events && elysium.events.on) {
    // onLoad - called when plugin is first loaded
    elysium.events.on("onLoad", function() {
      var state = getPluginState();

      if (state.active) {
        // Re-apply settings from previous session
        applySettings();
      } else {
        // First load - enable by default
        enableMinimalMode();
      }
    });

    // settings.changed - called when any plugin setting changes in the UI
    // This enables real-time preview of setting changes
    elysium.events.on("settings.changed", function(data) {
      if (data && data.key && data.key.indexOf("plugin.com.elysium.minimal-mode.setting.") === 0) {
        console.log("[MinimalMode] Setting changed: " + (data.settingId || "unknown"));
        refreshSettings();
      }
    });

    // onDisable - called when plugin is disabled by user
    elysium.events.on("onDisable", function() {
      var state = getPluginState();
      if (state.active) {
        restoreOriginalState();
      }
    });

    // onUnload - called when plugin is unloaded
    elysium.events.on("onUnload", function() {
      var state = getPluginState();
      if (state.active) {
        restoreOriginalState();
      }
    });
  } else {
    // Fallback: run initialization immediately if events not available
    var state = getPluginState();
    if (state.active) {
      applySettings();
    } else {
      enableMinimalMode();
    }
  }
} catch (e) {
  console.error("[MinimalMode] Error registering event handlers: " + e);
}

console.log("[MinimalMode] Plugin v2.0.0 initialized - demonstrating all Token APIs");
