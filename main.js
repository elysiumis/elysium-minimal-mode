/**
 * Minimal Mode Plugin for Elysium
 *
 * Provides an Obsidian-like aesthetic with:
 * - Monochrome icons (default: teal #20a2a1)
 * - Disabled liquid glass effects
 * - No glow effects
 */

const DEFAULT_COLOR = "#20a2a1";
const STORAGE_KEY_ACTIVE = "minimalMode.active";
const STORAGE_KEY_COLOR = "minimalMode.color";
const STORAGE_KEY_ORIGINAL = "minimalMode.originalSettings";

// Debug helper
function debug(msg, data) {
  if (data !== undefined) {
    console.log("[MinimalMode] " + msg + " " + JSON.stringify(data));
  } else {
    console.log("[MinimalMode] " + msg);
  }
}

/**
 * Get current settings from storage or defaults
 */
function getPluginState() {
  debug("Getting plugin state...");
  try {
    const active = elysium.storage.get(STORAGE_KEY_ACTIVE);
    const color = elysium.storage.get(STORAGE_KEY_COLOR);
    debug("Storage values: active=" + active + ", color=" + color);
    return {
      active: active === true || active === "true",
      color: color || DEFAULT_COLOR
    };
  } catch (e) {
    debug("Error getting plugin state: " + e);
    return { active: false, color: DEFAULT_COLOR };
  }
}

/**
 * Save original settings before applying minimal mode
 */
function saveOriginalSettings() {
  debug("Saving original settings...");
  try {
    if (!elysium.ui) {
      debug("ERROR: elysium.ui is undefined!");
      return null;
    }
    if (!elysium.ui.getMonochromeModeSettings) {
      debug("ERROR: elysium.ui.getMonochromeModeSettings is undefined!");
      return null;
    }

    const currentSettings = elysium.ui.getMonochromeModeSettings();
    debug("Current monochrome settings: " + JSON.stringify(currentSettings));

    const liquidGlass = elysium.settings.get("liquidGlassEnabled");
    debug("Current liquidGlass setting: " + liquidGlass);

    const original = {
      monochromeEnabled: currentSettings ? (currentSettings.enabled || false) : false,
      monochromeColor: currentSettings ? (currentSettings.color || DEFAULT_COLOR) : DEFAULT_COLOR,
      disableGlowEffects: currentSettings ? (currentSettings.disableGlowEffects || false) : false,
      liquidGlassEnabled: liquidGlass !== false
    };

    elysium.storage.set(STORAGE_KEY_ORIGINAL, JSON.stringify(original));
    debug("Saved original settings: " + JSON.stringify(original));
    return original;
  } catch (error) {
    debug("Failed to save original settings: " + error);
    return null;
  }
}

/**
 * Get saved original settings
 */
function getOriginalSettings() {
  try {
    const saved = elysium.storage.get(STORAGE_KEY_ORIGINAL);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    debug("Failed to parse original settings: " + error);
  }
  return {
    monochromeEnabled: false,
    monochromeColor: DEFAULT_COLOR,
    disableGlowEffects: false,
    liquidGlassEnabled: true
  };
}

/**
 * Apply minimal mode settings
 */
function applyMinimalMode(color) {
  debug("Applying minimal mode with color: " + color);
  try {
    debug("Checking APIs...");
    debug("elysium.settings exists: " + (!!elysium.settings));
    debug("elysium.settings.set exists: " + (!!elysium.settings.set));
    debug("elysium.ui exists: " + (!!elysium.ui));
    debug("elysium.ui.setMonochromeMode exists: " + (!!elysium.ui.setMonochromeMode));
    debug("elysium.ui.setGlowEffects exists: " + (!!elysium.ui.setGlowEffects));

    // Disable liquid glass
    debug("Setting liquidGlassEnabled to false...");
    var result1 = elysium.settings.set("liquidGlassEnabled", false);
    debug("liquidGlassEnabled result: " + result1);

    // Enable monochrome mode with specified color
    debug("Setting monochrome mode...");
    var result2 = elysium.ui.setMonochromeMode(true, color);
    debug("setMonochromeMode result: " + result2);

    // Disable glow effects
    debug("Disabling glow effects...");
    var result3 = elysium.ui.setGlowEffects(false);
    debug("setGlowEffects result: " + result3);

    debug("Minimal mode applied successfully!");
    return true;
  } catch (error) {
    debug("Failed to apply minimal mode: " + error);
    return false;
  }
}

/**
 * Restore original settings
 */
