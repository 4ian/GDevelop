/**

Game Develop - Path Automatism Extension
Copyright (c) 2010-2013 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include <boost/shared_ptr.hpp>
#include "PathAutomatism.h"
#include "PathAutomatismEditor.h"
#include "GDCpp/Scene.h"
#include "GDCpp/tinyxml/tinyxml.h"
#include "GDCpp/XmlMacros.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/CommonTools.h"
#include "RuntimeScenePathDatas.h"

PathAutomatism::PathAutomatism() :
    speed(200),
    timeOnSegment(0),
    totalSegmentTime(0),
    currentSegment(0),
    stopAtEnd(false),
    reverseAtEnd(false),
    followAngle(false),
    angleOffset(0),
    isPathLoaded(false),
    futureSegment(-1),
    futurePosition(-1),
    runtimeScenesPathDatas(NULL)
{
    Reset();
    SetPath("Object main path", std::vector<sf::Vector2f>(1, sf::Vector2f(0,0)));
    ChangeCurrentPath("Object main path");
}

PathAutomatism::PathAutomatism(const PathAutomatism &cl) : Automatism(cl)
{
    Init(cl);
}

PathAutomatism& PathAutomatism::operator=(const PathAutomatism &cl)
{
    Init(cl);
    return *this;
}

void PathAutomatism::Init(const PathAutomatism &cl)
{
    name = cl.name;
    type = cl.type;

    isPathLoaded = false;

    pathName = cl.pathName;
    path = cl.path;

    offset = cl.offset;
    speed = cl.speed;
    timeOnSegment = cl.timeOnSegment;
    totalSegmentTime = cl.totalSegmentTime;
    currentSegment = cl.currentSegment;

    stopAtEnd = cl.stopAtEnd;
    reverseAtEnd = cl.reverseAtEnd;

    followAngle = cl.followAngle;
    angleOffset = cl.angleOffset;

    localePaths = cl.localePaths;

    runtimeScenesPathDatas = cl.runtimeScenesPathDatas;
}

void PathAutomatism::Reset()
{
    EnterSegment(0);
}

void PathAutomatism::EnterSegment(unsigned int segmentNumber)
{
    currentSegment = segmentNumber;
    if (!path.empty() && currentSegment < path.size()-1)
    {
        sf::Vector2f newPath = (path[currentSegment + 1] - path[currentSegment]);
        totalSegmentTime = sqrtf(newPath.x*newPath.x+newPath.y*newPath.y);
        timeOnSegment = 0;

        if(followAngle)
            object->SetAngle(GetAngleOfSegment(newPath) + angleOffset);
    }
}

PathAutomatism::~PathAutomatism()
{
}

#if defined(GD_IDE_ONLY)
void PathAutomatism::EditAutomatism( wxWindow* parent, gd::Project & game_, gd::Layout * scene, gd::MainFrameWrapper & mainFrameWrapper_ )
{
    PathAutomatismEditor editor(parent, game_, scene, *this, mainFrameWrapper_);
    editor.ShowModal();
}
#endif


/**
 * Called at each frame before events :
 * Position the object on the path
 */
void PathAutomatism::DoStepPreEvents(RuntimeScene & scene)
{
    if(!isPathLoaded)
    {
        LoadPath(scene);
        Reset();
    }

    //  add to the current time along the path
    timeOnSegment += static_cast<double>(scene.GetElapsedTime())/1000000.0*speed;

    //  if I reached the end of this segment, move to a new segment
    if (timeOnSegment >= totalSegmentTime && currentSegment < path.size())
        EnterSegment(currentSegment + 1);

    //Position object on the segment
    sf::Vector2f newPos;
    if ( !path.empty() && currentSegment < path.size()-1 )
        newPos = offset + path[currentSegment] + (path[currentSegment + 1] - path[currentSegment]) * (timeOnSegment / totalSegmentTime);
    else
    {
        if ( stopAtEnd && !path.empty()) newPos = path.back() + offset;
        else if (reverseAtEnd)
        {
            std::reverse(path.begin(), path.end());
            EnterSegment(0);
            if (!path.empty()) newPos = path.front() + offset;
        }
        else
        {
            EnterSegment(0);
            if (!path.empty()) newPos = path.front() + offset;
        }
    }

    object->SetX(newPos.x);
    object->SetY(newPos.y);

    return;
}

