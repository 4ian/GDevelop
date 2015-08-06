/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "SceneStack.h"
#include "RuntimeScene.h"
#include "RuntimeGame.h"
#include "CodeExecutionEngine.h"
#include "SceneNameMangler.h"

bool SceneStack::Step()
{
	if (stack.empty()) return false;

	auto scene = stack.back();
	if (scene->RenderAndStep())
	{
		auto request = scene->GetRequestedChange();
        if (request.change == RuntimeScene::SceneChange::STOP_GAME) {
            return false;
        } else if (request.change == RuntimeScene::SceneChange::POP_SCENE) {
        	Pop();
        } else if (request.change == RuntimeScene::SceneChange::PUSH_SCENE) {
        	Push(request.requestedScene);
        } else if (request.change == RuntimeScene::SceneChange::REPLACE_SCENE) {
            Replace(request.requestedScene);
        } else if (request.change == RuntimeScene::SceneChange::CLEAR_SCENES) {
        	Replace(request.requestedScene, true);
        } else {
        	if (errorCallback) errorCallback("Unrecognized change in scene stack.");
        	return false;
        }
	}

	return true;
}

std::shared_ptr<RuntimeScene> SceneStack::Pop()
{
	if (stack.size() <= 1) return std::shared_ptr<RuntimeScene>();

	auto scene = stack.back();
	stack.pop_back();
	return scene;
}

std::shared_ptr<RuntimeScene> SceneStack::Push(gd::String newSceneName)
{
    if (!game.HasLayoutNamed(newSceneName))
    {
        if (errorCallback) errorCallback("Scene \"" + newSceneName + "\" does not exist.");
        return std::shared_ptr<RuntimeScene>();
    }

	auto newScene = std::make_shared<RuntimeScene>(window, &game);
    if (!newScene->LoadFromScene(game.GetLayout(newSceneName)))
    {
        if (errorCallback) errorCallback("Unable to load scene \"" + newSceneName + "\".");
        return std::shared_ptr<RuntimeScene>();
    }

    if (!codeLibraryName.empty() &&
        !newScene->GetCodeExecutionEngine()->LoadFromDynamicLibrary(codeLibraryName,
        "GDSceneEvents"+gd::SceneNameMangler::GetMangledSceneName(newScene->GetName())))
    {
        if (errorCallback) errorCallback("Unable to setup execution engine for scene \"" + newScene->GetName() + "\".");
        return std::shared_ptr<RuntimeScene>();
    }

    newScene->ChangeRenderWindow(window);
	stack.push_back(newScene);
	return newScene;
}

std::shared_ptr<RuntimeScene> SceneStack::Replace(gd::String newSceneName, bool clear)
{
    if (clear)
    {
        while (!stack.empty()) stack.pop_back();
    }
    else
    {
        if (!stack.empty()) stack.pop_back();
    }
	return Push(newSceneName);
}
