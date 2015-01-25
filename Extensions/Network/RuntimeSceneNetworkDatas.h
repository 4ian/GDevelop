/**

GDevelop - Network Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef RUNTIMESCENENETWORKDATAS_H
#define RUNTIMESCENENETWORKDATAS_H

#include <iostream>
#include "GDCpp/AutomatismsRuntimeSharedData.h"
class SceneNetworkDatas;

/**
 * Datas shared by Network Automatism at runtime ( i.e. Nothing )
 */
class GD_EXTENSION_API RuntimeSceneNetworkDatas : public AutomatismsRuntimeSharedData
{
    public:
        RuntimeSceneNetworkDatas(const SceneNetworkDatas & automatismSharedDatas);
        virtual ~RuntimeSceneNetworkDatas();
        virtual std::shared_ptr<AutomatismsRuntimeSharedData> Clone() const { return std::shared_ptr<AutomatismsRuntimeSharedData>(new RuntimeSceneNetworkDatas(*this));}

    private:
};

#endif // RUNTIMESCENENETWORKDATAS_H

