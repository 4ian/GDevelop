#include "GDL/Object.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/StdAlgo.h"
#include <SFML/System.hpp>
#include <vector>
#include <string>
#include <ctime>
#include <iostream>

using namespace std;

double ExpRandom( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return sf::Randomizer::Random( 0, atoi( exprInstruction.parameters[0].GetPlainString().c_str() ) );
}

double ExpTimeDelta( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return scene->GetElapsedTime();
}

double ExpTimeFromStart( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return scene->GetTimeFromStart();
}

double ExpTimeScale( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return scene->GetTimeScale();
}

double ExpMouseX( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    unsigned int camera = 0;
    if ( exprInstruction.parameters.size() > 1 ) //Compatibility with Game Develop < 1.2.8699
        camera = toInt(exprInstruction.parameters[1].GetPlainString());

    const sf::View & view = scene->GetLayer(
                                            exprInstruction.parameters[0].GetPlainString()
                                            ).GetView(camera);

    return scene->renderWindow->ConvertCoords(scene->input->GetMouseX(), scene->input->GetMouseY(), view).x;
}

double ExpMouseY( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    unsigned int camera = 0;
    if ( exprInstruction.parameters.size() > 1 ) //Compatibility with Game Develop < 1.2.8699
        camera = toInt(exprInstruction.parameters[1].GetPlainString());

    const sf::View & view = scene->GetLayer(
                                            exprInstruction.parameters[0].GetPlainString()
                                            ).GetView(camera);
    return scene->renderWindow->ConvertCoords(scene->input->GetMouseX(), scene->input->GetMouseY(), view).y;
}

double ExpCameraX( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    unsigned int camera = 0;
    if ( exprInstruction.parameters.size() > 1 ) //Compatibility with Game Develop < 1.2.8699
        camera = toInt(exprInstruction.parameters[1].GetPlainString());

    const sf::View & view = scene->GetLayer(
                                            exprInstruction.parameters[0].GetPlainString()
                                            ).GetView(camera);
    return view.GetCenter().x-view.GetSize().x/2;
}

double ExpCameraY( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    unsigned int camera = 0;
    if ( exprInstruction.parameters.size() > 1 ) //Compatibility with Game Develop < 1.2.8699
        camera = toInt(exprInstruction.parameters[1].GetPlainString());

    const sf::View & view = scene->GetLayer(
                                            exprInstruction.parameters[0].GetPlainString()
                                            ).GetView(camera);
    return view.GetCenter().y-view.GetSize().y/2;
}

double ExpCameraRotation( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    unsigned int camera = 0;
    if ( exprInstruction.parameters.size() > 1 ) //Compatibility with Game Develop < 1.2.8699
        camera = toInt(exprInstruction.parameters[1].GetPlainString());

    return scene->GetLayer(exprInstruction.parameters[0].GetPlainString()).GetView(camera).GetRotation();
}

double ExpTime( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    time_t rawtime = time(0);
    struct tm * timeinfo = localtime ( &rawtime );

    string parameter = exprInstruction.parameters[0].GetPlainString();

    if ( parameter == "hour" )
        return timeinfo->tm_hour;
    else if ( parameter == "min" )
        return timeinfo->tm_min;
    else if ( parameter == "sec" )
        return timeinfo->tm_sec;
    else if ( parameter == "mday" )
        return timeinfo->tm_mday;
    else if ( parameter == "mon" )
        return timeinfo->tm_mon;
    else if ( parameter == "year" )
        return timeinfo->tm_year;
    else if ( parameter == "wday" )
        return timeinfo->tm_wday;
    else if ( parameter == "yday" )
        return timeinfo->tm_yday;

    return 0;
}

double ExpGetVariableValue( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    int varId = scene->variables.FindVariable(exprInstruction.parameters[0].GetPlainString());
    double varValue = varId != -1 ? scene->variables.variables[varId].Getvalue() : 0;

    return varValue;
}

double ExpGetGlobalVariableValue( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    int varId = scene->game->variables.FindVariable(exprInstruction.parameters[0].GetPlainString());
    double varValue = varId != -1 ? scene->game->variables.variables[varId].Getvalue() : 0;

    return varValue;
}


double ExpGetObjectCount( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return objectsConcerned->Pick( exprInstruction.parameters[0].GetAsObjectIdentifier() ).size();
}

double ExpGetScreenWidth( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    sf::VideoMode videoMode = sf::VideoMode::GetDesktopMode();

    return videoMode.Width;
}

double ExpGetScreenHeight( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    sf::VideoMode videoMode = sf::VideoMode::GetDesktopMode();

    return videoMode.Height;
}


double ExpGetScreenColorDepth( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    sf::VideoMode videoMode = sf::VideoMode::GetDesktopMode();

    return videoMode.BitsPerPixel;
}
