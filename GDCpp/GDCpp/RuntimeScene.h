/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef RUNTIMESCENE_H
#define RUNTIMESCENE_H

#include "GDCpp/Scene.h" //This include must be placed first
#include "GDCpp/RuntimeVariablesContainer.h"
#include <vector>
#include <string>
#include <map>
#include <SFML/System.hpp>
#include <boost/shared_ptr.hpp>
#include "GDCpp/ObjInstancesHolder.h"
namespace sf { class RenderWindow; }
namespace sf { class Event; }
namespace gd { class Project; }
namespace gd { class Object; }
namespace gd { class ImageManager; }
class CppPlatform;
class RuntimeLayer;
class RuntimeGame;
class AutomatismsRuntimeSharedData;
class ExtensionBase;
class Text;
class CodeExecutionEngine;
class ManualTimer;
#undef GetObject //Disable an annoying macro

#if defined(GD_IDE_ONLY)
class BaseDebugger;
class BaseProfiler;
#endif

/**
 * \brief Represents a scene being played.
 *
 * A RuntimeScene is used when a game is played.<br>
 * It contains everything a scene provide, but also specific
 * functions and members for runtime ( Render functions, objects instances, variables... )
 *
 * \ingroup GameEngine
 */
class GD_API RuntimeScene : public Scene
{
public:
    RuntimeScene(sf::RenderWindow * renderWindow_, RuntimeGame * game_);
    virtual ~RuntimeScene();

    RuntimeScene& operator=(const RuntimeScene & scene);
    RuntimeScene(const RuntimeScene & scene);

    sf::RenderWindow *                      renderWindow; ///< Pointer to the render window used for display.
    RuntimeGame *                       game; ///< Pointer to the game the scene is linked to.
    #if defined(GD_IDE_ONLY)
    BaseDebugger *                          debugger; ///< Pointer to the debugger. Can be NULL.
    #endif
    ObjInstancesHolder                      objectsInstances; ///< Contains all of the objects on the scene
    std::vector < ManualTimer >             timers; ///<List of the timer currently used.
    bool                                    running; ///< True if the scene is being played

    /**
     * \brief Provide access to the variables container
     */
    inline const RuntimeVariablesContainer & GetVariables() const { return variables; }

    /**
     * \brief Provide access to the variables container
     */
    inline RuntimeVariablesContainer & GetVariables() { return variables; }

    /**
     * \brief Shortcut for game.GetImageManager()
     * \return The image manager of the game.
     */
    boost::shared_ptr<gd::ImageManager> GetImageManager() const;

    /**
     * Get the layer with specified name.
     */
    RuntimeLayer & GetRuntimeLayer(const std::string & name);

    /**
     * Add a text to be displayed on the scene
     * \deprecated
     */
    void DisplayText(Text & text);

    /**
     * Get the AutomatismsRuntimeSharedData associated with automatism.
     * Be careful, no check is made to ensure that the shared data exist.
     */
    const boost::shared_ptr<AutomatismsRuntimeSharedData> & GetAutomatismSharedDatas(const std::string & automatismName) const { return automatismsSharedDatas.find(automatismName)->second; }

    /**
     * Set up the RuntimeScene using a Scene.
     * Typically called automatically by the IDE or by the game executable.
     *
     * \note Similar to calling LoadFromSceneAndCustomInstances(scene, scene.GetInitialInstances());
     * \see LoadFromSceneAndCustomInstances
     */
    bool LoadFromScene( const gd::Layout & scene );

    /**
     * Set up the Runtime Scene using the \a instances and the \a scene.
     * \param scene Scene used as context.
     * \param instances Initial instances to be put on the scene
     */
    bool LoadFromSceneAndCustomInstances( const gd::Layout & scene, const gd::InitialInstancesContainer & instances );

    /**
     * Create the objects from an gd::InitialInstancesContainer object.
     *
     * \param container The object containing the initial instances to be created
     * \param xOffset The offset on x axis to be applied to objects created
     * \param yOffset The offset on y axis to be applied to objects created
     * \param optionalMap An optional pointer to a std::map<const gd::InitialInstance *, boost::shared_ptr<RuntimeObject> > which will be filled with the index of the initial instances. Can be NULL.
     */
    void CreateObjectsFrom(const gd::InitialInstancesContainer & container, float xOffset = 0, float yOffset = 0, std::map<const gd::InitialInstance *, boost::shared_ptr<RuntimeObject> > * optionalMap = NULL);

    /**
     * Change the window used for rendering the scene
     */
    void ChangeRenderWindow(sf::RenderWindow * window);

    /**
     * Return true if scene is rendered full screen.
     */
    bool RenderWindowIsFullScreen() { return isFullScreen; }

    /**
     * Change full screen state. The render window is itself not changed so as to be displayed fullscreen or not.
     */
    void SetRenderWindowIsFullScreen(bool yes = true) { isFullScreen = yes; }

    /**
     * Return true if window has focus.
     */
    bool RenderWindowHasFocus() { return windowHasFocus; }

