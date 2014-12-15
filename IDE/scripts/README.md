About translations
==================

Translations are made using [PoEdit](http://poedit.net/).

PoEdit can search for sources files in directories and update translations
catalogs from theses sources files. Alas, there is no way to exclude a directory.

Thus, we're using xgettext, with the script "TranslationsUpdate.bat" or "TranslationsUpdate.sh",
to create a .POT file from sources, and we can then update catalogs in PoEdit by using this .POT file.

To generate the .POT file, just do on Linux, using a terminal:

    sh TranslationsUpdate.sh

or on Windows using the command line:

    TranslationsUpdate.bat
