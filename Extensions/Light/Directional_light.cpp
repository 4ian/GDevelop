#include "Directional_light.h"
#include <cmath>
#include <iostream>
#include <SFML/Graphics.hpp>

Directional_light::Directional_light() : Light()
{
    m_angle = 0;
    m_opening_angle = 0;
}

Directional_light::Directional_light(sf::Vector2f position, float intensity, float radius, float angle, float opening_angle, sf::Color colo)
    : Light(position, intensity, radius, 0, colo), m_angle(angle), m_opening_angle(opening_angle)
{
}

Directional_light::~Directional_light()
{
    //dtor
}


void Directional_light::Generate(std::vector<Wall*> &m_wall)
{
    shapes.clear();

    float angle     = m_angle * M_PI / 180;
    float o_angle   = m_opening_angle * M_PI / 180;

    AddTriangle(sf::Vector2f((m_radius*cos(angle + o_angle * 0.5))
                            ,(m_radius*sin(angle + o_angle * 0.5))) ,
                sf::Vector2f((m_radius*cos(angle - o_angle * 0.5))
                            ,(m_radius*sin(angle - o_angle * 0.5))),0,m_wall);
}

void Directional_light::SetAngle(float angle)
{
    m_angle = angle;
}

void Directional_light::SetOpeningAngle(float angle)
{
    m_opening_angle = angle;
}

void Directional_light::SetOtherParameter(unsigned n, float v)
{
    if(n == ANGLE)
        SetAngle(v);
    else if(n == OPENING_ANGLE)
        SetOpeningAngle(v);
}