    /**
     * After calling this method, RenderAndStep() will return the number passed as parameter.
     * \see RenderAndStep
     */
    void GotoSceneWhenEventsAreFinished(int scene);

    /**
     * Render and play the scene one frame.
     * \return -1 for doing nothing, -2 to quit the game, another number to change the scene
     */
    int RenderAndStep();

    /**
     * Just render a frame.
     */
    void RenderWithoutStep();

    /**
     * Change scene time scale.
     */
    inline void SetTimeScale(double timeScale_) { timeScale = timeScale_; };

    /**
     * Return scene time scale.
     */
    inline double GetTimeScale() const { return timeScale; };

    /**
     * Get elapsed time since last frame, in microseconds.
     */
    inline signed long long GetElapsedTime() const { return elapsedTime; };

    /**
     * Get time elapsed since beginning, in microseconds.
     */
    inline signed long long GetTimeFromStart() const { return timeFromStart; };

    /**
     * Return true if the scene was just rendered once.
     */
    inline bool IsFirstLoop() const { return firstLoop; };

    /**
     * Notify the scene that something ( Like an open file dialog ) stopped scene rendering for a certain amount of time.
     * \param pauseTime_ Pause duration, in microseconds.
     */
    void NotifyPauseWasMade(signed long long pauseTime_) { pauseTime += pauseTime_; }

    void ManageRenderTargetEvents();

    /**
     * Order an object list according to object's Z coordinate.
     */
    bool OrderObjectsByZOrder( RuntimeObjList & objList );

    /**
     * Get a read-only list of SFML events managed by the render target.
     */
    const std::vector<sf::Event> & GetRenderTargetEvents() const { return renderTargetEvents; }

    #if defined(GD_IDE_ONLY)
    /**
     * Get a list, with read-write access, of SFML events managed by the render target.
     * \note This method is used by the IDE ( class SceneEditorCanvas precisely ) to manually inject
     * events not caught by SFML on linux when using a wxSFMLCanvas.
     * \warning You should not rely on this method as it could be removed when this specific problem will be fixed
     * ( but you can safely use the const version of this method )
     */
    std::vector<sf::Event> & GetRenderTargetEvents() { return renderTargetEvents; }
    #endif

    /** \name Code execution engine
     * Functions members giving access to the code execution engine.
     */
    ///@{
    /**
     * Give access to the execution engine of the scene.
     * Each scene has its own unique execution engine.
     */
    boost::shared_ptr<CodeExecutionEngine> GetCodeExecutionEngine() const { return codeExecutionEngine; }

    /**
     * Give access to the execution engine of the scene.
     * Each scene has its own unique execution engine.
     */
    void SetCodeExecutionEngine(boost::shared_ptr<CodeExecutionEngine> codeExecutionEngine_) { codeExecutionEngine = codeExecutionEngine_; }
    ///@}


protected:

    /**
     * Render a frame in the window
     */
    void Render();
    void ManageObjectsBeforeEvents();
    void ManageObjectsAfterEvents();
    bool UpdateTime();

    bool                                    firstLoop; ///<true if the scene was just rendered once.
    bool                                    isFullScreen; ///< As sf::RenderWindow can't say if it is fullscreen or not
    std::vector<sf::Event>                  renderTargetEvents;
    signed int                              realElapsedTime; ///< Elapsed time since last frame, in microseconds, without taking time scale in account.
    signed int                              elapsedTime; ///< Elapsed time since last frame, in microseconds ( elapsedTime = realElapsedTime*timeScale ).
    double                                  timeScale; ///< Time scale
    signed long long                        timeFromStart; ///< Time in microseconds elapsed from start.
    signed long long                        pauseTime; ///< Time to be subtracted to realElapsedTime for the current frame.
    int                                     specialAction; ///< -1 for doing nothing, -2 to quit the game, another number to change the scene
    RuntimeVariablesContainer               variables; ///<List of the scene variables
    std::vector < ExtensionBase * >         extensionsToBeNotifiedOnObjectDeletion; ///< List, built during LoadFromScene, containing a list of extensions which must be notified when an object is deleted.
    sf::Clock                               clock;
    bool                                    windowHasFocus; ///< True if the render target used by the scene has the focus.
    std::map < std::string, boost::shared_ptr<AutomatismsRuntimeSharedData> > automatismsSharedDatas; ///<Contains all automatisms shared datas.
    std::vector < RuntimeLayer >            layers; ///< The layers used at runtime to display the scene.
    boost::shared_ptr<CodeExecutionEngine>  codeExecutionEngine;
    CppPlatform *                           platform;

    std::vector < Text >                    textes; ///<Deprecated way of displaying a text
    bool DisplayLegacyTexts(std::string layer = "");

    void Init(const RuntimeScene & scene);

    static RuntimeLayer badRuntimeLayer; ///< Null object return by GetLayer when no appropriate layer could be found.
};

#endif // RUNTIMESCENE_H

