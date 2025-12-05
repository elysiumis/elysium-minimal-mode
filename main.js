/**
 * Minimal Mode Plugin for Elysium
 *
 * Provides an Obsidian-like aesthetic with:
 * - Monochrome icons (default: teal #20a2a1)
 * - Disabled liquid glass effects
 * - No glow effects
 *
 * Commands:
 * - minimal-mode:toggle - Toggle minimal mode on/off
 * - minimal-mode:enable - Enable minimal mode
 * - minimal-mode:disable - Disable minimal mode
 * - minimal-mode:set-color - Set the monochrome icon color
 */

const DEFAULT_COLOR = "#20a2a1";
const STORAGE_KEY_ACTIVE = "minimalMode.active";
const STORAGE_KEY_COLOR = "minimalMode.color";
const STORAGE_KEY_ORIGINAL = "minimalMode.originalSettings";

/**
 * Get current settings from storage or defaults
 */
async function getPluginState() {
  const active = await elysium.storage.get(STORAGE_KEY_ACTIVE);
  const color = await elysium.storage.get(STORAGE_KEY_COLOR);
  return {
    active: active === true || active === "true",
    color: color || DEFAULT_COLOR
  };
}

/**
 * Save original settings before applying minimal mode
 */
async function saveOriginalSettings() {
  try {
    const currentSettings = await elysium.ui.getMonochromeModeSettings();
    const liquidGlass = await elysium.settings.get("liquidGlassEnabled");

    const original = {
      monochromeEnabled: currentSettings.enabled || false,
      monochromeColor: currentSettings.color || DEFAULT_COLOR,
      disableGlowEffects: currentSettings.disableGlowEffects || false,
      liquidGlassEnabled: liquidGlass !== false // default to true if not set
    };

    await elysium.storage.set(STORAGE_KEY_ORIGINAL, JSON.stringify(original));
    return original;
  } catch (error) {
    console.error("Failed to save original settings:", error);
    return null;
  }
}

/**
 * Get saved original settings
 */
async function getOriginalSettings() {
  try {
    const saved = await elysium.storage.get(STORAGE_KEY_ORIGINAL);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to parse original settings:", error);
  }
  // Default fallback
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
async function applyMinimalMode(color) {
  try {
    // Disable liquid glass
    await elysium.settings.set("liquidGlassEnabled", false);

    // Enable monochrome mode with specified color
    await elysium.ui.setMonochromeMode(true, color);

    // Disable glow effects
    await elysium.ui.setGlowEffects(false);

    console.log("Minimal mode applied with color:", color);
    return true;
  } catch (error) {
    console.error("Failed to apply minimal mode:", error);
    return false;
  }
}

/**
 * Restore original settings
 */
async function restoreOriginalSettings() {
  try {
    const original = await getOriginalSettings();

    // Restore liquid glass setting
    await elysium.settings.set("liquidGlassEnabled", original.liquidGlassEnabled);

    // Restore monochrome mode
    await elysium.ui.setMonochromeMode(original.monochromeEnabled, original.monochromeColor);

    // Restore glow effects
    await elysium.ui.setGlowEffects(!original.disableGlowEffects);

    console.log("Original settings restored");
    return true;
  } catch (error) {
    console.error("Failed to restore original settings:", error);
    return false;
  }
}

/**
 * Enable minimal mode
 */
async function enableMinimalMode() {
  const state = await getPluginState();

  if (!state.active) {
    // Save current settings before changing
    await saveOriginalSettings();
  }

  const success = await applyMinimalMode(state.color);
  if (success) {
    await elysium.storage.set(STORAGE_KEY_ACTIVE, true);
  }
  return success;
}

/**
 * Disable minimal mode
 */
async function disableMinimalMode() {
  const success = await restoreOriginalSettings();
  if (success) {
    await elysium.storage.set(STORAGE_KEY_ACTIVE, false);
  }
  return success;
}

/**
 * Toggle minimal mode
 */
async function toggleMinimalMode() {
  const state = await getPluginState();
  if (state.active) {
    return await disableMinimalMode();
  } else {
    return await enableMinimalMode();
  }
}

/**
 * Set the monochrome color
 */
async function setColor(newColor) {
  // Validate hex color format
  if (!/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
    console.error("Invalid color format. Use hex format like #20a2a1");
    return false;
  }

  await elysium.storage.set(STORAGE_KEY_COLOR, newColor);

  // If minimal mode is active, apply the new color immediately
  const state = await getPluginState();
  if (state.active) {
    await elysium.ui.setMonochromeMode(true, newColor);
  }

  console.log("Monochrome color set to:", newColor);
  return true;
}

// Plugin lifecycle
module.exports = {
  /**
   * Called when the plugin is loaded/enabled
   */
  async onload() {
    console.log("Minimal Mode plugin loaded");

    // Register commands
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
      callback: async (args) => {
        if (args && args.color) {
          return await setColor(args.color);
        }
        // Default to teal if no color specified
        return await setColor(DEFAULT_COLOR);
      }
    });

    // Check if minimal mode was active before and re-apply
    const state = await getPluginState();
    if (state.active) {
      console.log("Re-applying minimal mode from previous session");
      await applyMinimalMode(state.color);
    }
  },

  /**
   * Called when the plugin is disabled
   */
  async ondisable() {
    console.log("Minimal Mode plugin disabled");

    // Restore original settings when plugin is disabled
    const state = await getPluginState();
    if (state.active) {
      await restoreOriginalSettings();
    }
  },

  /**
   * Called when the plugin is unloaded
   */
  async onunload() {
    console.log("Minimal Mode plugin unloaded");

    // Restore original settings when plugin is unloaded
    const state = await getPluginState();
    if (state.active) {
      await restoreOriginalSettings();
    }
  },

  // Export functions for external access
  enableMinimalMode,
  disableMinimalMode,
  toggleMinimalMode,
  setColor,
  getPluginState
};
