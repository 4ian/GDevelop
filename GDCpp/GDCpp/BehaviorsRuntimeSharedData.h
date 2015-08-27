/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef BEHAVIORSRUNTIMESHAREDDATAS_H
#define BEHAVIORSRUNTIMESHAREDDATAS_H

namespace gd { class BehaviorsSharedData; }
#include <memory>

/**
 * \brief Base class for defining behaviors shared datas used at runtime.
 *
 * Behaviors can use shared datas, as if they were extending the RuntimeScene members.
 * Inherit from this class, and define an appropriate constructor, which will be called by the
 * CreateRuntimeSharedDatas member function of BehaviorsharedDatas.
 *
 * \see BehaviorsharedDatas::CreateRuntimeSharedDatas
 *
 * \ingroup GameEngine
 */
class BehaviorsRuntimeSharedData
{
    public:
        BehaviorsRuntimeSharedData() {};
        virtual ~BehaviorsRuntimeSharedData() {};
        virtual std::shared_ptr<BehaviorsRuntimeSharedData> Clone() const { return std::shared_ptr<BehaviorsRuntimeSharedData>(new BehaviorsRuntimeSharedData(*this));}

};

#endif // BEHAVIORSRUNTIMESHAREDDATAS_H

