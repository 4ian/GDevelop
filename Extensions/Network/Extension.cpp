/**

Game Develop - Network Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "NetworkActions.h"
#include "NetworkAutomatismActions.h"
#include "NetworkAutomatism.h"
#include "NetworkExpressions.h"
#include <boost/version.hpp>

/**
 * This class declare information about the extension.
 */
class Extension : public ExtensionBase
{
    public:

        /**
         * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
         */
        Extension()
        {
            DECLARE_THE_EXTENSION("Network",
                                  _("Fonctionnalités réseau"),
                                  _("Extension permettant de communiquer entre plusieurs jeux"),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            DECLARE_ACTION("AddRecipient",
                           _("Ajouter un destinataire"),
                           _("Ajoute l'ordinateur ayant l'adresse IP indiquée comme destinataire des données envoyées."),
                           _("Ajouter _PARAM0_ en destinataire"),
                           _("Réseau : Envoi"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png",
                           &ActAddRecipient);

                DECLARE_PARAMETER("text", _("Adresse IP du destinataire"), false, "")
                DECLARE_PARAMETER_OPTIONAL("expression", _("Port du destinataire (Par défaut : 50001)"), false, "")

            DECLARE_END_ACTION()

            DECLARE_ACTION("RemoveAllRecipients",
                           _("Supprimer tous les destinataires"),
                           _("Vide la liste des destinataires des données envoyées"),
                           _("Vider la liste des destinataires"),
                           _("Réseau : Envoi"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png",
                           &ActRemoveAllRecipients);

            DECLARE_END_ACTION()

            DECLARE_ACTION("ListenToPort",
                           _("Initialiser la réception de données"),
                           _("Initialise le réseau afin de pouvoir recevoir des données depuis d'autres ordinateurs."),
                           _("Initialiser la réception de données"),
                           _("Réseau : Reception"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png",
                           &ActListenToPort);

                DECLARE_PARAMETER_OPTIONAL("expression", _("Port d'écoute (Par défaut : 50001)"), false, "")

            DECLARE_END_ACTION()

            DECLARE_ACTION("SendValue",
                           _("Envoyer une valeur"),
                           _("Envoi une valeur aux destinataires"),
                           _("Envoyer la valeur _PARAM1_ avec l'intitulé _PARAM0_ aux destinataires"),
                           _("Réseau : Envoi"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png",
                           &ActSendValue);

                DECLARE_PARAMETER("text", _("Groupe"), false, "")
                DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                MAIN_OBJECTS_IN_PARAMETER(0)

            DECLARE_END_ACTION()

            DECLARE_ACTION("SendString",
                           _("Envoyer un texte"),
                           _("Envoi un texte aux destinataires"),
                           _("Envoyer le texte _PARAM1_ avec l'intitulé _PARAM0_ aux destinataires"),
                           _("Réseau : Envoi"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png",
                           &ActSendString);

                DECLARE_PARAMETER("text", _("Groupe"), false, "")
                DECLARE_PARAMETER("text", _("Texte"), false, "")

            DECLARE_END_ACTION()

            DECLARE_ACTION("ReceivePackets",
                           _("Recevoir les données en attente"),
                           _("Reçois les données envoyées depuis d'autre ordinateurs.\nVous pouvez ensuite les consulter avec les expressions appropriées"),
                           _("Recevoir les données"),
                           _("Réseau : Reception"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png",
                           &ActReceivePackets);

            DECLARE_END_ACTION()

            DECLARE_STR_EXPRESSION("GetReceivedDataString", _("Obtenir le texte d'une donnée"), _("Obtenir le texte contenu dans une donnée"), _("Réseau : Reception"), "res/actions/scaleHeight.png", &ExpGetReceivedDataString)
                DECLARE_PARAMETER("text", _("Nom de la donnée contenant le texte à récupérer"), false, "")
            DECLARE_END_STR_EXPRESSION()

            DECLARE_EXPRESSION("GetReceivedDataValue", _("Obtenir la valeur d'une donnée"), _("Obtenir la valeur contenue dans une donnée"), _("Réseau : Reception"), "res/texteicon.png", &ExpGetReceivedDataValue)
                DECLARE_PARAMETER("text", _("Nom de la donnée contenant le texte à récupérer"), false, "")
            DECLARE_END_EXPRESSION()

            DECLARE_STR_EXPRESSION("GetLastError", _("Dernière erreur survenue"), _("Obtenir le texte décrivant la dernière erreur survenue."), _("Réseau : Erreurs"), "res/error.png", &ExpGetLastError)
            DECLARE_END_STR_EXPRESSION()

            DECLARE_AUTOMATISM("NetworkAutomatism",
                      _("Mise à jour en réseau automatique"),
                      _("NetworkUpdater"),
                      _("Automatisme permettant de déplacer automatiquement les objets d'un jeu en réseau"),
                      "",
                      "Extensions/networkicon32.png",
                      NetworkAutomatism,
                      SceneNetworkDatas)

                DECLARE_AUTOMATISM_ACTION("SetAsSender",
                               _("Mettre en envoi de données"),
                               _("L'automatisme enverra les données de ses objets.\nAssurez vous d'avoir généré les identifiants des objets auparavant"),
                               _("Mettre _PARAM0_ en envoi de données"),
                               _("Automatisme Mise à jour en réseau automatique"),
                               "Extensions/networkicon24.png",
                               "Extensions/networkicon.png",
                               &NetworkAutomatism::ActSetAsSender);

                    DECLARE_PARAMETER("object", _("Object"), true, "")
                    DECLARE_PARAMETER("automatism", _("Automatism"), false, "NetworkAutomatism")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_AUTOMATISM_ACTION()

                DECLARE_AUTOMATISM_ACTION("SetAsReceiver",
                               _("Mettre en réception de données"),
                               _("L'automatisme recevra les données et mettera à jours les objets.\nAssurez vous d'avoir généré les identifiants des objets auparavant"),
                               _("Mettre _PARAM0_ en réception de données"),
                               _("Automatisme Mise à jour en réseau automatique"),
                               "Extensions/networkicon24.png",
                               "Extensions/networkicon.png",
                               &NetworkAutomatism::ActSetAsReceiver);

                    DECLARE_PARAMETER("object", _("Object"), true, "")
                    DECLARE_PARAMETER("automatism", _("Automatism"), false, "NetworkAutomatism")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_AUTOMATISM_ACTION()

                DECLARE_AUTOMATISM_ACTION("SetIdentifier",
                               _("Changer l'identifiant de l'objet"),
                               _("Chaque objet nécessite un identifiant unique, le même sur tous les ordinateurs, afin d'être identifié et mis à jour"),
                               _("Mettre l'identifiant de _PARAM0_ à _PARAM2_"),
                               _("Automatisme Mise à jour en réseau automatique"),
                               "Extensions/networkicon24.png",
                               "Extensions/networkicon.png",
                               &NetworkAutomatism::ActSetIdentifier);

                    DECLARE_PARAMETER("object", _("Object"), true, "")
                    DECLARE_PARAMETER("automatism", _("Automatism"), false, "NetworkAutomatism")
                    DECLARE_PARAMETER("expression", _("Identifiant"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_AUTOMATISM_ACTION()

                DECLARE_AUTOMATISM_EXPRESSION("GetIdentifier", _("Obtenir l'identifiant de l'objet"), _("Obtenir l'identifiant de l'objet"), _("Automatisme Mise à jour en réseau automatique"), "res/texteicon.png", &NetworkAutomatism::ExpGetIdentifier)
                    DECLARE_PARAMETER("object", _("Objet"), true, "")
                    DECLARE_PARAMETER("automatism", _("Automatisme"), false, "NetworkAutomatism")
                DECLARE_END_AUTOMATISM_EXPRESSION()

            DECLARE_END_AUTOMATISM()

            DECLARE_ACTION("GenerateObjectNetworkId",
                           _("Générer les identifiants des objets"),
                           _("Génère automatiquement des identifiants différents pour les objets indiqués.\nNotez qu'il est préférable d'utiliser cette action en début de scène par exemple, pour assurer que les objets aient\nbien les mêmes identifiants sur les différents ordinateurs."),
                           _("Générer des identifiants réseau unique pour _PARAM0_"),
                           _("Automatisme Mise à jour en réseau automatique"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png",
                           &ActGenereateObjectNetworkId);

                DECLARE_PARAMETER("object", _("Object"), true, "")
                DECLARE_PARAMETER("automatism", _("Automatism"), false, "NetworkAutomatism")
                MAIN_OBJECTS_IN_PARAMETER(0)

            DECLARE_END_ACTION()

            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

    protected:
    private:

        /**
         * This function is called by Game Develop so
         * as to complete information about how the extension was compiled ( which libs... )
         * -- Do not need to be modified. --
         */
        void CompleteCompilationInformation()
        {
            #if defined(GD_IDE_ONLY)
            compilationInfo.runtimeOnly = false;
            #else
            compilationInfo.runtimeOnly = true;
            #endif

            #if defined(__GNUC__)
            compilationInfo.gccMajorVersion = __GNUC__;
            compilationInfo.gccMinorVersion = __GNUC_MINOR__;
            compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__;
            #endif

            compilationInfo.boostVersion = BOOST_VERSION;

            compilationInfo.sfmlMajorVersion = 2;
            compilationInfo.sfmlMinorVersion = 0;

            #if defined(GD_IDE_ONLY)
            compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION;
            compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION;
            compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER;
            compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
            #endif

            compilationInfo.gdlVersion = RC_FILEVERSION_STRING;
            compilationInfo.sizeOfpInt = sizeof(int*);

            compilationInfo.informationCompleted = true;
        }
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void DestroyGDExtension(ExtensionBase * p) {
    delete p;
}
