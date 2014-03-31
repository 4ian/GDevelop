Translations are made using poEdit.
PoEdit can search for sources files in directories and update translations
catalogs from theses sources files. Alas, there is no way to exclude a directory.
Thus, we're using xgettext, with the script "TranslationsUpdate.bat", to create a
.POT file from sources, and we can then update catalogs in PoEdit by using this .POT file.