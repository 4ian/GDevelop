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
#include "GDL/InitialInstancesContainer.h"
#include "GDL/Layer.h"
class Object;
class Game;
class CodeExecutionEngine;
class AutomatismsSharedDatas;
class BaseProfiler;
class TiXmlElement;
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/LayoutEditorCanvasOptions.h"
#include "GDCore/PlatformDefinition/Layout.h"
namespace gd { class BaseEvent; }
namespace gd { typedef boost::shared_ptr<BaseEvent> BaseEventSPtr; }
#endif

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

    /**
     * Get scene name
     */
    virtual const std::string & GetName() const {return name;};

    /**
     * Change scene name
     */
    virtual void SetName(const std::string & name_) {name = name_;};

    /**
     * Set the background color
     */
    virtual void SetBackgroundColor(unsigned int r, unsigned int g, unsigned int b) { backgroundColorR = r; backgroundColorG = g; backgroundColorB = b; }

    /**
     * Get the background color red component
     */
    virtual unsigned int GetBackgroundColorRed() const { return backgroundColorR; }

    /**
     * Get the background color green component
     */
    virtual unsigned int GetBackgroundColorGreen() const { return backgroundColorG; }

    /**
     * Get the background color blue component
     */
    virtual unsigned int GetBackgroundColorBlue() const { return backgroundColorB; }

    /**
     * Get scene window default title
     */
    virtual const std::string & GetWindowDefaultTitle() const {return title;};

    /**
     * Set scene window default title
     */
    virtual void SetWindowDefaultTitle(const std::string & title_) {title = title_;};

    /**
     * Return a reference to the vector containing the (smart) pointers to the objects.
     */
    inline const std::vector < boost::shared_ptr<Object> > & GetInitialObjects() const { return initialObjects; }

    /**
     * Return a reference to the vector containing the (smart) pointers to the objects.
     */
    inline std::vector < boost::shared_ptr<Object> > & GetInitialObjects() { return initialObjects; }

    /**
     * Return a reference to the specified layer
     */
    virtual Layer & GetLayer(const std::string & name);

    /**
     * Return a reference to the specified layer
     */
    virtual const Layer & GetLayer(const std::string & name) const;

    /**
     * Return a reference to the specified layer
     */
    virtual Layer & GetLayer(unsigned int index);

    /**
     * Return a reference to the specified layer
     */
    virtual const Layer & GetLayer (unsigned int index) const;

    /**
     * Return the number of layers
     */
    virtual unsigned int GetLayersCount() const;

    /**
     * Provide access to the ListVariable member containing the layout variables
     */
    inline const ListVariable & GetVariables() const { return variables; }

    /**
     * Provide access to the ListVariable member containing the layout variables
     */
    inline ListVariable & GetVariables() { return variables; }

    /**
     * Return the container storing initial instances.
     */
    virtual const InitialInstancesContainer & GetInitialInstances() const { return initialInstances; }

    /**
     * Return the container storing initial instances.
     */
    virtual InitialInstancesContainer & GetInitialInstances() { return initialInstances; }

    virtual void LoadFromXml(const TiXmlElement * element);

    #if defined(GD_IDE_ONLY)
    /** \name Specialization of gd::Layout members
     * See gd::Layout documentation for more information about what these members functions should do.
     */
    ///@{
    virtual const std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() const { return events; }
    virtual std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() { return events; }

    virtual bool HasObjectNamed(const std::string & name) const;
    virtual gd::Object & GetObject(const std::string & name);
    virtual const gd::Object & GetObject(const std::string & name) const;
    virtual gd::Object & GetObject(unsigned int index);
    virtual const gd::Object & GetObject (unsigned int index) const;
    virtual unsigned int GetObjectPosition(const std::string & name) const;
    virtual unsigned int GetObjectsCount() const;
    virtual void InsertNewObject(const std::string & objectType, const std::string & name, unsigned int position);
    virtual void InsertObject(const gd::Object & theObject, unsigned int position);
    virtual void RemoveObject(const std::string & name);
    virtual void SwapObjects(unsigned int firstObjectIndex, unsigned int secondObjectIndex);

    virtual bool HasLayerNamed(const std::string & name) const;
    virtual unsigned int GetLayerPosition(const std::string & name) const;
    virtual void InsertNewLayer(const std::string & name, unsigned int position);
    virtual void InsertLayer(const gd::Layer & theLayer, unsigned int position);
    virtual void RemoveLayer(const std::string & name);
    virtual void SwapLayers(unsigned int firstLayerIndex, unsigned int secondLayerIndex);
    ///@}

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
     * Make sure that the scene had an instance of shared data for
     * every automatism of every object that can be used on the scene
     * ( i.e. the objects of the scene and the global objects )
     *
     * Must be called when an automatism have been added/deleted
     * or when a scene have been added to a game.
     */
    void UpdateAutomatismsSharedData(Game & game);

    /**
     * Return the settings associated to the scene.
     */
    const gd::LayoutEditorCanvasOptions & GetAssociatedLayoutEditorCanvasOptions() const { return associatedSettings; }

    /**
     * Return the settings associated to the scene.
     */
    gd::LayoutEditorCanvasOptions & GetAssociatedLayoutEditorCanvasOptions() { return associatedSettings; }

    /**
     * Get the profiler associated with the scene. Can be NULL.
     */
    BaseProfiler * GetProfiler() { return profiler; };

    /**
     * Set the profiler associated with the scene. Can be NULL.
     */
    void SetProfiler(BaseProfiler * profiler_) { profiler = profiler_; };

    virtual void SaveToXml(TiXmlElement * element) const;
    #endif

    /** \name Other properties
     */
    ///@{
    /**
     * Set if the input must be disabled when window lost focus.
     */
    void DisableInputWhenFocusIsLost(bool disable = true) { disableInputWhenNotFocused = disable; }

    /**
     * Return true if the input must be disabled when window lost focus.
     */
    bool IsInputDisabledWhenFocusIsLost() { return disableInputWhenNotFocused; }

    /**
     * Set if the objects z-order are sorted using the standard method
     */
    void SetStandardSortMethod(bool enable = true) { standardSortMethod = enable; }

    /**
     * Return true if the objects z-order are sorted using the standard method
     */
    bool StandardSortMethod() const { return standardSortMethod; }

    /**
     * Set if the scene must stop all the sounds being played when it is launched.
     */
    void SetStopSoundsOnStartup(bool enable = true) { stopSoundsOnStartup = enable; }

    /**
     * Return true if the scene must stop all the sounds being played when it is launched
     */
    bool StopSoundsOnStartup() const { return stopSoundsOnStartup; }

    /**
     * Set OpenGL default field of view
     */
    void SetOpenGLFOV(float oglFOV_) { oglFOV = oglFOV_; }

    /**
     * Get OpenGL default field of view
     */
    float GetOpenGLFOV() const { return oglFOV; }

    /**
     * Set OpenGL near clipping plan
     */
    void SetOpenGLZNear(float oglZNear_) { oglZNear = oglZNear_; }

    /**
     * Get OpenGL near clipping plan
     */
    float GetOpenGLZNear() const { return oglZNear; }

    /**
     * Set OpenGL far clipping plan
     */
    void SetOpenGLZFar(float oglZFar_) { oglZFar = oglZFar_; }

    /**
     * Get OpenGL far clipping plan
     */
    float GetOpenGLZFar() const { return oglZFar; }
    ///@}

    std::map < std::string, boost::shared_ptr<AutomatismsSharedDatas> > automatismsInitialSharedDatas; ///< Initial shared datas of automatisms

    /** \name Code execution engine
     * Functions members giving access to the code execution engine.
     */
    ///@{

    /**
     * Get the list containing the list of bitcodes files which must be loaded at the same time of the scene's bitcode.
     * This list is populated at the compilation ( see CodeCompiler and EventsCodeCompilerRuntimePreWork classes ) and is only used at runtime ( i.e: Not in the IDE ).
     * The IDE takes care of loading itself the necessary bitcodes ( See EventsCodeCompilerPostWork class ).
     */
    std::vector<std::string> & GetExternalBitCodeDependList() const { return externalBitCodeDependList; };

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

    std::string                                 name; ///< Scene name
    unsigned int                                backgroundColorR; ///< Background color Red component
    unsigned int                                backgroundColorG; ///< Background color Green component
    unsigned int                                backgroundColorB; ///< Background color Blue component
    std::string                                 title; ///< Title displayed in the window
    std::vector < boost::shared_ptr<Object> >   initialObjects; ///< Objects available.
    ListVariable                                variables; ///< Variables list
    InitialInstancesContainer                   initialInstances; ///< Initial instances
    std::vector < Layer >                       layers; ///< Initial layers
    bool                                        stopSoundsOnStartup; ///< True to make the scene stop all sounds at startup.
    bool                                        standardSortMethod; ///< True to sort objects using standard sort.
    float                                       oglFOV; ///< OpenGL Field Of View value
    float                                       oglZNear; ///< OpenGL Near Z position
    float                                       oglZFar; ///< OpenGL Far Z position
    bool                                        disableInputWhenNotFocused; /// If set to true, the input must be disabled when the window do not have the focus.

    mutable std::vector<std::string>            externalBitCodeDependList; ///< List of bitcode files the scene depends on. Used only for runtime and not in the IDE.
    mutable boost::shared_ptr<CodeExecutionEngine> codeExecutionEngine;

    #if defined(GD_IDE_ONLY)
    std::vector < gd::BaseEventSPtr >           events; ///< Scene events
    BaseProfiler *                              profiler; ///< Pointer to the profiler. Can be NULL.
    bool                                        refreshNeeded; ///< If set to true, the IDE will reload the scene( thanks to SceneEditorCanvas notably which check this flag when the scene is being edited )
    bool                                        compilationNeeded; ///< If set to true, the IDE will recompile the events ( thanks to SceneEditorCanvas notably which check this flag when the scene is being edited )
    gd::LayoutEditorCanvasOptions               associatedSettings;
    #endif

    /**
     * Initialize from another scene. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const Scene & scene);

    static Layer badLayer;
};

//"Tool" Functions

/**
 * \brief Functor testing scene name
 * \see Scene
 */
struct SceneHasName : public std::binary_function<boost::shared_ptr<Scene>, std::string, bool> {
    bool operator()(const boost::shared_ptr<Scene> & scene, std::string name) const { return scene->GetName() == name; }
};

#endif // SCENE_H

