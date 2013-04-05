/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OPENSAVEGAME_H
#define OPENSAVEGAME_H

#include "GDL/Game.h"
#include <string>
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/CommonTools.h"
namespace gd { class Instruction; }
namespace gd { class Project; }
namespace gd { class InstructionMetadata;}
namespace gd { class InitialInstance; }
namespace gd { class Layer; }
namespace gd { class BaseEvent; }
namespace gd {typedef boost::shared_ptr<gd::BaseEvent> BaseEventSPtr;}

using namespace std;

/**
 * \brief Internal class used so as to save and open games files.
 *
 * \deprecated All saving/loading related tasks must now be transfered to SaveToXml/LoadFromXml member functions.
 */
class GD_API OpenSaveGame
{
public:
    #if defined(GD_IDE_ONLY)
    static void OpenEvents( vector < gd::BaseEventSPtr > & list, const TiXmlElement * elem );
    static void OpenConditions(vector < gd::Instruction > & list, const TiXmlElement * elem);
    static void OpenActions(vector < gd::Instruction > & list, const TiXmlElement * elem);

    static void SaveConditions(const vector < gd::Instruction > & list, TiXmlElement * elem);
    static void SaveActions(const vector < gd::Instruction > & list, TiXmlElement * elem);

    static void OpenGroupesObjets( vector < gd::ObjectGroup > & list, const TiXmlElement * elem );
    static void SaveGroupesObjets( const vector < gd::ObjectGroup > & list, TiXmlElement * grpsobjets );

    static void SaveObjects( const vector < boost::shared_ptr<gd::Object> > & list, TiXmlElement * objects );
    static void OpenImagesFromGD2010498(Game & game, const TiXmlElement * elem, const TiXmlElement * dossierElem );
    #endif

    static void OpenObjects(gd::Project & project, vector < boost::shared_ptr<gd::Object> > & objects, const TiXmlElement * elem);
};

#endif // OPENSAVEGAME_H

