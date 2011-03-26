#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/aMusic.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>
#include <SFML/Audio.hpp>
#include <SFML/System.hpp>
#include "GDL/RuntimeScene.h"
#include "GDL/constantes.h"
#include "GDL/RessourcesLoader.h"

struct est_fini
{
    bool operator ()( sf::Sound &a ) const
    {
        if (a.GetStatus() == sf::Sound::Stopped )
        {
            return true;
        }

        return false;
    }
};

////////////////////////////////////////////////////////////
/// Joue simplement un son
///
/// Type : PlaySound
/// Paramètre 1 : Fichier son
/// Paramètre 2 : Bouclage ( facultatif )
/// Paramètre 3 : Volume ( facultatif )
////////////////////////////////////////////////////////////
bool ActPlaySound( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    sf::Clock Latence;

    SoundManager * soundManager;
    soundManager = SoundManager::GetInstance();

    Son * son = new Son(action.GetParameter(0).GetPlainString());
    soundManager->sounds.push_back(son);
    soundManager->sounds.back()->sound.Play();

    //Compatibilité avec Game Develop 1.0.1979 et inférieur
    //On verifie si l'argument 2 ( Bouclage ) existe
    if ( action.GetParameters().size() > 1 )
    {
        soundManager->sounds.back()->sound.SetLoop(action.GetParameter(1).GetAsBool());
    }

    //Compatibilité avec Game Develop 1.1.5429 et inférieur
    //On verifie si l'argument 3 ( Volume ) existe
    if ( action.GetParameters().size() > 2 )
    {
        if ( !action.GetParameter(2).GetPlainString().empty() )
            soundManager->sounds.back()->SetVolume(action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned));
        else
            soundManager->sounds.back()->SetVolume(100);
    }

    //Compatibility with Game Develop 1.5.9980 and below
    if ( action.GetParameters().size() > 3 )
    {
        if ( !action.GetParameter(3).GetPlainString().empty() )
            soundManager->sounds.back()->SetPitch(action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned));
        else
            soundManager->sounds.back()->SetPitch(1);
    }

    scene.pauseTime += Latence.GetElapsedTime();

    return true;
}

////////////////////////////////////////////////////////////
/// Joue un son sur un canal
///
/// Type : PlaySoundCanal
/// Paramètre 1 : Fichier son
/// Paramètre 2 : Canal
/// Paramètre 3 : Bouclage ( fac )
/// Paramètre 4 : Volume ( fac )
////////////////////////////////////////////////////////////
bool ActPlaySoundCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> ( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) );
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return false;

    //Chargement
    SoundManager * soundManager;
    soundManager = SoundManager::GetInstance();

    //Son à jouer
    Son * son = new Son(action.GetParameter(0).GetPlainString());
    son->sound.Play();

    soundManager->SetSoundOnChannel(canal, son);

    //Compatibilité avec Game Develop 1.0.1979 et inférieur
    //On verifie si l'argument 3 ( Bouclage ) existe
    if ( action.GetParameters().size() > 2 )
    {
        soundManager->GetSoundOnChannel(canal)->sound.SetLoop(action.GetParameter(2).GetAsBool());
    }

    //Compatibilité avec Game Develop 1.1.5429 et inférieur
    //On verifie si l'argument 4 ( Volume ) existe
    if ( action.GetParameters().size() > 3 )
    {
        if ( !action.GetParameter(3).GetPlainString().empty() )
            soundManager->GetSoundOnChannel(canal)->SetVolume(action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned));
        else
            soundManager->GetSoundOnChannel(canal)->SetVolume(100);
    }

    //Compatibility with Game Develop 1.5.9980 and below
    if ( action.GetParameters().size() > 4 )
    {
        if ( !action.GetParameter(4).GetPlainString().empty() )
            soundManager->GetSoundOnChannel(canal)->SetPitch(action.GetParameter( 4 ).GetAsMathExpressionResult(scene, objectsConcerned));
        else
            soundManager->GetSoundOnChannel(canal)->SetPitch(1);
    }

    return true;
}


////////////////////////////////////////////////////////////
/// Stoppe un son sur un canal
///
/// Type : StopSoundCanal
/// Paramètre 1 : Canal
////////////////////////////////////////////////////////////
bool ActStopSoundCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> ( action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));

    if ( canal < 0 || canal > MAX_CANAUX_SON ) return false;

    SoundManager::GetInstance()->GetSoundOnChannel(canal)->sound.Stop();

    return true;
}

