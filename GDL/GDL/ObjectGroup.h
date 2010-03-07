/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OBJECTGROUP_H
#define OBJECTGROUP_H
#include <vector>
#include <string>
#include <set>
#include <utility>
#include "GDL/ObjectType.h"
#include "GDL/ObjectIdentifiersManager.h"

using namespace std;

class GD_API ObjectGroup
{
    public:

        ObjectGroup();
        virtual ~ObjectGroup();

        /** Get a vector with only objects names.
         */
        inline vector < string > GetAllObjectsNames() const
        {
            vector < string > objectsNames;
            for (unsigned int i = 0 ;i<memberObjects.size();++i)
            {
            	objectsNames.push_back(memberObjects[i].first);
            }

            return objectsNames;
        }

        inline const vector < std::pair<string, unsigned int> > & GetAllObjectsWithOID() const
        {
            return memberObjects;
        }

        bool Find(string name) const;
        void AddObject(string name);
        void RemoveObject(string name);

        inline string GetName() const { return name; };
        inline unsigned int GetIdentifier() const { return id; }
        inline void SetName(string name_)
        {
            name = name_;

            ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
            id = objectIdentifiersManager->GetOIDfromName(name_);
        };

        bool HasAnIdenticalValue( const set < unsigned int > & list );

    private:
        vector < std::pair<string, unsigned int> > memberObjects; ///<For performance, objects are associated with their objects Id
        string name;
        unsigned int id; ///<As objects, groups must be able to be identifed during runtime with a unique identifier.
};

struct HasTheSameName : public std::binary_function<ObjectGroup, string, bool>
{
    bool operator ()( const ObjectGroup & a1, const string & name ) const
    {
        return a1.GetName() == name;
    }
};

#endif // OBJECTGROUP_H
