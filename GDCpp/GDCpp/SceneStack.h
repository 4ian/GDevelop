/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <string>
#include <vector>
#include <functional>
class RuntimeGame;
class RuntimeScene;
namespace sf { class RenderWindow; }

class GD_API SceneStack {
public:

	SceneStack(RuntimeGame & game_, sf::RenderWindow * window_, std::string codeLibraryName_) :
		game(game_),
		window(window_),
		codeLibraryName(codeLibraryName_)
	{
	};

	bool Step();
	std::shared_ptr<RuntimeScene> Pop();
	std::shared_ptr<RuntimeScene> Push(std::string newSceneName);
	std::shared_ptr<RuntimeScene> Replace(std::string newSceneName);

	void OnError(std::function<void(std::string)> cb) { errorCallback = cb; };

private:
	RuntimeGame & game;
	sf::RenderWindow * window;
	std::string codeLibraryName;
	std::vector<std::shared_ptr<RuntimeScene>> stack;
	std::function<void(std::string)> errorCallback;
};
