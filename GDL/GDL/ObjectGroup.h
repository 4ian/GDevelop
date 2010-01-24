/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Un groupe d'objets contient le nom de plusieurs objets
 */

#ifndef OBJECTGROUP_H
#define OBJECTGROUP_H
#include <vector>
#include <string>
#include <set>
#include "GDL/ObjectType.h"

using namespace std;

class GD_API ObjectGroup
{
    public:

        ObjectGroup();
        virtual ~ObjectGroup();
        /** Access m_objets
         * \return The current value of m_objets
         */
        inline const vector < string > & Getobjets() const { return m_objets; }
        /** Set m_objets
         * \param val New value to set
         */
        void Setobjets(vector < string > val) { m_objets = val; }
        bool Find(string name) const;
        void AddObject(string name);
        void RemoveObject(string name);

        inline string GetName() const { return name; };
        inline void SetName(string name_) { name = name_; };

        bool HasAnIdenticalValue( const set < ObjectType > & list );
        bool HasAnIdenticalValue( const set < string > & list );

    private:
        vector < string > m_objets;
        string name;
};

struct HasTheSameName : public std::binary_function<ObjectGroup, string, bool>
{
    bool operator ()( const ObjectGroup & a1, const string & name ) const
    {
        return a1.GetName() == name;
    }
};

#endif // OBJECTGROUP_H
