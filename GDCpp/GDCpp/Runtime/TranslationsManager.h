#ifndef TRANSLATIONSMANAGER_H
#define TRANSLATIONSMANAGER_H

#include <map>

#include "GDCpp/Runtime/String.h"

class GD_API TranslationsManager
{
public:
	TranslationsManager();

	void LoadMOFile(const gd::String & path);

	gd::String GetTranslation(const gd::String & string) const;

private:
	std::map<gd::String, gd::String> translations;
};

#endif
