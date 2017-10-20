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

#include "GDCpp/Extensions/ExtensionBase.h"

#include "SoundObject.h"


/**
 * \brief This class declares information about the extension.
 */
class SoundObjectCppExtension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    SoundObjectCppExtension()
    {
        SetExtensionInformation("SoundObject",
                              _("Sound object"),
                              _("This Extension enables the use of spatialized sounds."),
                              "Thomas Flecy, Victor Levasseur et al.",
                              "Open source (MIT License)");


        //Declaration of all objects available
        {
            gd::ObjectMetadata & obj = AddObject<SoundObject>("Sound",
                       _("Sound"),
                       _("Invisible object emitting a sound which can be moved around."),
                       "CppPlatform/Extensions/soundicon32.png");

            AddRuntimeObject<SoundObject, RuntimeSoundObject>(
                obj, "RuntimeSoundObject");

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

                .AddParameter("object", _("Object"), "Sound")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("SetVolume").SetManipulatedType("number").SetGetter("GetVolume").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Pitch",
                           _("Pitch"),
                           _("Change the pitch of a sound object."),
                           _("Do _PARAM1__PARAM2_ to Pitch of _PARAM0_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("SetPitch").SetManipulatedType("number").SetGetter("GetPitch").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Attenuation",
                           _("Attenuation"),
                           _("Change the attenuation of a sound object."),
                           _("Do _PARAM1__PARAM2_ to the attenuation of _PARAM0_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("SetAttenuation").SetManipulatedType("number").SetGetter("GetAttenuation").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("ZPos",
                           _("Z Position"),
                           _("Modify the sound level of a Sound object."),
                           _("Do _PARAM1__PARAM2_ to the sound level of _PARAM0_"),
                           _("Position"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("SetZPos").SetManipulatedType("number").SetGetter("GetZPos").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Loop",
                           _("Automatic restart"),
                           _("Activate or deactivate the looping of a sound."),
                           _("Activate looping for _PARAM0_: _PARAM1_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .AddParameter("yesorno", _("Loop"))
                .SetFunctionName("SetLoop").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("RelativeToListener",
                           _("Listener relation"),
                           _("Activate or deactivate the sound spatialisation relative to the listener."),
                           _("Set _PARAM0_ as relative to the listener position: _PARAM1_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .AddParameter("yesorno", _("Relative to the listener"))
                .SetFunctionName("SetRelativeToListener").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Play",
                           _("Play"),
                           _("Play a sound."),
                           _("Play sound _PARAM0_"),
                           _(""),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("Play").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Stop",
                           _("Stop"),
                           _("Stop a sound."),
                           _("Stop _PARAM0_"),
                           _(""),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("Stop").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddAction("Pause",
                           _("Pause"),
                           _("Pause a sound."),
                           _("Pause _PARAM0_"),
                           _(""),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("Pause").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Volume",
                           _("Sound level"),
                           _("Test the sound level of a Sound object."),
                           _("The sound level of _PARAM0_ is _PARAM2_ _PARAM1_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .SetFunctionName("GetVolume").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Pitch",
                           _("Pitch"),
                           _("Test the pitch value of a sound."),
                           _("Pitch of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .SetFunctionName("GetPitch").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Attenuation",
                           _("Attenuation"),
                           _("Test the attenuation of a sound."),
                           _("The attenuation of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .SetFunctionName("GetAttenuation").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("MinDistance",
                           _("Minimal distance"),
                           _("Test the minimal distance of a sound"),
                           _("The minimal distance of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .SetFunctionName("GetMinDistance").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("ZPos",
                           _("Z Position"),
                           _("Test Z position of a sound."),
                           _("The Z position of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .SetFunctionName("GetZPos").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Loop",
                           _("Automatic restart"),
                           _("Test if a sound is looping."),
                           _("_PARAM0_ is looping"),
                           _("Parameters"),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("GetLoop").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Playing",
                           _("Being played"),
                           _("Test if a sound is being played."),
                           _("_PARAM0_ is being played"),
                           _(""),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("IsPlaying").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Paused",
                           _("Paused"),
                           _("A sound is paused"),
                           _("_PARAM0_ is paused"),
                           _(""),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("IsPaused").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("Stopped",
                           _("Stopped"),
                           _("Test if a sound is stopped."),
                           _("_PARAM0_ is stopped"),
                           _(""),
                           "res/actions/son24.png",
                           "res/actions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("IsStopped").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddCondition("RelativeToListener",
                           _("Listener relation"),
                           _("Test if a sound is relative to the listener."),
                           _("_PARAM0_ is relative to the listener"),
                           _("Parameters"),
                           "res/conditions/son24.png",
                           "res/conditions/son.png")

                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("IsRelativeToListener").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("Volume", _("Sound level"), _("Sound level"), _("Parameters"), "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("GetVolume").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("Pitch", _("Pitch"), _("Pitch"), _("Parameters"), "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("GetPitch").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("Attenuation", _("Attenuation"), _("Attenuation"), _("Parameters"), "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("GetAttenuation").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("MinDistance", _("Minimal distance"), _("Minimal distance"), _("Parameters"), "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("GetMinDistance").SetIncludeFile("SoundObject/SoundObject.h");


            obj.AddExpression("ZPos", _("Z Position"), _("Z Position"), _("Position"), "res/actions/son.png")
                .AddParameter("object", _("Object"), "Sound")
                .SetFunctionName("GetZPos").SetIncludeFile("SoundObject/SoundObject.h");

        #endif
        }

        // Actions li�es � l'�couteur
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

            .SetFunctionName("SetListenerX").SetManipulatedType("number").SetGetter("GetListenerX").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerY",
                       _("Y position"),
                       _("Modify the Y position of the listener."),
                       _("Do _PARAM0__PARAM1_ to the Y position of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .SetFunctionName("SetListenerY").SetManipulatedType("number").SetGetter("GetListenerY").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerZ",
                       _("Z position"),
                       _("Modify the Z position of the listener."),
                       _("Do _PARAM0__PARAM1_ to the Z position of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .SetFunctionName("SetListenerZ").SetManipulatedType("number").SetGetter("GetListenerZ").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerDirectionX",
                       _("Direction on X axis"),
                       _("Change the direction of the listener on the X axis."),
                       _("Do _PARAM0__PARAM1_ to the direction on the X axis of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .SetFunctionName("SetListenerDirectionX").SetManipulatedType("number").SetGetter("GetListenerDirectionX").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerDirectionY",
                       _("Direction on Y axis"),
                       _("Change the direction of the listener on the Y axis."),
                       _("Do _PARAM0__PARAM1_ to the direction on the Y axis of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .SetFunctionName("SetListenerDirectionY").SetManipulatedType("number").SetGetter("GetListenerDirectionY").SetIncludeFile("SoundObject/SoundListener.h");


        AddAction("ListenerDirectionZ",
                       _("Direction on Z axis"),
                       _("Change the direction of the listener on the Z axis."),
                       _("Do _PARAM0__PARAM1_ to the direction on the Z axis of the listener"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .SetFunctionName("SetListenerDirectionZ").SetManipulatedType("number").SetGetter("GetListenerDirectionZ").SetIncludeFile("SoundObject/SoundListener.h");


        // Conditions li�es � l'�couteur
        AddCondition("ListenerX",
                       _("X position"),
                       _("Test the position of the listener on the X axis."),
                       _("The listener X position is _PARAM0__PARAM1_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")


            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))
            .SetFunctionName("GetListenerX").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerY",
                       _("Y position"),
                       _("Test the position of the listener on the Y axis."),
                       _("The listener Y position is _PARAM0__PARAM1_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")


            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))
            .SetFunctionName("GetListenerY").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerZ",
                       _("Z position"),
                       _("Test the position of the listener on the Z axis."),
                       _("The listener Z position is _PARAM0__PARAM1_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")


            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))
            .SetFunctionName("GetListenerZ").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerDirectionX",
                       _("X direction"),
                       _("Test the direction of the listener on the X axis."),
                       _("The listener X direction is _PARAM0__PARAM1_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")


            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))
            .SetFunctionName("GetListenerDirectionX").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

        AddCondition("ListenerDirectionY",
                       _("Y direction"),
                       _("Test the direction of the listener on the Y axis."),
                       _("The listener Y direction is _PARAM0__PARAM1_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))

            .SetFunctionName("GetListenerDirectionY").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");




        AddCondition("ListenerDirectionZ",
                       _("Z direction"),
                       _("Test the direction of the listener on the Z axis."),
                       _("The listener Z direction is _PARAM0__PARAM1_"),
                       _("Listener"),
                       "res/actions/son24.png",
                       "res/actions/son.png")

            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))

            .SetFunctionName("GetListenerDirectionZ").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");





        AddExpression("ListenerX", _("X position"), _("Listener X position"), _("Listener"), "res/actions/son.png")
            .SetFunctionName("GetListenerX").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerY", _("Y position"), _("Listener Y position"), _("Listener"), "res/actions/son.png")
            .SetFunctionName("GetListenerY").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerZ", _("Z position"), _("Listener Z position"), _("Listener"), "res/actions/son.png")
            .SetFunctionName("GetListenerZ").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerDirectionX", _("Direction on X axis"), _("Listener x direction"), _("Listener"), "res/actions/son.png")
            .SetFunctionName("GetListenerDirectionX").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerDirectionY", _("Direction on Y axis"), _("Listener y direction"), _("Listener"), "res/actions/son.png")
            .SetFunctionName("GetListenerDirectionY").SetIncludeFile("SoundObject/SoundListener.h");


        AddExpression("ListenerDirectionZ", _("Direction on Z axis"), _("Listener z direction"), _("Listener"), "res/actions/son.png")
            .SetFunctionName("GetListenerDirectionZ").SetIncludeFile("SoundObject/SoundListener.h");

        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(ANDROID)
extern "C" ExtensionBase * CreateGDCppSoundObjectExtension() {
    return new SoundObjectCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new SoundObjectCppExtension;
}
#endif
