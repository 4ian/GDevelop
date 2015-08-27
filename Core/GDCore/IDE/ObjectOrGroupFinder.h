/*
 * GDevelop Core
 * Copyright 2015. Victor Levasseur (victorlevasseur52@gmail.com)
 * This project is released under the MIT License.
 */

#include "GDCore/String.h"
#include <vector>

namespace gd
{

class ObjectGroup;
class Project;
class Layout;

/**
 * \brief Class used to check if other objects or groups have a specific name.
 */
class GD_CORE_API ObjectOrGroupFinder
{
public:

    /**
     * An enum (flag) used by HasObjectOrGroupNamed() to describe where an object with the same name has been found.
     */
    enum HasSameName
    {
        No = 0,
        AsObjectInLayout = 1,
        AsGroupInLayout = 2,
        AsGlobalObject = 4,
        AsGlobalGroup = 8,
        AsObjectInAnotherLayout = 16,
        AsGroupInAnotherLayout = 32,

        InLayout = AsObjectInLayout|AsGroupInLayout,
        InGlobal = AsGlobalObject|AsGlobalGroup,
        InAnotherLayout = AsObjectInAnotherLayout|AsGroupInAnotherLayout,

        Yes = InLayout|InGlobal|InAnotherLayout
    };

    /**
     * Initialize the ObjectOrGroupFinder object
     * \param project the project where it will search for name's occurences
     * \param layout the layout where the object is located/edited (if none, no layouts are considered to be the current one)
     */
    ObjectOrGroupFinder(const Project &project, const Layout *layout = nullptr);

    /**
     * Return a flag (ObjectOrGroupFinder::HasSameName) to tell if an object/group has the search name
     * Note: with allLayouts set to true, it also test the local objects and groups of other layouts.
     */
    unsigned int HasObjectOrGroupNamed(const gd::String &name, bool allLayouts = false);

    /**
     * \return a gd::String containing the list of the layouts containing an object/group with the searched name (from the previous call to HasObjectOrGroupNamed())
     */
    const std::vector<gd::String>& GetLayoutsWithSameObjectName() const;

private:

    bool HasGroupNamed(gd::String name, const std::vector<gd::ObjectGroup> & groups) const;

    const Project &project;
    const Layout *layout;

    std::vector<gd::String> layoutsWithSameObjectName;
};

}