/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/tinyxml.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include <vector>
#include <string>
#include "GDL/CommonTools.h"
#include "GDL/XmlFilesHelper.h"
#include <stdio.h>

using namespace std;

/**
 * Launch a file
 */
bool ActLaunchFile( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
#ifdef WINDOWS
    //Création de l'adresse internet à lancer
    string appel = "start \"\" \""+action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned)+"\""; //quotes are important

    system(appel.c_str());
#endif
#ifdef LINUX
    //Nécessite le paquet xdg-utils
    string appel = "xdg-open \""+action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned)+"\"";

    system(appel.c_str());
#endif

    return true;
}

/**
 * Execute a system-specific command
 */
bool ActExecuteCmd( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    system(action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned).c_str());

    return true;
}

/**
 * Delete a file
 */
bool ActDeleteFichier( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    remove(action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned).c_str());

    return true;
}

/**
 * Load a file in memory
 */
bool ActLoadFile( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    XmlFilesManager::LoadFile(action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned));

    return true;
}

/**
 * Unload a file from memory
 */
bool ActUnloadFile( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    XmlFilesManager::UnloadFile(action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned));

    return true;
}

////////////////////////////////////////////////////////////
/// Supprimer un groupe d'un fichier
///
/// Type : EcrireFichierExp
/// Paramètre 1 : Nom du fichier
/// Paramètre 2 : Groupe
////////////////////////////////////////////////////////////
bool ActDeleteGroupFichier( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    boost::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned));
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //Découpage des groupes
    istringstream groupsStr( action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned) );
    string Str;
    vector < string > groups;
    while ( std::getline( groupsStr, Str, '/' ) )
    {
        groups.push_back(Str);
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    if ( groups.empty() )
        return false;
    groups.push_back("");

    //Création si besoin est de la racine
    if ( hdl.FirstChildElement(groups.at(0).c_str()).Element() == NULL )


    //A chaque fois, on vérifie si le groupe voulu existe
    for (unsigned int i =0;i<groups.size();i++)
    {
        if ( hdl.FirstChildElement(groups.at(i).c_str()).Element() == NULL )
            return false;

        //Si on arrive au groupe parent du groupe
        //à supprimer
        if ( i >= (groups.size()-1)-1 )
        {
            hdl.ToNode()->RemoveChild(hdl.FirstChildElement(groups.at(i).c_str()).ToNode());
            return true;
        }

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    return false;
}

////////////////////////////////////////////////////////////
/// Ecrit une expression dans un fichier
///
/// Type : EcrireFichierExp
/// Paramètre 1 : Nom du fichier
/// Paramètre 2 : Groupe
/// Paramètre 3 : Expression à écrire
////////////////////////////////////////////////////////////
bool ActEcrireFichierExp( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    boost::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned));
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //Découpage des groupes
    istringstream groupsStr( action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned) );
    string Str;
    vector < string > groups;
    while ( std::getline( groupsStr, Str, '/' ) )
    {
        groups.push_back(Str);
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    if ( groups.empty() )
        return false;

    //Insertion de la déclaration
    TiXmlDeclaration decl( "1.0", "ISO-8859-1", "" );
    if ( hdl.FirstChildElement().Element() != NULL )
    {
        //Il y a déjà un noeud, on vérifie que c'est pas une déclaration
        if ( hdl.FirstChild().ToNode()->ToDeclaration() == NULL )
            file->GetTinyXmlDocument().InsertBeforeChild(hdl.FirstChildElement().Element(), decl);
    }
    else
        file->GetTinyXmlDocument().InsertEndChild(decl); //Il n'y a rien, on peut insérer notre déclaration

    //Création si besoin est de la racine
    if ( hdl.FirstChildElement(groups.at(0).c_str()).Element() == NULL )
    {
        TiXmlElement root(groups.at(0).c_str());
        file->GetTinyXmlDocument().InsertEndChild(root);
    }

    //A chaque fois, on vérifie si le groupe voulu existe, si non on le créé,
    //et on se déplace dedans.
    for (unsigned int i =0;i<groups.size();i++)
    {
        if ( hdl.FirstChildElement(groups.at(i).c_str()).Element() == NULL )
        {
            TiXmlElement le_nouveau (groups.at(i).c_str());
            hdl.Element()->InsertEndChild(le_nouveau);
        }

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    //Ecriture dans le groupe
    if ( hdl.Element() != NULL )
        hdl.Element()->SetDoubleAttribute("value", action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned));

    return true;
}

