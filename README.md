<p align="center">
  <img src="https://veduis.com/blog/images/featuredimg/2025/gstart.png" alt="GStart Logo or Preview" width="600">
</p>

# GStart

A start button inspired extension for GNOME Shell.

## What it does

- Adds a clean "start" button to the left side of your top panel
- Click it to open a quick menu with essential apps and system actions
- Launch Files, Settings, Terminal with one click
- Quick access to lock screen, logout, and power options
- Minimal design with smooth hover effects

## Quick Install

```bash
# After downloading and extracting the ZIP file
cd GStart-main  # or whatever the extracted folder is named

# Copy to extensions directory
cp -r . ~/.local/share/gnome-shell/extensions/gstart@github.com

# Restart GNOME Shell (Alt+F2, type 'r', press Enter. Or log out and back in if on Wayland.)

# Enable the extension
gnome-extensions enable gstart@github.com
```

## Requirements

- GNOME Shell 45, 46, or 47

## Remove it

```bash
gnome-extensions disable gstart@github.com
rm -rf ~/.local/share/gnome-shell/extensions/gstart@github.com
```

## License

GPL-3.0
