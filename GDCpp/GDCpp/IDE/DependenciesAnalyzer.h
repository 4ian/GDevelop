/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef DEPENDENCIESANALYZER_H
#define DEPENDENCIESANALYZER_H
#include <set>
#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
namespace gd { class EventsList; }
namespace gd { class BaseEvent; }
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class ExternalEvents; }

/**
 * \brief Compute the dependencies of a scene or external events.
 */
class DependenciesAnalyzer
{
public:

    /**
     * \brief Constructor for analyzing the dependencies of a layout
     */
    DependenciesAnalyzer(gd::Project & project_, gd::Layout & layout_);

    /**
     * \brief Constructor for analyzing the dependencies of external events.
     *
     * You can also call then DependenciesAnalyzer::ExternalEventsCanBeCompiledForAScene
     * to check if the external events can be compiled separatly and called by a scene.
     * \see DependenciesAnalyzer::ExternalEventsCanBeCompiledForAScene
     */
    DependenciesAnalyzer(gd::Project & project_, gd::ExternalEvents & externalEvents);

    virtual ~DependenciesAnalyzer();

    /**
     * \brief Search the dependencies and return true if there are no circular dependencies in the events
     * of the layout or external events passed in the constructor.
     *
     * \return true if there are no circular dependencies, false otherwise (in this case, no events code generation must done).
     */
    bool Analyze();

    /**
     * Check if the external events (passed in the constructor) can be compiled and called by a single scene:<br>
     * This is possible when the link calling the external events does not have any parent event
     * and when this situation occurs only in a single scene and not in another.
     *
     * \return The name of the scene which is able to call the compiled external events.
     * If empty, no scene is able to call them. (So external events have to be included directly by links).
     */
    std::string ExternalEventsCanBeCompiledForAScene();

    /**
     * \brief Return the scenes being dependencies of the scene or external events passed in the constructor.
     */
    const std::set< std::string > & GetScenesDependencies() const { return scenesDependencies; };

    /**
     * \brief Return the external events being dependencies of the scene or external events passed in the constructor.
     */
    const std::set< std::string > & GetExternalEventsDependencies() const { return externalEventsDependencies; };

    /**
     * \brief Return the source files being dependencies of the scene or external events passed in the constructor.
     */
    const std::set< std::string > & GetSourceFilesDependencies() const { return sourceFilesDependencies; };

    /**
     * \brief Return the scenes being dependencies of the scene or external events passed in the constructor,
     * but being not top level dependencies: The links including them are not a top level events (i.e: They have a parent event).
     */
    const std::set< std::string > & GetNotTopLevelScenesDependencies() const { return notTopLevelScenesDependencies; };

    /**
     * \brief Return the external events being dependencies of the scene or external events passed in the constructor,
     * but being not top level dependencies: The links including them are not a top level events (i.e: They have a parent event).
     */
    const std::set< std::string > & GetNotTopLevelExternalEventsDependencies() const { return notTopLevelExternalEventsDependencies; };

private:
    /**
     * \brief Analyze the dependencies of the events.
     *
     * \param events The events to be analyzed
     * \param isOnTopLevel If true, assumes that the events are on the top level (they have no parents).
     * \return false if a circular dependency exists, true otherwise.
     */
    bool Analyze(gd::EventsList & events, bool isOnTopLevel);

    /**
     * \brief Internal constructor used when analyzing a linked layout/external events.
     */
    DependenciesAnalyzer(const DependenciesAnalyzer & parent);

    void AddParentScene(std::string parentScene) { parentScenes.push_back(parentScene); };
    void AddParentExternalEvents(std::string parentExternalEvents_) { parentExternalEvents.push_back(parentExternalEvents_); };

    /**
     * Return true if all links pointing to external events called \a externalEventsName are only at the top level of \a events.
     * The function return false as soon as it discover a link to external events which is not at the top level ( i.e: It has a parent event ).
     *
     * \warning The function assumes that there are not cyclic dependencies.
     */
    bool CheckIfExternalEventsIsLinkedOnlyAtTopLevel(const std::string & externalEventsName, std::vector< boost::shared_ptr<gd::BaseEvent> > & events);

    std::set< std::string > scenesDependencies;
    std::set< std::string > externalEventsDependencies;
    std::set< std::string > sourceFilesDependencies;
    std::set< std::string > notTopLevelScenesDependencies;
    std::set< std::string > notTopLevelExternalEventsDependencies;
    std::vector<std::string> parentScenes; ///< Used to check for circular dependencies.
    std::vector<std::string> parentExternalEvents; ///< Used to check for circular dependencies.

    gd::Project & project;
    gd::Layout * layout;
    gd::ExternalEvents * externalEvents;
};

#endif // DEPENDENCIESANALYZER_H
#endif