////////////////////////////////////////////////////////////
/// Met en pause un son sur un canal
///
/// Type : PauseSoundCanal
/// Paramètre 1 : Canal
////////////////////////////////////////////////////////////
bool ActPauseSoundCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> ( action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return false;

    SoundManager::GetInstance()->GetSoundOnChannel(canal)->sound.Pause();

    return true;
}

////////////////////////////////////////////////////////////
/// Re(joute) un son sur un canal
///
/// Type : RePlaySoundCanal
/// Paramètre 1 : Canal
////////////////////////////////////////////////////////////
bool ActRePlaySoundCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> ( action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON )  return false;

    SoundManager::GetInstance()->GetSoundOnChannel(canal)->sound.Play();

    return true;
}

////////////////////////////////////////////////////////////
/// Joue simplement une musique
///
/// Type : PlayMusic
/// Paramètre 1 : Fichier
/// Paramètre 2 : Bouclage ( facultatif )
/// Paramètre 3 : Volume ( facultatif )
////////////////////////////////////////////////////////////
bool ActPlayMusic( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    SoundManager * soundManager = SoundManager::GetInstance();
    RessourcesLoader * ressourcesLoader = RessourcesLoader::GetInstance();

    Music * music = ressourcesLoader->LoadMusic(action.GetParameter(0).GetPlainString()); //Chargement

    soundManager->musics.push_back(music); //Ajout aux soundManager qui prend en charge la musique
    soundManager->musics.back()->Play();

    //Compatibilité avec Game Develop 1.0.1979 et inférieur
    //On verifie si l'argument 2 ( Bouclage ) existe
    if ( action.GetParameters().size() > 1 )
    {
        music->SetLoop(action.GetParameter(1).GetAsBool());
    }

    //Compatibilité avec Game Develop 1.1.5429 et inférieur
    //On verifie si l'argument 3 ( Volume ) existe
    if ( action.GetParameters().size() > 2 )
    {
        if ( !action.GetParameter(2).GetPlainString().empty() )
            music->SetVolume(action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned));
        else
            music->SetVolume(100);
    }

    //Compatibility with Game Develop 1.5.9980 and below
    if ( action.GetParameters().size() > 3 )
    {
        if ( !action.GetParameter(3).GetPlainString().empty() )
            music->SetPitch(action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned));
        else
            music->SetPitch(1);
    }

    return true;
}


////////////////////////////////////////////////////////////
/// Joue une musique sur un canal
///
/// Type : PlayMusicCanal
/// Paramètre 1 : Fichier
/// Paramètre 2 : Canal
/// Paramètre 3 : Bouclage ( facultatif )
////////////////////////////////////////////////////////////
bool ActPlayMusicCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> ( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_MUSIC ) return false;

    SoundManager * soundManager = SoundManager::GetInstance();
    RessourcesLoader * ressourcesLoader = RessourcesLoader::GetInstance();

    Music * music = ressourcesLoader->LoadMusic(action.GetParameter(0).GetPlainString()); //Chargement
    music->Play();

    soundManager->SetMusicOnChannel(canal, music); //Ajout au soundManager qui prend en charge la music

    //Compatibilité avec Game Develop 1.0.1979 et inférieur
    //On verifie si l'argument 3 ( Bouclage ) existe
    if ( action.GetParameters().size() > 2 )
    {
        music->SetLoop(action.GetParameter(2).GetAsBool());
    }

    //Compatibilité avec Game Develop 1.1.5429 et inférieur
    //On verifie si l'argument 4 ( Volume ) existe
    if ( action.GetParameters().size() > 3 )
    {
        if ( !action.GetParameter(3).GetPlainString().empty() )
            music->SetVolume(action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned));
        else
            music->SetVolume(100);
    }

    //Compatibility with Game Develop 1.5.9980 and below
    if ( action.GetParameters().size() > 4 )
    {
        if ( !action.GetParameter(4).GetPlainString().empty() )
            music->SetPitch(action.GetParameter( 4 ).GetAsMathExpressionResult(scene, objectsConcerned));
        else
            music->SetPitch(1);
    }

    return true;
}

////////////////////////////////////////////////////////////
/// Stoppe une musique sur un canal
///
/// Type : StopMusicCanal
/// Paramètre 1 : Canal
////////////////////////////////////////////////////////////
bool ActStopMusicCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> ( action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_MUSIC ) return false;

    SoundManager::GetInstance()->GetMusicOnChannel(canal)->Stop();

    return true;
}

