#include "GDL/FileExtension.h"
#include "GDL/cFichier.h"
#include "GDL/aFichier.h"

FileExtension::FileExtension()
{
    DECLARE_THE_EXTENSION("BuiltinFile",
                          _("Fonctionnalités sur les fichiers"),
                          _("Extension offrant des actions et conditions sur les fichiers, integrée en standard."),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("FileExists",
                   _("Le fichier existe"),
                   _("Teste si le fichier existe."),
                   _("Le fichier _PARAM0_ existe"),
                   _("Fichiers"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png",
                   &CondFileExists);

        DECLARE_PARAMETER("file", _("Nom du fichier"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("GroupExists",
                   _("Un groupe existe dans un fichier"),
                   _("Teste si le groupe ( de la forme /Racine/Exemple/1 ) existe dans le fichier.\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _("Le groupe _PARAM1_ existe dans le fichier _PARAM0_"),
                   _("Fichiers"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png",
                   &CondGroupExists);

        DECLARE_PARAMETER("file", _("Nom du fichier"), false, "");
        DECLARE_PARAMETER("text", _("Groupe"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("LoadFile",
                   _("Charger un fichier en mémoire"),
                   _("Cette action charge le fichier XML en mémoire, pour permettre de lire et écrire dedans.\nIl est possible de lire et d'écrire dans un fichier XML sans passer par cette action, mais les performances seront moindres."),
                   _("Charger le fichier XML _PARAM0_ en mémoire"),
                   _("Fichiers"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png",
                   &ActLoadFile);

        DECLARE_PARAMETER("file", _("Fichier"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("UnloadFile",
                   _("Fermer un fichier chargé en mémoire"),
                   _("Cette action ferme le fichier XML chargé précédemment en mémoire, en enregistrant les modifications apportées à celui ci."),
                   _("Fermer le fichier XML _PARAM0_ chargé en mémoire"),
                   _("Fichiers"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png",
                   &ActUnloadFile);

        DECLARE_PARAMETER("file", _("Fichier"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("EcrireFichierExp",
                   _("Ecrire un nombre dans un fichier"),
                   _("Cette action écrit le résultat de l'expression dans le fichier, dans le groupe indiqué.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/MonPersonnage/X)\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _("Ecrire _PARAM2_ dans _PARAM1_ du fichier _PARAM0_"),
                   _("Fichiers"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png",
                   &ActEcrireFichierExp);

        DECLARE_PARAMETER("file", _("Fichier"), false, "");
        DECLARE_PARAMETER("text", _("Groupe"), false, "");
        DECLARE_PARAMETER("expression", _("Expression"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("EcrireFichierTxt",
                   _("Ecrire un texte dans un fichier"),
                   _("Cette action écrit le texte dans le fichier, dans le groupe indiqué.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/MonPersonnage/X)\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _("Ecrire _PARAM2_ dans _PARAM1_ du fichier _PARAM0_"),
                   _("Fichiers"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png",
                   &ActEcrireFichierTxt);

        DECLARE_PARAMETER("file", _("Fichier"), false, "");
        DECLARE_PARAMETER("text", _("Groupe"), false, "");
        DECLARE_PARAMETER("text", _("Texte"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("LireFichierExp",
                   _("Lire une valeur depuis un fichier"),
                   _("Cette action lit la valeur du groupe indiqué et\nla stocke dans une variable de la scène.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/Niveau/Actuel)\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _("Lire le groupe _PARAM1_ du fichier _PARAM0_ et stocker la valeur dans _PARAM2_"),
                   _("Fichiers"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png",
                   &ActLireFichierExp);

        DECLARE_PARAMETER("file", _("Fichier"), false, "");
        DECLARE_PARAMETER("text", _("Groupe"), false, "");
        DECLARE_PARAMETER("scenevar", _("Variable de la scène"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("LireFichierTxt",
                   _("Lire un texte depuis un fichier"),
                   _("Cette action lit le texte du groupe indiqué et\nle stocke dans une variable de la scène.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/Niveau/Actuel)\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _("Lire le groupe _PARAM1_ du fichier _PARAM0_ et stocker le texte dans _PARAM2_"),
                   _("Fichiers"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png",
                   &ActLireFichierTxt);

        DECLARE_PARAMETER("file", _("Fichier"), false, "");
        DECLARE_PARAMETER("text", _("Groupe"), false, "");
        DECLARE_PARAMETER("scenevar", _("Variable de la scène"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("DeleteFichier",
                   _("Supprimer un fichier"),
                   _("Supprime le fichier de façon définitive."),
                   _("Supprimer le fichier _PARAM0_"),
                   _("Fichiers"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png",
                   &ActDeleteFichier);

        DECLARE_PARAMETER("file", _("Nom du fichier"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("DeleteGroupFichier",
                   _("Supprimer un groupe dans un fichier"),
                   _("Cette action supprime le groupe indiqué du fichier.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/Niveau/Actuel)"),
                   _("Supprimer le groupe _PARAM1_ du fichier _PARAM0_"),
                   _("Fichiers"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png",
                   &ActDeleteGroupFichier);

        DECLARE_PARAMETER("file", _("Nom du fichier"), false, "");
        DECLARE_PARAMETER("text", _("Groupe"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("LaunchFile",
                   _("Lancer un fichier"),
                   _("Cette action lance le fichier indiqué."),
                   _("Lancer le fichier _PARAM0_"),
                   _("Fichiers"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png",
                   &ActLaunchFile);

        DECLARE_PARAMETER("file", _("Nom du fichier"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ExecuteCmd",
                   _("Executer une commande"),
                   _("Cette action execute la commande indiqué."),
                   _("Executer _PARAM0_"),
                   _("Fichiers"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png",
                   &ActExecuteCmd);

        DECLARE_PARAMETER("text", _("Commande"), false, "");

    DECLARE_END_ACTION()
}
