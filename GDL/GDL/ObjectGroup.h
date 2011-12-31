/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OBJECTGROUP_H
#define OBJECTGROUP_H
#include <vector>
#include <string>
#include <set>
#include <utility>

/**
 * \brief Represents an object group.
 *
 * Objects groups does not really contains objects : They are just
 * used in events to create events which can be applied to several objects.
 */
class GD_API ObjectGroup
{
    public:

        ObjectGroup();
        virtual ~ObjectGroup() {};

        /**
         * Return true if an object is found inside the ObjectGroup.
         */
        bool Find(std::string name) const;

        /**
         * Add an object name to the group.
         */
        void AddObject(std::string name);

        /**
         * Remove an object name from the group
         */
        void RemoveObject(std::string name);

        /** Get group name
         */
        inline std::string GetName() const { return name; };

        /** Change group name
         */
        inline void SetName(std::string name_) {name = name_;};

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

struct HasTheSameName : public std::binary_function<ObjectGroup, std::string, bool>
{
    bool operator ()( const ObjectGroup & a1, const std::string & name ) const
    {
        return a1.GetName() == name;
    }
};

#endif // OBJECTGROUP_H