////////////////////////////////////////////////////////////
/// Met en pause une musique sur un canal
///
/// Type : PauseMusicCanal
/// Paramètre 1 : Canal
////////////////////////////////////////////////////////////
bool ActPauseMusicCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> ( action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_MUSIC ) return false;

    SoundManager::GetInstance()->GetMusicOnChannel(canal)->Pause();

    return true;
}

////////////////////////////////////////////////////////////
/// Re(joute) une musique sur un canal
///
/// Type : RePlayMusicCanal
/// Paramètre 1 : Canal
////////////////////////////////////////////////////////////
bool ActRePlayMusicCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> ( action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_MUSIC )  return false;

    SoundManager::GetInstance()->GetMusicOnChannel(canal)->Play();

    return true;
}

////////////////////////////////////////////////////////////
/// Modifier le volume du son sur le canal
///
/// Type : ModVolumeSoundCanal
/// Paramètre 1 : Canal
/// Paramètre 2 : Volume
/// Paramètre 3 : Signe ( facultatif )
////////////////////////////////////////////////////////////
bool ActModVolumeSoundCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> (action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return false;

    SoundManager * soundManager = SoundManager::GetInstance();

    if (action.GetParameter(2).GetPlainString().empty() || action.GetParameter(2).GetAsModOperator() == GDExpression::Set)
        soundManager->GetSoundOnChannel(canal)->SetVolume(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Add)
        soundManager->GetSoundOnChannel(canal)->SetVolume(soundManager->GetSoundOnChannel(canal)->GetVolume() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Substract)
        soundManager->GetSoundOnChannel(canal)->SetVolume(soundManager->GetSoundOnChannel(canal)->GetVolume() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Multiply)
        soundManager->GetSoundOnChannel(canal)->SetVolume(soundManager->GetSoundOnChannel(canal)->GetVolume() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Divide)
        soundManager->GetSoundOnChannel(canal)->SetVolume(soundManager->GetSoundOnChannel(canal)->GetVolume() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));

    return true;
}


////////////////////////////////////////////////////////////
/// Modifier le volume d'une musique sur le canal
///
/// Type : ModVolumeMusicCanal
/// Paramètre 1 : Canal
/// Paramètre 2 : Volume
/// Paramètre 3 : Signe ( facultatif )
////////////////////////////////////////////////////////////
bool ActModVolumeMusicCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> (action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_MUSIC )  return false;

    SoundManager * soundManager = SoundManager::GetInstance();

    if (action.GetParameter(2).GetPlainString().empty() || action.GetParameter(2).GetAsModOperator() == GDExpression::Set)
        soundManager->GetMusicOnChannel(canal)->SetVolume(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Add)
        soundManager->GetMusicOnChannel(canal)->SetVolume(soundManager->GetMusicOnChannel(canal)->GetVolume() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Substract)
        soundManager->GetMusicOnChannel(canal)->SetVolume(soundManager->GetMusicOnChannel(canal)->GetVolume() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Multiply)
        soundManager->GetMusicOnChannel(canal)->SetVolume(soundManager->GetMusicOnChannel(canal)->GetVolume() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Divide)
        soundManager->GetMusicOnChannel(canal)->SetVolume(soundManager->GetMusicOnChannel(canal)->GetVolume() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));

    return true;
}

////////////////////////////////////////////////////////////
/// Modifier le volume global du jeu
///
/// Type : ModGlobalVolume
/// Paramètre 2 : Volume
/// Paramètre 3 : Signe ( facultatif )
////////////////////////////////////////////////////////////
bool ActModGlobalVolume( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    SoundManager * soundManager = SoundManager::GetInstance();

    if (action.GetParameter(1).GetPlainString().empty() || action.GetParameter(1).GetAsModOperator() == GDExpression::Set)
        soundManager->SetGlobalVolume(action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(1).GetAsModOperator() == GDExpression::Add)
        soundManager->SetGlobalVolume(soundManager->GetGlobalVolume() + action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(1).GetAsModOperator() == GDExpression::Substract)
        soundManager->SetGlobalVolume(soundManager->GetGlobalVolume() - action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(1).GetAsModOperator() == GDExpression::Multiply)
        soundManager->SetGlobalVolume(soundManager->GetGlobalVolume() * action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(1).GetAsModOperator() == GDExpression::Divide)
        soundManager->SetGlobalVolume(soundManager->GetGlobalVolume() / action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));

    return true;
}