void PathAutomatism::DoStepPostEvents(RuntimeScene & scene)
{
    if(!isPathLoaded)
    {
        LoadPath(scene);
        Reset();
    }
    if(futureSegment != -1)
    {
        EnterSegment(futureSegment);
        futureSegment = -1;
    }
    if(futurePosition != -1)
    {
        timeOnSegment = futurePosition * totalSegmentTime;
        futurePosition = -1;
    }
}

#if defined(GD_IDE_ONLY)
void PathAutomatism::SaveToXml(TiXmlElement * elem) const
{
    TiXmlElement * pathElem = new TiXmlElement( "Paths" );
    elem->LinkEndChild( pathElem );
    SavePathsFromXml(pathElem);

    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("currentPath", GetCurrentPathName());

    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("speed", GetSpeed());
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("offsetX", GetOffsetX());
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("offsetY", GetOffsetY());
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("angleOffset", angleOffset);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("reverseAtEnd", ReverseAtEnd());
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("stopAtEnd", StopAtEnd());
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("followAngle", FollowAngle());
}

void PathAutomatism::SavePathsFromXml(TiXmlElement * elem) const
{
    for(std::map<std::string, std::vector<sf::Vector2f> >::const_iterator it = localePaths.begin(); it != localePaths.end(); it++)
    {
        TiXmlElement * str = new TiXmlElement( "Path" );
        elem->LinkEndChild( str );

        str->SetAttribute("name", it->first.c_str());
        str->SetAttribute("coords", GetStringFromCoordsVector(it->second, '/', ';').c_str());
    }
}
#endif

void PathAutomatism::LoadFromXml(const TiXmlElement * elem)
{
    if(elem->FirstChildElement("Paths") != 0)
        LoadPathsFromXml(elem->FirstChildElement("Paths"));

    std::string currentPath_;
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("currentPath", currentPath_);

    ChangeCurrentPath(currentPath_);

    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("speed", speed);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("offsetX", offset.x);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("offsetY", offset.y);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("angleOffset", angleOffset);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("reverseAtEnd", reverseAtEnd);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("stopAtEnd", stopAtEnd);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("followAngle", followAngle);
}

void PathAutomatism::LoadPathsFromXml(const TiXmlElement * elem)
{
    localePaths.clear();

    const TiXmlElement * childElem = elem->FirstChildElement("Path");
    while(childElem )
    {
        if(childElem->ToElement()->Attribute("name") == NULL || childElem->ToElement()->Attribute("coords") == NULL)
            continue;

        localePaths[childElem->ToElement()->Attribute("name")] = GetCoordsVectorFromString(childElem->ToElement()->Attribute("coords"), '/', ';');
        childElem = childElem->NextSiblingElement();
    }

    if(localePaths.size() == 0)
    {
        localePaths["Object main path"] = std::vector<sf::Vector2f>(1, sf::Vector2f(0,0));
    }
}

float PathAutomatism::GetOffsetX() const
{
    return offset.x;
}

void PathAutomatism::SetOffsetX(float off)
{
    offset.x = off;
}

float PathAutomatism::GetOffsetY() const
{
    return offset.y;
}

void PathAutomatism::SetOffsetY(float off)
{
    offset.y = off;
}

void PathAutomatism::SetSpeed(float sp)
{
    speed = sp;
}

float PathAutomatism::GetSpeed() const
{
    return speed;
}

void PathAutomatism::SetAngleOffset(float off)
{
    angleOffset = off;

    //Update the angle
    if(isPathLoaded)
    {
        sf::Vector2f newPath = (path[currentSegment + 1] - path[currentSegment]);
        if(followAngle)
            object->SetAngle(GetAngleOfSegment(newPath) + angleOffset);
    }
}

float PathAutomatism::GetAngleOffset() const
{
    return angleOffset;
}

