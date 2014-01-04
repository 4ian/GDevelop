/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include <iostream>
#include <algorithm>
#include <map>
#include "GDCore/PlatformDefinition/InitialInstancesContainer.h"
#include "GDCore/PlatformDefinition/InitialInstance.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/CommonTools.h"

namespace gd
{

gd::InitialInstance InitialInstancesContainer::badPosition;

InitialInstancesContainer::~InitialInstancesContainer()
{
}

unsigned int InitialInstancesContainer::GetInstancesCount() const
{
    return initialInstances.size();
}

void InitialInstancesContainer::LoadFromXml(const TiXmlElement * rootElem)
{
    if ( rootElem == NULL ) return;
    const TiXmlElement * elem = rootElem->FirstChildElement();

    while ( elem )
    {
        gd::InitialInstance newPosition;

        if ( elem->Attribute( "nom" ) != NULL ) newPosition.SetObjectName(elem->Attribute("nom"));
        if ( elem->Attribute( "x" ) != NULL ) newPosition.SetX(ToFloat(elem->Attribute("x")));
        if ( elem->Attribute( "y" ) != NULL ) newPosition.SetY(ToFloat(elem->Attribute("y")));
        if ( elem->Attribute( "angle" ) != NULL ) newPosition.SetAngle(ToFloat(elem->Attribute("angle")));
        newPosition.SetHasCustomSize( elem->Attribute( "personalizedSize" ) != NULL && std::string(elem->Attribute( "personalizedSize" )) == "true" );
        if ( elem->Attribute( "width" ) != NULL ) newPosition.SetCustomWidth(ToFloat(elem->Attribute("width")));
        if ( elem->Attribute( "height" ) != NULL ) newPosition.SetCustomHeight(ToFloat(elem->Attribute("height")));
        if ( elem->Attribute( "plan" ) != NULL ) newPosition.SetZOrder(ToInt(elem->Attribute("plan")));
        if ( elem->Attribute( "layer" ) != NULL ) newPosition.SetLayer(elem->Attribute("layer"));
        #if defined(GD_IDE_ONLY)
        newPosition.SetLocked( elem->Attribute( "locked" ) != NULL && std::string(elem->Attribute( "locked" )) == "true" );
        #endif

        const TiXmlElement * floatInfos = elem->FirstChildElement( "floatInfos" );
        if ( floatInfos ) floatInfos = floatInfos->FirstChildElement("Info");
        while ( floatInfos )
        {
            if ( floatInfos->Attribute("name") != NULL && floatInfos->Attribute("value") != NULL )
            {
                float value = 0;
                floatInfos->QueryFloatAttribute("value", &value);
                newPosition.floatInfos[floatInfos->Attribute("name")] = value;
            }

            floatInfos = floatInfos->NextSiblingElement();
        }

        const TiXmlElement * stringInfos = elem->FirstChildElement( "stringInfos" );
        if ( stringInfos ) stringInfos = stringInfos->FirstChildElement("Info");
        while ( stringInfos )
        {
            if ( stringInfos->Attribute("name") != NULL && stringInfos->Attribute("value") != NULL )
                newPosition.stringInfos[stringInfos->Attribute("name")] = stringInfos->Attribute("value");

            stringInfos = stringInfos->NextSiblingElement();
        }

        newPosition.GetVariables().LoadFromXml(elem->FirstChildElement( "InitialVariables" ));

        initialInstances.push_back( newPosition );
        elem = elem->NextSiblingElement();
    }
}


void InitialInstancesContainer::IterateOverInstances(gd::InitialInstanceFunctor & func)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end; ++it)
        func(*it);
}

namespace
{

struct InstancesZOrderSort
{
   bool operator ()(gd::InitialInstance * a, gd::InitialInstance * b) const
   {
      return a->GetZOrder() < b->GetZOrder();
   }
};

}

void InitialInstancesContainer::IterateOverInstancesWithZOrdering(gd::InitialInstanceFunctor & func, const std::string & layerName)
{
    std::vector<gd::InitialInstance*> sortedInstances;
    sortedInstances.reserve(initialInstances.size());
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end; ++it)
    {
        if (it->GetLayer() == layerName )
            sortedInstances.push_back(&(*it));
    }

    std::sort(sortedInstances.begin(), sortedInstances.end(), gd::InstancesZOrderSort());
    for (unsigned int i = 0;i<sortedInstances.size();++i)
        func(*sortedInstances[i]);
}

#if defined(GD_IDE_ONLY)
gd::InitialInstance & InitialInstancesContainer::InsertNewInitialInstance()
{
    gd::InitialInstance newInstance;
    initialInstances.push_back(newInstance);

    return initialInstances.back();
}

