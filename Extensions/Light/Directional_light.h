#ifndef DIRECTIONAL_LIGHT_H
#define DIRECTIONAL_LIGHT_H

#include "Light.h"

enum {ANGLE, OPENING_ANGLE};

class Directional_light : public Light
{
    public:
        Directional_light();
        Directional_light(sf::Vector2f position, float intensity, float radius, float angle, float opening_angle, sf::Color colo);
        virtual ~Directional_light();

        void Generate(std::vector <Wall*> &m_wall);

        void SetAngle(float angle);
        void SetOpeningAngle(float angle);

        void SetOtherParameter(unsigned, float);

    protected:
    private:

        float m_angle;
        float m_opening_angle;
};

#endif // DIRECTIONNAL_LIGHT_H

