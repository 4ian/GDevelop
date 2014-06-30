/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy

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
 * Contributors to the extension:
 * Victor Levasseur ( Reworked extension )
 * Florian Rival ( Adaptations to the latest versions of GD )
 */

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "SoundObject.h"
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
        SetExtensionInformation("SoundObject",
                              _("Sound object"),
                              _("Extension allowing to use spatialized sounds."),
                              "Thomas Flecy, Victor Levasseur et al.",
                              "Freeware");


        //Declaration of all objects available
        {
            gd::ObjectMetadata & obj = AddObject("Sound",
                       _("Sound"),
                       _("Invisible object emitting a sound which can be moved in the space."),
                       "CppPlatform/Extensions/soundicon32.png",
                       &CreateSoundObject,
                       &DestroySoundObject);

            AddRuntimeObject(obj, "RuntimeSoundObject", CreateRuntimeSoundObject, DestroyRuntimeSoundObject);

            #if defined(GD_IDE_ONLY)
            SoundObject::LoadEdittimeIcon();
            obj.SetIncludeFile("SoundObject/SoundObject.h");

            obj.AddAction("Volume",
                           _("Sound level"),
                           _("Modify the sound level of a Sound object."),
                           _("Do _PARAM1__PARAM2_ to the sound level of _PARAM0_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetVolume").SetManipulatedType("number").SetAssociatedGetter("GetVolume").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Pitch",
                           _("Pitch"),
                           _("Change the pitch of a sound object."),
                           _("Do _PARAM1__PARAM2_ to Pitch of _PARAM0_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetPitch").SetManipulatedType("number").SetAssociatedGetter("GetPitch").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Attenuation",
                           _("Attenuation"),
                           _("Change the attenuation of a sound object."),
                           _("Do _PARAM1__PARAM2_ to the attenuation of _PARAM0_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetAttenuation").SetManipulatedType("number").SetAssociatedGetter("GetAttenuation").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("ZPos",
                           _("Z Position"),
                           _("Modify the sound level of a Sound object."),
                           _("Do _PARAM1__PARAM2_ to the sound level of _PARAM0_"),
                           _("Position"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetZPos").SetManipulatedType("number").SetAssociatedGetter("GetZPos").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Loop",
                           _("Automatic restart"),
                           _("Activate or desactivate the looping of a sound."),
                           _("Activate looping for _PARAM0_: _PARAM1_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .AddParameter("yesorno", _("Loop"))
                .codeExtraInformation.SetFunctionName("SetLoop").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("RelativeToListener",
                           _("Listener relation"),
                           _("Activate or desactivate the sound spatialisation relative to the listener."),
                           _("Set _PARAM0_ as relative to the listener position: _PARAM1_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .AddParameter("yesorno", _("Relative to the listener"))
                .codeExtraInformation.SetFunctionName("SetRelativeToListener").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Play",
                           _("Play"),
                           _("Play a sound."),
                           _("Play sound _PARAM0_"),
                           "",
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("Play").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Stop",
                           _("Stop"),
                           _("Stop a sound."),
                           _("Stop _PARAM0_"),
                           "",
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("Stop").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Pause",
                           _("Pause"),
                           _("Pause a sound."),
                           _("Pause _PARAM0_"),
                           "",
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("Pause").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Volume",
                           _("Sound level"),
                           _("Test the sound level of a Sound object."),
                           _("Th sound level of _PARAM0_ is _PARAM2_ _PARAM1_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("GetVolume").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Pitch",
                           _("Pitch"),
                           _("Test the pitch value of a sound."),
                           _("Pitch of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("GetPitch").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Attenuation",
                           _("Attenuation"),
                           _("Test the attenuation of a sound."),
                           _("The attenuation of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("GetAttenuation").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("MinDistance",
                           _("Minimal distance"),
                           _("Test the minimal distance of a sound"),
                           _("The minimal distance of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("GetMinDistance").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("ZPos",
                           _("Z Position"),
                           _("Test Z position of a sound."),
                           _("The Z position of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("GetZPos").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Loop",
                           _("Automatic restart"),
                           _("Test if an sound is looping."),
                           _("_PARAM0_ is looping"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("GetLoop").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Playing",
                           _("Being played"),
                           _("Test if a sound is being played."),
                           _("_PARAM0_ is being played"),
                           "",
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("IsPlaying").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Paused",
                           _("Paused"),
                           _("A sound is paused"),
                           _("_PARAM0_ is paused"),
                           "",
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("IsPaused").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Stopped",
                           _("Stopped"),
                           _("Test if a sound is stopped."),
                           _("_PARAM0_ is stopped"),
                           "",
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("IsStopped").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("RelativeToListener",
                           _("Listener relation"),
                           _("Test if a sound is relative to the listener."),
                           _("_PARAM0_ is relative to the listener"),
                           _("Parameters"),
                           "res/conditions/son24.png",
                           "res/conditions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("IsRelativeToListener").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("Volume", _("Sound level"), _("Sound level"), _("Parameters"), "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("GetVolume").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("Pitch", _("Pitch"), _("Pitch"), _("Parameters"), "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("GetPitch").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("Attenuation", _("Attenuation"), _("Attenuation"), _("Parameters"), "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("GetAttenuation").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("MinDistance", _("Minimal distance"), _("Minimal distance"), _("Parameters"), "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("GetMinDistance").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("ZPos", _("Z Position"), _("Z Position"), _("Position"), "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("GetZPos").SetIncludeFile("SoundObject/SoundObject.h");

        #endif
        }

        // Actions liées à l'écouteur
        #if defined(GD_IDE_ONLY)
        AddAction("ListenerX",
                       _("X position"),
                       _("Modify the X position of the listener."),
                       _("Do _PARAM0__PARAM1_ to the X position of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .codeExtraInformation.SetFunctionName("SetListenerX").SetManipulatedType("number").SetAssociatedGetter("GetListenerX").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerY",
                       _("Y position"),
                       _("Modify the Y position of the listener."),
                       _("Do _PARAM0__PARAM1_ to the Y position of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .codeExtraInformation.SetFunctionName("SetListenerY").SetManipulatedType("number").SetAssociatedGetter("GetListenerY").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerZ",
                       _("Z position"),
                       _("Modify the Z position of the listener."),
                       _("Do _PARAM0__PARAM1_ to the Z position of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .codeExtraInformation.SetFunctionName("SetListenerZ").SetManipulatedType("number").SetAssociatedGetter("GetListenerZ").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerDirectionX",
                       _("Direction on X axis"),
                       _("Change the direction of the listener on X axis."),
                       _("Do _PARAM1__PARAM2_ to the direction on X axis of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .codeExtraInformation.SetFunctionName("SetListenerDirectionX").SetManipulatedType("number").SetAssociatedGetter("GetListenerDirectionX").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerDirectionY",
                       _("Direction on Y axis"),
                       _("Change the direction of the listener on Y axis."),
                       _("Do _PARAM1__PARAM2_ to the direction on Y axis of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .codeExtraInformation.SetFunctionName("SetListenerDirectionY").SetManipulatedType("number").SetAssociatedGetter("GetListenerDirectionY").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerDirectionZ",
                       _("Direction on Z axis"),
                       _("Change the direction of the listener on Z axis."),
                       _("Do _PARAM1__PARAM2_ to the direction on Z axis of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .codeExtraInformation.SetFunctionName("SetListenerDirectionZ").SetManipulatedType("number").SetAssociatedGetter("GetListenerDirectionZ").SetIncludeFile("SoundObject/SoundListener.h");


        // Conditions liées à l'écouteur
        AddCondition("ListenerX",
                       _("X position"),
                       _("Test the position of the listener on X axis."),
                       _("The listener X position is _PARAM1__PARAM0_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))
            .codeExtraInformation.SetFunctionName("GetListenerX").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerY",
                       _("Y position"),
                       _("Test the position of the listener on Y axis."),
                       _("The listener Y position is _PARAM1__PARAM0_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))
            .codeExtraInformation.SetFunctionName("GetListenerY").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerZ",
                       _("Z position"),
                       _("Test the position of the listener on Z axis."),
                       _("The listener Z position is _PARAM1__PARAM0_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))
            .codeExtraInformation.SetFunctionName("GetListenerZ").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerDirectionX",
                       _("X direction"),
                       _("Test the direction of the listener on X axis."),
                       _("The listener X direction is _PARAM1__PARAM0_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))
            .codeExtraInformation.SetFunctionName("GetListenerDirectionX").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerDirectionY",
                       _("Y direction"),
                       _("Test the direction of the listener on Y axis."),
                       _("The listener Y direction is _PARAM1__PARAM0_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))

            .codeExtraInformation.SetFunctionName("GetListenerDirectionY").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");




        AddCondition("ListenerDirectionZ",
                       _("Z direction"),
                       _("Test the direction of the listener on Z axis."),
                       _("The listener Z direction is _PARAM1__PARAM0_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))

            .codeExtraInformation.SetFunctionName("GetListenerDirectionZ").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");




        AddExpression("ListenerX", _("X position"), _("Listener X position"), _("Listener"), "res/actions/son.png")
            .codeExtraInformation.SetFunctionName("GetListenerX").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerY", _("Y position"), _("Listener Y position"), _("Listener"), "res/actions/son.png")
            .codeExtraInformation.SetFunctionName("GetListenerY").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerZ", _("Z position"), _("Listener Z position"), _("Listener"), "res/actions/son.png")
            .codeExtraInformation.SetFunctionName("GetListenerZ").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerDirectionX", _("Direction on X axis"), _("Listener x direction"), _("Listener"), "res/actions/son.png")
            .codeExtraInformation.SetFunctionName("GetListenerDirectionX").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerDirectionY", _("Direction on Y axis"), _("Listener y direction"), _("Listener"), "res/actions/son.png")
            .codeExtraInformation.SetFunctionName("GetListenerDirectionY").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerDirectionZ", _("Direction on Z axis"), _("Listener z direction"), _("Listener"), "res/actions/son.png")
            .codeExtraInformation.SetFunctionName("GetListenerDirectionZ").SetIncludeFile("SoundObject/SoundListener.h");

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

