/**

Game Develop - Video Object Extension
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

/*
Note : How to compile dependancies ?

Download libogg, libvorbis, libtheora and libtheoraplayer.

Mingw :
-Using MSYS, go to libogg directory, type "./configure --prefix=c:/mingw" and press Enter.
-Type "make" and "make install" to build and install libogg
-go to libvorbis directory, type "./configure --prefix=c:/mingw" and press Enter.
-Type "make" and "make install" to build and install libvorbis
-go to libtheora directory, type "./configure --prefix=c:/mingw" and press Enter.
-Type "make" and "make install" to build and install libtheora
-Build libtheoraplayer using Code::Blocks projects. Define DTHEORAVIDEO_STATIC if necessary.

Linux :
-Install libogg and libvorbis ( development packages )
-Install or download and manually rebuild ( make/make install ) libtheora if this latter is too old.

*/

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "VideoObject.h"
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
            DECLARE_THE_EXTENSION("VideoObject",
                                  _("Objet Video"),
                                  _("Extension permettant d'utiliser un objet affichant une vidéo."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            //Declaration of all objects available
            DECLARE_OBJECT("Video",
                           _("Video"),
                           _("Objet affichant une vidéo sans son."),
                           "Extensions/videoicon.png",
                           &CreateVideoObject,
                           &DestroyVideoObject);

                DECLARE_OBJECT_ACTION("LoadVideo",
                               _("Charger et jouer une vidéo"),
                               _("Charge la vidéo et la joue."),
                               _("Charger et jouer _PARAM1_"),
                               _("Vidéo"),
                               "res/starticon24.png",
                               "res/starticon.png",
                               &VideoObject::ActLoadVideo);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    DECLARE_PARAMETER("file", _("Vidéo"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("SetPause",
                               _("De/Activer la pause"),
                               _("Met ou enlève la pause de la vidéo."),
                               _("Mettre en pause _PARAM0_ : _PARAM1_"),
                               _("Vidéo"),
                               "res/pauseicon24.png",
                               "res/pauseicon.png",
                               &VideoObject::ActSetPause);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    DECLARE_PARAMETER("yesorno", _("Activer la pause ?"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("SetLooping",
                               _("De/Activer le bouclage"),
                               _("Met ou enlève le retour automatique au départ de la vidéo."),
                               _("Redémarrer _PARAM0_ automatiquement : _PARAM1_"),
                               _("Vidéo"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png",
                               &VideoObject::ActSetLooping);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    DECLARE_PARAMETER("yesorno", _("Activer le bouclage ?"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Restart",
                               _("Relancer la vidéo"),
                               _("Redémarre la vidéo depuis le départ."),
                               _("Relancer _PARAM0_"),
                               _("Vidéo"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png",
                               &VideoObject::ActRestart);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Seek",
                               _("Aller à une position dans la vidéo"),
                               _("Modifie la position actuelle dans la vidéo."),
                               _("Aller à la position _PARAM1_s de _PARAM0_"),
                               _("Vidéo"),
                               "res/conditions/time24.png",
                               "res/conditions/time.png",
                               &VideoObject::ActSeek);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    DECLARE_PARAMETER("expression", _("Position ( en secondes )"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Paused",
                               _("Vidéo en pause ?"),
                               _("Renvoi vrai si la vidéo est en pause"),
                               _("_PARAM0_ est en pause"),
                               _("Vidéo"),
                               "res/pauseicon24.png",
                               "res/pauseicon.png",
                               &VideoObject::CondPaused);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_CONDITION("Looping",
                               _("Bouclage"),
                               _("Renvoi vrai si la vidéo boucle automatiquement."),
                               _("_PARAM0_ redémarre automatiquement"),
                               _("Vidéo"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png",
                               &VideoObject::CondLooping);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_CONDITION("TimePosition",
                               _("Position dans la vidéo"),
                               _("Teste la position actuelle dans la vidéo."),
                               _("La position de la vidéo de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Vidéo"),
                               "res/conditions/time24.png",
                               "res/conditions/time.png",
                               &VideoObject::CondTimePosition);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    DECLARE_PARAMETER("expression", _("Position ( en secondes ) à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("ChangeColor",
                               _("Changer la couleur d'un objet vidéo"),
                               _("Change la couleur globale de la vidéo. Par défaut, la couleur est le blanc."),
                               _("Changer la couleur de _PARAM0_ en _PARAM1_"),
                               _("Effets"),
                               "res/actions/color24.png",
                               "res/actions/color.png",
                               &VideoObject::ActChangeColor);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    DECLARE_PARAMETER("color", _("Couleur"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Opacity",
                               _("Régler l'opacité d'un objet"),
                               _("Modifie la transparence d'un objet vidéo."),
                               _("Faire _PARAM2__PARAM1_ à l'opacité de _PARAM0_"),
                               _("Visibilité"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png",
                               &VideoObject::ActOpacity);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Opacity",
                               _("Opacité d'un objet"),
                               _("Teste la valeur de l'opacité ( transparence ) d'un objet vidéo."),
                               _("L'opacité de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Visibilité"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png",
                               &VideoObject::CondOpacity);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Angle",
                               _("Régler l'angle d'un objet vidéo"),
                               _("Modifie l'angle d'un objet vidéo."),
                               _("Faire _PARAM2__PARAM1_ à l'angle de _PARAM0_"),
                               _("Rotation"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png",
                               &VideoObject::ActAngle);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Angle",
                               _("Angle d'un objet vidéo"),
                               _("Teste la valeur de l'angle d'un objet vidéo."),
                               _("L'angle de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Rotation"),
                               "res/conditions/rotate24.png",
                               "res/conditions/rotate.png",
                               &VideoObject::CondAngle);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                    DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_EXPRESSION("Opacity", _("Opacité"), _("Opacité"), _("Opacité"), "res/actions/opacity.png", &VideoObject::ExpOpacity)
                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("Angle", _("Angle"), _("Angle"), _("Rotation"), "res/actions/rotate.png", &VideoObject::ExpAngle)
                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("TimePosition", _("Position actuelle dans la vidéo"), _("Position actuelle dans la vidéo en secondes"), _("Vidéo"), "res/conditions/time.png", &VideoObject::ExpTimePosition)
                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("Duration", _("Durée"), _("Durée de la vidéo en secondes"), _("Vidéo"), "res/conditions/time.png", &VideoObject::ExpDuration)
                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_STR_EXPRESSION("VideoFile", _("Fichier vidéo"), _("Fichier vidéo"), _("Fichier vidéo"), "res/conditions/fichier.png", &VideoObject::ExpVideoFile)
                    DECLARE_PARAMETER("object", _("Objet"), true, "Video")
                DECLARE_END_OBJECT_STR_EXPRESSION()

            DECLARE_END_OBJECT()

            #if defined(GD_IDE_ONLY)
            supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "libogg-0.dll"));
            supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "libtheoradec-1.dll"));
            supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "libtheoraplayer.dll"));
            supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "libvorbis-0.dll"));
            supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libtheoradec.so.1"));
            #endif


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
