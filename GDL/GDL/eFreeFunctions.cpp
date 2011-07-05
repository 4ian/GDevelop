#include "GDL/Object.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/StrExpressionInstruction.h"
#include "GDL/CommonTools.h"
#include "GDL/SoundManager.h"
#include <SFML/System.hpp>
#include <vector>
#include <string>
#include <ctime>
#include <iostream>

using namespace std;

//TODO : Rewrite most of the expressions using plain, clean, beautiful C++ functions, and make them available to the new GD Runtime.


double ExpGetScreenWidth( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    sf::VideoMode videoMode = sf::VideoMode::GetDesktopMode();

    return videoMode.Width;
}

double ExpGetScreenHeight( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    sf::VideoMode videoMode = sf::VideoMode::GetDesktopMode();

    return videoMode.Height;
}


double ExpGetScreenColorDepth( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    sf::VideoMode videoMode = sf::VideoMode::GetDesktopMode();

    return videoMode.BitsPerPixel;
}

double ExpGetSoundChannelPlayingOffset( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    /*int canal = static_cast<int> (exprInstruction.parameters[0].GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return 0;

    return SoundManager::GetInstance()->GetSoundOnChannel(canal)->GetPlayingOffset();*/
}

double ExpGetMusicChannelPlayingOffset( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    /*int canal = static_cast<int> (exprInstruction.parameters[0].GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return 0;

    return SoundManager::GetInstance()->GetMusicOnChannel(canal)->GetPlayingOffset();*/
}

double ExpGetSoundChannelPitch( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    /*int canal = static_cast<int> (exprInstruction.parameters[0].GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return 0;

    return SoundManager::GetInstance()->GetSoundOnChannel(canal)->GetPitch();*/
}

double ExpGetMusicChannelPitch( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    /*int canal = static_cast<int> (exprInstruction.parameters[0].GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return 0;

    return SoundManager::GetInstance()->GetMusicOnChannel(canal)->GetPitch();*/
}

double ExpGetSoundChannelVolume( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    /*int canal = static_cast<int> (exprInstruction.parameters[0].GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return 0;

    return SoundManager::GetInstance()->GetSoundOnChannel(canal)->GetVolume();*/
}

double ExpGetMusicChannelVolume( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    /*int canal = static_cast<int> (exprInstruction.parameters[0].GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return 0;

    return SoundManager::GetInstance()->GetMusicOnChannel(canal)->GetVolume();*/
}

double ExpGetJoystickAxis( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    //Obtain axis and joystick
    /*unsigned int joystick = exprInstruction.parameters[0].GetAsMathExpressionResult(scene, objectsConcerned);
    string axisStr = exprInstruction.parameters[1].GetAsTextExpressionResult(scene, objectsConcerned);
    sf::Joy::Axis axis;
    if ( axisStr == "AxisX" ) axis = sf::Joy::AxisX;
    else if ( axisStr == "AxisY" ) axis = sf::Joy::AxisY;
    else if ( axisStr == "AxisZ" ) axis = sf::Joy::AxisZ;
    else if ( axisStr == "AxisR" ) axis = sf::Joy::AxisR;
    else if ( axisStr == "AxisU" ) axis = sf::Joy::AxisU;
    else if ( axisStr == "AxisV" ) axis = sf::Joy::AxisV;
    else if ( axisStr == "AxisPOV" ) axis = sf::Joy::AxisPOV;
    else return 0;

    //Update variable value
    return scene.input->GetJoystickAxis(joystick, axis);*/
}
