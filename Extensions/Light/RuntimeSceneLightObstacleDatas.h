/**

GDevelop - Light Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef RUNTIMESCENELIGHTOBSTACLEDATAS_H
#define RUNTIMESCENELIGHTOBSTACLEDATAS_H
#include <vector>
#include "GDCpp/BehaviorsRuntimeSharedData.h"
class SceneLightObstacleDatas;
class LightObstacleBehavior;

/**
 * Datas shared by A Star Behavior at runtime
 */
class GD_EXTENSION_API RuntimeSceneLightObstacleDatas : public BehaviorsRuntimeSharedData
{
public:
    RuntimeSceneLightObstacleDatas(const SceneLightObstacleDatas & behaviorSharedDatas);
    virtual ~RuntimeSceneLightObstacleDatas();
    virtual std::shared_ptr<BehaviorsRuntimeSharedData> Clone() const { return std::shared_ptr<BehaviorsRuntimeSharedData>(new RuntimeSceneLightObstacleDatas(*this));}

    float gridWidth;
    float gridHeight;
    bool diagonalMove;

private:
};

#endif // RUNTIMESCENELIGHTOBSTACLEDATAS_H

