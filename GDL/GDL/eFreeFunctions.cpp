#include "GDL/Object.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/CommonTools.h"
#include <SFML/System.hpp>
#include <vector>
#include <string>
#include <ctime>
#include <iostream>

using namespace std;

double ExpRandom( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    double max = exprInstruction.parameters[0].GetAsMathExpressionResult(scene, objectsConcerned, obj1, obj2);
    if ( max < 0 ) return 0;

    return sf::Randomizer::Random(0, max);
}

double ExpTimeDelta( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return scene.GetElapsedTime();
}

double ExpTimeFromStart( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return scene.GetTimeFromStart();
}

double ExpTimeScale( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return scene.GetTimeScale();
}

double ExpMouseX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    string layer = exprInstruction.parameters.empty() ? "" : exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned); //Compatibility with Game Develop < 1.3.9262
    unsigned int camera = exprInstruction.parameters.size() > 1 ? exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned) : 0; //Compatibility with Game Develop < 1.2.8699

    const sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();

    return scene.renderWindow->ConvertCoords(scene.input->GetMouseX(), scene.input->GetMouseY(), view).x;
}

double ExpMouseY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    string layer = exprInstruction.parameters.empty() ? "" : exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned); //Compatibility with Game Develop < 1.3.9262
    unsigned int camera = exprInstruction.parameters.size() > 1 ? exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned) : 0; //Compatibility with Game Develop < 1.2.8699

    const sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();
    return scene.renderWindow->ConvertCoords(scene.input->GetMouseX(), scene.input->GetMouseY(), view).y;
}

double ExpMouseWheelDelta( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return scene.inputWheelDelta;
}

double ExpCameraWidth( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    unsigned int camera = exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned);

    return scene.GetLayer(
                            exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned)
                            ).GetCamera(camera).GetCameraInfo().size.x;
}

double ExpCameraHeight( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    unsigned int camera = exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned);

    return scene.GetLayer(
                            exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned)
                            ).GetCamera(camera).GetCameraInfo().size.y;
}

double ExpCameraViewportLeft( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    unsigned int camera = exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned);

    return scene.GetLayer(
                            exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned)
                            ).GetCamera(camera).GetCameraInfo().viewport.Left;
}

double ExpCameraViewportTop( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    unsigned int camera = exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned);

    return scene.GetLayer(
                            exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned)
                            ).GetCamera(camera).GetCameraInfo().viewport.Top;
}

double ExpCameraViewportRight( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    unsigned int camera = exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned);
    const sf::FloatRect & sfmlViewport = scene.GetLayer( exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned)
                                                    ).GetCamera(camera).GetCameraInfo().viewport;


    return sfmlViewport.Left+sfmlViewport.Width;
}

double ExpCameraViewportBottom( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    unsigned int camera = exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned);
    const sf::FloatRect & sfmlViewport = scene.GetLayer( exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned)
                                                    ).GetCamera(camera).GetCameraInfo().viewport;

    return sfmlViewport.Top+sfmlViewport.Height;
}

double ExpCameraX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    string layer = exprInstruction.parameters.empty() ? "" : exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned); //Compatibility with Game Develop < 1.3.9262
    unsigned int camera = exprInstruction.parameters.size() > 1 ? exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned) : 0; //Compatibility with Game Develop < 1.2.8699

    const sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();
    return view.GetCenter().x-view.GetSize().x/2;
}

double ExpCameraY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    string layer = exprInstruction.parameters.empty() ? "" : exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned); //Compatibility with Game Develop < 1.3.9262
    unsigned int camera = exprInstruction.parameters.size() > 1 ? exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned) : 0; //Compatibility with Game Develop < 1.2.8699

    const sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();
    return view.GetCenter().y-view.GetSize().y/2;
}

double ExpCameraRotation( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    string layer = exprInstruction.parameters.empty() ? "" : exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned); //Compatibility with Game Develop < 1.3.9262
    unsigned int camera = exprInstruction.parameters.size() > 1 ? exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned) : 0; //Compatibility with Game Develop < 1.2.8699

    return scene.GetLayer(layer).GetCamera(camera).GetSFMLView().GetRotation();
}

double ExpTime( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
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

double ExpGetVariableValue( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return scene.variables.GetVariableValue( exprInstruction.parameters[0].GetPlainString() );
}

std::string ExpGetVariableString( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction )
{
    return scene.variables.GetVariableString( exprInstruction.parameters[0].GetPlainString() );
}

double ExpGetGlobalVariableValue( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return scene.game->variables.GetVariableValue( exprInstruction.parameters[0].GetPlainString() );
}

std::string ExpGetGlobalVariableString( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction )
{
    return scene.game->variables.GetVariableString( exprInstruction.parameters[0].GetPlainString() );
}

double ExpGetObjectCount( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return objectsConcerned.Pick( exprInstruction.parameters[0].GetAsObjectIdentifier() ).size();
}

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
