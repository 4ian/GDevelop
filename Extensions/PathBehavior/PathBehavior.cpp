/**

GDevelop - Path Behavior Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <memory>
#include <cmath>
#include "PathBehavior.h"
#include "PathBehaviorEditor.h"
#include "GDCpp/Project/Layout.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/CommonTools.h"
#include "RuntimeScenePathDatas.h"

PathBehavior::PathBehavior() :
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

PathBehavior::PathBehavior(const PathBehavior &cl) : Behavior(cl)
{
    Init(cl);
}

PathBehavior& PathBehavior::operator=(const PathBehavior &cl)
{
    Init(cl);
    return *this;
}

void PathBehavior::Init(const PathBehavior &cl)
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

void PathBehavior::Reset()
{
    EnterSegment(0);
}

void PathBehavior::EnterSegment(std::size_t segmentNumber)
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

PathBehavior::~PathBehavior()
{
}

#if defined(GD_IDE_ONLY)
void PathBehavior::EditBehavior( wxWindow* parent, gd::Project & game_, gd::Layout * scene, gd::MainFrameWrapper & mainFrameWrapper_ )
{
#if !defined(GD_NO_WX_GUI)
    PathBehaviorEditor editor(parent, game_, scene, *this, mainFrameWrapper_);
    editor.ShowModal();
#endif
}
#endif


/**
 * Called at each frame before events :
 * Position the object on the path
 */
