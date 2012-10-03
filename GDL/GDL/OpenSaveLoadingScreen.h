/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OPENSAVELOADINGSCREEN_H
#define OPENSAVELOADINGSCREEN_H
#include <string>
#include "GDL/LoadingScreen.h"
#include "GDL/tinyxml/tinyxml.h"

using namespace std;

/**
 * \brief Internal helper class for saving and loading data of LoadingScreen.
 */
class GD_API OpenSaveLoadingScreen
{
public:

    static bool SaveToFile(const LoadingScreen & datas, string file);
    static void SaveToElement(const LoadingScreen & datas, TiXmlElement * root);
    static bool OpenFromFile(LoadingScreen & datas, string file);
    static bool OpenFromString(LoadingScreen & datas, string text);
    static bool OpenFromElement(LoadingScreen & datas, const TiXmlElement * elem);
};

#endif // OPENSAVELOADINGSCREEN_H

