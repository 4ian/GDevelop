/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AutomatismsRuntimeSharedDataHolder.h"
#include "GDCpp/AutomatismsRuntimeSharedData.h"
#include "GDCpp/AutomatismsSharedData.h"
#include <iostream>

const boost::shared_ptr<AutomatismsRuntimeSharedData> & AutomatismsRuntimeSharedDataHolder::GetAutomatismSharedData(const std::string & automatismName) const
{
	return automatismsSharedDatas.find(automatismName)->second;
}

void AutomatismsRuntimeSharedDataHolder::LoadFrom(const std::map < std::string, boost::shared_ptr<gd::AutomatismsSharedData> > & sharedData)
{
    automatismsSharedDatas.clear();
    for(std::map < std::string, boost::shared_ptr<gd::AutomatismsSharedData> >::const_iterator it = sharedData.begin();
        it != sharedData.end();
        ++it)
    {
    	if (it->second == boost::shared_ptr<gd::AutomatismsSharedData>()) continue;
        boost::shared_ptr<AutomatismsRuntimeSharedData> data = it->second->CreateRuntimeSharedDatas();

        if ( data )
            automatismsSharedDatas[it->first] = data;
        else
            std::cout << "ERROR: Unable to create shared data for automatism \"" << it->second->GetName() <<"\".";
    }
}

AutomatismsRuntimeSharedDataHolder::AutomatismsRuntimeSharedDataHolder(const AutomatismsRuntimeSharedDataHolder & other)
{
    Init(other);
}

AutomatismsRuntimeSharedDataHolder& AutomatismsRuntimeSharedDataHolder::operator=(const AutomatismsRuntimeSharedDataHolder & other)
{
    if( (this) != &other )
        Init(other);

    return *this;
}

void AutomatismsRuntimeSharedDataHolder::Init(const AutomatismsRuntimeSharedDataHolder & other)
{
    automatismsSharedDatas.clear();
    for (std::map < std::string, boost::shared_ptr<AutomatismsRuntimeSharedData> >::const_iterator it = other.automatismsSharedDatas.begin();
         it != other.automatismsSharedDatas.end();++it)
    {
    	automatismsSharedDatas[it->first] = it->second->Clone();
    }
}
