/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "BehaviorsRuntimeSharedDataHolder.h"
#include "GDCpp/BehaviorsRuntimeSharedData.h"
#include "GDCpp/BehaviorsSharedData.h"
#include <iostream>

const std::shared_ptr<BehaviorsRuntimeSharedData> & BehaviorsRuntimeSharedDataHolder::GetBehaviorSharedData(const gd::String & behaviorName) const
{
	return behaviorsSharedDatas.find(behaviorName)->second;
}

void BehaviorsRuntimeSharedDataHolder::LoadFrom(const std::map < gd::String, std::shared_ptr<gd::BehaviorsSharedData> > & sharedData)
{
    behaviorsSharedDatas.clear();
    for(std::map < gd::String, std::shared_ptr<gd::BehaviorsSharedData> >::const_iterator it = sharedData.begin();
        it != sharedData.end();
        ++it)
    {
    	if (it->second == std::shared_ptr<gd::BehaviorsSharedData>()) continue;
        std::shared_ptr<BehaviorsRuntimeSharedData> data = it->second->CreateRuntimeSharedDatas();

        if ( data )
            behaviorsSharedDatas[it->first] = data;
        else
            std::cout << "ERROR: Unable to create shared data for behavior \"" << it->second->GetName() <<"\".";
    }
}

BehaviorsRuntimeSharedDataHolder::BehaviorsRuntimeSharedDataHolder(const BehaviorsRuntimeSharedDataHolder & other)
{
    Init(other);
}

BehaviorsRuntimeSharedDataHolder& BehaviorsRuntimeSharedDataHolder::operator=(const BehaviorsRuntimeSharedDataHolder & other)
{
    if( (this) != &other )
        Init(other);

    return *this;
}

void BehaviorsRuntimeSharedDataHolder::Init(const BehaviorsRuntimeSharedDataHolder & other)
{
    behaviorsSharedDatas.clear();
    for (std::map < gd::String, std::shared_ptr<BehaviorsRuntimeSharedData> >::const_iterator it = other.behaviorsSharedDatas.begin();
         it != other.behaviorsSharedDatas.end();++it)
    {
    	behaviorsSharedDatas[it->first] = it->second->Clone();
    }
}