void InitialInstancesContainer::RemoveInstance(const gd::InitialInstance & instance)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end;)
    {
        if ( &(*it) == &instance )
            it = initialInstances.erase(it);
        else
            ++it;
    }
}

gd::InitialInstance & InitialInstancesContainer::InsertInitialInstance(const gd::InitialInstance & instance)
{
    try
    {
        const gd::InitialInstance & castedInstance = dynamic_cast<const gd::InitialInstance&>(instance);
        initialInstances.push_back(castedInstance);

        return initialInstances.back();
    }
    catch(...) { std::cout << "WARNING: Tried to add an gd::InitialInstance which is not a GD C++ Platform gd::InitialInstance to a GD C++ Platform project"; }

    return badPosition;
}

void InitialInstancesContainer::RenameInstancesOfObject(const std::string & oldName, const std::string & newName)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end; ++it)
    {
        if ( (*it).GetObjectName() == oldName )
            (*it).SetObjectName(newName);
    }
}

void InitialInstancesContainer::RemoveInitialInstancesOfObject(const std::string & objectName)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end;)
    {
        if ( (*it).GetObjectName() == objectName )
            it = initialInstances.erase(it);
        else
            ++it;
    }
}

void InitialInstancesContainer::RemoveAllInstancesOnLayer(const std::string & layerName)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end;)
    {
        if ( (*it).GetLayer() == layerName )
            it = initialInstances.erase(it);
        else
            ++it;
    }
}

void InitialInstancesContainer::MoveInstancesToLayer(const std::string & fromLayer, const std::string & toLayer)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end; ++it)
    {
        if ( (*it).GetLayer() == fromLayer )
            (*it).SetLayer(toLayer);
    }
}

bool InitialInstancesContainer::SomeInstancesAreOnLayer(const std::string & layerName)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end; ++it)
    {
        if ( (*it).GetLayer() == layerName )
            return true;
    }
    return false;
}

void InitialInstancesContainer::Create(const InitialInstancesContainer & source)
{
    try
    {
        const InitialInstancesContainer & castedSource = dynamic_cast<const InitialInstancesContainer&>(source);
        operator=(castedSource);
    }
    catch(...) { std::cout << "WARNING: Tried to create a GD C++ Platform InitialInstancesContainer object from an object which is not of the same type."; }
}

void InitialInstancesContainer::SaveToXml(TiXmlElement * element) const
{
    if ( element == NULL ) return;

    for (std::list<gd::InitialInstance>::const_iterator it = initialInstances.begin(), end = initialInstances.end(); it != end; ++it)
    {
        TiXmlElement * objet = new TiXmlElement( "Objet" );
        element->LinkEndChild( objet );
        objet->SetAttribute( "nom", (*it).GetObjectName().c_str() );
        objet->SetDoubleAttribute( "x", (*it).GetX() );
        objet->SetDoubleAttribute( "y", (*it).GetY() );
        objet->SetAttribute( "plan", (*it).GetZOrder() );
        objet->SetAttribute( "layer", (*it).GetLayer().c_str() );
        objet->SetDoubleAttribute( "angle", (*it).GetAngle() );
        objet->SetAttribute( "personalizedSize", (*it).HasCustomSize() ? "true" : "false" );
        objet->SetDoubleAttribute( "width", (*it).GetCustomWidth() );
        objet->SetDoubleAttribute( "height", (*it).GetCustomHeight() );
        objet->SetAttribute( "locked", (*it).IsLocked() ? "true" : "false" );

        TiXmlElement * floatInfos = new TiXmlElement( "floatInfos" );
        objet->LinkEndChild( floatInfos );

        for(std::map<std::string, float>::const_iterator floatInfo = (*it).floatInfos.begin(); floatInfo != (*it).floatInfos.end(); ++floatInfo)
        {
            TiXmlElement * info = new TiXmlElement( "Info" );
            floatInfos->LinkEndChild( info );
            info->SetAttribute( "name", floatInfo->first.c_str());
            info->SetDoubleAttribute( "value", floatInfo->second);
        }

        TiXmlElement * stringInfos = new TiXmlElement( "stringInfos" );
        objet->LinkEndChild( stringInfos );

        for(std::map<std::string, std::string>::const_iterator stringInfo = (*it).stringInfos.begin(); stringInfo != (*it).stringInfos.end(); ++stringInfo)
        {
            TiXmlElement * info = new TiXmlElement( "Info" );
            stringInfos->LinkEndChild( info );
            info->SetAttribute( "name", stringInfo->first.c_str());
            info->SetAttribute( "value", stringInfo->second.c_str());
        }

        TiXmlElement * initialVariables = new TiXmlElement( "InitialVariables" );
        objet->LinkEndChild( initialVariables );
        (*it).GetVariables().SaveToXml(initialVariables);
    }
}
#endif

InitialInstanceFunctor::~InitialInstanceFunctor()
{
};

}
