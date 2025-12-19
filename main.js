/**
 * Minimal Mode Plugin for Elysium - v3.0.0
 *
 * A comprehensive theming plugin demonstrating ALL available Token APIs.
 * This serves as a developer example showing how to:
 *
 * NEW in v3.0.0 - Hierarchical Token System:
 * - Use elysium.ui.tokens.setBatch() for efficient batch updates
 * - Use hierarchical paths like "calendar.block.goal.backgroundColor"
 * - Set per-entity-type styling (different colors for goals vs tasks)
 * - Use elysium.ui.elements.getAll() to discover customizable elements
 * - Use OpenTime export/import hooks for data portability
 *
 * Legacy (still supported):
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
  disableGlowEffects: true,

  // NEW: Per-entity calendar block colors (hierarchical tokens)
  // These demonstrate the new hierarchical token system
  goalBlockColor: "#FF6B6B",      // Coral red for goals
  taskBlockColor: "#4ECDC4",      // Teal for tasks
  eventBlockColor: "#45B7D1",     // Sky blue for events
  habitBlockColor: "#96CEB4",     // Sage green for habits
  appointmentBlockColor: "#DDA0DD", // Plum for appointments
  reminderBlockColor: "#F7DC6F"   // Golden for reminders
};

// === Storage Keys ===
var STORAGE_KEY_ACTIVE = "minimalMode.active";
var STORAGE_KEY_ORIGINAL_TOKENS = "minimalMode.originalTokens";
var STORAGE_KEY_ORIGINAL_SETTINGS = "minimalMode.originalSettings";
var STORAGE_KEY_ORIGINAL_HIERARCHICAL = "minimalMode.originalHierarchical";

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
    disableGlowEffects: getSetting("disableGlowEffects"),

    // Per-entity calendar block colors
    goalBlockColor: getSetting("goalBlockColor"),
    taskBlockColor: getSetting("taskBlockColor"),
    eventBlockColor: getSetting("eventBlockColor"),
    habitBlockColor: getSetting("habitBlockColor"),
    appointmentBlockColor: getSetting("appointmentBlockColor"),
    reminderBlockColor: getSetting("reminderBlockColor")
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

    // NEW: Save original hierarchical tokens
    // Query for any existing calendar block tokens
    try {
      var hierarchicalTokens = elysium.ui.tokens.query("calendar.block.*");
      elysium.storage.set(STORAGE_KEY_ORIGINAL_HIERARCHICAL, JSON.stringify(hierarchicalTokens || {}));
    } catch (e) {
      // Hierarchical tokens API might not be available - that's ok
      elysium.storage.set(STORAGE_KEY_ORIGINAL_HIERARCHICAL, "{}");
    }

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
  var hierarchical = {};

  try {
    var savedTokens = elysium.storage.get(STORAGE_KEY_ORIGINAL_TOKENS);
    if (savedTokens) {
      tokens = JSON.parse(savedTokens);
    }

    var savedSettings = elysium.storage.get(STORAGE_KEY_ORIGINAL_SETTINGS);
    if (savedSettings) {
      settings = JSON.parse(savedSettings);
    }

    var savedHierarchical = elysium.storage.get(STORAGE_KEY_ORIGINAL_HIERARCHICAL);
    if (savedHierarchical) {
      hierarchical = JSON.parse(savedHierarchical);
    }
  } catch (error) {
    console.error("[MinimalMode] Failed to parse original state: " + error);
  }

  return { tokens: tokens, settings: settings, hierarchical: hierarchical };
}

/**
 * Apply all settings using the Token API
 * This demonstrates the full power of the theming system
 *
 * NEW in v3.0.0: Uses hierarchical tokens for per-entity styling
 */
