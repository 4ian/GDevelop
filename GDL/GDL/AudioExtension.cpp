/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/AudioExtension.h"
#include "GDL/ResourcesMergingHelper.h"
#include "GDL/SoundManager.h"
#include "GDL/Instruction.h"
#include <iostream>

AudioExtension::AudioExtension()
{
    DECLARE_THE_EXTENSION("BuiltinAudio",
                          _("Audio"),
                          _("Extension audio integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_ACTION("PlaySoundCanal",
                   _("Jouer un son sur un canal"),
                   _("Joue un son ( court fichier audio ) sur un canal précis,\npour pouvoir ensuite interagir avec."),
                   _("Jouer le son _PARAM0_ sur le canal _PARAM1_"),
                   _("Sons"),
                   "res/actions/son24.png",
                   "res/actions/son.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("soundfile", _("Fichier audio"), "",false);
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("yesorno", _("Boucler le son ?"), "",true).SetDefaultValue("no");
        instrInfo.AddParameter("expression", _("Volume ( De 0 à 100, 100 par défaut )"), "",true).SetDefaultValue("100");
        instrInfo.AddParameter("expression", _("Pitch ( Vitesse ) ( 1 par défaut )"), "",true).SetDefaultValue("1");

        instrInfo.cppCallingInformation.SetFunctionName("PlaySoundOnChannel").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("StopSoundCanal",
                   _("Arrêter le son sur un canal"),
                   _("Arrêter le son joué sur le canal indiqué."),
                   _("Arrêter le son du canal _PARAM0_"),
                   _("Sons"),
                   "res/actions/son24.png",
                   "res/actions/son.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("StopSoundOnChannel").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("PauseSoundCanal",
                   _("Mettre en pause le son d'un canal"),
                   _("Mettre en pause le son joué sur le canal indiqué."),
                   _("Mettre en pause le son du canal _PARAM0_"),
                   _("Sons"),
                   "res/actions/son24.png",
                   "res/actions/son.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("PauseSoundOnChannel").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("RePlaySoundCanal",
                   _("Jouer le son d'un canal"),
                   _("(Re)jouer le son du canal."),
                   _("Jouer le son du canal _PARAM0_"),
                   _("Sons"),
                   "res/actions/son24.png",
                   "res/actions/son.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("RePlaySoundOnChannel").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("PlayMusicCanal",
                   _("Jouer une musique sur un canal"),
                   _("Joue une musique sur un canal précis,\npour pouvoir ensuite interagir avec."),
                   _("Jouer la musique _PARAM0_ sur le canal _PARAM1_"),
                   _("Musiques"),
                   "res/actions/music24.png",
                   "res/actions/music.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("musicfile", _("Fichier audio"), "",false);
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("yesorno", _("Boucler le son ?"), "",true).SetDefaultValue("no");
        instrInfo.AddParameter("expression", _("Volume ( De 0 à 100, 100 par défaut )"), "",true).SetDefaultValue("100");
        instrInfo.AddParameter("expression", _("Pitch ( Vitesse ) ( 1 par défaut )"), "",true).SetDefaultValue("1");

        instrInfo.cppCallingInformation.SetFunctionName("PlayMusicOnChannel").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("StopMusicCanal",
                   _("Arrêter la musique sur un canal"),
                   _("Arrêter la musique jouée sur le canal indiqué."),
                   _("Arrêter la musique du canal _PARAM0_"),
                   _("Musiques"),
                   "res/actions/music24.png",
                   "res/actions/music.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("StopMusicOnChannel").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("PauseMusicCanal",
                   _("Mettre en pause la musique d'un canal"),
                   _("Mettre en pause la musique jouée sur le canal indiqué."),
                   _("Mettre en pause la musique du canal _PARAM0_"),
                   _("Musiques"),
                   "res/actions/music24.png",
                   "res/actions/music.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("PauseMusicOnChannel").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("RePlayMusicCanal",
                   _("Jouer la musique d'un canal"),
                   _("(Re)jouer la musique du canal."),
                   _("Jouer la musique du canal _PARAM0_"),
                   _("Musiques"),
                   "res/actions/music24.png",
                   "res/actions/music.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("RePlayMusicOnChannel").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVolumeSoundCanal",
                   _("Volume d'un son sur un canal"),
                   _("Cette action modifie le volume du son sur le canal spécifié. Le volume est compris entre 0 et 100."),
                   _("Faire _PARAM2__PARAM1_ au volume du son sur le canal  _PARAM0_"),
                   _("Volume sonore"),
                   "res/actions/sonVolume24.png",
                   "res/actions/sonVolume.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("expression", _("Valeur"), "",false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetSoundVolumeOnChannel").SetManipulatedType("number").SetAssociatedGetter("GetSoundVolumeOnChannel").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVolumeMusicCanal",
                   _("Volume de la musique d'un canal"),
                   _("Cette action modifie le volume de la musique sur le canal spécifié. Le volume est compris entre 0 et 100."),
                   _("Faire _PARAM2__PARAM1_ au volume de la musique du canal  _PARAM0_"),
                   _("Volume sonore"),
                   "res/actions/sonVolume24.png",
                   "res/actions/sonVolume.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("expression", _("Valeur"), "",false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetMusicVolumeOnChannel").SetManipulatedType("number").SetAssociatedGetter("GetMusicVolumeOnChannel").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModGlobalVolume",
                   _("Volume global du jeu"),
                   _("Cette action modifie le volume sonore global du jeu. Le volume est compris entre 0 et 100."),
                   _("Faire _PARAM1__PARAM0_ au volume sonore global"),
                   _("Volume sonore"),
                   "res/actions/volume24.png",
                   "res/actions/volume.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Valeur"), "",false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetGlobalVolume").SetAssociatedGetter("GetGlobalVolume").SetManipulatedType("number").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModPitchSoundChannel",
                   _("Pitch d'un son sur un canal"),
                   _("Cette action modifie le pitch ( vitesse ) du son d'un canal.\nUn pitch de 1 indique une vitesse normale."),
                   _("Faire _PARAM2__PARAM1_ au pitch du son sur le canal _PARAM0_"),
                   _("Sons"),
                   "res/actions/son24.png",
                   "res/actions/son.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("expression", _("Valeur"), "",false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetSoundPitchOnChannel").SetAssociatedGetter("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/AudioTools.h");


    DECLARE_END_ACTION()

    DECLARE_ACTION("ModPitchMusicChannel",
                   _("Pitch de la musique d'un canal"),
                   _("Cette action modifie le pitch de la musique sur un canal.\nUn pitch de 1 indique une vitesse normale."),
                   _("Faire _PARAM2__PARAM1_ au pitch de la musique du canal _PARAM0_"),
                   _("Musiques"),
                   "res/actions/music24.png",
                   "res/actions/music.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("expression", _("Valeur"), "",false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetMusicPitchOnChannel").SetAssociatedGetter("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/AudioTools.h");


    DECLARE_END_ACTION()

    DECLARE_ACTION("ModPlayingOffsetSoundChannel",
                   _("Position de lecture d'un son sur un canal"),
                   _("Cette action modifie la position de lecture du son d'un canal."),
                   _("Faire _PARAM2__PARAM1_s à la position de lecture du son sur le canal _PARAM0_"),
                   _("Sons"),
                   "res/actions/son24.png",
                   "res/actions/son.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("expression", _("Valeur"), "",false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetSoundPlayingOffsetOnChannel").SetAssociatedGetter("GetSoundPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModPlayingOffsetMusicChannel",
                   _("Position de lecture de la musique d'un canal"),
                   _("Cette action modifie la position de lecture de la musique sur un canal."),
                   _("Faire _PARAM2__PARAM1_s à la position de lecture de la musique du canal _PARAM0_"),
                   _("Musiques"),
                   "res/actions/music24.png",
                   "res/actions/music.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("expression", _("Valeur"), "",false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetMusicPlayingOffsetOnChannel").SetAssociatedGetter("GetMusicPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("PlaySound",
                   _("Jouer un son"),
                   _("Joue un son."),
                   _("Jouer le son _PARAM0_"),
                   _("Sons"),
                   "res/actions/son24.png",
                   "res/actions/son.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("soundfile", _("Fichier audio"), "",false);
        instrInfo.AddParameter("yesorno", _("Boucler le son ?"), "",true).SetDefaultValue("no");
        instrInfo.AddParameter("expression", _("Volume ( De 0 à 100, 100 par défaut )"), "",true).SetDefaultValue("100");
        instrInfo.AddParameter("expression", _("Pitch ( Vitesse ) ( 1 par défaut )"), "",true).SetDefaultValue("1");

        instrInfo.cppCallingInformation.SetFunctionName("PlaySound").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("PlayMusic",
                   _("Jouer une musique"),
                   _("Joue une musique."),
                   _("Jouer la musique _PARAM0_"),
                   _("Musiques"),
                   "res/actions/music24.png",
                   "res/actions/music.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("musicfile", _("Fichier audio"), "",false);
        instrInfo.AddParameter("yesorno", _("Boucler le son ?"), "",true).SetDefaultValue("no");
        instrInfo.AddParameter("expression", _("Volume ( De 0 à 100, 100 par défaut )"), "",true).SetDefaultValue("100");
        instrInfo.AddParameter("expression", _("Pitch ( Vitesse ) ( 1 par défaut )"), "",true).SetDefaultValue("1");

        instrInfo.cppCallingInformation.SetFunctionName("PlayMusic").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_ACTION()

    DECLARE_CONDITION("MusicPlaying",
                   _("Une musique est entrain d'être jouée"),
                   _("Teste si la musique sur le canal indiqué est entrain d'être jouée."),
                   _("La musique sur le canal _PARAM0_ est entrain d'être jouée"),
                   _("Musiques"),
                   "res/conditions/musicplaying24.png",
                   "res/conditions/musicplaying.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("MusicPlaying").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("MusicPaused",
                   _("Une musique est en pause"),
                   _("Teste si la musique sur le canal indiqué est en pause."),
                   _("La musique sur le canal _PARAM0_ est en pause"),
                   _("Musiques"),
                   "res/conditions/musicpaused24.png",
                   "res/conditions/musicpaused.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("MusicPaused").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("MusicStopped",
                   _("Une musique est arrêtée"),
                   _("Teste si la musique sur le canal indiqué est arrêtée."),
                   _("La musique sur le canal _PARAM0_ est arrêtée"),
                   _("Musiques"),
                   "res/conditions/musicstopped24.png",
                   "res/conditions/musicstopped.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("MusicStopped").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()
    DECLARE_CONDITION("SoundPlaying",
                   _("Un son est entrain d'être jouée"),
                   _("Teste si le son sur le canal indiqué est entrain d'être joué."),
                   _("Le son sur le canal _PARAM0_ est entrain d'être joué"),
                   _("Sons"),
                   "res/conditions/sonplaying24.png",
                   "res/conditions/sonplaying.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SoundPlaying").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SoundPaused",
                   _("Un son est en pause"),
                   _("Teste si le son sur le canal indiqué est en pause."),
                   _("Le son sur le canal _PARAM0_ est en pause"),
                   _("Sons"),
                   "res/conditions/sonpaused24.png",
                   "res/conditions/sonpaused.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SoundPaused").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SoundStopped",
                   _("Un son est arrêtée"),
                   _("Teste si le son sur le canal indiqué est arrêté."),
                   _("Le son sur le canal _PARAM0_ est arrêté"),
                   _("Sons"),
                   "res/conditions/sonstopped24.png",
                   "res/conditions/sonstopped.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SoundStopped").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SoundCanalVolume",
                   _("Volume d'un son sur un canal"),
                   _("Teste le volume du son sur le canal indiqué. Le volume est compris entre 0 et 100."),
                   _("Le volume du son sur le canal _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Volume sonore"),
                   "res/conditions/sonVolume24.png",
                   "res/conditions/sonVolume.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("expression", _("Volume à tester"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetSoundVolumeOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("MusicCanalVolume",
                   _("Volume de la musique sur un canal"),
                   _("Teste le volume de la musique sur le canal indiqué. Le volume est compris entre 0 et 100."),
                   _("Le volume de la musique sur le canal _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Volume sonore"),
                   "res/conditions/musicVolume24.png",
                   "res/conditions/musicVolume.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("expression", _("Volume à tester"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetMusicVolumeOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("GlobalVolume",
                   _("Volume sonore global"),
                   _("Vérifie que le volume sonore global correspond au test. Le volume est compris entre 0 et 100."),
                   _("Le volume sonore global est _PARAM1_ à _PARAM0_"),
                   _("Volume sonore"),
                   "res/conditions/volume24.png",
                   "res/conditions/volume.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Volume à tester"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVolume").SetManipulatedType("number").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SoundChannelPitch",
                   _("Pitch du son d'un canal"),
                   _("Teste le pitch ( vitesse ) du son sur le canal indiqué. Un pitch de 1 indique une vitesse normale."),
                   _("Le pitch du son sur le canal _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Sons"),
                   "res/conditions/sonVolume24.png",
                   "res/conditions/sonVolume.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("expression", _("Pitch à tester"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("MusicChannelPitch",
                   _("Pitch de la musique d'un canal"),
                   _("Teste le pitch ( vitesse ) de la musique sur le canal indiqué. Un pitch de 1 indique une vitesse normale."),
                   _("Le volume de la musique sur le canal _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Musiques"),
                   "res/conditions/musicVolume24.png",
                   "res/conditions/musicVolume.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("expression", _("Pitch à tester"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SoundChannelPlayingOffset",
                   _("Position de lecture du son d'un canal"),
                   _("Teste la position de lecture du son sur le canal indiqué."),
                   _("La position de lecture du son sur le canal _PARAM0_ est _PARAM2_ à _PARAM1_s"),
                   _("Sons"),
                   "res/conditions/sonVolume24.png",
                   "res/conditions/sonVolume.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("expression", _("Position à tester ( en secondes )"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetSoundPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("MusicChannelPlayingOffset",
                   _("Position de lecture de la musique d'un canal"),
                   _("Teste la position de lecture de la musique sur le canal indiqué."),
                   _("La position de lecture la musique sur le canal _PARAM0_ est _PARAM2_ à _PARAM1_s"),
                   _("Musiques"),
                   "res/conditions/musicVolume24.png",
                   "res/conditions/musicVolume.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal ( 0 à 15 )"), "",false);
        instrInfo.AddParameter("expression", _("Position à tester ( en secondes )"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetMusicPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_EXPRESSION("SoundChannelPlayingOffset", _("Position de lecture d'un son"), _("Position de lecture d'un son"), _("Sons"), "res/actions/son.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetSoundPlayingOffsetOnChannel").SetIncludeFile("GDL/AudioTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("MusicChannelPlayingOffset", _("Position de lecture d'une musique"), _("Position de lecture d'une musique"), _("Musiques"), "res/actions/music.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetMusicPlayingOffsetOnChannel").SetIncludeFile("GDL/AudioTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("SoundChannelVolume", _("Volume d'un son"), _("Volume d'un son"), _("Sons"), "res/actions/son.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetSoundVolumeOnChannel").SetIncludeFile("GDL/AudioTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("MusicChannelVolume", _("Volume d'une musique"), _("Volume d'une musique"), _("Musiques"), "res/actions/music.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetMusicVolumeOnChannel").SetIncludeFile("GDL/AudioTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("SoundChannelPitch", _("Pitch d'un son"), _("Pitch d'un son"), _("Sons"), "res/actions/son.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetSoundPitchOnChannel").SetIncludeFile("GDL/AudioTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("MusicChannelPitch", _("Pitch d'une musique"), _("Pitch d'une musique"), _("Musiques"), "res/actions/music.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Canal"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetMusicPitchOnChannel").SetIncludeFile("GDL/AudioTools.h");
    DECLARE_END_EXPRESSION()
}

#if defined(GD_IDE_ONLY)
void AudioExtension::PrepareActionsResourcesForMerging(Instruction & action, ResourcesMergingHelper & resourcesMergingHelper)
{
    if ( action.GetType() == "PlaySound" || action.GetType() == "PlaySoundCanal" || action.GetType() == "PlayMusic" || action.GetType() == "PlayMusicCanal" )
        action.SetParameter( 0, resourcesMergingHelper.GetNewFilename(action.GetParameter(0).GetPlainString()));
}

void AudioExtension::GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const
{
    if ( propertyNb < SoundManager::GetInstance()->sounds.size() )
    {
        sf::Sound::Status soundStatus = SoundManager::GetInstance()->sounds[propertyNb]->GetStatus();

        if ( soundStatus == sf::Sound::Playing)
            name = _("Son joué :");
        else if ( soundStatus == sf::Sound::Stopped)
            name = _("Son stoppé :");
        else if ( soundStatus == sf::Sound::Paused)
            name = _("Son en pause :");

        value = SoundManager::GetInstance()->sounds[propertyNb]->file;
    }
    if ( propertyNb-SoundManager::GetInstance()->sounds.size() < SoundManager::GetInstance()->musics.size() )
    {
        sf::Sound::Status soundStatus = SoundManager::GetInstance()->musics[propertyNb-SoundManager::GetInstance()->sounds.size()]->GetStatus();

        if ( soundStatus == sf::Sound::Playing)
            name = _("Musique jouée :");
        else if ( soundStatus == sf::Sound::Stopped)
            name = _("Musique stoppée :");
        else if ( soundStatus == sf::Sound::Paused)
            name = _("Musique en pause :");

        value = SoundManager::GetInstance()->musics[propertyNb-SoundManager::GetInstance()->sounds.size()]->file;
    }
}

bool AudioExtension::ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue)
{
    return false;
}

unsigned int AudioExtension::GetNumberOfProperties(RuntimeScene & scene) const
{
    return SoundManager::GetInstance()->musics.size()+SoundManager::GetInstance()->sounds.size();
}

#endif
