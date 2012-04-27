/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_OBJECTGROUP_H
#define GDCORE_OBJECTGROUP_H
#include <vector>
#include <string>
#include <utility>
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#endif


namespace gd
{

/**
 * \brief Represents an object group.
 *
 * Objects groups do not really contains objects : They are just used in events, so as to create events which can be applied to several objects.
 * \note This class is fully implemented in GDCore.
 */
class GD_CORE_API ObjectGroup
{
public:

    ObjectGroup() {};
    virtual ~ObjectGroup() {};

    /**
     * Return true if an object is found inside the ObjectGroup.
     */
    bool Find(const std::string & name) const;

    /**
     * Add an object name to the group.
     */
    void AddObject(const std::string & name);

    /**
     * Remove an object name from the group
     */
    void RemoveObject(const std::string & name);

    /** Get group name
     */
    inline const std::string & GetName() const { return name; };

    /** Change group name
     */
    inline void SetName(const std::string & name_) {name = name_;};

    /**
     * Get a vector with objects names.
     */
    inline const std::vector < std::string > & GetAllObjectsNames() const
    {
        return memberObjects;
    }

private:
    std::vector < std::string > memberObjects;
    std::string name; ///< Group name
};

/**
 * \brief Functor to easily find an object group with a specific name
 * Usage example:
 * \code
 * vector< gd::ObjectGroup >::const_iterator myGroup = find_if(layout.GetObjectGroups().begin(), layout.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), "myGroup"));
 * if ( myGroup != layout.GetObjectGroups().end() )
 * {
 *     //...
 * }
 * \endcode
 */
struct GroupHasTheSameName : public std::binary_function<ObjectGroup, std::string, bool>
{
    bool operator ()( const ObjectGroup & group, const std::string & name ) const
    {
        return group.GetName() == name;
    }
};

}

#endif // GDCORE_OBJECTGROUP_H
