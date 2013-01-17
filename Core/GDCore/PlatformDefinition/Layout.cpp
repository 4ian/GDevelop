/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "Layout.h"
#include <string>
#include <vector>
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/PlatformDefinition/ObjectGroup.h"

using namespace std;

namespace gd
{

void Layout::SaveToXml(TiXmlElement * element) const
{

}

void Layout::LoadFromXml(const TiXmlElement * element)
{
}

std::string GD_CORE_API GetTypeOfObject(const gd::Project & project, const gd::Layout & layout, std::string name, bool searchInGroups)
{
    std::string type;

    //Search in objects
    if ( layout.HasObjectNamed(name) )
        type = layout.GetObject(name).GetType();
    else if ( project.HasObjectNamed(name) )
        type = project.GetObject(name).GetType();

    //Search in groups
    if ( searchInGroups )
    {
        for (unsigned int i = 0;i<layout.GetObjectGroups().size();++i)
        {
            if ( layout.GetObjectGroups()[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have the same type.

                vector < string > groupsObjects = layout.GetObjectGroups()[i].GetAllObjectsNames();
                std::string previousType = groupsObjects.empty() ? "" : GetTypeOfObject(project, layout, groupsObjects[0], false);

                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    if ( GetTypeOfObject(project, layout, groupsObjects[j], false) != previousType )
                        return ""; //The group has more than one type.

                }

                if ( !type.empty() && previousType != type )
                    return ""; //The group has objects of different type, so the group has not any type.

                type = previousType;
            }
        }
        for (unsigned int i = 0;i<project.GetObjectGroups().size();++i)
        {
            if ( project.GetObjectGroups()[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have the same type.

                vector < string > groupsObjects = project.GetObjectGroups()[i].GetAllObjectsNames();
                std::string previousType = groupsObjects.empty() ? "" : GetTypeOfObject(project, layout, groupsObjects[0], false);

                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    if ( GetTypeOfObject(project, layout, groupsObjects[j], false) != previousType )
                        return ""; //The group has more than one type.

                }

                if ( !type.empty() && previousType != type )
                    return ""; //The group has objects of different type, so the group has not any type.

                type = previousType;
            }
        }
    }

    return type;
}

std::string GD_CORE_API GetTypeOfAutomatism(const gd::Project & project, const gd::Layout & layout, std::string name, bool searchInGroups)
{
    for (unsigned int i = 0;i<layout.GetObjectsCount();++i)
    {
        vector < std::string > automatisms = layout.GetObject(i).GetAllAutomatismNames();
        for (unsigned int j = 0;j<automatisms.size();++j)
        {
            if ( layout.GetObject(i).GetAutomatism(automatisms[j]).GetName() == name )
                return layout.GetObject(i).GetAutomatism(automatisms[j]).GetTypeName();
        }
    }

    for (unsigned int i = 0;i<project.GetObjectsCount();++i)
    {
        vector < std::string > automatisms = project.GetObject(i).GetAllAutomatismNames();
        for (unsigned int j = 0;j<automatisms.size();++j)
        {
            if ( project.GetObject(i).GetAutomatism(automatisms[j]).GetName() == name )
                return project.GetObject(i).GetAutomatism(automatisms[j]).GetTypeName();
        }
    }

    return "";
}

vector < std::string > GD_CORE_API GetAutomatismsOfObject(const gd::Project & project, const gd::Layout & layout, std::string name, bool searchInGroups)
{
    bool automatismsAlreadyInserted = false;
    vector < std::string > automatims;

    //Search in objects
    if ( layout.HasObjectNamed(name) ) //We check first layout's objects' list.
    {
        vector < std::string > objectAutomatisms = layout.GetObject(name).GetAllAutomatismNames();
        copy(objectAutomatisms.begin(), objectAutomatisms.end(), back_inserter(automatims));
        automatismsAlreadyInserted = true;
    }
    else if ( project.HasObjectNamed(name) ) //Then the global object list
    {
        vector < std::string > objectAutomatisms = project.GetObject(name).GetAllAutomatismNames();
        copy(objectAutomatisms.begin(), objectAutomatisms.end(), back_inserter(automatims));
        automatismsAlreadyInserted = true;
    }

    //Search in groups
    if ( searchInGroups )
    {
        for (unsigned int i = 0;i<layout.GetObjectGroups().size();++i)
        {
            if ( layout.GetObjectGroups()[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have common automatisms.

                vector < string > groupsObjects = layout.GetObjectGroups()[i].GetAllObjectsNames();
                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    //Get automatisms of the object of the group and delete automatism which are not in commons.
                	vector < std::string > objectAutomatisms = GetAutomatismsOfObject(project, layout, groupsObjects[j], false);
                	if (!automatismsAlreadyInserted)
                	{
                	    automatismsAlreadyInserted = true;
                	    automatims = objectAutomatisms;
                	}
                	else
                	{
                        for (unsigned int a = 0 ;a<automatims.size();++a)
                        {
                            if ( find(objectAutomatisms.begin(), objectAutomatisms.end(), automatims[a]) == objectAutomatisms.end() )
                            {
                                automatims.erase(automatims.begin() + a);
                                --a;
                            }
                        }
                	}
                }
            }
        }
        for (unsigned int i = 0;i<project.GetObjectGroups().size();++i)
        {
            if ( project.GetObjectGroups()[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have common automatisms.

                vector < string > groupsObjects = project.GetObjectGroups()[i].GetAllObjectsNames();
                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    //Get automatisms of the object of the group and delete automatism which are not in commons.
                	vector < std::string > objectAutomatisms = GetAutomatismsOfObject(project, layout, groupsObjects[j], false);
                	if (!automatismsAlreadyInserted)
                	{
                	    automatismsAlreadyInserted = true;
                	    automatims = objectAutomatisms;
                	}
                	else
                	{
                        for (unsigned int a = 0 ;a<automatims.size();++a)
                        {
                            if ( find(objectAutomatisms.begin(), objectAutomatisms.end(), automatims[a]) == objectAutomatisms.end() )
                            {
                                automatims.erase(automatims.begin() + a);
                                --a;
                            }
                        }
                	}
                }
            }
        }
    }

    return automatims;
}


}
