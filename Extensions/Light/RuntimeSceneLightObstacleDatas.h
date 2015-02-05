/**

GDevelop - Light Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef RUNTIMESCENELIGHTOBSTACLEDATAS_H
#define RUNTIMESCENELIGHTOBSTACLEDATAS_H
#include <vector>
#include "GDCpp/AutomatismsRuntimeSharedData.h"
class SceneLightObstacleDatas;
class LightObstacleAutomatism;

/**
 * Datas shared by A Star Automatism at runtime
 */
class GD_EXTENSION_API RuntimeSceneLightObstacleDatas : public AutomatismsRuntimeSharedData
{
public:
    RuntimeSceneLightObstacleDatas(const SceneLightObstacleDatas & automatismSharedDatas);
    virtual ~RuntimeSceneLightObstacleDatas();
    virtual boost::shared_ptr<AutomatismsRuntimeSharedData> Clone() const { return boost::shared_ptr<AutomatismsRuntimeSharedData>(new RuntimeSceneLightObstacleDatas(*this));}

    float gridWidth;
    float gridHeight;
    bool diagonalMove;

private:
};

#endif // RUNTIMESCENELIGHTOBSTACLEDATAS_H

