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
                           _("Sound level"),
                           _("Modify the sound level of a Sound object."),
                           GD_T("Do _PARAM1__PARAM2_ to the sound level of _PARAM0_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("SetVolume").SetManipulatedType("number").SetGetter("GetVolume").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Pitch",
                           _("Pitch"),
                           _("Change the pitch of a sound object."),
                           GD_T("Do _PARAM1__PARAM2_ to Pitch of _PARAM0_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("SetPitch").SetManipulatedType("number").SetGetter("GetPitch").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Attenuation",
                           _("Attenuation"),
                           _("Change the attenuation of a sound object."),
                           GD_T("Do _PARAM1__PARAM2_ to the attenuation of _PARAM0_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("SetAttenuation").SetManipulatedType("number").SetGetter("GetAttenuation").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("ZPos",
                           _("Z Position"),
                           _("Modify the sound level of a Sound object."),
                           GD_T("Do _PARAM1__PARAM2_ to the sound level of _PARAM0_"),
                           _("Position"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("SetZPos").SetManipulatedType("number").SetGetter("GetZPos").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Loop",
                           _("Automatic restart"),
                           _("Activate or desactivate the looping of a sound."),
                           GD_T("Activate looping for _PARAM0_: _PARAM1_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("yesorno", GD_T("Loop"))
                .SetFunctionName("SetLoop").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("RelativeToListener",
                           _("Listener relation"),
                           _("Activate or desactivate the sound spatialisation relative to the listener."),
                           GD_T("Set _PARAM0_ as relative to the listener position: _PARAM1_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("yesorno", GD_T("Relative to the listener"))
                .SetFunctionName("SetRelativeToListener").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Play",
                           _("Play"),
                           _("Play a sound."),
                           GD_T("Play sound _PARAM0_"),
                           _(""),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("Play").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Stop",
                           _("Stop"),
                           _("Stop a sound."),
                           GD_T("Stop _PARAM0_"),
                           _(""),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("Stop").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Pause",
                           _("Pause"),
                           _("Pause a sound."),
                           GD_T("Pause _PARAM0_"),
                           _(""),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("Pause").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Volume",
                           _("Sound level"),
                           _("Test the sound level of a Sound object."),
                           GD_T("Th sound level of _PARAM0_ is _PARAM2_ _PARAM1_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))
                .SetFunctionName("GetVolume").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Pitch",
                           _("Pitch"),
                           _("Test the pitch value of a sound."),
                           GD_T("Pitch of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))
                .SetFunctionName("GetPitch").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Attenuation",
                           _("Attenuation"),
                           _("Test the attenuation of a sound."),
                           GD_T("The attenuation of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))
                .SetFunctionName("GetAttenuation").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("MinDistance",
                           _("Minimal distance"),
                           _("Test the minimal distance of a sound"),
                           GD_T("The minimal distance of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))
                .SetFunctionName("GetMinDistance").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("ZPos",
                           _("Z Position"),
                           _("Test Z position of a sound."),
                           GD_T("The Z position of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))
                .SetFunctionName("GetZPos").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Loop",
                           _("Automatic restart"),
                           _("Test if an sound is looping."),
                           GD_T("_PARAM0_ is looping"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("GetLoop").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Playing",
                           _("Being played"),
                           _("Test if a sound is being played."),
                           GD_T("_PARAM0_ is being played"),
                           _(""),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("IsPlaying").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Paused",
                           _("Paused"),
                           _("A sound is paused"),
                           GD_T("_PARAM0_ is paused"),
                           _(""),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("IsPaused").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Stopped",
                           _("Stopped"),
                           _("Test if a sound is stopped."),
                           GD_T("_PARAM0_ is stopped"),
                           _(""),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("IsStopped").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("RelativeToListener",
                           _("Listener relation"),
                           _("Test if a sound is relative to the listener."),
                           GD_T("_PARAM0_ is relative to the listener"),
                           _("Parameters"),
                           "res/conditions/son24.png",
                           "res/conditions/son.png")

                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("IsRelativeToListener").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("Volume", GD_T("Sound level"), GD_T("Sound level"), GD_T("Parameters"), "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("GetVolume").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("Pitch", GD_T("Pitch"), GD_T("Pitch"), GD_T("Parameters"), "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("GetPitch").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("Attenuation", GD_T("Attenuation"), GD_T("Attenuation"), GD_T("Parameters"), "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("GetAttenuation").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("MinDistance", GD_T("Minimal distance"), GD_T("Minimal distance"), GD_T("Parameters"), "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("GetMinDistance").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("ZPos", GD_T("Z Position"), GD_T("Z Position"), GD_T("Position"), "res/actions/son.png")
                .AddParameter("object", GD_T("Object"), "Sound", false)
                .SetFunctionName("GetZPos").SetIncludeFile("SoundObject/SoundObject.h");

        #endif
        }

        // Actions liées à l'écouteur
        #if defined(GD_IDE_ONLY)
        AddAction("ListenerX",
                       _("X position"),
                       _("Modify the X position of the listener."),
                       GD_T("Do _PARAM0__PARAM1_ to the X position of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .SetFunctionName("SetListenerX").SetManipulatedType("number").SetGetter("GetListenerX").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerY",
                       _("Y position"),
                       _("Modify the Y position of the listener."),
                       GD_T("Do _PARAM0__PARAM1_ to the Y position of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .SetFunctionName("SetListenerY").SetManipulatedType("number").SetGetter("GetListenerY").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerZ",
                       _("Z position"),
                       _("Modify the Z position of the listener."),
                       GD_T("Do _PARAM0__PARAM1_ to the Z position of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .SetFunctionName("SetListenerZ").SetManipulatedType("number").SetGetter("GetListenerZ").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerDirectionX",
                       _("Direction on X axis"),
                       _("Change the direction of the listener on X axis."),
                       GD_T("Do _PARAM1__PARAM2_ to the direction on X axis of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .SetFunctionName("SetListenerDirectionX").SetManipulatedType("number").SetGetter("GetListenerDirectionX").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerDirectionY",
                       _("Direction on Y axis"),
                       _("Change the direction of the listener on Y axis."),
                       GD_T("Do _PARAM1__PARAM2_ to the direction on Y axis of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .SetFunctionName("SetListenerDirectionY").SetManipulatedType("number").SetGetter("GetListenerDirectionY").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerDirectionZ",
                       _("Direction on Z axis"),
                       _("Change the direction of the listener on Z axis."),
                       GD_T("Do _PARAM1__PARAM2_ to the direction on Z axis of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .SetFunctionName("SetListenerDirectionZ").SetManipulatedType("number").SetGetter("GetListenerDirectionZ").SetIncludeFile("SoundObject/SoundListener.h");


        // Conditions liées à l'écouteur
        AddCondition("ListenerX",
                       _("X position"),
                       _("Test the position of the listener on X axis."),
                       GD_T("The listener X position is _PARAM1__PARAM0_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")


            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))
            .SetFunctionName("GetListenerX").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerY",
                       _("Y position"),
                       _("Test the position of the listener on Y axis."),
                       GD_T("The listener Y position is _PARAM1__PARAM0_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")


            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))
            .SetFunctionName("GetListenerY").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerZ",
                       _("Z position"),
                       _("Test the position of the listener on Z axis."),
                       GD_T("The listener Z position is _PARAM1__PARAM0_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")


            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))
            .SetFunctionName("GetListenerZ").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerDirectionX",
                       _("X direction"),
                       _("Test the direction of the listener on X axis."),
                       GD_T("The listener X direction is _PARAM1__PARAM0_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")


            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))
            .SetFunctionName("GetListenerDirectionX").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerDirectionY",
                       _("Y direction"),
                       _("Test the direction of the listener on Y axis."),
                       GD_T("The listener Y direction is _PARAM1__PARAM0_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))

            .SetFunctionName("GetListenerDirectionY").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");




        AddCondition("ListenerDirectionZ",
                       _("Z direction"),
                       _("Test the direction of the listener on Z axis."),
                       GD_T("The listener Z direction is _PARAM1__PARAM0_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))

            .SetFunctionName("GetListenerDirectionZ").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");





        AddExpression("ListenerX", GD_T("X position"), GD_T("Listener X position"), GD_T("Listener"), "res/actions/son.png")
            .SetFunctionName("GetListenerX").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerY", GD_T("Y position"), GD_T("Listener Y position"), GD_T("Listener"), "res/actions/son.png")
            .SetFunctionName("GetListenerY").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerZ", GD_T("Z position"), GD_T("Listener Z position"), GD_T("Listener"), "res/actions/son.png")
            .SetFunctionName("GetListenerZ").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerDirectionX", GD_T("Direction on X axis"), GD_T("Listener x direction"), GD_T("Listener"), "res/actions/son.png")
            .SetFunctionName("GetListenerDirectionX").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerDirectionY", GD_T("Direction on Y axis"), GD_T("Listener y direction"), GD_T("Listener"), "res/actions/son.png")
            .SetFunctionName("GetListenerDirectionY").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerDirectionZ", GD_T("Direction on Z axis"), GD_T("Listener z direction"), GD_T("Listener"), "res/actions/son.png")
            .SetFunctionName("GetListenerDirectionZ").SetIncludeFile("SoundObject/SoundListener.h");

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
