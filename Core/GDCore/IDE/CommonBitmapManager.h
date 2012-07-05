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
 * \brief Provide easy access to the most common wxBitmap used in dialogs.
 *
 * The bitmaps are loaded when the CommonBitmapManager is constructed for the first time ( usually by the IDE ).
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
    wxBitmap add16;
    wxBitmap add24;
    wxBitmap unknown24;
    wxBitmap scene;
    wxBitmap layerBt;
    wxBitmap joyaxisBt;
    wxBitmap backthumbsBg;
    wxBitmap varBt;
    wxBitmap semitransparentHitBox;
    wxBitmap noProtection;
    wxBitmap folder40;
    wxBitmap parentFolder40;
    wxBitmap invertedCondition;
    wxBitmap left16;
    wxBitmap right16;

    /** \name 24x24 bitmaps
     * wxBitmap which can be used for ribbons.
     */
    ///@{
    wxBitmap objects24;
    wxBitmap layers24;
    wxBitmap undo24;
    wxBitmap redo24;
    wxBitmap center24;
    wxBitmap zoom24;
    wxBitmap grid24;
    wxBitmap gridedit24;
    wxBitmap windowMask24;
    wxBitmap objectsPositionsList24;
    wxBitmap refreshicon24;
    wxBitmap starticon24;
    wxBitmap startwindow24;
    wxBitmap pauseicon24;
    wxBitmap bug24;
    wxBitmap profiler24;
    wxBitmap fullscreen24;
    ///@}

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
