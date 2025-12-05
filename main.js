/**
 * Minimal Mode Plugin for Elysium
 *
 * Provides an Obsidian-like aesthetic with:
 * - Monochrome icons (default: teal #20a2a1)
 * - Disabled liquid glass effects
 * - No glow effects
 * - No button backgrounds
 * - Sharp corners
 * - No shadows
 *
 * Uses the new Theme Token API for full control
 * Settings are configurable via the plugin Settings tab
 */

const DEFAULT_COLOR = "#20a2a1";
const DEFAULT_CORNER_RADIUS = 4;
const DEFAULT_SHOW_BUTTON_BACKGROUNDS = false;
const DEFAULT_BACKGROUND_OPACITY = 80;

const STORAGE_KEY_ACTIVE = "minimalMode.active";
const STORAGE_KEY_ORIGINAL_TOKENS = "minimalMode.originalTokens";
const STORAGE_KEY_ORIGINAL_SETTINGS = "minimalMode.originalSettings";

/**
 * Get settings from UI settings panel with fallback to defaults
 */
function getUISettings() {
  try {
    var color = elysium.settings.getPluginSetting("color");
    var cornerRadius = elysium.settings.getPluginSetting("cornerRadius");
    var showButtonBackgrounds = elysium.settings.getPluginSetting("showButtonBackgrounds");
    var backgroundOpacity = elysium.settings.getPluginSetting("backgroundOpacity");

    return {
      color: color || DEFAULT_COLOR,
      cornerRadius: cornerRadius !== undefined ? cornerRadius : DEFAULT_CORNER_RADIUS,
      showButtonBackgrounds: showButtonBackgrounds !== undefined ? showButtonBackgrounds : DEFAULT_SHOW_BUTTON_BACKGROUNDS,
      backgroundOpacity: backgroundOpacity !== undefined ? backgroundOpacity : DEFAULT_BACKGROUND_OPACITY
    };
  } catch (e) {
    console.log("[MinimalMode] Could not read UI settings, using defaults");
    return {
      color: DEFAULT_COLOR,
      cornerRadius: DEFAULT_CORNER_RADIUS,
      showButtonBackgrounds: DEFAULT_SHOW_BUTTON_BACKGROUNDS,
      backgroundOpacity: DEFAULT_BACKGROUND_OPACITY
    };
  }
}

/**
 * Get current plugin state
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
 * Save original tokens and settings before applying minimal mode
 */
function saveOriginalState() {
  try {
    // Save original tokens
    var tokens = elysium.ui.getAllTokens();
    elysium.storage.set(STORAGE_KEY_ORIGINAL_TOKENS, JSON.stringify(tokens));

    // Save original monochrome settings
    var monoSettings = elysium.ui.getMonochromeModeSettings();
    var liquidGlass = elysium.settings.get("liquidGlassEnabled");

    var original = {
      monochromeEnabled: monoSettings ? (monoSettings.enabled || false) : false,
      monochromeColor: monoSettings ? (monoSettings.color || DEFAULT_COLOR) : DEFAULT_COLOR,
      disableGlowEffects: monoSettings ? (monoSettings.disableGlowEffects || false) : false,
      liquidGlassEnabled: liquidGlass !== false
    };

    elysium.storage.set(STORAGE_KEY_ORIGINAL_SETTINGS, JSON.stringify(original));
    return true;
  } catch (error) {
    console.error("[MinimalMode] Failed to save original state: " + error);
    return false;
  }
}

/**
 * Get saved original state
 */
