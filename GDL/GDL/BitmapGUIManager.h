/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GDE)

#ifndef BITMAPGUIMANAGER_H
#define BITMAPGUIMANAGER_H
#include <wx/bitmap.h>
#include <string>

using namespace std;

/**
 * Class containing frequently used bitmaps
 */
class GD_API BitmapGUIManager
{
public:

    wxBitmap expressionBt;
    wxBitmap objectBt;
    wxBitmap automatismBt;
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

protected:
private:
    BitmapGUIManager();
    virtual ~BitmapGUIManager() {};

    static BitmapGUIManager *_singleton;
};

#endif // BITMAPGUIMANAGER_H
#endif