function applySettings() {
  try {
    var s = getAllSettings();

    // === HIERARCHICAL TOKENS (NEW in v3.0.0) ===
    // Use setBatch for efficient updates - this is the recommended approach
    // for setting multiple tokens at once

    // Per-entity-type calendar block colors
    // These use the hierarchical path format: component.subComponent.variant.property
    var hierarchicalTokens = {};

    // Only set entity-specific colors if NOT using monochrome calendar mode
    if (!s.applyToCalendarBlocks) {
      hierarchicalTokens = {
        // Calendar block colors per entity type
        "calendar.block.goal.backgroundColor": s.goalBlockColor,
        "calendar.block.task.backgroundColor": s.taskBlockColor,
        "calendar.block.event.backgroundColor": s.eventBlockColor,
        "calendar.block.habit.backgroundColor": s.habitBlockColor,
        "calendar.block.appointment.backgroundColor": s.appointmentBlockColor,
        "calendar.block.reminder.backgroundColor": s.reminderBlockColor,

        // Global corner radius (applies as fallback)
        "global.cornerRadius": s.cornerRadius,

        // Global shadow settings
        "global.showShadows": s.showShadows,
        "global.shadowRadius": s.shadowRadius
      };
    }

    // Apply hierarchical tokens using the new batch API
    try {
      if (elysium.ui.tokens && elysium.ui.tokens.setBatch) {
        elysium.ui.tokens.setBatch(hierarchicalTokens);
        console.log("[MinimalMode] Applied " + Object.keys(hierarchicalTokens).length + " hierarchical tokens");
      }
    } catch (e) {
      console.log("[MinimalMode] Hierarchical tokens API not available, using legacy API");
    }

    // === LEGACY TOKENS ===
    // These still work and are useful for non-hierarchical settings

    // Styling tokens
    elysium.ui.setToken("accentColor", s.accentColor);
    elysium.ui.setToken("buttonShape", s.buttonShape);
    elysium.ui.setToken("cardShape", s.cardShape);
    elysium.ui.setToken("chipShape", s.chipShape);
    elysium.ui.setToken("buttonHasBackground", s.buttonHasBackground);
    elysium.ui.setToken("cardHasBackground", s.cardHasBackground);
    elysium.ui.setToken("showShadows", s.showShadows);
    elysium.ui.setToken("shadowRadius", s.shadowRadius);
    elysium.ui.setToken("backgroundOpacity", s.backgroundOpacity / 100);

    // Layout tokens
    elysium.ui.setToken("sidebarWidth", s.sidebarWidth);
    elysium.ui.setToken("buttonSize", s.buttonSize);
    elysium.ui.setToken("iconSize", s.iconSize);
    elysium.ui.setToken("cornerRadius", s.cornerRadius);
    elysium.ui.setToken("spacing", s.spacing);
    elysium.ui.setToken("rowHeight", s.rowHeight);
    elysium.ui.setToken("hourHeight", s.hourHeight);

    // Position tokens
    elysium.ui.setToken("quickEntryPosition", s.quickEntryPosition);
    elysium.ui.setToken("floatingButtonPosition", s.floatingButtonPosition);
    elysium.ui.setToken("toolbarPosition", s.toolbarPosition);

    // === LEGACY APIs ===
    elysium.settings.set("liquidGlassEnabled", s.liquidGlassEnabled);
    elysium.ui.setMonochromeMode(s.monochromeEnabled, s.accentColor);
    elysium.ui.setMonochromeCalendar(s.applyToCalendarBlocks);
    elysium.ui.setGlowEffects(!s.disableGlowEffects);

    console.log("[MinimalMode] Applied settings - accent: " + s.accentColor + ", corners: " + s.cornerRadius);
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

    // Clear hierarchical tokens set by this plugin
    try {
      if (elysium.ui.tokens && elysium.ui.tokens.clear) {
        elysium.ui.tokens.clear();
        console.log("[MinimalMode] Cleared hierarchical tokens");
      }
    } catch (e) {
      // Hierarchical API not available
    }

    // Restore all legacy tokens that were saved
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
 * NEW: Debug function to log all customizable elements
 * Demonstrates the element discovery API
 */
function logCustomizableElements() {
  try {
    if (elysium.ui.elements && elysium.ui.elements.getAll) {
      var elements = elysium.ui.elements.getAll();
      console.log("[MinimalMode] Customizable elements:");
      console.log(JSON.stringify(elements, null, 2));

      // Also show just for calendar component
      var calendarElements = elysium.ui.elements.getForComponent("calendar");
      console.log("[MinimalMode] Calendar elements:");
      console.log(JSON.stringify(calendarElements, null, 2));
    } else {
      console.log("[MinimalMode] Element discovery API not available");
    }
  } catch (e) {
    console.error("[MinimalMode] Could not get elements: " + e);
  }
}

/**
 * Debug function to log all current token values
 * Useful for developers to see what's available
 */
function logAllTokens() {
  try {
    // Legacy tokens
    var tokens = elysium.ui.getAllTokens();
    console.log("[MinimalMode] Legacy tokens:");
    console.log(JSON.stringify(tokens, null, 2));

    // Hierarchical tokens
    try {
      if (elysium.ui.tokens && elysium.ui.tokens.query) {
        var hierarchical = elysium.ui.tokens.query("*");
        console.log("[MinimalMode] Hierarchical tokens:");
        console.log(JSON.stringify(hierarchical, null, 2));
      }
    } catch (e) {
      console.log("[MinimalMode] Hierarchical tokens query not available");
    }
  } catch (e) {
    console.error("[MinimalMode] Could not get tokens: " + e);
  }
}

// === OpenTime Export/Import Hooks (NEW in v3.0.0) ===
// This demonstrates how plugins can include their data in OpenTime exports

try {
  if (elysium.opentime && elysium.opentime.registerExportHook) {
    // Register export hook - adds plugin settings to OpenTime exports
    elysium.opentime.registerExportHook({
      id: "minimal-mode-settings",
      callback: function() {
        // Return plugin settings to be included in export
        var state = getPluginState();
        if (!state.active) {
          return null; // Don't export if plugin is not active
        }

        return {
          version: "3.0.0",
          active: true,
          settings: getAllSettings()
        };
      }
    });

    // Register import hook - restores plugin settings from OpenTime imports
    elysium.opentime.registerImportHook({
      id: "minimal-mode-settings",
      callback: function(data) {
        if (data && data.active && data.settings) {
          console.log("[MinimalMode] Restoring settings from OpenTime import");
          // Could restore settings here if needed
          // For now, just log that data was received
          console.log("[MinimalMode] Import data version: " + data.version);
        }
      }
    });

    console.log("[MinimalMode] Registered OpenTime hooks");
  }
} catch (e) {
  console.log("[MinimalMode] OpenTime hooks not available: " + e);
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
    id: "debug-tokens",
    name: "Log All Tokens (Debug)",
    callback: logAllTokens
  });

  elysium.commands.register({
    id: "debug-elements",
    name: "Log Customizable Elements (Debug)",
    callback: logCustomizableElements
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

console.log("[MinimalMode] Plugin v3.0.0 initialized - demonstrating Hierarchical Token APIs");
