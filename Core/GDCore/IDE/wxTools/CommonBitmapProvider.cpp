/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "CommonBitmapProvider.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include <wx/bitmap.h>
#include <wx/wx.h>
#include <wx/gdicmn.h>
#include <wx/dc.h>
#include <wx/dcmemory.h>
#include "GDCore/String.h"

namespace gd
{

CommonBitmapProvider * CommonBitmapProvider::_singleton = NULL;

CommonBitmapProvider::CommonBitmapProvider()
{
    expressionBt.LoadFile("res/expressionicon.png", wxBITMAP_TYPE_ANY);
    objectBt = gd::SkinHelper::GetIcon("object", 16);
    behaviorBt.LoadFile("res/behavior16.png", wxBITMAP_TYPE_ANY);
    signeBt.LoadFile("res/signeicon.png", wxBITMAP_TYPE_ANY);
    fileBt.LoadFile("res/fileicon.png", wxBITMAP_TYPE_ANY);
    yesnoBt.LoadFile("res/yesnoicon.png", wxBITMAP_TYPE_ANY);
    policeBt.LoadFile("res/policeicon.png", wxBITMAP_TYPE_ANY);
    colorBt.LoadFile("res/coloricon.png", wxBITMAP_TYPE_ANY);
    texteBt.LoadFile("res/texteicon.png", wxBITMAP_TYPE_ANY);
    musicBt.LoadFile("res/musicicon.png", wxBITMAP_TYPE_ANY);
    soundBt.LoadFile("res/soundicon.png", wxBITMAP_TYPE_ANY);
    passwordBt.LoadFile("res/passwordicon.png", wxBITMAP_TYPE_ANY);
    unknownBt.LoadFile("res/unknownicon.png", wxBITMAP_TYPE_ANY);
    keyBt.LoadFile("res/keyicon.png", wxBITMAP_TYPE_ANY);
    mouseBt.LoadFile("res/mouseicon.png", wxBITMAP_TYPE_ANY);
    transparentBg.LoadFile("res/transparentback.png", wxBITMAP_TYPE_ANY);
    trueOrFalseBt.LoadFile("res/yesnoicon.png", wxBITMAP_TYPE_ANY);
    point.LoadFile("res/point.png", wxBITMAP_TYPE_ANY);
    add16 = gd::SkinHelper::GetIcon("add", 16);
    add24 = gd::SkinHelper::GetIcon("add", 24);
    scene = gd::SkinHelper::GetIcon("scene", 16);
    layerBt = gd::SkinHelper::GetIcon("layer", 16);
    joyaxisBt.LoadFile("res/joystick16.png", wxBITMAP_TYPE_ANY);
    varBt.LoadFile("res/var.png", wxBITMAP_TYPE_ANY);
    unknown24.LoadFile("res/unknown24.png", wxBITMAP_TYPE_ANY);
    unknownAction24.LoadFile("res/unknownAction24.png", wxBITMAP_TYPE_ANY);
    unknownCondition24.LoadFile("res/unknownCondition24.png", wxBITMAP_TYPE_ANY);
    noProtection.LoadFile("res/noProtection.png", wxBITMAP_TYPE_ANY);
    folder40.LoadFile("res/folder40.png", wxBITMAP_TYPE_ANY);
    parentFolder40.LoadFile("res/parentFolder40.png", wxBITMAP_TYPE_ANY);
    invertedCondition.LoadFile("res/contraire.png", wxBITMAP_TYPE_ANY);
    animation16.LoadFile("res/animation16.png", wxBITMAP_TYPE_ANY);
    leftdir16.LoadFile("res/leftdir.png", wxBITMAP_TYPE_ANY);
    leftdowndir16.LoadFile("res/leftdowndir.png", wxBITMAP_TYPE_ANY);
    downdir16.LoadFile("res/downdir.png", wxBITMAP_TYPE_ANY);
    rightdowndir16.LoadFile("res/rightdowndir.png", wxBITMAP_TYPE_ANY);
    rightdir16.LoadFile("res/rightdir.png", wxBITMAP_TYPE_ANY);
    rightupdir16.LoadFile("res/rightupdir.png", wxBITMAP_TYPE_ANY);
    updir16.LoadFile("res/updir.png", wxBITMAP_TYPE_ANY);
    leftupdir16.LoadFile("res/leftupdir.png", wxBITMAP_TYPE_ANY);
    maskEdit16.LoadFile("res/maskEdit16.png", wxBITMAP_TYPE_ANY);
    pointEdit16.LoadFile("res/pointEdit16.png", wxBITMAP_TYPE_ANY);
    defaultMask16.LoadFile("res/defaultMask16.png", wxBITMAP_TYPE_ANY);
    objectGroup16.LoadFile("res/groupeobjeticon.png", wxBITMAP_TYPE_ANY);
    gdFileIcon32.LoadFile("res/gdFile32.png", wxBITMAP_TYPE_ANY);
    error48.LoadFile( "res/error48.png", wxBITMAP_TYPE_ANY );
}

}
#endif
