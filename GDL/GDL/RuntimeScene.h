/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SCENEIG_H
#define SCENEIG_H

#include "GDL/Scene.h" //This include must be placed first
#include <iostream>
#include <sstream>
#include <vector>
#include <string>
#include <map>
#include <boost/shared_ptr.hpp>

#include <llvm/ADT/OwningPtr.h>
#include <llvm/LLVMContext.h>
namespace llvm
{
    class Function;
    class Module;
    class ExecutionEngine;
    class MemoryBuffer;
}

#include "GDL/RuntimeGame.h"
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/CommonTools.h"
#include "GDL/Son.h"
#include "GDL/Music.h"
#include "GDL/constantes.h"
#include "GDL/RuntimeLayer.h"
#include "GDL/Text.h"
#include "GDL/SoundManager.h"
#include "GDL/Layer.h"
#include "GDL/ManualTimer.h"
#include "GDL/ObjInstancesHolder.h"
class AutomatismsRuntimeSharedDatas;

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
    const sf::Input *                       input; ///< Pointer to the SFML class used to get user input
    bool                                    inputKeyPressed;    ///< Supplementary input : True if any key was pressed
    int                                     inputWheelDelta;    ///< Supplementary input : Amount of mouse wheel moved
    std::string                             inputTextEntered;   ///< Supplementary input : Text entered using keyboard
    RuntimeGame *                           game; ///< Pointer to the game the scene is linked to
    SoundManager *                          soundManager; ///< Pointer to the sound manager.
    #if defined(GD_IDE_ONLY)
    BaseDebugger *                          debugger; ///< Pointer to the debugger. Can be NULL.
    BaseProfiler *                          profiler; ///< Pointer to the profiler. Can be NULL.
    #endif
    ObjInstancesHolder                      objectsInstances; ///< Contains all of the objects on the scene
    ListVariable                            variables; ///<List of the scene variables
    vector < RuntimeLayer >                 layers; ///<List of the layers
    vector < Text >                         textes; ///<Deprecated way of displaying a text
    vector < ManualTimer >                  timers; ///<List of the timer currently used.
    bool                                    running; ///< True if the scene is being played
    float                                   pauseTime; ///<Time that has been spent during the frame but which must not be taken in account in elpased time.
    int                                     backgroundColorR; ///< Background color Red component
    int                                     backgroundColorG; ///< Background color Green component
    int                                     backgroundColorB; ///< Background color Blue component
    std::map < std::string, boost::shared_ptr<AutomatismsRuntimeSharedDatas> > automatismsSharedDatas; ///<Contains all automatisms shared datas. Note the use of flat_map for better performance.

    llvm::Function * eventsEntryFunction;
    llvm::Module *Module;
    llvm::OwningPtr<llvm::ExecutionEngine> EE;
    llvm::OwningPtr<llvm::MemoryBuffer> eventsBuffer;
    llvm::LLVMContext llvmContext;

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
    const RuntimeLayer & GetLayer(string name) const;

    /**
     * Return the layer with the name passed in argument
     */
    RuntimeLayer & GetLayer(string name);

    /**
     * Change scene time scale.
     */
    inline void SetTimeScale(float timeScale_) { timeScale = timeScale_; };

    /**
     * Return scene time scale.
     */
    inline float GetTimeScale() const { return timeScale; };

    /**
     * Get elapsed time since last frame, in seconds.
     */
    inline float GetElapsedTime() const { return realElapsedTime*timeScale; };

    /**
     * Get time elapsed since beginning, in seconds.
     */
    inline float GetTimeFromStart() const { return timeFromStart; };

    /**
     * Return true if the scene was just rendered once.
     */
    inline bool IsFirstLoop() const { return firstLoop; };

    /**
     * Helper function to stop all musics played in the soundManager.
     */
    bool StopMusic();

    void ManageRenderTargetEvents();
    bool OrderObjectsByZOrder( ObjList & objList );

protected:

    void Init(const RuntimeScene & scene);

    /**
     * Render a frame in the window
     */
    void Render();
    void ManageObjectsBeforeEvents();
    void ManageObjectsAfterEvents();
    void ManageSounds();
    bool UpdateTime();

    bool DisplayLegacyTexts(string layer = "");
    void PreprocessEventList( const Game & Jeu, vector < BaseEventSPtr > & listEvent );

    bool firstLoop; ///<true if the scene was just rendered once.
    bool isFullScreen; ///< As sf::RenderWindow can't say if it is fullscreen or not
    float realElapsedTime; ///< Elpased time since last frame, in seconds, without taking time scale in account.
    float elapsedTime; ///< Elpased time since last frame, in seconds
    float timeScale; ///< Time scale
    float timeFromStart; ///< Time in seconds elapsed from start
    int   specialAction; ///< -1 for doing nothing, -2 to quit the game, another number to change the scene

    static RuntimeLayer badLayer;
};

#endif // SCENEIG_H
