#include "GDL/cFichier.h"
#include "GDL/tinyxml.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"

#include "GDL/CommonTools.h"
#include <vector>
#include <string>

////////////////////////////////////////////////////////////
/// Test si un fichier existe
///
/// Type : FileExists
/// Paramètre 1 : Chemin du fichier
////////////////////////////////////////////////////////////
bool CondFileExists( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    TiXmlDocument doc;
    if ( !doc.LoadFile(condition.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned).c_str()) && doc.ErrorId() == 2)
    {
        if ( condition.IsInverted() )
            return true;
        return false;
    }

    if ( condition.IsInverted() )
        return false;
    return true;
}

////////////////////////////////////////////////////////////
/// Test si un groupe existe
///
/// Type : GroupExists
/// Paramètre 1 : Chemin du fichier
/// Paramètre 2 : Groupe à tester
////////////////////////////////////////////////////////////
bool CondGroupExists( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    TiXmlDocument doc;
    if ( !doc.LoadFile(condition.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned).c_str() ) && doc.ErrorId() == 2)
    {
        scene.errors.Add("Impossible d'ouvrir le fichier "+condition.GetParameter(0).GetPlainString()+" : "+string(doc.ErrorDesc()), "", "", -1, 2);

        if ( condition.IsInverted() )
            return true;
        return false;
    }

    TiXmlHandle hdl( &doc );

    //Découpage des groupes
    istringstream groupsStr( condition.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned) );
    string Str;
    vector < string > groups;
    while ( std::getline( groupsStr, Str, '/' ) )
        groups.push_back(Str);

    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    //On avance petit à petit dans le fichier
    for (unsigned int i =0;i<groups.size();i++)
    {
        if ( !hdl.FirstChildElement(groups.at(i).c_str()).ToElement())
        {
            if ( condition.IsInverted() )
                return true;
            return false;
        }

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    if ( condition.IsInverted() )
        return false;
    return true;
}
