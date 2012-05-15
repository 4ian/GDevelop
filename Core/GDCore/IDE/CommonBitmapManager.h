/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CommonBitmapManager_H
#define CommonBitmapManager_H
#include <wx/bitmap.h>

namespace gd
{

/**
 * \brief Meant to provide easy access to usually used wxBitmap.
 */
class GD_CORE_API CommonBitmapManager
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
    wxBitmap unknown24;
    wxBitmap scene;
    wxBitmap layerBt;
    wxBitmap joyaxisBt;
    wxBitmap backthumbsBg;
    wxBitmap varBt;
    wxBitmap semitransparentHitBox;

    static CommonBitmapManager *GetInstance()
    {
        if ( NULL == _singleton )
            _singleton =  new CommonBitmapManager;

        return _singleton;
    }

    static void DestroySingleton()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

private:
    CommonBitmapManager();
    virtual ~CommonBitmapManager() {};

    static CommonBitmapManager *_singleton;
};

}

#endif // CommonBitmapManager_H
