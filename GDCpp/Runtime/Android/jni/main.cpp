#include <SFML/System.hpp>
#include <SFML/Window.hpp>
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <SFML/Network.hpp>

#include "GDCpp/Runtime/Force.h"
#include "GDCpp/Runtime/Log.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/CodeExecutionEngine.h"
#include "GDCpp/Runtime/Serialization/Serializer.h"
#include "GDCpp/Runtime/SceneStack.h"
#include "GDCpp/Runtime/ResourcesLoader.h"

using namespace gd;

class RuntimeContext;
/* GDCPP_EVENTS_DECLARATIONS */

//TODO: extension
#include "GDCpp/Extensions/CppPlatform.h"
#include "GDCpp/Extensions/ExtensionBase.h"
extern "C" ExtensionBase * CreateGDCppTextObjectExtension();
extern "C" ExtensionBase * CreateGDCppTopDownMovementBehaviorExtension();
extern "C" ExtensionBase * CreateGDCppDestroyOutsideBehaviorExtension();
extern "C" ExtensionBase * CreateGDCppPhysicsBehaviorExtension();
extern "C" ExtensionBase * CreateGDCppTileMapObjectExtension();
extern "C" ExtensionBase * CreateGDCppTiledSpriteObjectExtension();
extern "C" ExtensionBase * CreateGDCppPlatformBehaviorExtension();
extern "C" ExtensionBase * CreateGDCppPanelSpriteObjectExtension();

//TODO: move me to an android specific
#include <iostream>
#include <android/log.h>
class androidbuf : public std::streambuf {
public:
    enum { bufsize = 128 }; // ... or some other suitable buffer size
    androidbuf() { this->setp(buffer, buffer + bufsize - 1); }

private:
    int overflow(int c)
    {
        if (c == traits_type::eof()) {
            *this->pptr() = traits_type::to_char_type(c);
            this->sbumpc();
        }
        return this->sync()? traits_type::eof(): traits_type::not_eof(c);
    }

    int sync()
    {
        int rc = 0;
        if (this->pbase() != this->pptr()) {
            char writebuf[bufsize+1];
            memcpy(writebuf, this->pbase(), this->pptr() - this->pbase());
            writebuf[this->pptr() - this->pbase()] = '\0';

            rc = __android_log_write(ANDROID_LOG_INFO, "std", writebuf) > 0;
            this->setp(buffer, buffer + bufsize - 1);
        }
        return rc;
    }

    char buffer[bufsize];
};


int main(int argc, char *argv[])
{
    __android_log_write(ANDROID_LOG_ERROR, "GD", "Started game");
    std::cout.rdbuf(new androidbuf);

    sf::RenderWindow window(sf::VideoMode::getDesktopMode(), "");

    //TODO: extension
    CppPlatform::Get().AddExtension(std::shared_ptr<ExtensionBase>(CreateGDCppTextObjectExtension())); std::cout.flush();
    CppPlatform::Get().AddExtension(std::shared_ptr<ExtensionBase>(CreateGDCppTopDownMovementBehaviorExtension())); std::cout.flush();
    CppPlatform::Get().AddExtension(std::shared_ptr<ExtensionBase>(CreateGDCppDestroyOutsideBehaviorExtension())); std::cout.flush();
    CppPlatform::Get().AddExtension(std::shared_ptr<ExtensionBase>(CreateGDCppPhysicsBehaviorExtension())); std::cout.flush();
    CppPlatform::Get().AddExtension(std::shared_ptr<ExtensionBase>(CreateGDCppTileMapObjectExtension())); std::cout.flush();
    CppPlatform::Get().AddExtension(std::shared_ptr<ExtensionBase>(CreateGDCppTiledSpriteObjectExtension())); std::cout.flush();
    CppPlatform::Get().AddExtension(std::shared_ptr<ExtensionBase>(CreateGDCppPlatformBehaviorExtension())); std::cout.flush();
    CppPlatform::Get().AddExtension(std::shared_ptr<ExtensionBase>(CreateGDCppPanelSpriteObjectExtension())); std::cout.flush();

    GDLogBanner();

    gd::Project game;
    gd::String json = gd::ResourcesLoader::Get()->LoadPlainText("gd-project.json");

    SerializerElement rootElement = Serializer::FromJSON(json);
    game.UnserializeFrom(rootElement);

    RuntimeGame runtimeGame;
    runtimeGame.LoadFromProject(game);

    bool abort = false;
    SceneStack sceneStack(runtimeGame, &window);
    sceneStack.OnError([&abort](gd::String error) {
        std::cout << error << std::endl;
        abort = true;
    });
    sceneStack.OnLoadScene([](std::shared_ptr<RuntimeScene> scene) {
        int (*function)(RuntimeContext*) = nullptr;
        /* GDCPP_EVENTS_ASSIGNMENTS */

        if (function)
        {
            scene->GetCodeExecutionEngine()->LoadFunction(function);
            return true;
        }

        return false;
    });

    sceneStack.Push(game.GetLayout(0).GetName());
    while (sceneStack.Step() && !abort)
        ;

    std::cout << "Exiting game" << std::endl;
}
