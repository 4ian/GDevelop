/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_OBJECTGROUP_H
#define GDCORE_OBJECTGROUP_H
#include <vector>
#include "GDCore/String.h"
#include <utility>
namespace gd { class SerializerElement; }

namespace gd
{

/**
 * \brief Represents an object group.
 *
 * Objects groups do not really contains objects : They are just used in events, so as to create events which can be applied to several objects.
 *
 * \see gd::GroupHasTheSameName
 * \ingroup PlatformDefinition
 */
class GD_CORE_API ObjectGroup
{
public:

    ObjectGroup() {};
    virtual ~ObjectGroup() {};

    /**
     * \brief Return true if an object is found inside the ObjectGroup.
     */
    bool Find(const gd::String & name) const;

    /**
     * \brief Add an object name to the group.
     */
    void AddObject(const gd::String & name);

    /**
     * \brief Remove an object name from the group
     */
    void RemoveObject(const gd::String & name);

    /** \brief Get group name
     */
    inline const gd::String & GetName() const { return name; };

    /** \brief Change group name
     */
    inline void SetName(const gd::String & name_) {name = name_;};

    /**
     * \brief Get a vector with objects names.
     */
    inline const std::vector < gd::String > & GetAllObjectsNames() const
    {
        return memberObjects;
    }

    /**
     * \brief Serialize instances container.
     */
    static void SerializeTo(const std::vector < gd::ObjectGroup > & list, SerializerElement & element);

    /**
     * \brief Unserialize the instances container.
     */
    static void UnserializeFrom(std::vector < gd::ObjectGroup > & list, const SerializerElement & element);

private:
    std::vector < gd::String > memberObjects;
    gd::String name; ///< Group name
};

/**
 * \brief Functor to easily find an object group with a specific name.
 *
 * Usage example:
 * \code
 * vector< gd::ObjectGroup >::const_iterator myGroup = find_if(layout.GetObjectGroups().begin(), layout.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), "myGroup"));
 * if ( myGroup != layout.GetObjectGroups().end() )
 * {
 *     //...
 * }
 * \endcode
 *
 * \see gd::ObjectGroup
 */
struct GroupHasTheSameName : public std::binary_function<ObjectGroup, gd::String, bool>
{
    bool operator ()( const ObjectGroup & group, const gd::String & name ) const
    {
        return group.GetName() == name;
    }
};

}

#endif // GDCORE_OBJECTGROUP_H
