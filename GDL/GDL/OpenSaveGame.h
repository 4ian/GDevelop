/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OPENSAVEGAME_H
#define OPENSAVEGAME_H

#include "GDL/Game.h"
#include <string>
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/CommonTools.h"
namespace gd { class Instruction; }
namespace gd { class InstructionMetadata;}
class InitialPosition;
class Layer;
namespace gd { class BaseEvent; }
namespace gd {typedef boost::shared_ptr<gd::BaseEvent> BaseEventSPtr;}

using namespace std;

/**
 * \brief Internal class used so as to save and open games files.
 */
class GD_API OpenSaveGame
{
public:
    OpenSaveGame( Game & game_ );
    virtual ~OpenSaveGame();

    bool OpenFromFile(string file);
    void OpenFromString(string text);

    #if defined(GD_IDE_ONLY)
    static void OpenEvents( vector < gd::BaseEventSPtr > & list, const TiXmlElement * elem );
    static void OpenConditions(vector < gd::Instruction > & list, const TiXmlElement * elem);
    static void OpenActions(vector < gd::Instruction > & list, const TiXmlElement * elem);

    bool SaveToFile(string file);
    static void SaveEvents( const vector < gd::BaseEventSPtr > & list, TiXmlElement * events );
    static void SaveConditions(const vector < gd::Instruction > & list, TiXmlElement * elem);
    static void SaveActions(const vector < gd::Instruction > & list, TiXmlElement * elem);

    static void OpenGroupesObjets( vector < gd::ObjectGroup > & list, const TiXmlElement * elem );

    //Compatibility code --- with Game Develop 1
    static void AdaptEventsFromGD1x(vector < gd::BaseEventSPtr > & list);
    static bool updateEventsFromGD1x;
    #endif

    static void OpenObjects(vector < boost::shared_ptr<Object> > & objects, const TiXmlElement * elem);
    static void OpenPositions( vector < InitialPosition > & list, const TiXmlElement * elem );
    static void OpenLayers( vector < Layer > & list, const TiXmlElement * elem );

private:

    Game & game;

    void OpenDocument(TiXmlDocument & doc);
    void OpenGameInformations( const TiXmlElement * elem );

    #if defined(GD_IDE_ONLY)
    void OpenExternalEvents( vector < boost::shared_ptr<ExternalEvents> > & list, const TiXmlElement * elem );
    void OpenImagesFromGD2010498( const TiXmlElement * elem, TiXmlElement * dossierElem );

    void SaveObjects( const vector < boost::shared_ptr<Object> > & list, TiXmlElement * objects );
    void SaveGroupesObjets( const vector < gd::ObjectGroup > & list, TiXmlElement * grpsobjets );
    void SaveLayers( const vector < Layer > & list, TiXmlElement * layers );
    void SaveExternalEvents( const vector < boost::shared_ptr<ExternalEvents> > & list, TiXmlElement * layers );

    static void AdaptConditionFromGD1x(gd::Instruction & instruction, const gd::InstructionMetadata & instrInfos);
    static void AdaptActionFromGD1x(gd::Instruction & instruction, const gd::InstructionMetadata & instrInfos);

    std::string updateText;
    #endif
};

#endif // OPENSAVEGAME_H
