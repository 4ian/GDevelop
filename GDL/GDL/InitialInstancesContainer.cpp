/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include <iostream>
#include <map>
#include "GDL/Position.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/CommonTools.h"
#include "InitialInstancesContainer.h"

InitialPosition InitialInstancesContainer::badPosition;

unsigned int InitialInstancesContainer::GetInstancesCount() const
{
    return initialInstances.size();
}

const InitialPosition & InitialInstancesContainer::GetInstance(unsigned int index) const
{
    if ( index > initialInstances.size() ) return badPosition;

    return initialInstances[index];
}

InitialPosition & InitialInstancesContainer::GetInstance(unsigned int index)
{
    if ( index > initialInstances.size() ) return badPosition;

    return initialInstances[index];
}

void InitialInstancesContainer::InsertNewInitialInstance()
{
    InitialPosition newInstance;
    initialInstances.push_back(newInstance);
}

void InitialInstancesContainer::RemoveInstance(unsigned int index)
{
    if ( index > initialInstances.size() ) return;

    initialInstances.erase(initialInstances.begin()+index);
}

void InitialInstancesContainer::LoadFromXml(const TiXmlElement * rootElem)
{
    if ( rootElem == NULL ) return;
    const TiXmlElement * elem = rootElem->FirstChildElement();

    while ( elem )
    {
        InitialPosition newPosition;

        if ( elem->Attribute( "nom" ) != NULL ) newPosition.SetObjectName(elem->Attribute("nom"));
        if ( elem->Attribute( "x" ) != NULL ) newPosition.SetX(ToFloat(elem->Attribute("x")));
        if ( elem->Attribute( "y" ) != NULL ) newPosition.SetY(ToFloat(elem->Attribute("y")));
        if ( elem->Attribute( "angle" ) != NULL ) newPosition.SetAngle(ToFloat(elem->Attribute("angle")));
        newPosition.SetHasCustomSize( elem->Attribute( "personalizedSize" ) != NULL && std::string(elem->Attribute( "personalizedSize" )) == "true" );
        if ( elem->Attribute( "width" ) != NULL ) newPosition.SetWidth(ToFloat(elem->Attribute("width")));
        if ( elem->Attribute( "height" ) != NULL ) newPosition.SetHeight(ToFloat(elem->Attribute("height")));
        if ( elem->Attribute( "plan" ) != NULL ) newPosition.SetZOrder(ToInt(elem->Attribute("plan")));
        if ( elem->Attribute( "layer" ) != NULL ) newPosition.SetLayer(elem->Attribute("layer"));

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

#if defined(GD_IDE_ONLY)
void InitialInstancesContainer::InsertInitialInstance(const gd::InitialInstance & instance)
{
    try
    {
        const InitialPosition & castedInstance = dynamic_cast<const InitialPosition&>(instance);
        initialInstances.push_back(castedInstance);
    }
    catch(...) { std::cout << "WARNING: Tried to add an InitialPosition which is not a GD C++ Platform InitialPosition to a GD C++ Platform project"; }
}

void InitialInstancesContainer::RenameInstancesOfObject(const std::string & oldName, const std::string & newName)
{
    for (unsigned int i = 0;i<initialInstances.size();++i)
    {
        if ( initialInstances[i].GetObjectName() == oldName )
            initialInstances[i].SetObjectName(newName);
    }
}

void InitialInstancesContainer::RemoveInitialInstancesOfObject(const std::string & objectName)
{
    for (unsigned int i = initialInstances.size()-1;i<initialInstances.size();--i)
    {
        if ( initialInstances[i].GetObjectName() == objectName )
            initialInstances.erase(initialInstances.begin()+i);
    }
}

void InitialInstancesContainer::RemoveAllInstancesOnLayer(const std::string & layerName)
{
    for (unsigned int i = initialInstances.size()-1;i<initialInstances.size();--i)
    {
        if ( initialInstances[i].GetLayer() == layerName )
            initialInstances.erase(initialInstances.begin()+i);
    }
}

void InitialInstancesContainer::MoveInstancesToLayer(const std::string & fromLayer, const std::string & toLayer)
{
    for (unsigned int i = 0;i<initialInstances.size();++i)
    {
        if ( initialInstances[i].GetLayer() == fromLayer )
            initialInstances[i].SetLayer(toLayer);
    }
}


void InitialInstancesContainer::Create(const gd::InitialInstancesContainer & source)
{
    try
    {
        const InitialInstancesContainer & castedSource = dynamic_cast<const InitialInstancesContainer&>(source);
        operator=(castedSource);
    }
    catch(...) { std::cout << "WARNING: Tried to create a InitialInstancesContainer object from an object which is not a InitialInstancesContainer"; }
}

void InitialInstancesContainer::SaveToXml(TiXmlElement * element) const
{
    if ( element == NULL ) return;

    for (unsigned int j = 0;j < initialInstances.size();++j)
    {
        TiXmlElement * objet = new TiXmlElement( "Objet" );
        element->LinkEndChild( objet );
        objet->SetAttribute( "nom", initialInstances[j].GetObjectName().c_str() );
        objet->SetDoubleAttribute( "x", initialInstances[j].GetX() );
        objet->SetDoubleAttribute( "y", initialInstances[j].GetY() );
        objet->SetAttribute( "plan", initialInstances[j].GetZOrder() );
        objet->SetAttribute( "layer", initialInstances[j].GetLayer().c_str() );
        objet->SetDoubleAttribute( "angle", initialInstances[j].GetAngle() );
        objet->SetAttribute( "personalizedSize", initialInstances[j].HasCustomSize() ? "true" : "false" );
        objet->SetDoubleAttribute( "width", initialInstances[j].GetWidth() );
        objet->SetDoubleAttribute( "height", initialInstances[j].GetHeight() );

        TiXmlElement * floatInfos = new TiXmlElement( "floatInfos" );
        objet->LinkEndChild( floatInfos );

        for(std::map<std::string, float>::const_iterator floatInfo = initialInstances[j].floatInfos.begin(); floatInfo != initialInstances[j].floatInfos.end(); ++floatInfo)
        {
            TiXmlElement * info = new TiXmlElement( "Info" );
            floatInfos->LinkEndChild( info );
            info->SetAttribute( "name", floatInfo->first.c_str());
            info->SetDoubleAttribute( "value", floatInfo->second);
        }

        TiXmlElement * stringInfos = new TiXmlElement( "stringInfos" );
        objet->LinkEndChild( stringInfos );

        for(std::map<std::string, std::string>::const_iterator stringInfo = initialInstances[j].stringInfos.begin(); stringInfo != initialInstances[j].stringInfos.end(); ++stringInfo)
        {
            TiXmlElement * info = new TiXmlElement( "Info" );
            stringInfos->LinkEndChild( info );
            info->SetAttribute( "name", stringInfo->first.c_str());
            info->SetAttribute( "value", stringInfo->second.c_str());
        }

        TiXmlElement * initialVariables = new TiXmlElement( "InitialVariables" );
        objet->LinkEndChild( initialVariables );
        initialInstances[j].GetVariables().SaveToXml(initialVariables);
    }
}
#endif
