/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "CommonBitmapManager.h"
#include <wx/bitmap.h>
#include <wx/wx.h>
#include <wx/gdicmn.h>
#include <wx/dc.h>
#include <wx/dcmemory.h>
#include <string>

namespace gd
{

CommonBitmapManager * CommonBitmapManager::_singleton = NULL;

CommonBitmapManager::CommonBitmapManager()
{
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
    add16.LoadFile("res/addicon.png", wxBITMAP_TYPE_ANY);
    add24.LoadFile("res/add24.png", wxBITMAP_TYPE_ANY);
    scene.LoadFile("res/sceneeditor.png", wxBITMAP_TYPE_ANY);
    layerBt.LoadFile("res/layers16.png", wxBITMAP_TYPE_ANY);
    joyaxisBt.LoadFile("res/joystick16.png", wxBITMAP_TYPE_ANY);
    backthumbsBg.LoadFile("res/backthumbs.png", wxBITMAP_TYPE_ANY);
    varBt.LoadFile("res/var.png", wxBITMAP_TYPE_ANY);
    unknown24.LoadFile("res/unknown24.png", wxBITMAP_TYPE_ANY);
    unknownAction24.LoadFile("res/unknownAction24.png", wxBITMAP_TYPE_ANY);
    unknownCondition24.LoadFile("res/unknownCondition24.png", wxBITMAP_TYPE_ANY);
    semitransparentHitBox.LoadFile("res/semitransparentHitBox.png", wxBITMAP_TYPE_ANY);
    noProtection.LoadFile("res/noProtection.png", wxBITMAP_TYPE_ANY);
    folder40.LoadFile("res/folder40.png", wxBITMAP_TYPE_ANY);
    parentFolder40.LoadFile("res/parentFolder40.png", wxBITMAP_TYPE_ANY);
    invertedCondition.LoadFile("res/contraire.png", wxBITMAP_TYPE_ANY);
    left16.LoadFile("res/left16.png", wxBITMAP_TYPE_ANY);
    right16.LoadFile("res/right16.png", wxBITMAP_TYPE_ANY);
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
    remove16.LoadFile("res/deleteicon.png", wxBITMAP_TYPE_ANY);
    copy16.LoadFile("res/copyicon.png", wxBITMAP_TYPE_ANY);
    defaultMask16.LoadFile("res/defaultMask16.png", wxBITMAP_TYPE_ANY);
    preview16.LoadFile("res/preview16.png", wxBITMAP_TYPE_ANY);
    objectGroup16.LoadFile("res/groupeobjeticon.png", wxBITMAP_TYPE_ANY);
    gdFileIcon32.LoadFile("res/gdFile32.png", wxBITMAP_TYPE_ANY);
    error48.LoadFile( "res/error48.png", wxBITMAP_TYPE_ANY );
    help16.LoadFile( "res/helpicon.png", wxBITMAP_TYPE_ANY );
    group24.LoadFile( "res/objectgroup24.png", wxBITMAP_TYPE_ANY );

    layers24.LoadFile("res/layers24.png", wxBITMAP_TYPE_ANY);
    undo24.LoadFile("res/undo24.png", wxBITMAP_TYPE_ANY);
    redo24.LoadFile("res/redo24.png", wxBITMAP_TYPE_ANY);
    redo24.LoadFile("res/redo24.png", wxBITMAP_TYPE_ANY);
    center24.LoadFile("res/center24.png", wxBITMAP_TYPE_ANY);
    zoom24.LoadFile("res/zoom24.png", wxBITMAP_TYPE_ANY);
    grid24.LoadFile("res/grid24.png", wxBITMAP_TYPE_ANY);
    gridedit24.LoadFile("res/gridedit24.png", wxBITMAP_TYPE_ANY);
    windowMask24.LoadFile("res/windowMask24.png", wxBITMAP_TYPE_ANY);
    windowMask24.LoadFile("res/windowMask24.png", wxBITMAP_TYPE_ANY);
    objectsPositionsList24.LoadFile("res/ObjectsPositionsList24.png", wxBITMAP_TYPE_ANY);
    refreshicon24.LoadFile("res/refreshicon24.png", wxBITMAP_TYPE_ANY);
    starticon24.LoadFile("res/starticon24.png", wxBITMAP_TYPE_ANY);
    startwindow24.LoadFile("res/startwindow24.png", wxBITMAP_TYPE_ANY);
    pauseicon24.LoadFile("res/pauseicon24.png", wxBITMAP_TYPE_ANY);
    bug24.LoadFile("res/bug24.png", wxBITMAP_TYPE_ANY);
    profiler24.LoadFile("res/profiler24.png", wxBITMAP_TYPE_ANY);
    fullscreen24.LoadFile("res/fullscreen24.png", wxBITMAP_TYPE_ANY);

}

}
