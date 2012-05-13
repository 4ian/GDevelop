/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef RUNTIMESCENE_H
#define RUNTIMESCENE_H

#include "GDL/Scene.h" //This include must be placed first
#include <iostream>
#include <sstream>
#include <vector>
#include <string>
#include <map>
#include <boost/shared_ptr.hpp>
#include "GDL/CommonTools.h"
#include "GDL/RuntimeLayer.h"
#include "GDL/Text.h"
#include "GDL/Layer.h"
#include "GDL/ManualTimer.h"
#include "GDL/ObjInstancesHolder.h"
class RuntimeGame;
class CodeExecutionEngine;
class Object;
class SoundManager;
class AutomatismsRuntimeSharedDatas;
class ExtensionBase;
#undef GetObject //Disable an annoying macro

#if defined(GD_IDE_ONLY)
class BaseDebugger;
class BaseProfiler;
#endif

/**
 * \brief Represents a scene being played.
 *
 * A RuntimeScene is used when a game is played.
 * It contains everything a scene provide, but also specific
 * functions and members for runtime ( Render functions, objects instances, variables... )
 */
class GD_API RuntimeScene : public Scene
{
public:
    RuntimeScene(sf::RenderWindow * renderWindow_, RuntimeGame * game_);
    virtual ~RuntimeScene();

    RuntimeScene& operator=(const RuntimeScene & scene);
    RuntimeScene(const RuntimeScene & scene);

    sf::RenderWindow *                      renderWindow; ///< Pointer to the render window used for display
    RuntimeGame *                           game; ///< Pointer to the game the scene is linked to
    #if defined(GD_IDE_ONLY)
    BaseDebugger *                          debugger; ///< Pointer to the debugger. Can be NULL.
    #endif
    ObjInstancesHolder                      objectsInstances; ///< Contains all of the objects on the scene
    std::vector < ManualTimer >             timers; ///<List of the timer currently used.
    bool                                    running; ///< True if the scene is being played

    /**
     * Provide access to the ListVariable member containing the variables
     */
    inline const ListVariable & GetVariables() const { return variables; }

    /**
     * Provide access to the ListVariable member containing the variables
     */
    inline ListVariable & GetVariables() { return variables; }

    /**
     * Get the list of all layers of the scene
     */
    const std::vector < RuntimeLayer > & GetAllLayers() const { return layers; }

    /**
     * Get the list of all layers of the scene
     */
    std::vector < RuntimeLayer > & GetAllLayers() { return layers; }

    /**
     * Add a text to be displayed on the scene
     * \deprecated
     */
    void DisplayText(Text & text) { textes.push_back(text); };

    /**
     * Get the AutomatismsRuntimeSharedData associated with automatism.
     * Be careful, no check is made to ensure that the shared data exist.
     */
    const boost::shared_ptr<AutomatismsRuntimeSharedDatas> & GetAutomatismSharedDatas(const std::string & automatismName) const { return automatismsSharedDatas.find(automatismName)->second; }

    /**
     * Set up the Runtime Scene using a Scene
     */
    bool LoadFromScene( const Scene & scene );

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
     * By calling this method, scene will
     */
    void GotoSceneWhenEventsAreFinished(int scene);

    /**
     * Render and play the scene one frame.
     */
    int RenderAndStep(unsigned int nbStep);

    /**
     * Just render a frame.
     */
    void RenderWithoutStep();

    /**
     * Return the layer with the name passed in argument
     */
    const RuntimeLayer & GetLayer(const string & name) const;

    /**
     * Return the layer with the name passed in argument
     */
    RuntimeLayer & GetLayer(const string & name);

    /**
     * Change scene time scale.
     */
    inline void SetTimeScale(double timeScale_) { timeScale = timeScale_; };

    /**
     * Return scene time scale.
     */
    inline double GetTimeScale() const { return timeScale; };

    /**
     * Get elapsed time since last frame, in milliseconds.
     */
    inline unsigned int GetElapsedTime() const { return elapsedTime; };

    /**
     * Get time elapsed since beginning, in milliseconds.
     */
    inline unsigned int GetTimeFromStart() const { return timeFromStart; };

    /**
     * Return true if the scene was just rendered once.
     */
    inline bool IsFirstLoop() const { return firstLoop; };

    /**
     * Notify the scene that something ( Like an open file dialog ) stopped scene rendering for a certain amount of time.
     * \param Pause duration, in milliseconds.
     */
    void NotifyPauseWasMade(unsigned int pauseTime_) { pauseTime += pauseTime_; }

    void ManageRenderTargetEvents();

    /**
     * Get a read-only list of SFML events managed by the render target.
     */
    const std::vector<sf::Event> & GetRenderTargetEvents() const { return renderTargetEvents; }

    #if defined(GD_IDE_ONLY)
    /**
     * Get a list, with read-write access, of SFML events managed by the render target.
     * \note This method is used by the IDE ( class SceneCanvas precisely ) to manually inject
     * events not caught by SFML on linux when using a wxSFMLCanvas.
     * \warning You should not rely on this method as it could be removed when this specific problem will be fixed
     * ( but you can safely use the const version of this method )
     */
    std::vector<sf::Event> & GetRenderTargetEvents() { return renderTargetEvents; }
    #endif

    /**
     * Order an object list according to object's Z coordinate.
     */
    bool OrderObjectsByZOrder( ObjList & objList );

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
    unsigned int                            realElapsedTime; ///< Elpased time since last frame, in milliseconds, without taking time scale in account.
    unsigned int                            elapsedTime; ///< Elpased time since last frame, in milliseconds
    double                                  timeScale; ///< Time scale
    unsigned int                            timeFromStart; ///< Time in milliseconds elapsed from start
    unsigned int                            pauseTime;
    int                                     specialAction; ///< -1 for doing nothing, -2 to quit the game, another number to change the scene
    ListVariable                            variables; ///<List of the scene variables
    std::vector < RuntimeLayer >            layers; ///<List of the layers
    std::vector < ExtensionBase * >         extensionsToBeNotifiedOnObjectDeletion; ///< List, built during LoadFromScene, containing a list of extensions which must be notified when an object is deleted.

    std::map < std::string, boost::shared_ptr<AutomatismsRuntimeSharedDatas> > automatismsSharedDatas; ///<Contains all automatisms shared datas.

    vector < Text > textes; ///<Deprecated way of displaying a text
    bool DisplayLegacyTexts(string layer = "");

    void Init(const RuntimeScene & scene);

    static RuntimeLayer badLayer;
};

#endif // RUNTIMESCENE_H