function getOriginalState() {
  var tokens = {};
  var settings = {
    monochromeEnabled: false,
    monochromeColor: DEFAULT_COLOR,
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
 * Apply minimal mode using settings from UI
 */
function applyMinimalMode() {
  try {
    // Get settings from UI settings panel
    var uiSettings = getUISettings();

    // === Styling Tokens ===

    // Set accent color from UI settings
    elysium.ui.setToken("accentColor", uiSettings.color);

    // Button backgrounds from UI settings
    elysium.ui.setToken("buttonShape", uiSettings.showButtonBackgrounds ? "circle" : "none");
    elysium.ui.setToken("buttonHasBackground", uiSettings.showButtonBackgrounds);

    // Corner radius from UI settings
    elysium.ui.setToken("cardShape", uiSettings.cornerRadius <= 2 ? "square" : "roundedRect");
    elysium.ui.setToken("cornerRadius", uiSettings.cornerRadius);

    // Minimal chips
    elysium.ui.setToken("chipShape", "roundedRect");

    // No shadows or glows
    elysium.ui.setToken("showShadows", false);

    // Background opacity from UI settings (convert from 0-100 to 0-1)
    elysium.ui.setToken("backgroundOpacity", uiSettings.backgroundOpacity / 100);

    // === Original Monochrome APIs ===

    // Disable liquid glass
    elysium.settings.set("liquidGlassEnabled", false);

    // Enable monochrome mode with color from UI settings
    elysium.ui.setMonochromeMode(true, uiSettings.color);

    // Disable glow effects
    elysium.ui.setGlowEffects(false);

    console.log("[MinimalMode] Applied with color: " + uiSettings.color + ", radius: " + uiSettings.cornerRadius);
    return true;
  } catch (error) {
    console.error("[MinimalMode] Failed to apply minimal mode: " + error);
    return false;
  }
}

/**
 * Restore original state
 */
function restoreOriginalState() {
  try {
    var original = getOriginalState();

    // Restore tokens
    var tokens = original.tokens;
    if (tokens.accentColor) elysium.ui.setToken("accentColor", tokens.accentColor);
    if (tokens.buttonShape) elysium.ui.setToken("buttonShape", tokens.buttonShape);
    if (tokens.buttonHasBackground !== undefined) elysium.ui.setToken("buttonHasBackground", tokens.buttonHasBackground);
    if (tokens.cardShape) elysium.ui.setToken("cardShape", tokens.cardShape);
    if (tokens.cornerRadius) elysium.ui.setToken("cornerRadius", tokens.cornerRadius);
    if (tokens.chipShape) elysium.ui.setToken("chipShape", tokens.chipShape);
    if (tokens.showShadows !== undefined) elysium.ui.setToken("showShadows", tokens.showShadows);
    if (tokens.backgroundOpacity) elysium.ui.setToken("backgroundOpacity", tokens.backgroundOpacity);

    // Restore original settings
    var settings = original.settings;
    elysium.settings.set("liquidGlassEnabled", settings.liquidGlassEnabled);
    elysium.ui.setMonochromeMode(settings.monochromeEnabled, settings.monochromeColor);
    elysium.ui.setGlowEffects(!settings.disableGlowEffects);

    console.log("[MinimalMode] Restored original settings");
    return true;
  } catch (error) {
    console.error("[MinimalMode] Failed to restore original state: " + error);
    return false;
  }
}

/**
 * Enable minimal mode
 */
function enableMinimalMode() {
  var state = getPluginState();

  if (!state.active) {
    saveOriginalState();
  }

  var success = applyMinimalMode();
  if (success) {
    elysium.storage.set(STORAGE_KEY_ACTIVE, true);
  }
  return success;
}

/**
 * Disable minimal mode
 */
function disableMinimalMode() {
  var success = restoreOriginalState();
  if (success) {
    elysium.storage.set(STORAGE_KEY_ACTIVE, false);
  }
  return success;
}

/**
 * Toggle minimal mode
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
 */
function refreshSettings() {
  var state = getPluginState();
  if (state.active) {
    applyMinimalMode();
    console.log("[MinimalMode] Settings refreshed");
  }
  return true;
}

// === Plugin Initialization ===

// Register commands
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
} catch (e) {
  console.error("[MinimalMode] Error registering commands: " + e);
}

// Register lifecycle event handlers
try {
  if (elysium.events && elysium.events.on) {
    elysium.events.on("onLoad", function() {
      var state = getPluginState();

      if (state.active) {
        // Re-apply minimal mode from previous session
        applyMinimalMode();
      } else {
        // First load - enable minimal mode by default
        enableMinimalMode();
      }
    });

    // Listen for settings changes to auto-refresh
    elysium.events.on("settings.changed", function(data) {
      if (data && data.key && data.key.indexOf("plugin.com.elysium.minimal-mode.setting.") === 0) {
        console.log("[MinimalMode] Settings changed, refreshing...");
        refreshSettings();
      }
    });

    elysium.events.on("onDisable", function() {
      var state = getPluginState();
      if (state.active) {
        restoreOriginalState();
      }
    });

    elysium.events.on("onUnload", function() {
      var state = getPluginState();
      if (state.active) {
        restoreOriginalState();
      }
    });
  } else {
    // Fallback: run initialization immediately
    var state = getPluginState();
    if (state.active) {
      applyMinimalMode();
    } else {
      enableMinimalMode();
    }
  }
} catch (e) {
  console.error("[MinimalMode] Error registering event handlers: " + e);
}

console.log("[MinimalMode] Plugin initialized");
