/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OPENSAVEGAME_H
#define OPENSAVEGAME_H

#include "GDL/Game.h"
#include <string>
#include "GDL/tinyxml.h"
#include "GDL/CommonTools.h"

using namespace std;

/**
 * Class used so as to save and open games files.
 */
class GD_API OpenSaveGame
{
public:
    OpenSaveGame( Game & game_ );
    virtual ~OpenSaveGame();

    bool OpenFromFile(string file);
    void OpenFromString(string text);
    bool SaveToFile(string file);
    void RecreatePaths(string file);

    static void OpenEvents( vector < BaseEventSPtr > & list, const TiXmlElement * elem );
    static void SaveEvents( const vector < BaseEventSPtr > & list, TiXmlElement * events );
    static void SaveConditions(const vector < Instruction > & list, TiXmlElement * elem);
    static void SaveActions(const vector < Instruction > & list, TiXmlElement * elem);
    static void OpenConditions(vector < Instruction > & list, const TiXmlElement * elem);
    static void OpenActions(vector < Instruction > & list, const TiXmlElement * elem);

    //Compatibility code --- with Game Develop 1.3.8892 and inferior
    static void AdaptEventsFromGD138892(vector < BaseEventSPtr > & list);
    //End of Compatibility code --- with Game Develop 1.3.8892 and inferior
    //Compatibility code --- with Game Develop 1.3.9262 and inferior
    static void AdaptExpressionsFromGD139262(vector < BaseEventSPtr > & list, Game & game, Scene & scene);
    //End of Compatibility code --- with Game Develop 1.3.9262 and inferior
    //Compatibility code --- with Game Develop 1.4.9552 and inferior
    static void AdaptExpressionsFromGD149552(vector < BaseEventSPtr > & list, Game & game, Scene & scene);
    //End of Compatibility code --- with Game Develop 1.4.9552 and inferior
    //Compatibility code --- with Game Develop 1.4.9587 and inferior
    static void AdaptExpressionsFromGD149587(vector < BaseEventSPtr > & list, Game & game, Scene & scene);
    //End of Compatibility code --- with Game Develop 1.4.9587 and inferior

protected:
private:

    Game & game;

    void OpenDocument(TiXmlDocument & doc);
    void OpenGameInformations( TiXmlElement * elem );
    void OpenImages( const TiXmlElement * elem, TiXmlElement * dossierElem );
    void OpenObjects(vector < boost::shared_ptr<Object> > & objects, TiXmlElement * elem);
    void OpenPositions( vector < InitialPosition > & list, TiXmlElement * elem );
    void OpenGroupesObjets( vector < ObjectGroup > & list, TiXmlElement * elem );
    void OpenLayers( vector < Layer > & list, TiXmlElement * elem );
    void OpenExternalEvents( vector < boost::shared_ptr<ExternalEvents> > & list, TiXmlElement * elem );
    static void OpenVariablesList(ListVariable & list, const TiXmlElement * elem);

    void SavePositions( const vector < InitialPosition > & list, TiXmlElement * positions );
    void SaveObjects( const vector < boost::shared_ptr<Object> > & list, TiXmlElement * objects );
    void SaveGroupesObjets( const vector < ObjectGroup > & list, TiXmlElement * grpsobjets );
    void SaveLayers( const vector < Layer > & list, TiXmlElement * layers );
    void SaveExternalEvents( const vector < boost::shared_ptr<ExternalEvents> > & list, TiXmlElement * layers );
    static void SaveVariablesList(const ListVariable & list, TiXmlElement * elem);
};

#endif // OPENSAVEGAME_H
