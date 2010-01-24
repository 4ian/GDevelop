#include "GDL/InterfaceExtension.h"
#include "GDL/aGUI.h"

InterfaceExtension::InterfaceExtension()
{
    DECLARE_THE_EXTENSION("BuiltinInterface",
                          _("Fonctionnalités d'interface"),
                          _("Extension permettant d'afficher des interfaces, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_ACTION("ShowMsgBox",
                   _("Afficher une boite de message"),
                   _("Affiche une boite de message avec le texte indiqué, et un bouton ok."),
                   _("Afficher le message \"_PARAM0_\" avec le titre \"_PARAM1_\""),
                   _("Interfaces"),
                   "res/actions/msgbox24.png",
                   "res/actions/msgbox.png",
                   &ActShowMsgBox);

        DECLARE_PARAMETER("texte", _("Message"), false, "")
        DECLARE_PARAMETER("texte", _("Titre"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ShowOpenFile",
                   _("Afficher une fenêtre d'ouverture de fichier"),
                   _("Affiche une fenêtre permettant de choisir un fichier.\nLe nom et répertoire du fichier est enregistré dans la variable de la scène indiquée."),
                   _("Ouvrir une fenêtre de choix de fichier, et enregistrer le résultat dans _PARAM0_"),
                   _("Interfaces"),
                   "res/actions/openfile24.png",
                   "res/actions/openfile.png",
                   &ActShowOpenFile);

        DECLARE_PARAMETER("scenevar", _("Variable de la scène où enregistrer le résultat"), false, "")
        DECLARE_PARAMETER("texte", _("Titre"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ShowTextInput",
                   _("Afficher une fenêtre d'entrée de texte"),
                   _("Affiche une fenêtre permettant d'entrer un texte.\nLe texte sera enregistré dans la variable de la scène indiquée."),
                   _("Ouvrir une fenêtre d'entrée de texte, et enregistrer le résultat dans _PARAM0_"),
                   _("Interfaces"),
                   "res/actions/textenter24.png",
                   "res/actions/textenter.png",
                   &ActShowTextInput);

        DECLARE_PARAMETER("scenevar", _("Variable de la scène où enregistrer le résultat"), false, "")
        DECLARE_PARAMETER("texte", _("Message"), false, "")
        DECLARE_PARAMETER("texte", _("Titre"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ShowYesNoMsgBox",
                   _("Afficher une boite de message Oui/Non"),
                   _("Affiche une fenêtre permettant de choisir entre oui ou non.\nLa réponse sera enregistrée dans la variable de la scène indiquée."),
                   _("Ouvrir une fenêtre Oui/Non, et enregistrer le résultat dans _PARAM0_"),
                   _("Interfaces"),
                   "res/actions/msgbox24.png",
                   "res/actions/msgbox.png",
                   &ActShowYesNoMsgBox);

        DECLARE_PARAMETER("scenevar", _("Variable de la scène où enregistrer le résultat"), false, "")
        DECLARE_PARAMETER("texte", _("Message"), false, "")
        DECLARE_PARAMETER("texte", _("Titre"), false, "")

    DECLARE_END_ACTION()

}
