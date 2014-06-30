/**

Game Develop - Video Object Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
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
        SetExtensionInformation("VideoObject",
                              _("Video Object"),
                              _("Extension allowing to use an object displaying a video."),
                              "Florian Rival",
                              "zlib/libpng License (Open Source)");

        //Declaration of all objects available
        {
            gd::ObjectMetadata & obj = AddObject("Video",
                       _("Video"),
                       _("Displays a video"),
                       "CppPlatform/Extensions/videoicon.png",
                       &CreateVideoObject,
                       &DestroyVideoObject,
                       "VideoObject");

            AddRuntimeObject(obj, "RuntimeVideoObject", CreateRuntimeVideoObject, DestroyRuntimeVideoObject);

            #if defined(GD_IDE_ONLY)

            obj.SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddAction("LoadVideo",
                           _("Load and play a video"),
                           _("Load the video and play it."),
                           _("Load and play _PARAM1_"),
                           _("Video"),
                           "res/starticon24.png",
                           "res/starticon.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddParameter("file", _("Video"))
                .codeExtraInformation.SetFunctionName("LoadAndPlayVideo").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddAction("SetPause",
                           _("De/activate pause"),
                           _("Pause or unpause video."),
                           _("Set the pause of _PARAM0_ : _PARAM1_"),
                           _("Video"),
                           "res/pauseicon24.png",
                           "res/pauseicon.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddParameter("yesorno", _("Activate pause \?"))
                .codeExtraInformation.SetFunctionName("SetPause").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddAction("SetLooping",
                           _("De/activate automatic restart"),
                           _("Set or unset automatic restart."),
                           _("Restart _PARAM0_ automatically : _PARAM1_"),
                           _("Video"),
                           "res/actions/rotate24.png",
                           "res/actions/rotate.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddParameter("yesorno", _("Activate automatic restart \?"))
                .codeExtraInformation.SetFunctionName("SetLooping").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddAction("Restart",
                           _("Restart the video"),
                           _("Restart video from beginning."),
                           _("Restart _PARAM0_"),
                           _("Video"),
                           "res/actions/rotate24.png",
                           "res/actions/rotate.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddCodeOnlyParameter("inlineCode", "0")
                .codeExtraInformation.SetFunctionName("Seek").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddAction("Seek",
                           _("Go to a position in video"),
                           _("Modify the current position in the video."),
                           _("Go to position _PARAM1_ in video of _PARAM0_"),
                           _("Video"),
                           "res/conditions/time24.png",
                           "res/conditions/time.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddParameter("expression", _("Position ( in seconds )"))
                .codeExtraInformation.SetFunctionName("Seek").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddCondition("Paused",
                           _("Video paused"),
                           _("Return true if video is paused."),
                           _("_PARAM0_ is paused"),
                           _("Video"),
                           "res/pauseicon24.png",
                           "res/pauseicon.png")
                .AddParameter("object", _("Object"), "Video", false);
                .codeExtraInformation.SetFunctionName("IsPaused").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddCondition("Looping",
                           _("Automatic restart"),
                           _("Return true if the video automatically restart."),
                           _("_PARAM0_ automatically restart"),
                           _("Video"),
                           "res/actions/rotate24.png",
                           "res/actions/rotate.png")
                .AddParameter("object", _("Object"), "Video", false);
                .codeExtraInformation.SetFunctionName("GetLooping").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddCondition("TimePosition",
                           _("Position in video"),
                           _("Test the current position in video."),
                           _("Current position in the video of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Video"),
                           "res/conditions/time24.png",
                           "res/conditions/time.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Position ( in seconds ) to test"))
                .codeExtraInformation.SetFunctionName("GetTimePosition").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddAction("ChangeColor",
                           _("Change the color of a Video object"),
                           _("Change the global color of video. The default color is white."),
                           _("Change color of _PARAM0_ to _PARAM1_"),
                           _("Effects"),
                           "res/actions/color24.png",
                           "res/actions/color.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddParameter("color", _("Color"))
                .codeExtraInformation.SetFunctionName("SetColor").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddAction("Opacity",
                           _("Change object's opacity"),
                           _("Change transparency of a Video object."),
                           _("Do _PARAM1__PARAM2_ to the opacity of _PARAM0_"),
                           _("Visibility"),
                           "res/actions/opacity24.png",
                           "res/actions/opacity.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetOpacity").SetAssociatedGetter("GetOpacity").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");


            obj.AddCondition("Opacity",
                           _("Object opacity"),
                           _("Test the opacity of video."),
                           _("The opacity of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Visibility"),
                           "res/conditions/opacity24.png",
                           "res/conditions/opacity.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("GetOpacity").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");


            obj.AddAction("Angle",
                           _("Modify the angle of a Video object."),
                           _("Modify the angle of a Video object."),
                           _("Do _PARAM1__PARAM2_ to the angle of _PARAM0_"),
                           _("Rotation"),
                           "res/actions/rotate24.png",
                           "res/actions/rotate.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetAngle").SetAssociatedGetter("GetAngle").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");


            obj.AddCondition("Angle",
                           _("Angle of a Video object"),
                           _("Test the value of the angle of a Video object."),
                           _("The angle of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Rotation"),
                           "res/conditions/rotate24.png",
                           "res/conditions/rotate.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddAction("Volume",
                           _("Modify the audio volume of a video object"),
                           _("Modify the audio volume of a video object."),
                           _("Do _PARAM1__PARAM2_ to the audio volume of _PARAM0_"),
                           _("Sound"),
                           "res/actions/volume24.png",
                           "res/actions/volume.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetVolume").SetAssociatedGetter("GetVolume").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddCondition("Volume",
                           _("Audio volume of a video object"),
                           _("Test the value of the audio volume of a Video object."),
                           _("Audio volule of _PARAM0_ is _PARAM2_ _PARAM1_"),
                           _("Sound"),
                           "res/conditions/volume24.png",
                           "res/conditions/volume.png")
                .AddParameter("object", _("Object"), "Video", false);
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("GetVolume").SetManipulatedType("number").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddExpression("Opacity", _("Opacity"), _("Opacity"), _("Opacity"), "res/actions/opacity.png")
                .AddParameter("object", _("Object"), "Video", false);
                .codeExtraInformation.SetFunctionName("GetOpacity").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddExpression("Angle", _("Angle"), _("Angle"), _("Rotation"), "res/actions/rotate.png")
                .AddParameter("object", _("Object"), "Video", false);
                .codeExtraInformation.SetFunctionName("GetAngle").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddExpression("TimePosition", _("Current position in video"), _("Current position in the video, in seconds."), _("Video"), "res/conditions/time.png")
                .AddParameter("object", _("Object"), "Video", false);
                .codeExtraInformation.SetFunctionName("GetTimePosition").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddExpression("Duration", _("Length"), _("Length of the video in seconds"), _("Video"), "res/conditions/time.png")
                .AddParameter("object", _("Object"), "Video", false);
                .codeExtraInformation.SetFunctionName("GetDuration").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddExpression("Volume", _("Sound level"), _("Video's audio volume"), _("Sound"), "res/conditions/volume.png")
                .AddParameter("object", _("Object"), "Video", false);
                .codeExtraInformation.SetFunctionName("GetVolume").SetIncludeFile("VideoObject/VideoObject.h");

            obj.AddStrExpression("VideoFile", _("Video file"), _("Video file"), _("Video file"), "res/conditions/fichier.png")
                .AddParameter("object", _("Object"), "Video", false);
                .codeExtraInformation.SetFunctionName("GetVideoFile").SetIncludeFile("VideoObject/VideoObject.h");

            #endif

        }

        #if defined(GD_IDE_ONLY)
        supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "libogg-0.dll"));
        supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "libtheoradec-1.dll"));
        supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "libtheoraplayer.dll"));
        supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "libvorbis-0.dll"));
        supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libtheoradec.so.1"));
        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
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

