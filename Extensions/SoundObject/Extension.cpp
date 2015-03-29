/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Victor Levasseur ( Reworked extension )
 * Florian Rival ( Adaptations to the latest versions of GD )
 */

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "SoundObject.h"


/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("SoundObject",
                              GD_T("Sound object"),
                              GD_T("Extension allowing to use spatialized sounds."),
                              "Thomas Flecy, Victor Levasseur et al.",
                              "Open source (MIT License)");


        //Declaration of all objects available
        {
            gd::ObjectMetadata & obj = AddObject("Sound",
                       GD_T("Sound"),
                       GD_T("Invisible object emitting a sound which can be moved in the space."),
                       "CppPlatform/Extensions/soundicon32.png",
                       &CreateSoundObject);

            AddRuntimeObject(obj, "RuntimeSoundObject", CreateRuntimeSoundObject);

            #if defined(GD_IDE_ONLY)
            SoundObject::LoadEdittimeIcon();
            obj.SetIncludeFile("SoundObject/SoundObject.h");

            obj.AddAction("Volume",
                           GD_T("Sound level"),
                           GD_T("Modify the sound level of a Sound object."),
                           GD_T("Do _PARAM1__PARAM2_ to the sound level of _PARAM0_"),
                           GD_T("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .codeExtraInformation.SetFunctionName("SetVolume").SetManipulatedType("number").SetAssociatedGetter("GetVolume").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Pitch",
                           GD_T("Pitch"),
                           GD_T("Change the pitch of a sound object."),
                           GD_T("Do _PARAM1__PARAM2_ to Pitch of _PARAM0_"),
                           GD_T("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .codeExtraInformation.SetFunctionName("SetPitch").SetManipulatedType("number").SetAssociatedGetter("GetPitch").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Attenuation",
                           GD_T("Attenuation"),
                           GD_T("Change the attenuation of a sound object."),
                           GD_T("Do _PARAM1__PARAM2_ to the attenuation of _PARAM0_"),
                           GD_T("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .codeExtraInformation.SetFunctionName("SetAttenuation").SetManipulatedType("number").SetAssociatedGetter("GetAttenuation").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("ZPos",
                           GD_T("Z Position"),
                           GD_T("Modify the sound level of a Sound object."),
                           GD_T("Do _PARAM1__PARAM2_ to the sound level of _PARAM0_"),
                           GD_T("Position"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .codeExtraInformation.SetFunctionName("SetZPos").SetManipulatedType("number").SetAssociatedGetter("GetZPos").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Loop",
                           GD_T("Automatic restart"),
                           GD_T("Activate or desactivate the looping of a sound."),
                           GD_T("Activate looping for _PARAM0_: _PARAM1_"),
                           GD_T("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("yesorno", GD_T("Loop"))
                .codeExtraInformation.SetFunctionName("SetLoop").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("RelativeToListener",
                           GD_T("Listener relation"),
                           GD_T("Activate or desactivate the sound spatialisation relative to the listener."),
                           GD_T("Set _PARAM0_ as relative to the listener position: _PARAM1_"),
                           GD_T("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("yesorno", GD_T("Relative to the listener"))
                .codeExtraInformation.SetFunctionName("SetRelativeToListener").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Play",
                           GD_T("Play"),
                           GD_T("Play a sound."),
                           GD_T("Play sound _PARAM0_"),
                           "",
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("Play").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Stop",
                           GD_T("Stop"),
                           GD_T("Stop a sound."),
                           GD_T("Stop _PARAM0_"),
                           "",
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("Stop").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Pause",
                           GD_T("Pause"),
                           GD_T("Pause a sound."),
                           GD_T("Pause _PARAM0_"),
                           "",
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("Pause").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Volume",
                           GD_T("Sound level"),
                           GD_T("Test the sound level of a Sound object."),
                           GD_T("Th sound level of _PARAM0_ is _PARAM2_ _PARAM1_"),
                           GD_T("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))
                .codeExtraInformation.SetFunctionName("GetVolume").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Pitch",
                           GD_T("Pitch"),
                           GD_T("Test the pitch value of a sound."),
                           GD_T("Pitch of _PARAM0_ is _PARAM1__PARAM2_"),
                           GD_T("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))
                .codeExtraInformation.SetFunctionName("GetPitch").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Attenuation",
                           GD_T("Attenuation"),
                           GD_T("Test the attenuation of a sound."),
                           GD_T("The attenuation of _PARAM0_ is _PARAM1__PARAM2_"),
                           GD_T("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))
                .codeExtraInformation.SetFunctionName("GetAttenuation").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("MinDistance",
                           GD_T("Minimal distance"),
                           GD_T("Test the minimal distance of a sound"),
                           GD_T("The minimal distance of _PARAM0_ is _PARAM1__PARAM2_"),
                           GD_T("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))
                .codeExtraInformation.SetFunctionName("GetMinDistance").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("ZPos",
                           GD_T("Z Position"),
                           GD_T("Test Z position of a sound."),
                           GD_T("The Z position of _PARAM0_ is _PARAM1__PARAM2_"),
                           GD_T("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))
                .codeExtraInformation.SetFunctionName("GetZPos").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Loop",
                           GD_T("Automatic restart"),
                           GD_T("Test if an sound is looping."),
                           GD_T("_PARAM0_ is looping"),
                           GD_T("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("GetLoop").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Playing",
                           GD_T("Being played"),
                           GD_T("Test if a sound is being played."),
                           GD_T("_PARAM0_ is being played"),
                           "",
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("IsPlaying").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Paused",
                           GD_T("Paused"),
                           GD_T("A sound is paused"),
                           GD_T("_PARAM0_ is paused"),
                           "",
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("IsPaused").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Stopped",
                           GD_T("Stopped"),
                           GD_T("Test if a sound is stopped."),
                           GD_T("_PARAM0_ is stopped"),
                           "",
                           "res/actions/son24.png",
                           "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("IsStopped").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("RelativeToListener",
                           GD_T("Listener relation"),
                           GD_T("Test if a sound is relative to the listener."),
                           GD_T("_PARAM0_ is relative to the listener"),
                           GD_T("Parameters"),
                           "res/conditions/son24.png",
                           "res/conditions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("IsRelativeToListener").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("Volume", GD_T("Sound level"), GD_T("Sound level"), GD_T("Parameters"), "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("GetVolume").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("Pitch", GD_T("Pitch"), GD_T("Pitch"), GD_T("Parameters"), "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("GetPitch").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("Attenuation", GD_T("Attenuation"), GD_T("Attenuation"), GD_T("Parameters"), "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("GetAttenuation").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("MinDistance", GD_T("Minimal distance"), GD_T("Minimal distance"), GD_T("Parameters"), "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("GetMinDistance").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("ZPos", GD_T("Z Position"), GD_T("Z Position"), GD_T("Position"), "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .codeExtraInformation.SetFunctionName("GetZPos").SetIncludeFile("SoundObject/SoundObject.h");

        #endif
        }

        // Actions liées à l'écouteur
        #if defined(GD_IDE_ONLY)
        AddAction("ListenerX",
                       GD_T("X position"),
                       GD_T("Modify the X position of the listener."),
                       GD_T("Do _PARAM0__PARAM1_ to the X position of the listener"),
                       GD_T("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .codeExtraInformation.SetFunctionName("SetListenerX").SetManipulatedType("number").SetAssociatedGetter("GetListenerX").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerY",
                       GD_T("Y position"),
                       GD_T("Modify the Y position of the listener."),
                       GD_T("Do _PARAM0__PARAM1_ to the Y position of the listener"),
                       GD_T("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .codeExtraInformation.SetFunctionName("SetListenerY").SetManipulatedType("number").SetAssociatedGetter("GetListenerY").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerZ",
                       GD_T("Z position"),
                       GD_T("Modify the Z position of the listener."),
                       GD_T("Do _PARAM0__PARAM1_ to the Z position of the listener"),
                       GD_T("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .codeExtraInformation.SetFunctionName("SetListenerZ").SetManipulatedType("number").SetAssociatedGetter("GetListenerZ").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerDirectionX",
                       GD_T("Direction on X axis"),
                       GD_T("Change the direction of the listener on X axis."),
                       GD_T("Do _PARAM1__PARAM2_ to the direction on X axis of the listener"),
                       GD_T("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .codeExtraInformation.SetFunctionName("SetListenerDirectionX").SetManipulatedType("number").SetAssociatedGetter("GetListenerDirectionX").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerDirectionY",
                       GD_T("Direction on Y axis"),
                       GD_T("Change the direction of the listener on Y axis."),
                       GD_T("Do _PARAM1__PARAM2_ to the direction on Y axis of the listener"),
                       GD_T("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .codeExtraInformation.SetFunctionName("SetListenerDirectionY").SetManipulatedType("number").SetAssociatedGetter("GetListenerDirectionY").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerDirectionZ",
                       GD_T("Direction on Z axis"),
                       GD_T("Change the direction of the listener on Z axis."),
                       GD_T("Do _PARAM1__PARAM2_ to the direction on Z axis of the listener"),
                       GD_T("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .codeExtraInformation.SetFunctionName("SetListenerDirectionZ").SetManipulatedType("number").SetAssociatedGetter("GetListenerDirectionZ").SetIncludeFile("SoundObject/SoundListener.h");


        // Conditions liées à l'écouteur
        AddCondition("ListenerX",
                       GD_T("X position"),
                       GD_T("Test the position of the listener on X axis."),
                       GD_T("The listener X position is _PARAM1__PARAM0_"),
                       GD_T("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))
            .codeExtraInformation.SetFunctionName("GetListenerX").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerY",
                       GD_T("Y position"),
                       GD_T("Test the position of the listener on Y axis."),
                       GD_T("The listener Y position is _PARAM1__PARAM0_"),
                       GD_T("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))
            .codeExtraInformation.SetFunctionName("GetListenerY").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerZ",
                       GD_T("Z position"),
                       GD_T("Test the position of the listener on Z axis."),
                       GD_T("The listener Z position is _PARAM1__PARAM0_"),
                       GD_T("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))
            .codeExtraInformation.SetFunctionName("GetListenerZ").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerDirectionX",
                       GD_T("X direction"),
                       GD_T("Test the direction of the listener on X axis."),
                       GD_T("The listener X direction is _PARAM1__PARAM0_"),
                       GD_T("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))
            .codeExtraInformation.SetFunctionName("GetListenerDirectionX").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerDirectionY",
                       GD_T("Y direction"),
                       GD_T("Test the direction of the listener on Y axis."),
                       GD_T("The listener Y direction is _PARAM1__PARAM0_"),
                       GD_T("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))

            .codeExtraInformation.SetFunctionName("GetListenerDirectionY").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");




        AddCondition("ListenerDirectionZ",
                       GD_T("Z direction"),
                       GD_T("Test the direction of the listener on Z axis."),
                       GD_T("The listener Z direction is _PARAM1__PARAM0_"),
                       GD_T("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))

            .codeExtraInformation.SetFunctionName("GetListenerDirectionZ").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");




        AddExpression("ListenerX", GD_T("X position"), GD_T("Listener X position"), GD_T("Listener"), "res/actions/son.png")
            .codeExtraInformation.SetFunctionName("GetListenerX").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerY", GD_T("Y position"), GD_T("Listener Y position"), GD_T("Listener"), "res/actions/son.png")
            .codeExtraInformation.SetFunctionName("GetListenerY").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerZ", GD_T("Z position"), GD_T("Listener Z position"), GD_T("Listener"), "res/actions/son.png")
            .codeExtraInformation.SetFunctionName("GetListenerZ").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerDirectionX", GD_T("Direction on X axis"), GD_T("Listener x direction"), GD_T("Listener"), "res/actions/son.png")
            .codeExtraInformation.SetFunctionName("GetListenerDirectionX").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerDirectionY", GD_T("Direction on Y axis"), GD_T("Listener y direction"), GD_T("Listener"), "res/actions/son.png")
            .codeExtraInformation.SetFunctionName("GetListenerDirectionY").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerDirectionZ", GD_T("Direction on Z axis"), GD_T("Listener z direction"), GD_T("Listener"), "res/actions/son.png")
            .codeExtraInformation.SetFunctionName("GetListenerDirectionZ").SetIncludeFile("SoundObject/SoundListener.h");

        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
