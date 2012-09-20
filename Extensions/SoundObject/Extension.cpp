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
 * Florian Rival ( Minor adaptations )
 */

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
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
            DECLARE_THE_EXTENSION("SoundObject",
                                  _("Sound object"),
                                  _("Extension allowing to use spatialized sounds."),
                                  "Thomas Flecy, Victor Levasseur et al.",
                                  "Freeware")


            //Declaration of all objects available
            DECLARE_OBJECT("Sound",
                           _("Sound"),
                           _("Sound that can be moved in the space."),
                           "Extensions/soundicon32.png",
                           &CreateSoundObject,
                           &DestroySoundObject,
                           "SoundObject");

                #if defined(GD_IDE_ONLY)
                SoundObject::LoadEdittimeIcon();
                objInfos.SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_OBJECT_ACTION("Volume",
                               _("Sound level"),
                               _("Modify the sound level of a Sound object."),
                               _("Do _PARAM2__PARAM1_ to the sound level of _PARAM0_"),
                               _("Parameters"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetVolume").SetManipulatedType("number").SetAssociatedGetter("GetVolume").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_ACTION()


                DECLARE_OBJECT_ACTION("Pitch",
                               _("Pitch"),
                               _("Change the pitch of a sound object."),
                               _("Do _PARAM2__PARAM1_ to Pitch of _PARAM0_"),
                               _("Parameters"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetPitch").SetManipulatedType("number").SetAssociatedGetter("GetPitch").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_ACTION()


                DECLARE_OBJECT_ACTION("Attenuation",
                               _("Attenuation"),
                               _("Change the attenuation of a sound object."),
                               _("Do _PARAM2__PARAM1_ to the attenuation of _PARAM0_"),
                               _("Parameters"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetAttenuation").SetManipulatedType("number").SetAssociatedGetter("GetAttenuation").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_ACTION()


                DECLARE_OBJECT_ACTION("ZPos",
                               _("Z Position"),
                               _("Modify the sound level of a Sound object."),
                               _("Do _PARAM2__PARAM1_ to the sound level of _PARAM0_"),
                               _("Position"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetZPos").SetManipulatedType("number").SetAssociatedGetter("GetZPos").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_ACTION()


                DECLARE_OBJECT_ACTION("Loop",
                               _("Automatic restart"),
                               _("Activate or desactivate the looping of a sound."),
                               _("Activate looping for _PARAM0_: _PARAM1_"),
                               _("Parameters"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);
                    instrInfo.AddParameter("yesorno", _("Loop"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetLoop").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_ACTION()


                DECLARE_OBJECT_ACTION("RelativeToListener",
                               _("Listener relation"),
                               _("Activate or desactivate the sound spatialisation relative to the listener."),
                               _("Set _PARAM0_ as relative to the listener position: _PARAM1_"),
                               _("Parameters"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);
                    instrInfo.AddParameter("yesorno", _("Relative to the listener"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetRelativeToListener").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_ACTION()


                DECLARE_OBJECT_ACTION("Play",
                               _("Play"),
                               _("Play a sound."),
                               _("Play sound _PARAM0_"),
                               _("Play"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("Play").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_ACTION()


                DECLARE_OBJECT_ACTION("Stop",
                               _("Stop"),
                               _("Stop a sound."),
                               _("Stop _PARAM0_"),
                               _("Play"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("Stop").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_ACTION()


                DECLARE_OBJECT_ACTION("Pause",
                               _("Pause"),
                               _("Pause a sound."),
                               _("Pause _PARAM0_"),
                               _("Play"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("Pause").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_ACTION()


                DECLARE_OBJECT_CONDITION("Volume",
                               _("Sound level"),
                               _("Test the sound level of a Sound object."),
                               _("Th sound level of _PARAM0_ is _PARAM2_ _PARAM1_"),
                               _("Parameters"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetVolume").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_CONDITION()


                DECLARE_OBJECT_CONDITION("Pitch",
                               _("Pitch"),
                               _("Test the pitch value of a sound."),
                               _("Pitch of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Parameters"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetPitch").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_CONDITION()


                DECLARE_OBJECT_CONDITION("Attenuation",
                               _("Attenuation"),
                               _("Test the attenuation of a sound."),
                               _("The attenuation of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Parameters"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetAttenuation").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_CONDITION()


                DECLARE_OBJECT_CONDITION("MinDistance",
                               _("Minimal distance"),
                               _("Test the minimal distance of a sound"),
                               _("The minimal distance of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Parameters"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetMinDistance").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_CONDITION()


                DECLARE_OBJECT_CONDITION("ZPos",
                               _("Z Position"),
                               _("Test Z position of a sound."),
                               _("The Z position of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Parameters"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetZPos").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_CONDITION()


                DECLARE_OBJECT_CONDITION("Loop",
                               _("Automatic restart"),
                               _("Test if an sound is looping."),
                               _("_PARAM0_ is looping"),
                               _("Parameters"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetLoop").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_CONDITION()


                DECLARE_OBJECT_CONDITION("Playing",
                               _("Being played"),
                               _("Test if a sound is being played."),
                               _("_PARAM0_ is being played"),
                               _("Play"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsPlaying").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_CONDITION()


                DECLARE_OBJECT_CONDITION("Paused",
                               _("Paused"),
                               _("A sound is paused"),
                               _("_PARAM0_ is paused"),
                               _("Play"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsPaused").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_CONDITION()


                DECLARE_OBJECT_CONDITION("Stopped",
                               _("Stopped"),
                               _("Test if a sound is stopped."),
                               _("_PARAM0_ is stopped"),
                               _("Play"),
                               "res/actions/son24.png",
                               "res/actions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsStopped").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_CONDITION()


                DECLARE_OBJECT_CONDITION("RelativeToListener",
                               _("Listener relation"),
                               _("Test if a sound is relative to the listener."),
                               _("_PARAM0_ is relative to the listener"),
                               _("Parameters"),
                               "res/conditions/son24.png",
                               "res/conditions/son.png");

                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsRelativeToListener").SetIncludeFile("SoundObject/SoundObject.h");

                DECLARE_END_OBJECT_CONDITION()


                DECLARE_OBJECT_EXPRESSION("Volume", _("Sound level"), _("Sound level"), _("Parameters"), "res/actions/son.png")
                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetVolume").SetIncludeFile("SoundObject/SoundObject.h");
                DECLARE_END_OBJECT_EXPRESSION()


                DECLARE_OBJECT_EXPRESSION("Pitch", _("Pitch"), _("Pitch"), _("Parameters"), "res/actions/son.png")
                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetPitch").SetIncludeFile("SoundObject/SoundObject.h");
                DECLARE_END_OBJECT_EXPRESSION()


                DECLARE_OBJECT_EXPRESSION("Attenuation", _("Attenuation"), _("Attenuation"), _("Parameters"), "res/actions/son.png")
                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetAttenuation").SetIncludeFile("SoundObject/SoundObject.h");
                DECLARE_END_OBJECT_EXPRESSION()


                DECLARE_OBJECT_EXPRESSION("MinDistance", _("Minimal distance"), _("Minimal distance"), _("Parameters"), "res/actions/son.png")
                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetMinDistance").SetIncludeFile("SoundObject/SoundObject.h");
                DECLARE_END_OBJECT_EXPRESSION()


                DECLARE_OBJECT_EXPRESSION("ZPos", _("Z Position"), _("Z Position"), _("Position"), "res/actions/son.png")
                    instrInfo.AddParameter("object", _("Object"), "Sound", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetZPos").SetIncludeFile("SoundObject/SoundObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

            #endif
            DECLARE_END_OBJECT()

            // Actions liées à l'écouteur
            #if defined(GD_IDE_ONLY)
            DECLARE_ACTION("ListenerX",
                           _("X position"),
                           _("Modify the X position of the listener."),
                           _("Do _PARAM0__PARAM1_ to the X position of the listener"),
                           _("Listener"),
                           "res/actions/son24.png",
                           "res/actions/son.png");

                instrInfo.AddParameter("expression", _("Value"), "", false);
                instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("SetListenerX").SetManipulatedType("number").SetAssociatedGetter("GetListenerX").SetIncludeFile("SoundObject/SoundListener.h");

            DECLARE_END_ACTION()


            DECLARE_ACTION("ListenerY",
                           _("Y position"),
                           _("Modify the Y position of the listener."),
                           _("Do _PARAM0__PARAM1_ to the Y position of the listener"),
                           _("Listener"),
                           "res/actions/son24.png",
                           "res/actions/son.png");

                instrInfo.AddParameter("expression", _("Value"), "", false);
                instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("SetListenerY").SetManipulatedType("number").SetAssociatedGetter("GetListenerY").SetIncludeFile("SoundObject/SoundListener.h");

            DECLARE_END_ACTION()


            DECLARE_ACTION("ListenerZ",
                           _("Z position"),
                           _("Modify the Z position of the listener."),
                           _("Do _PARAM0__PARAM1_ to the Z position of the listener"),
                           _("Listener"),
                           "res/actions/son24.png",
                           "res/actions/son.png");

                instrInfo.AddParameter("expression", _("Value"), "", false);
                instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("SetListenerZ").SetManipulatedType("number").SetAssociatedGetter("GetListenerZ").SetIncludeFile("SoundObject/SoundListener.h");

            DECLARE_END_ACTION()


            DECLARE_ACTION("ListenerDirectionX",
                           _("Direction on X axis"),
                           _("Change the direction of the listener on X axis."),
                           _("Do _PARAM2__PARAM1_ to the direction on X axis of the listener"),
                           _("Listener"),
                           "res/actions/son24.png",
                           "res/actions/son.png");

                instrInfo.AddParameter("expression", _("Value"), "", false);
                instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("SetListenerDirectionX").SetManipulatedType("number").SetAssociatedGetter("GetListenerDirectionX").SetIncludeFile("SoundObject/SoundListener.h");

            DECLARE_END_ACTION()


            DECLARE_ACTION("ListenerDirectionY",
                           _("Direction on Y axis"),
                           _("Change the direction of the listener on Y axis."),
                           _("Do _PARAM2__PARAM1_ to the direction on Y axis of the listener"),
                           _("Listener"),
                           "res/actions/son24.png",
                           "res/actions/son.png");

                instrInfo.AddParameter("expression", _("Value"), "", false);
                instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("SetListenerDirectionY").SetManipulatedType("number").SetAssociatedGetter("GetListenerDirectionY").SetIncludeFile("SoundObject/SoundListener.h");

            DECLARE_END_ACTION()


            DECLARE_ACTION("ListenerDirectionZ",
                           _("Direction on Z axis"),
                           _("Change the direction of the listener on Z axis."),
                           _("Do _PARAM2__PARAM1_ to the direction on Z axis of the listener"),
                           _("Listener"),
                           "res/actions/son24.png",
                           "res/actions/son.png");

                instrInfo.AddParameter("expression", _("Value"), "", false);
                instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("SetListenerDirectionZ").SetManipulatedType("number").SetAssociatedGetter("GetListenerDirectionZ").SetIncludeFile("SoundObject/SoundListener.h");

            DECLARE_END_ACTION()


            // Conditions liées à l'écouteur
            DECLARE_CONDITION("ListenerX",
                           _("X position"),
                           _("Test the position of the listener on X axis."),
                           _("The listener X position is _PARAM1__PARAM0_"),
                           _("Listener"),
                           "res/actions/son24.png",
                           "res/actions/son.png");

                instrInfo.AddParameter("expression", _("Value to test"), "", false);
                instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GetListenerX").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

            DECLARE_END_CONDITION()


            DECLARE_CONDITION("ListenerY",
                           _("Y position"),
                           _("Test the position of the listener on Y axis."),
                           _("The listener Y position is _PARAM1__PARAM0_"),
                           _("Listener"),
                           "res/actions/son24.png",
                           "res/actions/son.png");

                instrInfo.AddParameter("expression", _("Value to test"), "", false);
                instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GetListenerY").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

            DECLARE_END_CONDITION()


            DECLARE_CONDITION("ListenerZ",
                           _("Z position"),
                           _("Test the position of the listener on Z axis."),
                           _("The listener Z position is _PARAM1__PARAM0_"),
                           _("Listener"),
                           "res/actions/son24.png",
                           "res/actions/son.png");

                instrInfo.AddParameter("expression", _("Value to test"), "", false);
                instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GetListenerZ").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

            DECLARE_END_CONDITION()


            DECLARE_CONDITION("ListenerDirectionX",
                           _("X direction"),
                           _("Test the direction of the listener on X axis."),
                           _("The listener X direction is _PARAM1__PARAM0_"),
                           _("Listener"),
                           "res/actions/son24.png",
                           "res/actions/son.png");

                instrInfo.AddParameter("expression", _("Value to test"), "", false);
                instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GetListenerDirectionX").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

            DECLARE_END_CONDITION()


            DECLARE_CONDITION("ListenerDirectionY",
                           _("Y direction"),
                           _("Test the direction of the listener on Y axis."),
                           _("The listener Y direction is _PARAM1__PARAM0_"),
                           _("Listener"),
                           "res/actions/son24.png",
                           "res/actions/son.png");

                instrInfo.AddParameter("expression", _("Value to test"), "", false);
                instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GetListenerDirectionY").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

            DECLARE_END_CONDITION()


            DECLARE_CONDITION("ListenerDirectionZ",
                           _("Z direction"),
                           _("Test the direction of the listener on Z axis."),
                           _("The listener Z direction is _PARAM1__PARAM0_"),
                           _("Listener"),
                           "res/actions/son24.png",
                           "res/actions/son.png");

                instrInfo.AddParameter("expression", _("Value to test"), "", false);
                instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GetListenerDirectionZ").SetManipulatedType("number").SetIncludeFile("SoundObject/SoundListener.h");

            DECLARE_END_CONDITION()


            DECLARE_EXPRESSION("ListenerX", _("X position"), _("Listener X position"), _("Listener"), "res/actions/son.png")
                instrInfo.cppCallingInformation.SetFunctionName("GetListenerX").SetIncludeFile("SoundObject/SoundListener.h");
            DECLARE_END_EXPRESSION()

            DECLARE_EXPRESSION("ListenerY", _("Y position"), _("Listener Y position"), _("Listener"), "res/actions/son.png")
                instrInfo.cppCallingInformation.SetFunctionName("GetListenerY").SetIncludeFile("SoundObject/SoundListener.h");
            DECLARE_END_EXPRESSION()

            DECLARE_EXPRESSION("ListenerZ", _("Z position"), _("Listener Z position"), _("Listener"), "res/actions/son.png")
                instrInfo.cppCallingInformation.SetFunctionName("GetListenerZ").SetIncludeFile("SoundObject/SoundListener.h");
            DECLARE_END_EXPRESSION()

            DECLARE_EXPRESSION("ListenerDirectionX", _("Direction on X axis"), _("Listener x direction"), _("Listener"), "res/actions/son.png")
                instrInfo.cppCallingInformation.SetFunctionName("GetListenerDirectionX").SetIncludeFile("SoundObject/SoundListener.h");
            DECLARE_END_EXPRESSION()

            DECLARE_EXPRESSION("ListenerDirectionY", _("Direction on Y axis"), _("Listener y direction"), _("Listener"), "res/actions/son.png")
                instrInfo.cppCallingInformation.SetFunctionName("GetListenerDirectionY").SetIncludeFile("SoundObject/SoundListener.h");
            DECLARE_END_EXPRESSION()

            DECLARE_EXPRESSION("ListenerDirectionZ", _("Direction on Z axis"), _("Listener z direction"), _("Listener"), "res/actions/son.png")
                instrInfo.cppCallingInformation.SetFunctionName("GetListenerDirectionZ").SetIncludeFile("SoundObject/SoundListener.h");
            DECLARE_END_EXPRESSION()
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

