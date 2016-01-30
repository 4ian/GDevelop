/**

GDevelop - Network Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef RUNTIMESCENENETWORKDATAS_H
#define RUNTIMESCENENETWORKDATAS_H

#include <iostream>
#include "GDCpp/Runtime/BehaviorsRuntimeSharedData.h"
class SceneNetworkDatas;

/**
 * Datas shared by Network Behavior at runtime ( i.e. Nothing )
 */
class GD_EXTENSION_API RuntimeSceneNetworkDatas : public BehaviorsRuntimeSharedData
{
    public:
        RuntimeSceneNetworkDatas(const SceneNetworkDatas & behaviorSharedDatas);
        virtual ~RuntimeSceneNetworkDatas();
        virtual std::shared_ptr<BehaviorsRuntimeSharedData> Clone() const { return std::shared_ptr<BehaviorsRuntimeSharedData>(new RuntimeSceneNetworkDatas(*this));}

    private:
};

#endif // RUNTIMESCENENETWORKDATAS_H

