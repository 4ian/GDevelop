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
 * \brief Internal class for saving and loading data of LoadingScreen.
 */
class GD_API OpenSaveLoadingScreen
{
    public:
        OpenSaveLoadingScreen(LoadingScreen & datas_);
        virtual ~OpenSaveLoadingScreen();

        bool SaveToFile(string file);
        void SaveToElement(TiXmlElement * root);
        bool OpenFromFile(string file);
        bool OpenFromString(string text);
        bool OpenFromElement(const TiXmlElement * elem);
    protected:
    private:

        LoadingScreen & datas;
};

#endif // OPENSAVELOADINGSCREEN_H

