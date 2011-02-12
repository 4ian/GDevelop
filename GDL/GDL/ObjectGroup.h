/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OBJECTGROUP_H
#define OBJECTGROUP_H
#include <vector>
#include <string>
#include <set>
#include <utility>
#include "GDL/ObjectIdentifiersManager.h"
#include <boost/interprocess/containers/flat_set.hpp>

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

        inline std::string GetName() const { return name; };
        inline unsigned int GetIdentifier() const { return id; }
        inline void SetName(std::string name_)
        {
            name = name_;

            ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::GetInstance();
            id = objectIdentifiersManager->GetOIDfromName(name_);
        };

        /**
         * Get a vector with only objects names.
         */
        inline std::vector < std::string > GetAllObjectsNames() const
        {
            std::vector < std::string > objectsNames;
            for (unsigned int i = 0 ;i<memberObjects.size();++i)
            {
            	objectsNames.push_back(memberObjects[i].first);
            }

            return objectsNames;
        }

        /**
         * Get a vector of pair containing all objects name as well as their objects identifier.
         */
        inline const std::vector < std::pair<std::string, unsigned int> > & GetAllObjectsWithOID() const
        {
            return memberObjects;
        }

        /**
         * True if there at least one similar object between the group and the list.
         */
        bool HasAnIdenticalValue( const boost::interprocess::flat_set < unsigned int > & list );

    private:
        std::vector < std::pair<std::string, unsigned int> > memberObjects; ///<For performance, objects are associated with their objects Id
        std::string name; ///< Group name
        unsigned int id; ///<As objects, groups must be able to be identifed during runtime with a unique identifier.
};

struct HasTheSameName : public std::binary_function<ObjectGroup, std::string, bool>
{
    bool operator ()( const ObjectGroup & a1, const std::string & name ) const
    {
        return a1.GetName() == name;
    }
};

#endif // OBJECTGROUP_H
