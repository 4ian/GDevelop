/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <vector>
#include <functional>
#include <memory>
#include <GDCpp/Runtime/String.h>
class RuntimeGame;
class RuntimeScene;
namespace gd { class RenderingWindow; }

/**
 * A stack of RuntimeScene.
 */
class GD_API SceneStack {
public:

	/**
	 * \brief Construct a new stack
	 * \param game The RuntimeGame that will be used by scenes.
	 * \param window The sf::RenderWindow to be used to render the scenes.
	 * \param codeLibraryName Filename to a shared library containing the code to execute for scenes.
	 */
	SceneStack(RuntimeGame & game_, gd::RenderingWindow * window_) :
		game(game_),
		window(window_)
	{
	};

	/**
	 * \brief Execute one step of the game.
	 *
	 * RuntimeScene::RenderAndStep is called on the current scene. If a scene change was requested,
	 * the stack is updated.
	 *
	 * This method is typically called in a loop until it returns false.
	 * \return false if game must be stopped.
	 */
	bool Step();

	/**
	 * \brief Stop and remove the current scene from the stack, unless there is
	 * only one or zero scene in the stack.
	 * \return A pointer to the scene removed, or a null pointer if nothing was removed.
	 */
	std::unique_ptr<RuntimeScene> Pop();

	/**
	 * \brief Load a new scene on the top of the stack. This scene becomes the current
	 * scene and is the one played when you call Step.
	 * \param newSceneName The name of the scene to launch, as found in the RuntimeGame.
	 * \return A non owning pointer to the RuntimeScene added or nullptr if loading failed.
	 */
	RuntimeScene * Push(gd::String newSceneName);

	/**
	 * \brief Replace the current scene by a new one. This new scene becomes the current
	 * scene and is the one played when you call Step.
	 * \param newSceneName The name of the scene to launch, as found in the RuntimeGame.
	 * \param clear If set to true, all other scenes will be removed from stack.
	 * \return A non owning pointer to the RuntimeScene added or nullptr if loading failed.
	 */
	RuntimeScene * Replace(gd::String newSceneName, bool clear = false);

	/**
	 * \brief Set the callback called when an error occurs (loading failed...)
	 */
	void OnError(std::function<void(gd::String)> cb) { errorCallback = cb; };

	/**
	 * \brief Set a custom function to call when a scene is pushed on the stack.
	 */
	void OnLoadScene(std::function<bool(RuntimeScene &)> cb) { loadCallback = cb; }

private:
	RuntimeGame & game;
	gd::RenderingWindow * window;
	std::vector<std::unique_ptr<RuntimeScene>> stack;
	std::function<void(gd::String)> errorCallback;
	std::function<bool(RuntimeScene &)> loadCallback;
};
