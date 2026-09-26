/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * extension.js - Entry point for the Force Quit Shortcut GNOME Shell extension.
 */

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { ForceQuitService } from './src/forceQuitService.js';

export default class ForceQuitShortcutExtension extends Extension {
    enable() {
	this._forceQuitService = new ForceQuitService();
	this._settings = this.getSettings('org.gnome.shell.extensions.forcequitshortcut');

	// Register the keyboard shortcut.
	this._bindShortcut();

	// Rebind the shortcut whenever the user changes it in the preferences.
	this._settingsChangedId = this._settings.connect('changed::shortcut-key', () => {
            this._bindShortcut();
        });

	// Handle background autostart.
	if (this._settings.get_boolean('autostart')) {
            const delayMs = this._settings.get_int('autostart-delay') * 1000;
            this._autostartTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, delayMs, () => {
                this._autostartTimeout = null;
                // Re-check: the user may have turned autostart off during the delay.
                if (this._settings.get_boolean('autostart')) {
                    this._openForceQuitWindow(true); // Start with the window hidden.
                }
                return GLib.SOURCE_REMOVE;
            });
	}
    }

    _bindShortcut() {
        // Remove the existing keybinding, if any.
        Main.wm.removeKeybinding('shortcut-key');
        
        // Register the current keybinding.
        Main.wm.addKeybinding(
            'shortcut-key',
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this._openForceQuitWindow(false) // Open the window normally.
        );
    }

    _openForceQuitWindow(hidden = false) {
        const windowScriptPath = GLib.build_filenamev([this.path, 'app', 'forceQuitWindow.js']);

        // Resolve the gjs binary explicitly instead of relying on PATH, and
        // fail loudly (instead of silently doing nothing) if it's missing.
        const gjsPath = GLib.find_program_in_path('gjs');
        if (!gjsPath) {
            console.error('Force Quit Shortcut: could not find the "gjs" executable in PATH.');
            Main.notifyError(
                this.gettext('Force Quit'),
                this.gettext('Could not find the "gjs" executable needed to open the Force Quit window.')
            );
            return;
        }

        try {
            const args = [gjsPath, '-m', windowScriptPath];
            if (hidden) {
                args.push('--hidden');
            }
            Gio.Subprocess.new(args, Gio.SubprocessFlags.NONE);
        } catch (e) {
            console.error('Failed to launch Force Quit window:', e);
            Main.notifyError(
                this.gettext('Force Quit'),
                this.gettext('Failed to launch the Force Quit window.')
            );
        }
    }

    disable() {
        Main.wm.removeKeybinding('shortcut-key');

        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }

        if (this._autostartTimeout) {
            GLib.Source.remove(this._autostartTimeout);
            this._autostartTimeout = null;
        }

        if (this._forceQuitService) {
            this._forceQuitService.destroy();
            this._forceQuitService = null;
        }

        this._settings = null;
    }
}
