import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const GStartButton = GObject.registerClass(
class GStartButton extends PanelMenu.Button {
    _init(extensionPath) {
        super._init(0.0, 'GStart Button', false);
        
        this._extensionPath = extensionPath;
        
        // Create the button container
        this._box = new St.BoxLayout({
            style_class: 'gstart-button-box',
            reactive: true,
            can_focus: true,
            track_hover: true,
        });
        
        // Create and add the icon
        this._icon = new St.Icon({
            gicon: Gio.icon_new_for_string(`${this._extensionPath}/icons/gstart.svg`),
            style_class: 'gstart-icon',
            icon_size: 20,
        });
        
        this._box.add_child(this._icon);
        this.add_child(this._box);
        
        // Build the popup menu
        this._buildMenu();
        
        // Add hover effects
        this.connect('enter-event', this._onHoverEnter.bind(this));
        this.connect('leave-event', this._onHoverLeave.bind(this));
    }
    
    _buildMenu() {
        // Quick Actions Section
        let quickSection = new PopupMenu.PopupMenuSection();
        
        // Header
        let headerItem = new PopupMenu.PopupMenuItem('⚡ Quick Actions', {
            reactive: false,
            style_class: 'gstart-header',
        });
        quickSection.addMenuItem(headerItem);
        
        quickSection.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Files
        let filesItem = new PopupMenu.PopupMenuItem('📁  Files');
        filesItem.connect('activate', () => {
            this._launchApp('org.gnome.Nautilus.desktop');
        });
        quickSection.addMenuItem(filesItem);
        
        // Settings
        let settingsItem = new PopupMenu.PopupMenuItem('⚙️  Settings');
        settingsItem.connect('activate', () => {
            this._launchApp('org.gnome.Settings.desktop');
        });
        quickSection.addMenuItem(settingsItem);
        
        // Terminal
        let terminalItem = new PopupMenu.PopupMenuItem('💻  Terminal');
        terminalItem.connect('activate', () => {
            this._launchTerminal();
        });
        quickSection.addMenuItem(terminalItem);
        
        this.menu.addMenuItem(quickSection);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // System Section
        let systemSection = new PopupMenu.PopupMenuSection();
        
        let systemHeader = new PopupMenu.PopupMenuItem('🖥️ System', {
            reactive: false,
            style_class: 'gstart-header',
        });
        systemSection.addMenuItem(systemHeader);
        
        systemSection.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Lock Screen
        let lockItem = new PopupMenu.PopupMenuItem('🔒  Lock Screen');
        lockItem.connect('activate', () => {
            Main.overview.hide();
            Main.screenShield.lock(true);
        });
        systemSection.addMenuItem(lockItem);
        
        // Log Out
        let logoutItem = new PopupMenu.PopupMenuItem('🚪  Log Out');
        logoutItem.connect('activate', () => {
            this._systemAction('logout');
        });
        systemSection.addMenuItem(logoutItem);
        
        // Power Off
        let powerItem = new PopupMenu.PopupMenuItem('⏻  Power Off');
        powerItem.connect('activate', () => {
            this._systemAction('power-off');
        });
        systemSection.addMenuItem(powerItem);
        
        this.menu.addMenuItem(systemSection);
    }
    
    _launchApp(desktopId) {
        try {
            let app = Gio.DesktopAppInfo.new(desktopId);
            if (app) {
                app.launch([], null);
            }
        } catch (e) {
            log(`GStart: Failed to launch ${desktopId}: ${e.message}`);
        }
    }
    
    _launchTerminal() {
        const terminals = [
            'org.gnome.Terminal.desktop',
            'org.gnome.Console.desktop',
            'com.raggesilver.BlackBox.desktop',
            'kitty.desktop',
            'alacritty.desktop',
        ];
        
        for (let terminal of terminals) {
            try {
                let app = Gio.DesktopAppInfo.new(terminal);
                if (app) {
                    app.launch([], null);
                    return;
                }
            } catch (e) {
                continue;
            }
        }
        
        // Fallback: try running gnome-terminal directly
        try {
            GLib.spawn_command_line_async('gnome-terminal');
        } catch (e) {
            log(`GStart: Failed to launch any terminal: ${e.message}`);
        }
    }
    
    _systemAction(action) {
        try {
            let bus = Gio.bus_get_sync(Gio.BusType.SESSION, null);
            
            if (action === 'logout') {
                bus.call(
                    'org.gnome.SessionManager',
                    '/org/gnome/SessionManager',
                    'org.gnome.SessionManager',
                    'Logout',
                    new GLib.Variant('(u)', [1]),
                    null,
                    Gio.DBusCallFlags.NONE,
                    -1,
                    null,
                    null
                );
            } else if (action === 'power-off') {
                bus.call(
                    'org.gnome.SessionManager',
                    '/org/gnome/SessionManager',
                    'org.gnome.SessionManager',
                    'Shutdown',
                    null,
                    null,
                    Gio.DBusCallFlags.NONE,
                    -1,
                    null,
                    null
                );
            }
        } catch (e) {
            log(`GStart: System action failed: ${e.message}`);
        }
    }
    
    _onHoverEnter() {
        this._icon.add_style_class_name('gstart-icon-hover');
    }
    
    _onHoverLeave() {
        this._icon.remove_style_class_name('gstart-icon-hover');
    }
    
    destroy() {
        super.destroy();
    }
});

export default class GStartExtension extends Extension {
    enable() {
        this._button = new GStartButton(this.path);
        // Add to the left side of the panel (like Windows start button)
        Main.panel.addToStatusArea('gstart-button', this._button, 0, 'left');
    }
    
    disable() {
        if (this._button) {
            this._button.destroy();
            this._button = null;
        }
    }
}
