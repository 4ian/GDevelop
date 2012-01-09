/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/NetworkExtension.h"

NetworkExtension::NetworkExtension()
{
    DECLARE_THE_EXTENSION("BuiltinNetwork",
                          _("Fonctionnalités internet basiques"),
                          _("Extension pour utiliser internet, integrée en standard"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_ACTION("EnvoiDataNet",
                   _("Envoyer des données sur internet"),
                   _("Envoie les données spécifié à un site web.\nVous avez besoin de mettre en place une page php sur votre site web permettant de récolter ces données.\nEntrez un mot de passe, et appliquez le même à la configuration de votre page php.\nPour plus d'informations sur la mise en place de votre site, consultez l'aide."),
                   _("Envoyer à _PARAM0_ les données : _PARAM2_, _PARAM3_,_PARAM4_,_PARAM5_,_PARAM6_,_PARAM7_"),
                   _("Réseau"),
                   "res/actions/net24.png",
                   "res/actions/net.png");

        instrInfo.AddParameter("string", _("Adresse de la page .php ( N'oubliez pas le protocole http:// )"), "",false);
        instrInfo.AddParameter("password", _("Mot de passe de sécurité"), "",false);
        instrInfo.AddParameter("string", _("Donnée 1"), "",false);
        instrInfo.AddParameter("string", _("Donnée 2"), "",true);
        instrInfo.AddParameter("string", _("Donnée 3"), "",true);
        instrInfo.AddParameter("string", _("Donnée 4"), "",true);
        instrInfo.AddParameter("string", _("Donnée 5"), "",true);
        instrInfo.AddParameter("string", _("Donnée 6"), "",true);

        instrInfo.cppCallingInformation.SetFunctionName("SendDataToPhpWebPage").SetIncludeFile("GDL/BuiltinExtensions/NetworkTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("DownloadFile",
                   _("Télécharger un fichier"),
                   _("Télécharge un fichier depuis un site web."),
                   _("Télécharger le fichier _PARAM1_ depuis _PARAM0_ sous le nom de _PARAM2_"),
                   _("Réseau"),
                   "res/actions/net24.png",
                   "res/actions/net.png");

        instrInfo.AddParameter("string", _("Site web ( Par exemple : http://www.monsite.com )"), "",false);
        instrInfo.AddParameter("string", _("Chemin du fichier ( Par exemple : /dossier/fichier.txt )"), "",false);
        instrInfo.AddParameter("string", _("Enregistrer le fichier sous le nom"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("DownloadFile").SetIncludeFile("GDL/BuiltinExtensions/NetworkTools.h");

    DECLARE_END_ACTION()
    #endif
}
