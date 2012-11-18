/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#ifndef DEPENDENCIESANALYZER_H
#define DEPENDENCIESANALYZER_H
#include <set>
#include <string>
#include <boost/shared_ptr.hpp>
namespace gd { class BaseEvent; }
class Game;

class DependenciesAnalyzer
{
public:
    DependenciesAnalyzer(Game & game_) : game(game_) {};
    virtual ~DependenciesAnalyzer();

    /**
     * Analyze the dependencies.
     *
     * \return false if a circular dependency exists, true otherwise.
     */
    bool Analyze(std::vector< boost::shared_ptr<gd::BaseEvent> > & events);

    /**
     * Check if external events can be compiled and called by a \a scene:<br>
     * This is possible when the link calling the external events does not have any parent event
     * and when this situation occurs only in the \a scene and not in another.
     *
     * \return The name of the scene which is able to call the compiled external events. If empty, no scene is able to call them. ( So external events have to be included directly by links ).
     */
    std::string ExternalEventsCanBeCompiledForAScene(const std::string & externalEventsName);

    const std::set< std::string > & GetScenesDependencies() const { return scenesDependencies; };
    const std::set< std::string > & GetExternalEventsDependencies() const { return externalEventsDependencies; };
    const std::set< std::string > & GetSourceFilesDependencies() const { return sourceFilesDependencies; };

    void SetBaseScene(std::string baseScene_) { baseScene = baseScene_;};
    void SetBaseExteralEvents(std::string baseExternalEvents_) { baseExternalEvents = baseExternalEvents_;};

private:

    std::set< std::string > scenesDependencies;
    std::set< std::string > externalEventsDependencies;
    std::set< std::string > sourceFilesDependencies;
    std::string baseScene; ///< Used to check for circular dependencies. Optional ( can be empty )
    std::string baseExternalEvents; ///< Used to check for circular dependencies. Optional ( can be empty )

    /**
     * Return true if all links pointing to external events called \a externalEventsName are only at the top level of \a events.
     * The function return false as soon as it discover a link to external events which is not at the top level ( i.e: It has a parent event ).
     */
    bool CheckIfExternalEventsIsLinkedOnlyAtTopLevel(const std::string & externalEventsName, std::vector< boost::shared_ptr<gd::BaseEvent> > & events);

    Game & game;
};

#endif // DEPENDENCIESANALYZER_H
#endif
