#include "GDL/NetworkExtension.h"
#include "GDL/aNet.h"

NetworkExtension::NetworkExtension()
{
    DECLARE_THE_EXTENSION("BuiltinNetwork",
                          _("Fonctionnalités réseau"),
                          _("Extension pour utiliser internet, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_ACTION("EnvoiDataNet",
                   _("Envoyer des données sur internet"),
                   _("Envoie les données spécifié à un site web.\nVous avez besoin de mettre en place une page php sur votre site web permettant de récolter ces données.\nEntrez un mot de passe, et appliquez le même à la configuration de votre page php.\nPour plus d'informations sur la mise en place de votre site, consultez l'aide."),
                   _("Envoyer à _PARAM0_ les données : _PARAM2_, _PARAM3_,_PARAM4_,_PARAM5_,_PARAM6_,_PARAM7_"),
                   _("Réseau"),
                   "res/actions/net24.png",
                   "res/actions/net.png",
                   &ActEnvoiDataNet);

        DECLARE_PARAMETER("text", _("Adresse de la page .php ( N'oubliez pas le protocole http:// )"), false, "")
        DECLARE_PARAMETER("password", _("Mot de passe de sécurité"), false, "")
        DECLARE_PARAMETER("text", _("Donnée 1"), false, "")
        DECLARE_PARAMETER_OPTIONAL("text", _("Donnée 2"), false, "")
        DECLARE_PARAMETER_OPTIONAL("text", _("Donnée 3"), false, "")
        DECLARE_PARAMETER_OPTIONAL("text", _("Donnée 4"), false, "")
        DECLARE_PARAMETER_OPTIONAL("text", _("Donnée 5"), false, "")
        DECLARE_PARAMETER_OPTIONAL("text", _("Donnée 6"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("DownloadFile",
                   _("Télécharger un fichier"),
                   _("Télécharge un fichier depuis un site web."),
                   _("Télécharger le fichier _PARAM1_ depuis _PARAM0_ sous le nom de _PARAM2_"),
                   _("Réseau"),
                   "res/actions/net24.png",
                   "res/actions/net.png",
                   &ActDownloadFile);

        DECLARE_PARAMETER("text", _("Site web ( Par exemple : http://www.monsite.com )"), false, "")
        DECLARE_PARAMETER("text", _("Chemin du fichier ( Par exemple : /dossier/fichier.txt )"), false, "")
        DECLARE_PARAMETER("text", _("Enregistrer le fichier sous le nom"), false, "")

    DECLARE_END_ACTION()
}