/**
 * Change pitch of the sound of a chnnel
 */
bool ActModPitchSoundChannel( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> (action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return false;

    SoundManager * soundManager = SoundManager::GetInstance();

    if (action.GetParameter(2).GetPlainString().empty() || action.GetParameter(2).GetAsModOperator() == GDExpression::Set)
        soundManager->GetSoundOnChannel(canal)->SetPitch(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Add)
        soundManager->GetSoundOnChannel(canal)->SetPitch(soundManager->GetSoundOnChannel(canal)->GetPitch() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Substract)
        soundManager->GetSoundOnChannel(canal)->SetPitch(soundManager->GetSoundOnChannel(canal)->GetPitch() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Multiply)
        soundManager->GetSoundOnChannel(canal)->SetPitch(soundManager->GetSoundOnChannel(canal)->GetPitch() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Divide)
        soundManager->GetSoundOnChannel(canal)->SetPitch(soundManager->GetSoundOnChannel(canal)->GetPitch() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));

    return true;
}

/**
 * Change pitch of the sound of a chnnel
 */
bool ActModPitchMusicChannel( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> (action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return false;

    SoundManager * soundManager = SoundManager::GetInstance();

    if (action.GetParameter(2).GetPlainString().empty() || action.GetParameter(2).GetAsModOperator() == GDExpression::Set)
        soundManager->GetMusicOnChannel(canal)->SetPitch(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Add)
        soundManager->GetMusicOnChannel(canal)->SetPitch(soundManager->GetSoundOnChannel(canal)->GetPitch() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Substract)
        soundManager->GetMusicOnChannel(canal)->SetPitch(soundManager->GetSoundOnChannel(canal)->GetPitch() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Multiply)
        soundManager->GetMusicOnChannel(canal)->SetPitch(soundManager->GetSoundOnChannel(canal)->GetPitch() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Divide)
        soundManager->GetMusicOnChannel(canal)->SetPitch(soundManager->GetSoundOnChannel(canal)->GetPitch() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));

    return true;
}

/**
 * Change the playing offset of the sound of a chnnel
 */
bool ActModPlayingOffsetSoundChannel( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> (action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return false;

    SoundManager * soundManager = SoundManager::GetInstance();

    if (action.GetParameter(2).GetPlainString().empty() || action.GetParameter(2).GetAsModOperator() == GDExpression::Set)
        soundManager->GetSoundOnChannel(canal)->SetPlayingOffset(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Add)
        soundManager->GetSoundOnChannel(canal)->SetPlayingOffset(soundManager->GetSoundOnChannel(canal)->GetPlayingOffset() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Substract)
        soundManager->GetSoundOnChannel(canal)->SetPlayingOffset(soundManager->GetSoundOnChannel(canal)->GetPlayingOffset() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Multiply)
        soundManager->GetSoundOnChannel(canal)->SetPlayingOffset(soundManager->GetSoundOnChannel(canal)->GetPlayingOffset() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Divide)
        soundManager->GetSoundOnChannel(canal)->SetPlayingOffset(soundManager->GetSoundOnChannel(canal)->GetPlayingOffset() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));

    return true;
}

/**
 * Change playing offset of the music of a chnnel
 */
bool ActModPlayingOffsetMusicChannel( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int canal = static_cast<int> (action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned));
    if ( canal < 0 || canal > MAX_CANAUX_SON ) return false;

    SoundManager * soundManager = SoundManager::GetInstance();

    if (action.GetParameter(2).GetPlainString().empty() || action.GetParameter(2).GetAsModOperator() == GDExpression::Set)
        soundManager->GetMusicOnChannel(canal)->SetPlayingOffset(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Add)
        soundManager->GetMusicOnChannel(canal)->SetPlayingOffset(soundManager->GetSoundOnChannel(canal)->GetPlayingOffset() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Substract)
        soundManager->GetMusicOnChannel(canal)->SetPlayingOffset(soundManager->GetSoundOnChannel(canal)->GetPlayingOffset() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Multiply)
        soundManager->GetMusicOnChannel(canal)->SetPlayingOffset(soundManager->GetSoundOnChannel(canal)->GetPlayingOffset() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
    else if (action.GetParameter(2).GetAsModOperator() == GDExpression::Divide)
        soundManager->GetMusicOnChannel(canal)->SetPlayingOffset(soundManager->GetSoundOnChannel(canal)->GetPlayingOffset() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));

    return true;
}
