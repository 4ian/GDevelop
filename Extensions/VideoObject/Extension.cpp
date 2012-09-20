/**

Game Develop - Video Object Extension
Copyright (c) 2010-2012 Florian Rival (Florian.Rival@gmail.com)

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

/**
 * Contributors:
 * Victor Levasseur: Added Audio implementation to VideoWrapper and support for loading video from memory
 */

/*
Note : How to compile dependencies ?

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

Mac :
-Download libogg, libvorbis and libtheora
-For each of them, do "./configure", "make", "make install".
-Need also to install X11 dev package.

*/

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "VideoObject.h"
#include <boost/version.hpp>

/**
 * \brief This class declares information about the extension.
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
                                  _("Video Object"),
                                  _("Extension allowing to use an object displaying a video."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            //Declaration of all objects available
            DECLARE_OBJECT("Video",
                           _("Video"),
                           _("Object displaying a video without sound."),
                           "Extensions/videoicon.png",
                           &CreateVideoObject,
                           &DestroyVideoObject,
                           "VideoObject");

                #if defined(GD_IDE_ONLY)

                objInfos.SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_OBJECT_ACTION("LoadVideo",
                               _("Load and play a video"),
                               _("Load the video and play it."),
                               _("Load and play _PARAM1_"),
                               _("Video"),
                               "res/starticon24.png",
                               "res/starticon.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddParameter("file", _("Video"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("LoadAndPlayVideo").SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("SetPause",
                               _("De/activate pause"),
                               _("Pause or unpause video."),
                               _("Set the pause of _PARAM0_ : _PARAM1_"),
                               _("Video"),
                               "res/pauseicon24.png",
                               "res/pauseicon.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddParameter("yesorno", _("Activate pause \?"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetPause").SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("SetLooping",
                               _("De/activate automatic restart"),
                               _("Set or unset automatic restart."),
                               _("Restart _PARAM0_ automatically : _PARAM1_"),
                               _("Video"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddParameter("yesorno", _("Activate automatic restart \?"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetLooping").SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Restart",
                               _("Restart the video"),
                               _("Restart video from beginning."),
                               _("Restart _PARAM0_"),
                               _("Video"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddCodeOnlyParameter("inlineCode", "0");


                    instrInfo.cppCallingInformation.SetFunctionName("Seek").SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Seek",
                               _("Go to a position in video"),
                               _("Modify the current position in the video."),
                               _("Go to position _PARAM1_ in video of _PARAM0_"),
                               _("Video"),
                               "res/conditions/time24.png",
                               "res/conditions/time.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddParameter("expression", _("Position ( in seconds )"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("Seek").SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Paused",
                               _("Video paused"),
                               _("Return true if video is paused."),
                               _("_PARAM0_ is paused"),
                               _("Video"),
                               "res/pauseicon24.png",
                               "res/pauseicon.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);


                    instrInfo.cppCallingInformation.SetFunctionName("IsPaused").SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_CONDITION("Looping",
                               _("Automatic restart"),
                               _("Return true if the video automatically restart."),
                               _("_PARAM0_ automatically restart"),
                               _("Video"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetLooping").SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_CONDITION("TimePosition",
                               _("Position in video"),
                               _("Test the current position in video."),
                               _("Current position in the video of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Video"),
                               "res/conditions/time24.png",
                               "res/conditions/time.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddParameter("expression", _("Position ( in seconds ) to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetTimePosition").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("ChangeColor",
                               _("Change the color of a Video object"),
                               _("Change the global color of video. The default color is white."),
                               _("Change color of _PARAM0_ to _PARAM1_"),
                               _("Effects"),
                               "res/actions/color24.png",
                               "res/actions/color.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddParameter("color", _("Color"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetColor").SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Opacity",
                               _("Change object's opacity"),
                               _("Change transparency of a Video object."),
                               _("Do _PARAM2__PARAM1_ to the opacity of _PARAM0_"),
                               _("Visibility"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetOpacity").SetAssociatedGetter("GetOpacity").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Opacity",
                               _("Object opacity"),
                               _("Test the opacity of video."),
                               _("The opacity of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Visibility"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetOpacity").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");


                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Angle",
                               _("Modify the angle of a Video object."),
                               _("Modify the angle of a Video object."),
                               _("Do _PARAM2__PARAM1_ to the angle of _PARAM0_"),
                               _("Rotation"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetAngle").SetAssociatedGetter("GetAngle").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Angle",
                               _("Angle of a Video object"),
                               _("Test the value of the angle of a Video object."),
                               _("The angle of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Rotation"),
                               "res/conditions/rotate24.png",
                               "res/conditions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Volume",
                               _("Modify the audio volume of a video object"),
                               _("Modify the audio volume of a video object."),
                               _("Do _PARAM2__PARAM1_ to the audio volume of _PARAM0_"),
                               _("Sound"),
                               "res/actions/volume24.png",
                               "res/actions/volume.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetVolume").SetAssociatedGetter("GetVolume").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Volume",
                               _("Audio volume of a video object"),
                               _("Test the value of the audio volume of a Video object."),
                               _("Audio volule of _PARAM0_ is _PARAM2_ _PARAM1_"),
                               _("Sound"),
                               "res/conditions/volume24.png",
                               "res/conditions/volume.png");

                    instrInfo.AddParameter("object", _("Object"), "Video", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetVolume").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_EXPRESSION("Opacity", _("Opacity"), _("Opacity"), _("Opacity"), "res/actions/opacity.png")
                    instrInfo.AddParameter("object", _("Object"), "Video", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetOpacity").SetIncludeFile("VideoObject/VideoObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("Angle", _("Angle"), _("Angle"), _("Rotation"), "res/actions/rotate.png")
                    instrInfo.AddParameter("object", _("Object"), "Video", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetIncludeFile("VideoObject/VideoObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("TimePosition", _("Current position in video"), _("Current position in the video, in seconds."), _("Video"), "res/conditions/time.png")
                    instrInfo.AddParameter("object", _("Object"), "Video", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetTimePosition").SetIncludeFile("VideoObject/VideoObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("Duration", _("Length"), _("Length of the video in seconds"), _("Video"), "res/conditions/time.png")
                    instrInfo.AddParameter("object", _("Object"), "Video", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetDuration").SetIncludeFile("VideoObject/VideoObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("Volume", _("Sound level"), _("Video's audio volume"), _("Sound"), "res/conditions/volume.png")
                    instrInfo.AddParameter("object", _("Object"), "Video", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetVolume").SetIncludeFile("VideoObject/VideoObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_STR_EXPRESSION("VideoFile", _("Video file"), _("Video file"), _("Video file"), "res/conditions/fichier.png")
                    instrInfo.AddParameter("object", _("Object"), "Video", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetVideoFile").SetIncludeFile("VideoObject/VideoObject.h");
                DECLARE_END_OBJECT_STR_EXPRESSION()

                #endif

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
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}

