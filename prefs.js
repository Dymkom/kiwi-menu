/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * prefs.js - Implements the preferences UI for the Force Quit Shortcut extension.
 */

import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ForceQuitShortcutPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Retrieve the extension settings.
        const settings = this.getSettings('org.gnome.shell.extensions.forcequitshortcut');
        const page = new Adw.PreferencesPage();
        window.add(page);

        // Behavior
        const bgGroup = new Adw.PreferencesGroup({ 
            title: _('Behavior')
        });
        page.add(bgGroup);

        const autostartRow = new Adw.SwitchRow({
            title: _('Start in background at login'),
            subtitle: _('Reduces rendering delay on cold start'),
        });
        settings.bind('autostart', autostartRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        bgGroup.add(autostartRow);

        const delayRow = new Adw.SpinRow({
            title: _('Delay time'),
            subtitle: _('Seconds after login'),
            adjustment: new Gtk.Adjustment({ lower: 0, upper: 120, step_increment: 1 })
        });
        settings.bind('autostart-delay', delayRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('autostart', delayRow, 'sensitive', Gio.SettingsBindFlags.DEFAULT);
        bgGroup.add(delayRow);

        // Keyboard Shortcuts
        const shortcutGroup = new Adw.PreferencesGroup({ title: _('Keyboard Shortcuts') });
        page.add(shortcutGroup);

        // 1. Main shortcut row.
        const shortcutRow = new Adw.ActionRow({ 
            title: _('Show window'),
            subtitle: _('Click to set a new shortcut'),
            activatable: true 
        });
        shortcutGroup.add(shortcutRow);

        const shortcutLabel = new Gtk.Label({
            css_classes: ['dim-label'],
            valign: Gtk.Align.CENTER
        });

        const defaultShortcut = '<Alt><Super>Escape';

        // Restore default shortcut button.
        const restoreBtn = new Gtk.Button({
            has_frame: false,
            icon_name: 'edit-undo-symbolic',
            tooltip_text: _('Restore Default'),
            valign: Gtk.Align.CENTER,
        });
        restoreBtn.add_css_class('circular');

        // Pack the shortcut label and restore button.
        const controlsBox = new Gtk.Box({ spacing: 8, orientation: Gtk.Orientation.HORIZONTAL });
        controlsBox.append(shortcutLabel);
        controlsBox.append(restoreBtn);
        shortcutRow.add_suffix(controlsBox);

        // 2. Navigation shortcut reference.
        const killRow = new Adw.ActionRow({ title: _('Close process') });
        const killLabel = new Gtk.Label({ label: 'Q / Delete', valign: Gtk.Align.CENTER });
        killLabel.add_css_class('dim-label');
        killRow.add_suffix(killLabel);
        shortcutGroup.add(killRow);

        const upRow = new Adw.ActionRow({ title: _('Move up in list') });
        const upLabel = new Gtk.Label({ label: 'W / A / ↑', valign: Gtk.Align.CENTER });
        upLabel.add_css_class('dim-label');
        upRow.add_suffix(upLabel);
        shortcutGroup.add(upRow);

        const downRow = new Adw.ActionRow({ title: _('Move down in list') });
        const downLabel = new Gtk.Label({ label: 'S / D / ↓', valign: Gtk.Align.CENTER });
        downLabel.add_css_class('dim-label');
        downRow.add_suffix(downLabel);
        shortcutGroup.add(downRow);

        // Update the shortcut UI
        const updateShortcutUI = () => {
            const bindings = settings.get_strv('shortcut-key');
            const currentVal = bindings.length > 0 ? bindings[0] : '';

            if (!currentVal) {
                shortcutLabel.label = _('Disabled');
                restoreBtn.visible = true;
                return;
            }

            const [ok, keyval, mods] = Gtk.accelerator_parse(currentVal);
            
            shortcutLabel.label = ok ? Gtk.accelerator_get_label(keyval, mods) : currentVal;

            const [defOk, defKey, defMods] = Gtk.accelerator_parse(defaultShortcut);

            // Check whether the current shortcut matches the default.
            const isDefault = ok && defOk && keyval === defKey && mods === defMods;
            restoreBtn.visible = !isDefault; // Show the restore button only when the shortcut differs from the default.
        };
        updateShortcutUI(); // Initialize the UI.

        restoreBtn.connect('clicked', () => {
            settings.set_strv('shortcut-key', [defaultShortcut]);
            updateShortcutUI();
        });

        // Tracks whether shortcut recording is active.
        let isRecording = false;

        // Update the visual recording state.
        const setRecordingState = (recording) => {
            isRecording = recording;
            if (recording) {
                shortcutRow.subtitle = _('Press shortcut... (Esc to cancel)');
                shortcutRow.add_css_class('error');
            } else {
                shortcutRow.subtitle = _('Click to change keyboard shortcut');
                shortcutRow.remove_css_class('error');
            }
        };

        // 4: Clicking anywhere on the row starts or stops shortcut recording.
        shortcutRow.connect('activated', () => {
            setRecordingState(!isRecording);
        });

        const keyController = new Gtk.EventControllerKey();
        // Capture key events before GTK uses them for navigation.
        keyController.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);
        window.add_controller(keyController);

        keyController.connect('key-pressed', (ctrl, keyval, keycode, state) => {
            if (!isRecording) return false;

            // Get the actual modifier state while ignoring Caps Lock.
            let mask = state & Gtk.accelerator_get_default_mod_mask();
            mask &= ~Gdk.ModifierType.LOCK_MASK;

            const isModifier = (
                keyval === Gdk.KEY_Alt_L || keyval === Gdk.KEY_Alt_R ||
                keyval === Gdk.KEY_Control_L || keyval === Gdk.KEY_Control_R ||
                keyval === Gdk.KEY_Shift_L || keyval === Gdk.KEY_Shift_R ||
                keyval === Gdk.KEY_Super_L || keyval === Gdk.KEY_Super_R ||
                keyval === Gdk.KEY_Meta_L || keyval === Gdk.KEY_Meta_R
            );

            if (isModifier) {
                return true; 
            }

            // Esc without modifiers cancels shortcut recording.
            if (keyval === Gdk.KEY_Escape && mask === 0) {
                setRecordingState(false);
                return true;
            }

            // Save the shortcut if it is valid (e.g. Super+Alt+Esc).
            if (Gtk.accelerator_valid(keyval, mask)) {
                let accelStr = Gtk.accelerator_name(keyval, mask);
                settings.set_strv('shortcut-key', [accelStr]);
                updateShortcutUI();
                setRecordingState(false);
                return true;
            }

            return true;
        });
    }
}
