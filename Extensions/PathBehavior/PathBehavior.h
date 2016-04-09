/**

GDevelop - Path Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef PATHBEHAVIOR_H
#define PATHBEHAVIOR_H

#include "GDCpp/Runtime/Project/Behavior.h"
#include "GDCpp/Runtime/Project/Object.h"
#include <SFML/System/Vector2.hpp>
#include <map>
class RuntimeScene;
namespace gd { class SerializerElement; }
namespace gd { class Layout; }
class PathBehaviorEditor;
class RuntimeScenePathDatas;

/**
 * Behavior that position object on a predefined path.
 */
class GD_EXTENSION_API PathBehavior : public Behavior
{
friend class PathBehaviorEditor;

public:
    PathBehavior();
    PathBehavior(const PathBehavior &cl);
    PathBehavior& operator=(const PathBehavior &cl);
    void Init(const PathBehavior &cl);

    virtual ~PathBehavior();

    virtual Behavior* Clone() const { return new PathBehavior(*this); }

    #if defined(GD_IDE_ONLY)
    /**
     * Serialize the behavior
     */
    virtual void SerializeTo(gd::SerializerElement & element) const;
    void SerializePathsTo(gd::SerializerElement & element) const;
    #endif

    /**
     * Unserialize the behavior
     */
    virtual void UnserializeFrom(const gd::SerializerElement & element);
    void UnserializePathsFrom(const gd::SerializerElement & element);

    #if defined(GD_IDE_ONLY)
    /**
     * Called when user wants to edit the behavior.
     */
    virtual void EditBehavior( wxWindow* parent, gd::Project & game_, gd::Layout * scene, gd::MainFrameWrapper & mainFrameWrapper_ );
    #endif

    void Reset();
    void EnterSegment(std::size_t segmentNumber);

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
    Get a path stored by the behavior
    */
    const std::vector<sf::Vector2f>& GetPath(const gd::String &_name) const;

    /**
    Modify a path of the behavior but doesn't change the current path
    (note : need to call ChangeCurrentPath even if the path is the current.)
    */
    void SetPath(const gd::String &_name, std::vector<sf::Vector2f> _path);

    /**
    Set a new path to the behavior
    */
    void ChangeCurrentPath(const gd::String &_name);
    const gd::String& GetCurrentPathName() const;

    /**
    Make a copy of the path to make it usable to the behavior.
    Don't need to be called (already call by DoPreStepEvent and DoPostStepEvent if the needed path isn't loaded).
    */
    void LoadPath(RuntimeScene & scene);

    void DeleteAllPaths(); ///< Only used by the editor

    /**
    Return a vector containing the name of all the local paths.
    */
    std::vector<gd::String> GetListOfPathsNames() const;

    void SetCurrentSegment(std::size_t seg);
    int GetCurrentSegment();
    float GetPositionOnSegment(); ///< position belongs to 0 to 1 (percentage of the current segment)
    void SetPositionOnSegment(float pos);

    static gd::String GetStringFromCoordsVector(const std::vector<sf::Vector2f> &vec, char32_t coordsSep = U'\n', char32_t composantSep = U';');
    static std::vector<sf::Vector2f> GetCoordsVectorFromString(const gd::String &str, char32_t coordsSep = U'\n', char32_t composantSep = U';');

private:

    virtual void DoStepPreEvents(RuntimeScene & scene);
    virtual void DoStepPostEvents(RuntimeScene & scene);

    float GetAngleOfSegment(sf::Vector2f &seg);

    //sf::Vector2f has been chosen to represent position, but any simple vector2 class would do the job.
    gd::String pathName; ///< Name of the current path (the path may be not loaded, especially in Edit mode)
    std::vector<sf::Vector2f> path; ///< Copy of current path (used for movement to allow the behavior to reverse it)

    sf::Vector2f offset; ///< Offset of the path relative to the scene's origin
    float speed;
    float timeOnSegment;
    float totalSegmentTime;
    std::size_t currentSegment;

    bool stopAtEnd;
    bool reverseAtEnd;

    bool followAngle; ///< If true, the object is rotated according to the current segment's angle.
    float angleOffset; ///< Angle offset (added to the angle calculated with the segment)

    bool isPathLoaded; ///< True if the path is already loaded, otherwise false.
    int futureSegment; ///< if the current segment has to be changed, it contains a positive number, otherwise -1.
    float futurePosition; ///< if the current position on segment has to be changed, it contains a positive number, otherwise -1.

    std::map<gd::String, std::vector<sf::Vector2f> > localePaths; ///< Contains all the object path

    RuntimeScenePathDatas * runtimeScenesPathDatas;
};

#endif // PATHBEHAVIOR_H
