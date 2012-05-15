/**

Game Develop - Path Automatism Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef PATHAUTOMATISM_H
#define PATHAUTOMATISM_H

#include "GDL/Automatism.h"
#include "GDL/Object.h"
#include <SFML/System/Vector2.hpp>
#include "ScenePathDatas.h"
#include <boost/weak_ptr.hpp>
#include <iostream>
#include <map>
#include <set>
#include "math.h"
class RuntimeScene;
class TiXmlElement;
class Scene;
class PathAutomatismEditor;

/**
 * Automatism that position object on a predefined path.
 */
class GD_EXTENSION_API PathAutomatism : public Automatism
{
    friend class PathAutomatismEditor;

    public:
        PathAutomatism(std::string automatismTypeName);
        PathAutomatism(const PathAutomatism &cl);
        PathAutomatism& operator=(const PathAutomatism &cl);
        void Init(const PathAutomatism &cl);

        virtual ~PathAutomatism();

        virtual Automatism* Clone() { return new PathAutomatism(*this); }

        #if defined(GD_IDE_ONLY)
        /**
         * Save Automatism to XML
         */
        virtual void SaveToXml(TiXmlElement * elem) const;
        void SavePathsFromXml(TiXmlElement * elem) const;
        #endif

        /**
         * Load Automatism from XML
         */
        virtual void LoadFromXml(const TiXmlElement * elem);
        void LoadPathsFromXml(const TiXmlElement * elem);

        #if defined(GD_IDE_ONLY)
        /**
         * Called when user wants to edit the automatism.
         */
        virtual void EditAutomatism( wxWindow* parent, Game & game_, Scene * scene, MainEditorCommand & mainEditorCommand_ );
        #endif

        void Reset();
        void EnterSegment(unsigned int segmentNumber);

        static std::map < const Scene* , ScenePathDatas > scenesPathDatas; ///< Static map associating scene to datas

        float GetOffsetX() const;
        void SetOffsetX(float off);
        float GetOffsetY() const;
        void SetOffsetY(float off);

        void SetReverseAtEnd(bool set = true) {reverseAtEnd = set;};
        bool ReverseAtEnd() const { return reverseAtEnd;};
        void SetStopAtEnd(bool set = true) {stopAtEnd = set;};
        bool StopAtEnd() const { return stopAtEnd;};

        void SetFollowAngle(bool set = true) {followAngle = set;};
        bool FollowAngle() const { return followAngle;};

        void SetSpeed(float sp);
        float GetSpeed() const;

        void SetAngleOffset(float off);
        float GetAngleOffset() const;

        void Reverse();

        /**
        Get a path stored by the automatism
        */
        const std::vector<sf::Vector2f>& GetPath(const std::string &_name) const;

        /**
        Modify a path of the automatism but doesn't change the current path
        (note : need to call ChangeCurrentPath even if the path is the current.)
        */
        void SetPath(const std::string &_name, std::vector<sf::Vector2f> _path);

        /**
        Set a new path to the automatism
        */
        void ChangeCurrentPath(const std::string &_name);
        const std::string& GetCurrentPathName() const;

        /**
        Make a copy of the path to make it usable to the automatism.
        Don't need to be called (already call by DoPreStepEvent and DoPostStepEvent if the needed path isn't loaded).
        */
        void LoadPath(RuntimeScene & scene);

        void DeleteAllPaths(); ///< Only used by the editor

        /**
        Return a vector containing the name of all the local paths.
        */
        std::vector<std::string> GetListOfPathsNames() const;

        void SetCurrentSegment(unsigned int seg);
        int GetCurrentSegment();
        float GetPositionOnSegment(); ///< position belongs to 0 to 1 (percentage of the current segment)
        void SetPositionOnSegment(float pos);

        static std::string GetStringFromCoordsVector(const std::vector<sf::Vector2f> &vec, char coordsSep = '\n', char composantSep = ';');
        static std::vector<sf::Vector2f> GetCoordsVectorFromString(const std::string &str, char coordsSep = '\n', char composantSep = ';');

    private:

        virtual void DoStepPreEvents(RuntimeScene & scene);
        virtual void DoStepPostEvents(RuntimeScene & scene);

        float GetAngleOfSegment(sf::Vector2f &seg);

        //sf::Vector2f has been choosen to represent position, but any simple vector2 class would do the job.
        std::string pathName; ///< Name of the current path (the path may be not loaded, especially in Edit mode)
        std::vector<sf::Vector2f> path; ///< Copie of current path (used for movement to allow the automatism to reverse it)

        sf::Vector2f offset; ///< Offset of the path ralative to the scene's origin
        float speed;
        float timeOnSegment;
        float totalSegmentTime;
        unsigned int currentSegment;

        bool stopAtEnd;
        bool reverseAtEnd;

        bool followAngle; ///< If true, the object is rotated according to the current segment's angle.
        float angleOffset; ///< Angle offset (added to the angle calculated with the segment)

        bool isPathLoaded; ///< True if the path is already loaded, otherwise false.
        int futureSegment; ///< if the current segment has to be changed, it contains a positive number, otherwise -1.
        float futurePosition; ///< if the current position on segment has to be changed, it contains a positive number, otherwise -1.

        std::map<std::string, std::vector<sf::Vector2f> > localePaths; ///< Contains all the object path

        boost::shared_ptr<RuntimeScenePathDatas> runtimeScenesPathDatas;
};

#endif // PATHAUTOMATISM_H
