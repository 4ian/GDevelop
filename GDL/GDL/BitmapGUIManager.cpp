/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GDE)

#include <wx/bitmap.h>
#include <wx/wx.h>
#include <wx/gdicmn.h>
#include <wx/dc.h>
#include <wx/dcmemory.h>
#include <iostream>
#include <string>

#include "GDL/BitmapGUIManager.h"

using namespace std;

BitmapGUIManager *BitmapGUIManager::_singleton = NULL;

BitmapGUIManager::BitmapGUIManager()
{
    //ctor
    expressionBt.LoadFile("res/expressionicon.png", wxBITMAP_TYPE_ANY);
    objectBt.LoadFile("res/objeticon.png", wxBITMAP_TYPE_ANY);
    automatismBt.LoadFile("res/automatism16.png", wxBITMAP_TYPE_ANY);
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
    modeSimple.LoadFile("res/modesimpleicon.png", wxBITMAP_TYPE_ANY);
    transparentBg.LoadFile("res/transparentback.png", wxBITMAP_TYPE_ANY);
    trueOrFalseBt.LoadFile("res/yesnoicon.png", wxBITMAP_TYPE_ANY);
    point.LoadFile("res/point.png", wxBITMAP_TYPE_ANY);
    objects24.LoadFile("res/objeticon24.png", wxBITMAP_TYPE_ANY);
    add24.LoadFile("res/add24.png", wxBITMAP_TYPE_ANY);
    scene.LoadFile("res/sceneeditor.png", wxBITMAP_TYPE_ANY);
    layerBt.LoadFile("res/layers16.png", wxBITMAP_TYPE_ANY);
    joyaxisBt.LoadFile("res/joystick16.png", wxBITMAP_TYPE_ANY);
    backthumbsBg.LoadFile("res/backthumbs.png", wxBITMAP_TYPE_ANY);
    varBt.LoadFile("res/var.png", wxBITMAP_TYPE_ANY);
    unknown24.LoadFile("res/unknown24.png", wxBITMAP_TYPE_ANY);
}
#endif
