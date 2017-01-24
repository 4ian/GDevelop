/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef RUNTIMESCENE_H
#define RUNTIMESCENE_H

#include "GDCpp/Runtime/Project/Layout.h" //This include must be placed first
#include "GDCpp/Runtime/RuntimeVariablesContainer.h"
#include <vector>
#include <string>
#include <map>
#include <memory>
#include <SFML/System.hpp>
#include "GDCpp/Runtime/ObjInstancesHolder.h"
#include "GDCpp/Runtime/RuntimeLayer.h"
#include "GDCpp/Runtime/TimeManager.h"
#include "GDCpp/Runtime/InputManager.h"
#include "GDCpp/Runtime/BehaviorsRuntimeSharedDataHolder.h"
namespace sf { class RenderWindow; }
namespace sf { class Event; }
namespace gd { class RenderingWindow; }
namespace gd { class Project; }
namespace gd { class Object; }
namespace gd { class ImageManager; }
class RuntimeLayer;
class RuntimeGame;
class BehaviorsRuntimeSharedData;
class ExtensionBase;
class CodeExecutionEngine;
#undef GetObject //Disable an annoying macro

#if defined(GD_IDE_ONLY)
class BaseDebugger;
#endif

/**
 * \brief Represents a scene being played.
 *
 * Contains game object instances and all runtime objects needed
 * to play to a scene rendered in a SFML RenderWindow.
 *
 * \ingroup GameEngine
 */
class GD_API RuntimeScene : public Scene
{
public:
    RuntimeScene(gd::RenderingWindow * renderWindow_, RuntimeGame * game_);
    virtual ~RuntimeScene();

    gd::RenderingWindow *                      renderWindow; ///< Pointer to the render window used for display.
    RuntimeGame *                           game; ///< Pointer to the game the scene is linked to.
    #if defined(GD_IDE_ONLY)
    BaseDebugger *                          debugger; ///< Pointer to the debugger. Can be NULL.
    #endif
    ObjInstancesHolder                      objectsInstances; ///< Contains all of the objects on the scene

    /**
     * \brief Provide access to the variables container
     */
    inline const RuntimeVariablesContainer & GetVariables() const { return variables; }

    /**
     * \brief Provide access to the variables container
     */
    inline RuntimeVariablesContainer & GetVariables() { return variables; }

    /**
     * \brief Shortcut for game->GetImageManager()
     * \return The image manager of the game.
     */
    std::shared_ptr<gd::ImageManager> GetImageManager() const;

    /**
     * \brief Get the input manager used to handle mouse, keyboard and touches events.
     */
    const InputManager & GetInputManager() const { return inputManager; }

    /**
     * \brief Get the input manager used to handle mouse, keyboard and touches events.
     */
    InputManager & GetInputManager() { return inputManager; }

    /**
     * \brief Get the time manager used to handle all time related values and timers.
     */
    const TimeManager & GetTimeManager() const { return timeManager; }

    /**
     * \brief Get the time manager used to handle all time related values and timers.
     */
    TimeManager & GetTimeManager() { return timeManager; }

    /**
     * Get the layer with specified name.
     */
    RuntimeLayer & GetRuntimeLayer(const gd::String & name);

    /**
     * Get the layer with specified name.
     */
    const RuntimeLayer & GetRuntimeLayer(const gd::String & name) const;

    /**
     * \brief Return the shared data for a behavior.
     * \warning Be careful, no check is made to ensure that the shared data exist.
     * \param name The name of the behavior for which shared data must be fetched.
     */
    const std::shared_ptr<BehaviorsRuntimeSharedData> & GetBehaviorSharedData(const gd::String & behaviorName) const { return behaviorsSharedDatas.GetBehaviorSharedData(behaviorName); }

    /**
     * \brief Set up the RuntimeScene using a gd::Layout.
     *
     * Typically called automatically by the IDE or by the game executable.
     *
     * \note Similar to calling LoadFromSceneAndCustomInstances(scene, scene.GetInitialInstances());
     * \see LoadFromSceneAndCustomInstances
     */
    bool LoadFromScene( const gd::Layout & scene );

