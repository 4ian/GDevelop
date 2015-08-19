/**

GDevelop - Path Behavior Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "RuntimeScenePathDatas.h"
#include "ScenePathDatas.h"

RuntimeScenePathDatas::RuntimeScenePathDatas(const ScenePathDatas & behaviorSharedDatas)
{
    globalPaths = behaviorSharedDatas.globalPaths;
}

RuntimeScenePathDatas::~RuntimeScenePathDatas()
{
}

