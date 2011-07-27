#include "GDL/FileExtension.h"
#include "GDL/XmlFilesHelper.h"

FileExtension::FileExtension()
{
    DECLARE_THE_EXTENSION("BuiltinFile",
                          _("Fichiers"),
                          _("Extension offrant des actions et conditions sur les fichiers, integrée en standard."),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("FileExists",
                   _("Le fichier existe"),
                   _("Teste si le fichier existe."),
                   _("Le fichier _PARAM0_ existe"),
                   _("Fichiers"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png");

        instrInfo.AddParameter("file", _("Nom du fichier"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("FileExists").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("GroupExists",
                   _("Existence d'un groupe"),
                   _("Teste si le groupe ( de la forme /Racine/Exemple/1 ) existe dans le fichier.\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _("Le groupe _PARAM1_ existe dans le fichier _PARAM0_"),
                   _("Fichiers XML"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png");

        instrInfo.AddParameter("file", _("Nom du fichier"), "",false);
        instrInfo.AddParameter("string", _("Groupe"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GroupExists").SetIncludeFile("GDL/FileTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("LoadFile",
                   _("Charger un fichier en mémoire"),
                   _("Cette action charge le fichier XML en mémoire, pour permettre de lire et écrire dedans.\nIl est possible de lire et d'écrire dans un fichier XML sans passer par cette action, mais les performances seront moindres.\nN'oubliez surtout pas de décharger le fichier de la mémoire une fois les opérations terminées."),
                   _("Charger le fichier XML _PARAM0_ en mémoire"),
                   _("Fichiers XML"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png");

        instrInfo.AddParameter("file", _("Fichier"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("LoadFileInMemory").SetIncludeFile("GDL/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("UnloadFile",
                   _("Fermer un fichier chargé en mémoire"),
                   _("Cette action ferme le fichier XML chargé précédemment en mémoire, en enregistrant les modifications apportées à celui ci."),
                   _("Fermer le fichier XML _PARAM0_ chargé en mémoire"),
                   _("Fichiers XML"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png");

        instrInfo.AddParameter("file", _("Fichier"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("UnloadFileFromMemory").SetIncludeFile("GDL/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("EcrireFichierExp",
                   _("Ecrire une valeur"),
                   _("Cette action écrit le résultat de l'expression dans le fichier, dans le groupe indiqué.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/MonPersonnage/X)\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _("Ecrire _PARAM2_ dans _PARAM1_ du fichier _PARAM0_"),
                   _("Fichiers XML"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png");

        instrInfo.AddParameter("file", _("Fichier"), "",false);
        instrInfo.AddParameter("string", _("Groupe"), "",false);
        instrInfo.AddParameter("expression", _("Expression"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("WriteValueInFile").SetIncludeFile("GDL/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("EcrireFichierTxt",
                   _("Ecrire un texte"),
                   _("Cette action écrit le texte dans le fichier, dans le groupe indiqué.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/MonPersonnage/X)\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _("Ecrire _PARAM2_ dans _PARAM1_ du fichier _PARAM0_"),
                   _("Fichiers XML"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png");

        instrInfo.AddParameter("file", _("Fichier"), "",false);
        instrInfo.AddParameter("string", _("Groupe"), "",false);
        instrInfo.AddParameter("string", _("Texte"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("WriteStringInFile").SetIncludeFile("GDL/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("LireFichierExp",
                   _("Lire une valeur"),
                   _("Cette action lit la valeur du groupe indiqué et\nla stocke dans une variable de la scène.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/Niveau/Actuel)\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _("Lire le groupe _PARAM1_ du fichier _PARAM0_ et stocker la valeur dans _PARAM2_"),
                   _("Fichiers XML"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png");

        instrInfo.AddParameter("file", _("Fichier"), "",false);
        instrInfo.AddParameter("string", _("Groupe"), "",false);
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Variable de la scène"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("ReadValueFromFile").SetIncludeFile("GDL/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("LireFichierTxt",
                   _("Lire un texte"),
                   _("Cette action lit le texte du groupe indiqué et\nle stocke dans une variable de la scène.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/Niveau/Actuel)\nAttention ! Les espaces sont interdits dans le nom des groupes."),
                   _("Lire le groupe _PARAM1_ du fichier _PARAM0_ et stocker le texte dans _PARAM2_"),
                   _("Fichiers XML"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png");

        instrInfo.AddParameter("file", _("Fichier"), "",false);
        instrInfo.AddParameter("string", _("Groupe"), "",false);
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Variable de la scène"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("ReadStringFromFile").SetIncludeFile("GDL/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("DeleteFichier",
                   _("Supprimer un fichier"),
                   _("Supprime le fichier de façon définitive."),
                   _("Supprimer le fichier _PARAM0_"),
                   _("Fichiers"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png");

        instrInfo.AddParameter("file", _("Nom du fichier"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDDeleteFile").SetIncludeFile("GDL/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("DeleteGroupFichier",
                   _("Supprimer un groupe"),
                   _("Cette action supprime le groupe indiqué du fichier XML.\nIndiquez la structure du groupe en séparant les éléments par des /. (Exemple : Racine/Niveau/Actuel)"),
                   _("Supprimer le groupe _PARAM1_ du fichier _PARAM0_"),
                   _("Fichiers XML"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png");

        instrInfo.AddParameter("file", _("Nom du fichier"), "",false);
        instrInfo.AddParameter("string", _("Groupe"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("DeleteGroupFromFile").SetIncludeFile("GDL/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("LaunchFile",
                   _("Lancer un fichier"),
                   _("Cette action lance le fichier indiqué."),
                   _("Lancer le fichier _PARAM0_"),
                   _("Fichiers"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png");

        instrInfo.AddParameter("file", _("Nom du fichier"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("LaunchFile").SetIncludeFile("GDL/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ExecuteCmd",
                   _("Executer une commande"),
                   _("Cette action execute la commande indiqué."),
                   _("Executer _PARAM0_"),
                   _("Fichiers"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png");

        instrInfo.AddParameter("string", _("Commande"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("ExecuteCmd").SetIncludeFile("GDL/FileTools.h");

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
            name = _("Fichier ouvert :");
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
