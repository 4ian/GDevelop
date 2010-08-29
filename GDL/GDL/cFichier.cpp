#include "GDL/cFichier.h"
#include "GDL/tinyxml.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"
#include "GDL/XmlFilesHelper.h"
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
        return (false ^ condition.IsInverted());
    }

    return (true ^ condition.IsInverted());
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
    boost::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(condition.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned));
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

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
            return (false ^ condition.IsInverted());
        }

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    return (true ^ condition.IsInverted());
}