    /**
     * \brief Set up the RuntimeScene using the specified \a instances and \a scene.
     * \param scene gd::Layout that should be loaded
     * \param instances Initial instances to be put on the scene
     */
    bool LoadFromSceneAndCustomInstances( const gd::Layout & scene, const gd::InitialInstancesContainer & instances );

    /**
     * Create the objects from an gd::InitialInstancesContainer object.
     *
     * \param container The object containing the initial instances to be created
     * \param xOffset The offset on x axis to be applied to objects created
     * \param yOffset The offset on y axis to be applied to objects created
     */
    void CreateObjectsFrom(const gd::InitialInstancesContainer & container, float xOffset = 0, float yOffset = 0);

    /**
     * \brief Change the window used for rendering the scene
     */
    void ChangeRenderWindow(gd::RenderingWindow * window);

    /**
     * \brief Check if scene is rendered full screen.
     */
    bool RenderWindowIsFullScreen() { return isFullScreen; }

    /**
     * \brief Change full screen state.
     * The render window is itself not changed so as to be displayed fullscreen or not.
     */
    void SetRenderWindowIsFullScreen(bool yes = true) { isFullScreen = yes; }

    /**
     * Render and play one frame.
     * \return true if a scene change was request, false otherwise.
     */
    bool RenderAndStep();

    /**
     * \brief Just render a frame, without applying logic or events on objects.
     */
    void RenderWithoutStep();

    /** \name Code execution engine
     * Functions members giving access to the code execution engine.
     */
    ///@{
    /**
     * \brief Give access to the execution engine of the scene.
     * Each scene has its own unique execution engine.
     */
    std::shared_ptr<CodeExecutionEngine> GetCodeExecutionEngine() const { return codeExecutionEngine; }

    /**
     * \brief Give access to the execution engine of the scene.
     * Each scene has its own unique execution engine.
     */
    void SetCodeExecutionEngine(std::shared_ptr<CodeExecutionEngine> codeExecutionEngine_) { codeExecutionEngine = codeExecutionEngine_; }
    ///@}

    struct SceneChange {
        enum Change {
            CONTINUE = 0,
            PUSH_SCENE,
            POP_SCENE,
            REPLACE_SCENE,
            CLEAR_SCENES,
            STOP_GAME
        } change;
        gd::String requestedScene;
    };

    SceneChange GetRequestedChange() { return requestedChange; }
    void RequestChange(SceneChange::Change change, gd::String sceneName = "");

protected:

    /**
     * \brief Handle the events made on the scene's window
     */
    void ManageRenderTargetEvents();

    /**
     * \brief Order an object list according to object's Z coordinate.
     */
    bool OrderObjectsByZOrder( RuntimeObjNonOwningPtrList & objList );

    /**
     * \brief Render a frame in the window
     */
    void Render();

    /**
     * \brief To be called once during a step, to launch behaviors pre-events steps.
     */
    void ManageObjectsBeforeEvents();

    /**
     * \brief To be called once during a step, to remove objects marked as deleted in events,
     * and to update objects position, forces and behaviors.
     */
    void ManageObjectsAfterEvents();

    /**
     * \brief Set the OpenGL projection according to the window size and OpenGL scene options.
     */
    void SetupOpenGLProjection();

    bool                                    isFullScreen; ///< As sf::RenderWindow can't say if it is fullscreen or not
    InputManager                            inputManager;
    TimeManager                             timeManager;
    RuntimeVariablesContainer               variables; ///<List of the scene variables
    std::vector < ExtensionBase * >         extensionsToBeNotifiedOnObjectDeletion; ///< List, built during LoadFromScene, containing a list of extensions which must be notified when an object is deleted.
    BehaviorsRuntimeSharedDataHolder        behaviorsSharedDatas; ///<Contains all behaviors shared datas.
    std::vector < RuntimeLayer >            layers; ///< The layers used at runtime to display the scene.
    std::shared_ptr<CodeExecutionEngine>    codeExecutionEngine;
    SceneChange                             requestedChange; ///< What should be done at the end of the frame.
    sf::Clock                               clock; ///< The clock used to track time.

    static RuntimeLayer badRuntimeLayer; ///< Null object return by GetLayer when no appropriate layer could be found.
};

#endif // RUNTIMESCENE_H
