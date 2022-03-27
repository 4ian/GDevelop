# Flatpak for GDevelop

This is the Flatpak manifest and XML to build a Flatpak for GDevelop.

To build it from a clean Ubuntu based distro:

* `sudo apt install flatpak`
* `sudo apt-get install -y flatpak-builder`
* `sudo flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo`
* `sudo flatpak install flathub org.freedesktop.Platform//21.08 org.freedesktop.Sdk//21.08`
* `sudo flatpak install flathub org.electronjs.Electron2.BaseApp//21.08`
* `flatpak-builder build-dir io.gdevelop.ide.yml`

To try installing it and running it:

* `flatpak-builder --user --install --force-clean build-dir io.gdevelop.ide.yml`
* `flatpak run io.gdevelop.ide`