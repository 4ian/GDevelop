/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OPENSAVEGAME_H
#define OPENSAVEGAME_H

#if defined(GD_IDE_ONLY)

#include "GDL/Game.h"
#include <string>
#include "GDL/tinyxml.h"
#include "GDL/CommonTools.h"

using namespace std;

/**
 * Internal class used so as to save and open games files.
 */
class GD_API OpenSaveGame
{
public:
    OpenSaveGame( Game & game_ );
    virtual ~OpenSaveGame();

    bool OpenFromFile(string file);
    void OpenFromString(string text);
    void RecreatePaths(string file);
    static void OpenEvents( vector < BaseEventSPtr > & list, const TiXmlElement * elem );
    static void OpenConditions(vector < Instruction > & list, const TiXmlElement * elem);
    static void OpenActions(vector < Instruction > & list, const TiXmlElement * elem);

    #if defined(GD_IDE_ONLY)
    bool SaveToFile(string file);
    static void SaveEvents( const vector < BaseEventSPtr > & list, TiXmlElement * events );
    static void SaveConditions(const vector < Instruction > & list, TiXmlElement * elem);
    static void SaveActions(const vector < Instruction > & list, TiXmlElement * elem);
    #endif

protected:
private:

    Game & game;

    void OpenDocument(TiXmlDocument & doc);
    void OpenGameInformations( const TiXmlElement * elem );
    void OpenImages( const TiXmlElement * elem, TiXmlElement * dossierElem );
    void OpenObjects(vector < boost::shared_ptr<Object> > & objects, TiXmlElement * elem);
    void OpenPositions( vector < InitialPosition > & list, TiXmlElement * elem );
    void OpenGroupesObjets( vector < ObjectGroup > & list, TiXmlElement * elem );
    void OpenLayers( vector < Layer > & list, TiXmlElement * elem );
    void OpenExternalEvents( vector < boost::shared_ptr<ExternalEvents> > & list, TiXmlElement * elem );
    static void OpenVariablesList(ListVariable & list, const TiXmlElement * elem);

    #if defined(GD_IDE_ONLY)
    void SavePositions( const vector < InitialPosition > & list, TiXmlElement * positions );
    void SaveObjects( const vector < boost::shared_ptr<Object> > & list, TiXmlElement * objects );
    void SaveGroupesObjets( const vector < ObjectGroup > & list, TiXmlElement * grpsobjets );
    void SaveLayers( const vector < Layer > & list, TiXmlElement * layers );
    void SaveExternalEvents( const vector < boost::shared_ptr<ExternalEvents> > & list, TiXmlElement * layers );
    static void SaveVariablesList(const ListVariable & list, TiXmlElement * elem);
    #endif
};

#endif

#endif // OPENSAVEGAME_H
