/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDCore/PlatformDefinition/ClassWithObjects.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/TinyXml/tinyxml.h"

namespace gd
{

ClassWithObjects::ClassWithObjects()
{
}

#if defined(GD_IDE_ONLY)
void ClassWithObjects::SaveObjectsToXml(TiXmlElement * element) const
{
    for ( unsigned int j = 0;j < initialObjects.size();j++ )
    {
        TiXmlElement * objet = new TiXmlElement( "Objet" );
        element->LinkEndChild( objet );

        objet->SetAttribute( "nom", initialObjects.at( j )->GetName().c_str() );
        objet->SetAttribute( "type", initialObjects.at( j )->GetType().c_str() );

        initialObjects[j]->SaveToXml(objet);
    }
}
#endif

void ClassWithObjects::LoadObjectsFromXml(gd::Project & project, const TiXmlElement * element)
{
    const TiXmlElement * elemScene = element->FirstChildElement("Objet");

    while ( elemScene )
    {
        //Nom
        std::string name;
        if ( elemScene->Attribute( "nom" ) != NULL ) { name = elemScene->Attribute( "nom" ); }

        std::string type = "Sprite"; //Compatibility with Game Develop 1.2 and inferior
        if ( elemScene->Attribute( "type" ) != NULL ) { type = elemScene->Attribute( "type" ); }

        //Objet vide
        boost::shared_ptr<gd::Object> newObject = project.CreateObject(type, name);

        if ( newObject != boost::shared_ptr<gd::Object>() )
        {
            newObject->LoadFromXml(project, elemScene);
            initialObjects.push_back( newObject );
        }
        else
            std::cout << "Unknown object type:" << type << std::endl;

        elemScene = elemScene->NextSiblingElement();
    }
}

bool ClassWithObjects::HasObjectNamed(const std::string & name) const
{
    return ( find_if(initialObjects.begin(), initialObjects.end(), bind2nd(gd::ObjectHasName(), name)) != initialObjects.end() );
}
gd::Object & ClassWithObjects::GetObject(const std::string & name)
{
    return *(*find_if(initialObjects.begin(), initialObjects.end(), bind2nd(gd::ObjectHasName(), name)));
}
const gd::Object & ClassWithObjects::GetObject(const std::string & name) const
{
    return *(*find_if(initialObjects.begin(), initialObjects.end(), bind2nd(gd::ObjectHasName(), name)));
}
gd::Object & ClassWithObjects::GetObject(unsigned int index)
{
    return *initialObjects[index];
}
const gd::Object & ClassWithObjects::GetObject (unsigned int index) const
{
    return *initialObjects[index];
}
unsigned int ClassWithObjects::GetObjectPosition(const std::string & name) const
{
    for (unsigned int i = 0;i<initialObjects.size();++i)
    {
        if ( initialObjects[i]->GetName() == name ) return i;
    }
    return std::string::npos;
}
unsigned int ClassWithObjects::GetObjectsCount() const
{
    return initialObjects.size();
}
#if defined(GD_IDE_ONLY)
void ClassWithObjects::InsertNewObject(gd::Project & project, const std::string & objectType, const std::string & name, unsigned int position)
{
    boost::shared_ptr<gd::Object> newObject = project.GetCurrentPlatform().CreateObject(objectType, name);
    if (position<initialObjects.size())
        initialObjects.insert(initialObjects.begin()+position, newObject);
    else
        initialObjects.push_back(newObject);
}
#endif

void ClassWithObjects::InsertObject(const gd::Object & object, unsigned int position)
{
    boost::shared_ptr<gd::Object> newObject = boost::shared_ptr<gd::Object>(object.Clone());
    if (position<initialObjects.size())
        initialObjects.insert(initialObjects.begin()+position, newObject);
    else
        initialObjects.push_back(newObject);
}

void ClassWithObjects::SwapObjects(unsigned int firstObjectIndex, unsigned int secondObjectIndex)
{
    if ( firstObjectIndex >= initialObjects.size() || secondObjectIndex >= initialObjects.size() )
        return;

    boost::shared_ptr<gd::Object> temp = initialObjects[firstObjectIndex];
    initialObjects[firstObjectIndex] = initialObjects[secondObjectIndex];
    initialObjects[secondObjectIndex] = temp;
}

void ClassWithObjects::RemoveObject(const std::string & name)
{
    std::vector< boost::shared_ptr<gd::Object> >::iterator object = find_if(initialObjects.begin(), initialObjects.end(), bind2nd(ObjectHasName(), name));
    if ( object == initialObjects.end() ) return;

    initialObjects.erase(object);
}

}
