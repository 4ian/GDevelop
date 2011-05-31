#include "GDL/FileExtension.h"
#include "GDL/cFichier.h"
#include "GDL/aFichier.h"
#include "GDL/XmlFilesHelper.h"

FileExtension::FileExtension()
{
    DECLARE_THE_EXTENSION("BuiltinFile",
                          _T("Fichiers"),
                          _T("Extension offrant des actions et conditions sur les fichiers, integrée en standard."),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("FileExists",
                   _T("Le fichier existe"),
                   _T("Teste si le fichier existe."),
                   _T("Le fichier _PARAM0_ existe"),
                   _T("Fichiers"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png",
                   &CondFileExists);

        DECLARE_PARAMETER("file", _T("Nom du fichier"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("GroupExists",
                   _T("Existence d'un groupe"),
                   _T("Teste si le groupe ( de la forme /Racine/Exemple/1 ) existe dans le fichier.\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _T("Le groupe _PARAM1_ existe dans le fichier _PARAM0_"),
                   _T("Fichiers XML"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png",
                   &CondGroupExists);

        DECLARE_PARAMETER("file", _T("Nom du fichier"), false, "");
        DECLARE_PARAMETER("text", _T("Groupe"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("LoadFile",
                   _T("Charger un fichier en mémoire"),
                   _T("Cette action charge le fichier XML en mémoire, pour permettre de lire et écrire dedans.\nIl est possible de lire et d'écrire dans un fichier XML sans passer par cette action, mais les performances seront moindres.\nN'oubliez surtout pas de décharger le fichier de la mémoire une fois les opérations terminées."),
                   _T("Charger le fichier XML _PARAM0_ en mémoire"),
                   _T("Fichiers XML"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png",
                   &ActLoadFile);

        DECLARE_PARAMETER("file", _T("Fichier"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("UnloadFile",
                   _T("Fermer un fichier chargé en mémoire"),
                   _T("Cette action ferme le fichier XML chargé précédemment en mémoire, en enregistrant les modifications apportées à celui ci."),
                   _T("Fermer le fichier XML _PARAM0_ chargé en mémoire"),
                   _T("Fichiers XML"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png",
                   &ActUnloadFile);

        DECLARE_PARAMETER("file", _T("Fichier"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("EcrireFichierExp",
                   _T("Ecrire une valeur"),
                   _T("Cette action écrit le résultat de l'expression dans le fichier, dans le groupe indiqué.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/MonPersonnage/X)\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _T("Ecrire _PARAM2_ dans _PARAM1_ du fichier _PARAM0_"),
                   _T("Fichiers XML"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png",
                   &ActEcrireFichierExp);

        DECLARE_PARAMETER("file", _T("Fichier"), false, "");
        DECLARE_PARAMETER("text", _T("Groupe"), false, "");
        DECLARE_PARAMETER("expression", _T("Expression"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("EcrireFichierTxt",
                   _T("Ecrire un texte"),
                   _T("Cette action écrit le texte dans le fichier, dans le groupe indiqué.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/MonPersonnage/X)\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _T("Ecrire _PARAM2_ dans _PARAM1_ du fichier _PARAM0_"),
                   _T("Fichiers XML"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png",
                   &ActEcrireFichierTxt);

        DECLARE_PARAMETER("file", _T("Fichier"), false, "");
        DECLARE_PARAMETER("text", _T("Groupe"), false, "");
        DECLARE_PARAMETER("text", _T("Texte"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("LireFichierExp",
                   _T("Lire une valeur"),
                   _T("Cette action lit la valeur du groupe indiqué et\nla stocke dans une variable de la scène.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/Niveau/Actuel)\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _T("Lire le groupe _PARAM1_ du fichier _PARAM0_ et stocker la valeur dans _PARAM2_"),
                   _T("Fichiers XML"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png",
                   &ActLireFichierExp);

        DECLARE_PARAMETER("file", _T("Fichier"), false, "");
        DECLARE_PARAMETER("text", _T("Groupe"), false, "");
        DECLARE_PARAMETER("scenevar", _T("Variable de la scène"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("LireFichierTxt",
                   _T("Lire un texte"),
                   _T("Cette action lit le texte du groupe indiqué et\nle stocke dans une variable de la scène.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/Niveau/Actuel)\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _T("Lire le groupe _PARAM1_ du fichier _PARAM0_ et stocker le texte dans _PARAM2_"),
                   _T("Fichiers XML"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png",
                   &ActLireFichierTxt);

        DECLARE_PARAMETER("file", _T("Fichier"), false, "");
        DECLARE_PARAMETER("text", _T("Groupe"), false, "");
        DECLARE_PARAMETER("scenevar", _T("Variable de la scène"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("DeleteFichier",
                   _T("Supprimer un fichier"),
                   _T("Supprime le fichier de façon définitive."),
                   _T("Supprimer le fichier _PARAM0_"),
                   _T("Fichiers"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png",
                   &ActDeleteFichier);

        DECLARE_PARAMETER("file", _T("Nom du fichier"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("DeleteGroupFichier",
                   _T("Supprimer un groupe"),
                   _T("Cette action supprime le groupe indiqué du fichier XML.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/Niveau/Actuel)"),
                   _T("Supprimer le groupe _PARAM1_ du fichier _PARAM0_"),
                   _T("Fichiers XML"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png",
                   &ActDeleteGroupFichier);

        DECLARE_PARAMETER("file", _T("Nom du fichier"), false, "");
        DECLARE_PARAMETER("text", _T("Groupe"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("LaunchFile",
                   _T("Lancer un fichier"),
                   _T("Cette action lance le fichier indiqué."),
                   _T("Lancer le fichier _PARAM0_"),
                   _T("Fichiers"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png",
                   &ActLaunchFile);

        DECLARE_PARAMETER("file", _T("Nom du fichier"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ExecuteCmd",
                   _T("Executer une commande"),
                   _T("Cette action execute la commande indiqué."),
                   _T("Executer _PARAM0_"),
                   _T("Fichiers"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png",
                   &ActExecuteCmd);

        DECLARE_PARAMETER("text", _T("Commande"), false, "");

    DECLARE_END_ACTION()
}

#if defined(GD_IDE_ONLY)
void FileExtension::GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const
{
    const std::map < std::string, boost::shared_ptr<XmlFile> > & openedFiles = XmlFilesManager::GetOpenedFilesList();

    unsigned int i = 0;
    std::map < std::string, boost::shared_ptr<XmlFile> >::const_iterator end = openedFiles.end();
    for (std::map < std::string, boost::shared_ptr<XmlFile> >::const_iterator iter = openedFiles.begin();iter != end;++iter)
    {
        if ( propertyNb == i )
        {
            name = _T("Fichier ouvert :");
            value = iter->first;

            return;
        }

        ++i;
    }
}

bool FileExtension::ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue)
{
    return false;
}

unsigned int FileExtension::GetNumberOfProperties(RuntimeScene & scene) const
{
    return XmlFilesManager::GetOpenedFilesList().size();
}
#endif
