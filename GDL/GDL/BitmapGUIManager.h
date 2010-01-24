#if defined(GDE)
/**
 * Game Develop
 *    Editor
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  BitmapGUIManager est une classe unique qui contient des bitmaps
 *  et images fréquemment utilisées.
 */

#ifndef BITMAPGUIMANAGER_H
#define BITMAPGUIMANAGER_H
#include <wx/bitmap.h>
#include <string>

using namespace std;

class GD_API BitmapGUIManager
{
public:
    // Fonctions de création et destruction du singleton
    static BitmapGUIManager *getInstance()
    {
        if ( NULL == _singleton )
            _singleton =  new BitmapGUIManager;

        return _singleton;
    }

    static void kill()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

    static BitmapGUIManager *_singleton;

    wxBitmap expressionBt;
    wxBitmap objetBt;
    wxBitmap signeBt;
    wxBitmap fileBt;
    wxBitmap yesnoBt;
    wxBitmap policeBt;
    wxBitmap colorBt;
    wxBitmap texteBt;
    wxBitmap musicBt;
    wxBitmap soundBt;
    wxBitmap passwordBt;
    wxBitmap unknownBt;
    wxBitmap keyBt;
    wxBitmap mouseBt;
    wxBitmap modeSimple;
    wxBitmap transparentBg;
    wxBitmap trueOrFalseBt;
    wxBitmap point;
    wxBitmap objects24;
    wxBitmap add24;
    wxBitmap scene;
    wxBitmap layerBt;
    wxBitmap joyaxisBt;
    wxBitmap backthumbsBg;
    wxBitmap varBt;

protected:
private:
    BitmapGUIManager();
    virtual ~BitmapGUIManager() {};

    static wxBitmap CreateImageButton(string imageFile, string label);
};

#endif // BITMAPGUIMANAGER_H
#endif
