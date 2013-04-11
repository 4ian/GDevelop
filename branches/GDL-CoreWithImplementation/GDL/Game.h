/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GAME_H
#define GAME_H

#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
#include "GDL/VariableList.h"
#include "GDL/LoadingScreen.h"
#include "GDL/ResourcesManager.h"
namespace gd { class Object; }
namespace gd { class Layout; }
namespace gd { class ExternalEvents; }
namespace gd { class ExternalLayout; }
#if defined(GD_IDE_ONLY)
class wxPropertyGrid;
class wxPropertyGridEvent;
#include "GDCore/PlatformDefinition/Project.h"
namespace gd { class Platform; }
namespace gd { class Layout; }
namespace gd { class SourceFile; }
#include "GDL/IDE/ChangesNotifier.h"
#include "GDL/ExternalEvents.h"
#endif

/**
 * \brief Represents a game.
 *
 * Game contains all data of a game, from scenes to properties like game's name.
 *
 * \note When compiled for Game Develop IDE, this class inherits gd::Project and thus redefines methods related to gd::Project. When compiled for runtime, the class is stand alone and so contains only method useful for runtime.
 *
 * \ingroup GameEngine
 * \ingroup PlatformDefinition
 */
class GD_API Game
#if defined(GD_IDE_ONLY)
 : public gd::Project //When compiled for GD IDE, Game class inherits from gd::Project so as to be able to be manipulated by Game Develop.
#endif
{
public:

    /**
     * Default constructor
     */
    Game();

    /**
     * Default copy constructor
     */
    Game(const Game&);

    /**
     * Default destructor
     */
    virtual ~Game();

    /**
     * Assignment operator
     */
    Game& operator=(const Game & rhs);

    virtual Game * Clone() const { return new Game(*this); };

    /**
     * Return a reference to the vector containing the (smart) pointers to the layouts.
     */
    inline const std::vector < boost::shared_ptr<gd::Object> > & GetGlobalObjects() const { return initialObjects; }

    /**
     * Return a reference to the vector containing the (smart) pointers to the layouts.
     */
    inline std::vector < boost::shared_ptr<gd::Object> > & GetGlobalObjects() { return initialObjects; }
    #if defined(GD_IDE_ONLY)
    /**
     * Our implementation need to do sometimes extra work when changing a property ( For example, trigger a full
     * recompilation when global variables are updated ).
     */
    virtual void OnSelectionInPropertyGrid(wxPropertyGrid * grid, wxPropertyGridEvent & event);

    virtual ChangesNotifier & GetChangesNotifier() { return changesNotifier; };
    #endif

private:

    /**
     * Initialize from another game. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const Game & game);

    #if defined(GD_IDE_ONLY)
    static ChangesNotifier changesNotifier; ///< IDE related object
    #endif
};

#endif // GAME_H