////////////////////////////////////////////////////////////
/// Ecrit une expression dans un fichier
///
/// Type : EcrireFichierTxt
/// Paramètre 1 : Nom du fichier
/// Paramètre 2 : Groupe
/// Paramètre 3 : Expression texte à écrire
////////////////////////////////////////////////////////////
bool ActEcrireFichierTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    boost::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned));
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //Découpage des groupes
    istringstream groupsStr( action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned) );
    string Str;
    vector < string > groups;
    while ( std::getline( groupsStr, Str, '/' ) )
    {
        groups.push_back(Str);
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    if ( groups.empty() )
        return false;

    //Insertion de la déclaration
    TiXmlDeclaration decl( "1.0", "ISO-8859-1", "" );
    if ( hdl.FirstChildElement().Element() != NULL )
    {
        //Il y a déjà un noeud, on vérifie que c'est pas une déclaration
        if ( hdl.FirstChild().ToNode()->ToDeclaration() == NULL )
            file->GetTinyXmlDocument().InsertBeforeChild(hdl.FirstChildElement().Element(), decl);
    }
    else
        file->GetTinyXmlDocument().InsertEndChild(decl); //Il n'y a rien, on peut insérer notre déclaration

    //Création si besoin est de la racine
    if ( hdl.FirstChildElement(groups.at(0).c_str()).Element() == NULL )
    {
        TiXmlElement root(groups.at(0).c_str());
        file->GetTinyXmlDocument().InsertEndChild(root);
    }

    //A chaque fois, on vérifie si le groupe voulu existe, si non on le créé,
    //et on se déplace dedans.
    for (unsigned int i =0;i<groups.size();i++)
    {
        if ( hdl.FirstChildElement(groups.at(i).c_str()).Element() == NULL )
        {
            TiXmlElement le_nouveau (groups.at(i).c_str());
            hdl.Element()->InsertEndChild(le_nouveau);
        }

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    //Ecriture dans le groupe
    if ( hdl.Element() != NULL ) hdl.Element()->SetAttribute("texte", action.GetParameter(2).GetAsTextExpressionResult(scene, objectsConcerned).c_str());

    return true;
}

////////////////////////////////////////////////////////////
/// Charger une expression depuis un fichier
///
/// Type : LireFichierExp
/// Paramètre 1 : Nom du fichier
/// Paramètre 2 : Groupe
/// Paramètre 3 : Variable ( de la scène ) dans laquelle stocker la valeur
////////////////////////////////////////////////////////////
bool ActLireFichierExp( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    boost::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned), false);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //Découpage des groupes
    istringstream groupsStr( action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned) );
    string Str;
    vector < string > groups;
    while ( std::getline( groupsStr, Str, '/' ) )
    {
        groups.push_back(Str);
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    //On avance petit à petit dans le fichier
    for (unsigned int i =0;i<groups.size();i++)
    {
        if ( !hdl.FirstChildElement(groups.at(i).c_str()).ToElement())
        {
            return false;
        }
        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    //On stocke la valeur
    if ( hdl.ToElement()->Attribute("value") == NULL ) return false;
    double value;
    hdl.ToElement()->Attribute("value", &value);

    //Update variable value
    scene.variables.ObtainVariable(action.GetParameter( 2 ).GetPlainString()) = value;

    return true;
}


////////////////////////////////////////////////////////////
/// Charger une expression depuis un fichier
///
/// Type : LireFichierTxt
/// Paramètre 1 : Nom du fichier
/// Paramètre 2 : Groupe
/// Paramètre 3 : Variable ( de la scène ) dans laquelle stocker la valeur
////////////////////////////////////////////////////////////
bool ActLireFichierTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    boost::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned), false);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //Découpage des groupes
    istringstream groupsStr( action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned) );
    string Str;
    vector < string > groups;
    while ( std::getline( groupsStr, Str, '/' ) )
    {
        groups.push_back(Str);
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    //On avance petit à petit dans le fichier
    for (unsigned int i =0;i<groups.size();i++)
    {
        if ( !hdl.FirstChildElement(groups.at(i).c_str()).ToElement())
        {
            return false;
        }
        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    //On stocke la valeur
    if ( hdl.ToElement()->Attribute("texte") == NULL ) return false;

    //Update variable texte
    scene.variables.ObtainVariable( action.GetParameter( 2 ).GetPlainString() ) = hdl.ToElement()->Attribute("texte");

    return true;
}