void PathAutomatism::Reverse()
{
    float tempTimeOnSegment = timeOnSegment;
    std::reverse(path.begin(), path.end());
    EnterSegment(path.size() - currentSegment - 2);
    timeOnSegment = totalSegmentTime - tempTimeOnSegment;
}

const std::vector<sf::Vector2f>& PathAutomatism::GetPath(const std::string &_name) const
{
    return localePaths.at(_name);
}

void PathAutomatism::SetPath(const std::string &_name, std::vector<sf::Vector2f> _path)
{
    localePaths[_name] = _path;
}

void PathAutomatism::ChangeCurrentPath(const std::string &_name)
{
    pathName = _name;
    isPathLoaded = false;

    Reset();
}

const std::string& PathAutomatism::GetCurrentPathName() const
{
    return pathName;
}

void PathAutomatism::LoadPath(RuntimeScene & scene)
{
    if(localePaths.count(pathName) == 0)
    {
        if (runtimeScenesPathDatas == NULL)
            runtimeScenesPathDatas = static_cast<RuntimeScenePathDatas*>(scene.GetAutomatismSharedDatas(name).get());

        if(runtimeScenesPathDatas != NULL && runtimeScenesPathDatas->globalPaths.count(pathName) != 0)
            path = std::vector<sf::Vector2f>(runtimeScenesPathDatas->globalPaths.at(pathName));

    }
    else
    {
        path = std::vector<sf::Vector2f>(GetPath(pathName));
    }

    isPathLoaded = true;
}

std::vector<std::string> PathAutomatism::GetListOfPathsNames() const
{
    std::vector<std::string> names;
    for(std::map<std::string, std::vector<sf::Vector2f> >::const_iterator it = localePaths.begin(); it != localePaths.end(); it++)
    {
        names.push_back((*it).first);
    }

    return names;
}

void PathAutomatism::DeleteAllPaths()
{
    localePaths.clear();
}

void PathAutomatism::SetCurrentSegment(unsigned int seg)
{
    futureSegment = seg;
}

int PathAutomatism::GetCurrentSegment()
{
    return futureSegment == -1 ? currentSegment : futureSegment;
}

float PathAutomatism::GetPositionOnSegment()
{
    return futurePosition == -1 ? (timeOnSegment / totalSegmentTime) : futurePosition;
}

void PathAutomatism::SetPositionOnSegment(float pos)
{
    //timeOnSegment = pos * totalSegmentTime;
    futurePosition = pos;
}

std::string PathAutomatism::GetStringFromCoordsVector(const std::vector<sf::Vector2f> &vec, char coordsSep, char composantSep)
{
    std::string coordsStr;

	for (unsigned int a = 0; a < vec.size(); a++)
	{
	    coordsStr += ToString<float>(vec.at(a).x) + composantSep + ToString<float>(vec.at(a).y);
	    if(a != vec.size() - 1)
            coordsStr += coordsSep;
	}

	return coordsStr;
}

std::vector<sf::Vector2f> PathAutomatism::GetCoordsVectorFromString(const std::string &str, char coordsSep, char composantSep)
{
    std::vector<sf::Vector2f> coordsVec;

    std::vector<std::string> coordsDecomposed = SplitString<std::string>(str, coordsSep);

    for(unsigned int a = 0; a < coordsDecomposed.size(); a++)
    {
        std::vector<std::string> coordXY = SplitString<std::string>(coordsDecomposed.at(a), composantSep);

        if(coordXY.size() != 2)
            continue;

        sf::Vector2f newCoord(ToFloat<std::string>(coordXY.at(0)), ToFloat<std::string>(coordXY.at(1)));
        coordsVec.push_back(newCoord);
    }

    return coordsVec;
}

#define PI 3.14159265

float PathAutomatism::GetAngleOfSegment(sf::Vector2f &seg)
{
    float norm = abs(sqrtf(pow(seg.x, 2) + pow(seg.y,2)));

    if(seg.y >= 0)
    {
        return acos(seg.x / norm) * 180.0 / PI;
    }
    else
    {
        return -acos(seg.x / norm) * 180.0 / PI;
    }
}