function restoreOriginalSettings() {
  debug("Restoring original settings...");
  try {
    const original = getOriginalSettings();
    debug("Original settings to restore: " + JSON.stringify(original));

    elysium.settings.set("liquidGlassEnabled", original.liquidGlassEnabled);
    elysium.ui.setMonochromeMode(original.monochromeEnabled, original.monochromeColor);
    elysium.ui.setGlowEffects(!original.disableGlowEffects);

    debug("Original settings restored");
    return true;
  } catch (error) {
    debug("Failed to restore original settings: " + error);
    return false;
  }
}

/**
 * Enable minimal mode
 */
function enableMinimalMode() {
  debug("enableMinimalMode called");
  const state = getPluginState();

  if (!state.active) {
    saveOriginalSettings();
  }

  const success = applyMinimalMode(state.color);
  if (success) {
    elysium.storage.set(STORAGE_KEY_ACTIVE, true);
  }
  return success;
}

/**
 * Disable minimal mode
 */
function disableMinimalMode() {
  debug("disableMinimalMode called");
  const success = restoreOriginalSettings();
  if (success) {
    elysium.storage.set(STORAGE_KEY_ACTIVE, false);
  }
  return success;
}

/**
 * Toggle minimal mode
 */
function toggleMinimalMode() {
  debug("toggleMinimalMode called");
  const state = getPluginState();
  if (state.active) {
    return disableMinimalMode();
  } else {
    return enableMinimalMode();
  }
}

/**
 * Set the monochrome color
 */
function setColor(newColor) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
    debug("Invalid color format: " + newColor);
    return false;
  }

  elysium.storage.set(STORAGE_KEY_COLOR, newColor);

  const state = getPluginState();
  if (state.active) {
    elysium.ui.setMonochromeMode(true, newColor);
  }

  debug("Monochrome color set to: " + newColor);
  return true;
}

// Initialize plugin on load
debug("=== MINIMAL MODE PLUGIN INITIALIZING ===");

// Check what APIs are available
debug("typeof elysium: " + typeof elysium);
if (typeof elysium !== 'undefined') {
  debug("elysium.commands: " + (!!elysium.commands));
  debug("elysium.storage: " + (!!elysium.storage));
  debug("elysium.settings: " + (!!elysium.settings));
  debug("elysium.ui: " + (!!elysium.ui));
  debug("elysium.events: " + (!!elysium.events));

  if (elysium.ui) {
    debug("elysium.ui.setMonochromeMode: " + (!!elysium.ui.setMonochromeMode));
    debug("elysium.ui.setGlowEffects: " + (!!elysium.ui.setGlowEffects));
    debug("elysium.ui.getMonochromeModeSettings: " + (!!elysium.ui.getMonochromeModeSettings));
  }
} else {
  debug("ERROR: elysium is undefined!");
}

// Register commands
debug("Registering commands...");
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
    id: "set-color",
    name: "Set Monochrome Color",
    callback: function(args) {
      if (args && args.color) {
        return setColor(args.color);
      }
      return setColor(DEFAULT_COLOR);
    }
  });
  debug("Commands registered successfully");
} catch (e) {
  debug("Error registering commands: " + e);
}

// Register lifecycle event handlers
debug("Registering event handlers...");
try {
  if (elysium.events && elysium.events.on) {
    elysium.events.on("onLoad", function() {
      debug("=== onLoad EVENT FIRED ===");

      // Auto-enable on first load
      const state = getPluginState();
      debug("Current state: " + JSON.stringify(state));

      if (state.active) {
        debug("Re-applying minimal mode from previous session");
        applyMinimalMode(state.color);
      } else {
        debug("First load - enabling minimal mode");
        enableMinimalMode();
      }

      debug("=== onLoad COMPLETE ===");
    });

    elysium.events.on("onDisable", function() {
      debug("Plugin disabled");
      const state = getPluginState();
      if (state.active) {
        restoreOriginalSettings();
      }
    });

    elysium.events.on("onUnload", function() {
      debug("Plugin unloaded");
      const state = getPluginState();
      if (state.active) {
        restoreOriginalSettings();
      }
    });

    debug("Event handlers registered successfully");
  } else {
    debug("ERROR: elysium.events.on not available!");

    // Fallback: run initialization immediately
    debug("Running initialization immediately as fallback...");
    const state = getPluginState();
    if (state.active) {
      debug("Re-applying minimal mode from previous session");
      applyMinimalMode(state.color);
    } else {
      debug("First load - enabling minimal mode");
      enableMinimalMode();
    }
  }
} catch (e) {
  debug("Error registering event handlers: " + e);
}

debug("=== MINIMAL MODE PLUGIN INITIALIZATION COMPLETE ===");
