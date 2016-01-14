/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef CommonBitmapProvider_H
#define CommonBitmapProvider_H
#include <wx/bitmap.h>

namespace gd
{

/**
 * \brief Provide easy access to the most common wxBitmap used in dialogs.
 *
 * The bitmaps are loaded when the CommonBitmapProvider is constructed for the first time ( usually by the IDE ).
 *
 * \ingroup IDE
 */
class GD_CORE_API CommonBitmapProvider
{
public:

    wxBitmap expressionBt;
    wxBitmap objectBt;
    wxBitmap behaviorBt;
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
    wxBitmap transparentBg;
    wxBitmap trueOrFalseBt;
    wxBitmap point;
    wxBitmap add16;
    wxBitmap add24;
    wxBitmap unknown24;
    wxBitmap unknownAction24;
    wxBitmap unknownCondition24;
    wxBitmap scene;
    wxBitmap layerBt;
    wxBitmap joyaxisBt;
    wxBitmap varBt;
    wxBitmap noProtection;
    wxBitmap folder40;
    wxBitmap parentFolder40;
    wxBitmap invertedCondition;
    wxBitmap left16;
    wxBitmap right16;
    wxBitmap animation16;
    wxBitmap leftdir16;
    wxBitmap leftdowndir16;
    wxBitmap downdir16;
    wxBitmap rightdowndir16;
    wxBitmap rightdir16;
    wxBitmap rightupdir16;
    wxBitmap updir16;
    wxBitmap leftupdir16;
    wxBitmap maskEdit16;
    wxBitmap pointEdit16;
    wxBitmap defaultMask16;
    wxBitmap objectGroup16;
    wxBitmap gdFileIcon32;
    wxBitmap error48;

    static CommonBitmapProvider *Get()
    {
        if ( NULL == _singleton )
            _singleton =  new CommonBitmapProvider;

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
    CommonBitmapProvider();
    virtual ~CommonBitmapProvider() {};

    static CommonBitmapProvider *_singleton;
};

}

#endif // CommonBitmapProvider_H
#endif
