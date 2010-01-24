#ifndef DIRECTION_H
#define DIRECTION_H
#include <string>
#include <vector>
#include <SFML/Graphics.hpp>
#include "GDL/Sprite.h"

using namespace std;

class GD_API Direction
{
    public:
        Direction();
        virtual ~Direction();

        inline bool IsLooping() const { return loop; }
        void SetLoop(bool loop_);

        inline float GetTimeBetweenFrames() const { return timeBetweenFrame; }
        void  SetTimeBetweenFrames(float time);

        //Accès sécurisé aux sprites
        const Sprite & GetSprite(unsigned int nb) const;
        Sprite & ModSprite(unsigned int nb);

        inline bool HasNoSprites() const { return sprites.empty(); }
        inline unsigned int GetSpritesNumber() const { return sprites.size(); }
        inline void RemoveAllSprites() { sprites.clear(); }

        void AddSprite( const sf::Sprite & sprite );
        void AddSprite( const Sprite & sprite );

        //Accès direct au vector de Sprites.
        inline const vector < Sprite > & GetSprites() const { return sprites; }
        inline vector < Sprite > & GetSpritesToModify() { return sprites; }
        inline void SetSprites(const vector < Sprite > & sprites_) { sprites = sprites_; }


    private:
        bool loop;
        float timeBetweenFrame;
        vector < Sprite > sprites; // Les images à afficher

        static Sprite badSprite;
};

#endif // DIRECTION_H
