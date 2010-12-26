#include "GDL/AudioExtension.h"
#include "GDL/cMusic.h"
#include "GDL/aMusic.h"

AudioExtension::AudioExtension()
{
    DECLARE_THE_EXTENSION("BuiltinAudio",
                          _("Fonctionnalités audio"),
                          _("Extension audio integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_ACTION("PlaySoundCanal",
                   _("Jouer un son sur un canal"),
                   _("Joue un son ( court fichier audio ) sur un canal précis,\npour pouvoir ensuite interagir avec."),
                   _("Jouer le son _PARAM0_ sur le canal _PARAM1_"),
                   _("Sons"),
                   "res/actions/son24.png",
                   "res/actions/son.png",
                   &ActPlaySoundCanal);

        DECLARE_PARAMETER("soundfile", _("Fichier audio"), false, "")
        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("yesorno", _("Boucler le son ?"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Volume ( De 0 à 100, 100 par défaut )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Pitch ( Vitesse ) ( 1 par défaut )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("StopSoundCanal",
                   _("Arrêter le son sur un canal"),
                   _("Arrêter le son joué sur le canal indiqué."),
                   _("Arrêter le son du canal _PARAM0_"),
                   _("Sons"),
                   "res/actions/son24.png",
                   "res/actions/son.png",
                   &ActStopSoundCanal);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("PauseSoundCanal",
                   _("Mettre en pause le son d'un canal"),
                   _("Mettre en pause le son joué sur le canal indiqué."),
                   _("Mettre en pause le son du canal _PARAM0_"),
                   _("Sons"),
                   "res/actions/son24.png",
                   "res/actions/son.png",
                   &ActPauseSoundCanal);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("RePlaySoundCanal",
                   _("Jouer le son d'un canal"),
                   _("(Re)jouer le son du canal."),
                   _("Jouer le son du canal _PARAM0_"),
                   _("Sons"),
                   "res/actions/son24.png",
                   "res/actions/son.png",
                   &ActRePlaySoundCanal);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("PlayMusicCanal",
                   _("Jouer une musique sur un canal"),
                   _("Joue une musique sur un canal précis,\npour pouvoir ensuite interagir avec."),
                   _("Jouer la musique _PARAM0_ sur le canal _PARAM1_"),
                   _("Musiques"),
                   "res/actions/music24.png",
                   "res/actions/music.png",
                   &ActPlayMusicCanal);

        DECLARE_PARAMETER("musicfile", _("Fichier audio"), false, "")
        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("yesorno", _("Boucler le son ?"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Volume ( De 0 à 100, 100 par défaut )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Pitch ( Vitesse ) ( 1 par défaut )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("StopMusicCanal",
                   _("Arrêter la musique sur un canal"),
                   _("Arrêter la musique jouée sur le canal indiqué."),
                   _("Arrêter la musique du canal _PARAM0_"),
                   _("Musiques"),
                   "res/actions/music24.png",
                   "res/actions/music.png",
                   &ActStopMusicCanal);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("PauseMusicCanal",
                   _("Mettre en pause la musique d'un canal"),
                   _("Mettre en pause la musique jouée sur le canal indiqué."),
                   _("Mettre en pause la musique du canal _PARAM0_"),
                   _("Musiques"),
                   "res/actions/music24.png",
                   "res/actions/music.png",
                   &ActPauseMusicCanal);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("RePlayMusicCanal",
                   _("Jouer la musique d'un canal"),
                   _("(Re)jouer la musique du canal."),
                   _("Jouer la musique du canal _PARAM0_"),
                   _("Musiques"),
                   "res/actions/music24.png",
                   "res/actions/music.png",
                   &ActRePlayMusicCanal);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVolumeSoundCanal",
                   _("Modifier le volume d'un son sur un canal"),
                   _("Cette action modifie le volume du son sur le canal spécifié. Le volume est compris entre 0 et 100."),
                   _("Faire _PARAM2__PARAM1_ au volume du son sur le canal  _PARAM0_"),
                   _("Volume sonore"),
                   "res/actions/sonVolume24.png",
                   "res/actions/sonVolume.png",
                   &ActModVolumeSoundCanal);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVolumeMusicCanal",
                   _("Modifier le volume de la musique d'un canal"),
                   _("Cette action modifie le volume de la musique sur le canal spécifié. Le volume est compris entre 0 et 100."),
                   _("Faire _PARAM2__PARAM1_ au volume de la musique du canal  _PARAM0_"),
                   _("Volume sonore"),
                   "res/actions/sonVolume24.png",
                   "res/actions/sonVolume.png",
                   &ActModVolumeMusicCanal);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModGlobalVolume",
                   _("Modifier le volume global du jeu"),
                   _("Cette action modifie le volume sonore global du jeu. Le volume est compris entre 0 et 100."),
                   _("Faire _PARAM1__PARAM0_ au volume sonore global"),
                   _("Volume sonore"),
                   "res/actions/volume24.png",
                   "res/actions/volume.png",
                   &ActModGlobalVolume);

        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModPitchSoundChannel",
                   _("Modifier le pitch d'un son sur un canal"),
                   _("Cette action modifie le pitch ( vitesse ) du son d'un canal.\nUn pitch de 1 indique une vitesse normale."),
                   _("Faire _PARAM2__PARAM1_ au pitch du son sur le canal  _PARAM0_"),
                   _("Pitch ( vitesse )"),
                   "res/actions/son24.png",
                   "res/actions/son.png",
                   &ActModPitchSoundChannel);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModPitchMusicChannel",
                   _("Modifier le pitch de la musique d'un canal"),
                   _("Cette action modifie le pitch de la musique sur un canal.\nUn pitch de 1 indique une vitesse normale."),
                   _("Faire _PARAM2__PARAM1_ au pitch de la musique du canal  _PARAM0_"),
                   _("Pitch ( vitesse )"),
                   "res/actions/music24.png",
                   "res/actions/music.png",
                   &ActModPitchMusicChannel);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("PlaySound",
                   _("Jouer un son"),
                   _("Joue un son."),
                   _("Jouer le son _PARAM0_"),
                   _("Sons"),
                   "res/actions/son24.png",
                   "res/actions/son.png",
                   &ActPlaySound);

        DECLARE_PARAMETER("soundfile", _("Fichier audio"), false, "")
        DECLARE_PARAMETER_OPTIONAL("yesorno", _("Boucler le son ?"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Volume ( De 0 à 100, 100 par défaut )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Pitch ( Vitesse ) ( 1 par défaut )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("PlayMusic",
                   _("Jouer une musique"),
                   _("Joue une musique."),
                   _("Jouer la musique _PARAM0_"),
                   _("Musiques"),
                   "res/actions/music24.png",
                   "res/actions/music.png",
                   &ActPlayMusic);

        DECLARE_PARAMETER("musicfile", _("Fichier audio"), false, "")
        DECLARE_PARAMETER_OPTIONAL("yesorno", _("Boucler le son ?"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Volume ( De 0 à 100, 100 par défaut )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Pitch ( Vitesse ) ( 1 par défaut )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_CONDITION("MusicPlaying",
                   _("Une musique est entrain d'être jouée"),
                   _("Teste si la musique sur le canal indiqué est entrain d'être jouée."),
                   _("La musique sur le canal _PARAM0_ est entrain d'être jouée"),
                   _("Musiques"),
                   "res/conditions/musicplaying24.png",
                   "res/conditions/musicplaying.png",
                   &CondMusicPlaying);

        DECLARE_PARAMETER("expression", _("Canal"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("MusicPaused",
                   _("Une musique est en pause"),
                   _("Teste si la musique sur le canal indiqué est en pause."),
                   _("La musique sur le canal _PARAM0_ est en pause"),
                   _("Musiques"),
                   "res/conditions/musicpaused24.png",
                   "res/conditions/musicpaused.png",
                   &CondMusicPaused);

        DECLARE_PARAMETER("expression", _("Canal"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("MusicStopped",
                   _("Une musique est arrêtée"),
                   _("Teste si la musique sur le canal indiqué est arrêtée."),
                   _("La musique sur le canal _PARAM0_ est arrêtée"),
                   _("Musiques"),
                   "res/conditions/musicstopped24.png",
                   "res/conditions/musicstopped.png",
                   &CondMusicStopped);

        DECLARE_PARAMETER("expression", _("Canal"), false, "")

    DECLARE_END_CONDITION()
    DECLARE_CONDITION("SoundPlaying",
                   _("Un son est entrain d'être jouée"),
                   _("Teste si le son sur le canal indiqué est entrain d'être joué."),
                   _("Le son sur le canal _PARAM0_ est entrain d'être joué"),
                   _("Sons"),
                   "res/conditions/sonplaying24.png",
                   "res/conditions/sonplaying.png",
                   &CondSoundPlaying);

        DECLARE_PARAMETER("expression", _("Canal"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SoundPaused",
                   _("Un son est en pause"),
                   _("Teste si le son sur le canal indiqué est en pause."),
                   _("Le son sur le canal _PARAM0_ est en pause"),
                   _("Sons"),
                   "res/conditions/sonpaused24.png",
                   "res/conditions/sonpaused.png",
                   &CondSoundPaused);

        DECLARE_PARAMETER("expression", _("Canal"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SoundStopped",
                   _("Un son est arrêtée"),
                   _("Teste si le son sur le canal indiqué est arrêté."),
                   _("Le son sur le canal _PARAM0_ est arrêté"),
                   _("Sons"),
                   "res/conditions/sonstopped24.png",
                   "res/conditions/sonstopped.png",
                   &CondSoundStopped);

        DECLARE_PARAMETER("expression", _("Canal"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SoundCanalVolume",
                   _("Volume d'un son sur un canal"),
                   _("Teste le volume du son sur le canal indiqué. Le volume est compris entre 0 et 100."),
                   _("Le volume du son sur le canal _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Volume sonore"),
                   "res/conditions/sonVolume24.png",
                   "res/conditions/sonVolume.png",
                   &CondSoundCanalVolume);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")
        DECLARE_PARAMETER("expression", _("Volume à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("MusicCanalVolume",
                   _("Volume de la musique sur un canal"),
                   _("Teste le volume de la musique sur le canal indiqué. Le volume est compris entre 0 et 100."),
                   _("Le volume de la musique sur le canal _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Volume sonore"),
                   "res/conditions/musicVolume24.png",
                   "res/conditions/musicVolume.png",
                   &CondMusicCanalVolume);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")
        DECLARE_PARAMETER("expression", _("Volume à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("GlobalVolume",
                   _("Volume sonore global"),
                   _("Vérifie que le volume sonore global correspond au test. Le volume est compris entre 0 et 100."),
                   _("Le volume sonore global est _PARAM1_ à _PARAM0_"),
                   _("Volume sonore"),
                   "res/conditions/volume24.png",
                   "res/conditions/volume.png",
                   &CondGlobalVolume);

        DECLARE_PARAMETER("expression", _("Volume à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SoundChannelPitch",
                   _("Pitch du son d'un canal"),
                   _("Teste le pitch ( vitesse ) du son sur le canal indiqué. Un pitch de 1 indique une vitesse normale."),
                   _("Le pitch du son sur le canal _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Pitch ( vitesse )"),
                   "res/conditions/sonVolume24.png",
                   "res/conditions/sonVolume.png",
                   &CondSoundChannelPitch);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")
        DECLARE_PARAMETER("expression", _("Pitch à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("MusicChannelPitch",
                   _("Pitch de la musique d'un canal"),
                   _("Teste le pitch ( vitesse ) de la musique sur le canal indiqué. Un pitch de 1 indique une vitesse normale."),
                   _("Le volume de la musique sur le canal _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Volume sonore"),
                   "res/conditions/musicVolume24.png",
                   "res/conditions/musicVolume.png",
                   &CondMusicChannelPitch);

        DECLARE_PARAMETER("expression", _("Canal ( 0 à 15 )"), false, "")
        DECLARE_PARAMETER("expression", _("Pitch à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")

    DECLARE_END_CONDITION()
}
