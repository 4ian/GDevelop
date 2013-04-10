/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef SCENE_H
#define SCENE_H
#include <vector>
#include <map>
#include <string>
#include <boost/shared_ptr.hpp>
#include "GDCore/PlatformDefinition/Layout.h"
namespace gd { class Object; }
namespace gd { class AutomatismsSharedData; }
class Game;
class CodeExecutionEngine;
class BaseProfiler;
class TiXmlElement;

#undef GetObject //Disable an annoying macro

/**
 * \brief Represents a layout of the Game Develop C++ Platform
 *
 * During runtime ( i.e. When the game is being played ), Scene is loaded into a RuntimeScene.
 *
 * \see RuntimeScene
 * \ingroup PlatformDefinition
 */
class GD_API Scene
#if defined(GD_IDE_ONLY)
: public gd::Layout
#endif
{
public:
    Scene();
    Scene(const Scene&);
    virtual ~Scene();

    Scene& operator=(const Scene & rhs);

    /**
     * Return a pointer to a new Scene constructed from this one.
     */
    virtual Scene * Clone() const { return new Scene(*this); };

    #if defined(GD_IDE_ONLY)
    /** \name Events compilation and bitcode management
     * Members functions related to managing the compilation of events and the resulting bitcodes.
     *
     * \see CodeCompilationHelpers
     */
    ///@{

    /**
     * Set that the events need to be compiled.
     * \note The compilation is not launched at this time. It will for example occur when triggered by SceneEditorCanvas
     * or if you manually add a task to the code compiler ( see CodeCompilationHelpers ).
     *
     * \see ChangesNotifier
     * \see CodeCompilationHelpers
     */
    virtual void SetCompilationNeeded() { compilationNeeded = true; };

    /**
     * Must be called when compilation of events is over and so events are not considered "modified" anymore.
     */
    virtual void SetCompilationNotNeeded() { compilationNeeded = false; };

    /**
     * Return true if a compilation is needed.
     * This method is usually called by SceneEditorCanvas when (re)loading a scene
     * so as to know if it should launch compilation.
     */
    virtual bool CompilationNeeded() { return compilationNeeded; };

    ///@}

    /** \name Changes notification
     * Members functions used to notify the editor ( mainly SceneEditorCanvas ) that changes have been made
     * and that refreshing should be made.
     */
    ///@{

    /**
     * Return true if important changes have been made and so the editors must reload the scene.
     * ( Important changes may refers to objects modified, properties updated, objects groups modified, variables modified )
     */
    bool RefreshNeeded() const { return refreshNeeded; }

    /**
     * Must be called when some important changes have been made and so the editors must reload the scene
     * \see Scene::RefreshNeeded
     */
    void SetRefreshNeeded() { refreshNeeded = true; }

    /**
     * Must be called when the editor ( i.e: SceneEditorCanvas ) managing the scene has reloaded it.
     */
    void SetRefreshNotNeeded() { refreshNeeded = false; }
    ///@}

    /**
     * Get the profiler associated with the scene. Can be NULL.
     */
    BaseProfiler * GetProfiler() { return profiler; };

    /**
     * Set the profiler associated with the scene. Can be NULL.
     */
    void SetProfiler(BaseProfiler * profiler_) { profiler = profiler_; };
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

private:

    mutable boost::shared_ptr<CodeExecutionEngine> codeExecutionEngine;
    #if defined(GD_IDE_ONLY)
    BaseProfiler * profiler; ///< Pointer to the profiler. Can be NULL.
    bool refreshNeeded; ///< If set to true, the IDE will reload the scene( thanks to SceneEditorCanvas notably which check this flag when the scene is being edited )
    bool compilationNeeded; ///< If set to true, the IDE will recompile the events ( thanks to SceneEditorCanvas notably which check this flag when the scene is being edited )
    #endif

    /**
     * Initialize from another scene. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const Scene & scene);
};

#endif // SCENE_H