void PathBehavior::DoStepPreEvents(RuntimeScene & scene)
{
    if(!isPathLoaded)
    {
        LoadPath(scene);
        Reset();
    }

    //  add to the current time along the path
    timeOnSegment += static_cast<double>(scene.GetTimeManager().GetElapsedTime())
        / 1000000.0 * speed;

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

void PathBehavior::DoStepPostEvents(RuntimeScene & scene)
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
void PathBehavior::SerializeTo(gd::SerializerElement & element) const
{
    SerializePathsTo(element.AddChild("paths"));

    element.SetAttribute("currentPath", GetCurrentPathName());
    element.SetAttribute("speed", GetSpeed());
    element.SetAttribute("offsetX", GetOffsetX());
    element.SetAttribute("offsetY", GetOffsetY());
    element.SetAttribute("angleOffset", angleOffset);
    element.SetAttribute("reverseAtEnd", ReverseAtEnd());
    element.SetAttribute("stopAtEnd", StopAtEnd());
    element.SetAttribute("followAngle", FollowAngle());
}

void PathBehavior::SerializePathsTo(gd::SerializerElement & element) const
{
    element.ConsiderAsArrayOf("path");
    for(std::map<gd::String, std::vector<sf::Vector2f> >::const_iterator it = localePaths.begin(); it != localePaths.end(); it++)
    {
        gd::SerializerElement & pathElement = element.AddChild("path");

        pathElement.SetAttribute("name", it->first);
        pathElement.SetAttribute("coords", GetStringFromCoordsVector(it->second, '/', ';'));
    }
}
#endif

void PathBehavior::UnserializeFrom(const gd::SerializerElement & element)
{
    UnserializePathsFrom(element.GetChild("paths", 0, "Paths"));

    ChangeCurrentPath(element.GetStringAttribute("currentPath"));
    speed = element.GetDoubleAttribute("speed");
    offset.x = element.GetDoubleAttribute("offsetX");
    offset.y = element.GetDoubleAttribute("offsetY");
    angleOffset = element.GetDoubleAttribute("angleOffset");
    reverseAtEnd = element.GetBoolAttribute("reverseAtEnd");
    stopAtEnd = element.GetBoolAttribute("stopAtEnd");
    followAngle = element.GetBoolAttribute("followAngle");
}

void PathBehavior::UnserializePathsFrom(const gd::SerializerElement & element)
{
    localePaths.clear();

    element.ConsiderAsArrayOf("path", "Path");
    for(std::size_t i = 0;i<element.GetChildrenCount();++i)
    {
        const gd::SerializerElement & pathElement = element.GetChild(i);
        localePaths[pathElement.GetStringAttribute("name")] = GetCoordsVectorFromString(pathElement.GetStringAttribute("coords"), '/', ';');
    }

    if(localePaths.empty())
        localePaths["Object main path"] = std::vector<sf::Vector2f>(1, sf::Vector2f(0,0));
}

float PathBehavior::GetOffsetX() const
{
    return offset.x;
}

void PathBehavior::SetOffsetX(float off)
{
    offset.x = off;
}

float PathBehavior::GetOffsetY() const
{
    return offset.y;
}

void PathBehavior::SetOffsetY(float off)
{
    offset.y = off;
}

void PathBehavior::SetSpeed(float sp)
{
    speed = sp;
}

float PathBehavior::GetSpeed() const
{
    return speed;
}

void PathBehavior::SetAngleOffset(float off)
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

float PathBehavior::GetAngleOffset() const
{
    return angleOffset;
}

void PathBehavior::Reverse()
{
    float tempTimeOnSegment = timeOnSegment;
    std::reverse(path.begin(), path.end());
    EnterSegment(path.size() - currentSegment - 2);
    timeOnSegment = totalSegmentTime - tempTimeOnSegment;
}

const std::vector<sf::Vector2f>& PathBehavior::GetPath(const gd::String &_name) const
{
    return localePaths.at(_name);
}

void PathBehavior::SetPath(const gd::String &_name, std::vector<sf::Vector2f> _path)
{
    localePaths[_name] = _path;
}

void PathBehavior::ChangeCurrentPath(const gd::String &_name)
{
    pathName = _name;
    isPathLoaded = false;

    Reset();
}

const gd::String& PathBehavior::GetCurrentPathName() const
{
    return pathName;
}

void PathBehavior::LoadPath(RuntimeScene & scene)
{
    if(localePaths.count(pathName) == 0)
    {
        if (runtimeScenesPathDatas == NULL)
            runtimeScenesPathDatas = static_cast<RuntimeScenePathDatas*>(scene.GetBehaviorSharedData(name).get());

        if(runtimeScenesPathDatas != NULL && runtimeScenesPathDatas->globalPaths.count(pathName) != 0)
            path = std::vector<sf::Vector2f>(runtimeScenesPathDatas->globalPaths.at(pathName));

    }
    else
    {
        path = std::vector<sf::Vector2f>(GetPath(pathName));
    }

    isPathLoaded = true;
}

std::vector<gd::String> PathBehavior::GetListOfPathsNames() const
{
    std::vector<gd::String> names;
    for(std::map<gd::String, std::vector<sf::Vector2f> >::const_iterator it = localePaths.begin(); it != localePaths.end(); it++)
    {
        names.push_back((*it).first);
    }

    return names;
}

void PathBehavior::DeleteAllPaths()
{
    localePaths.clear();
}

void PathBehavior::SetCurrentSegment(std::size_t seg)
{
    futureSegment = seg;
}

int PathBehavior::GetCurrentSegment()
{
    return futureSegment == -1 ? currentSegment : futureSegment;
}

float PathBehavior::GetPositionOnSegment()
{
    return futurePosition == -1 ? (timeOnSegment / totalSegmentTime) : futurePosition;
}

void PathBehavior::SetPositionOnSegment(float pos)
{
    //timeOnSegment = pos * totalSegmentTime;
    futurePosition = pos;
}

gd::String PathBehavior::GetStringFromCoordsVector(const std::vector<sf::Vector2f> &vec, char32_t coordsSep, char32_t composantSep)
{
    gd::String coordsStr;

	for (std::size_t a = 0; a < vec.size(); a++)
	{
	    coordsStr += gd::String::From(vec.at(a).x);
        coordsStr.push_back(composantSep);
        coordsStr += gd::String::From(vec.at(a).y);
	    if(a != vec.size() - 1)
            coordsStr.push_back(coordsSep);
	}

	return coordsStr;
}

std::vector<sf::Vector2f> PathBehavior::GetCoordsVectorFromString(const gd::String &str, char32_t coordsSep, char32_t composantSep)
{
    std::vector<sf::Vector2f> coordsVec;

    std::vector<gd::String> coordsDecomposed = str.Split(coordsSep);

    for(std::size_t a = 0; a < coordsDecomposed.size(); a++)
    {
        std::vector<gd::String> coordXY = coordsDecomposed.at(a).Split(composantSep);

        if(coordXY.size() != 2)
            continue;

        sf::Vector2f newCoord(coordXY.at(0).To<float>(), coordXY.at(1).To<float>());
        coordsVec.push_back(newCoord);
    }

    return coordsVec;
}

#define PI 3.14159265

float PathBehavior::GetAngleOfSegment(sf::Vector2f &seg)
{
    float norm = std::abs(sqrtf(pow(seg.x, 2) + pow(seg.y,2)));

    if(seg.y >= 0)
    {
        return acos(seg.x / norm) * 180.0 / PI;
    }
    else
    {
        return -acos(seg.x / norm) * 180.0 / PI;
    }
}
