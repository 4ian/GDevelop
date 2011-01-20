/**

Game Develop - Particle System Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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

#include "ParticleEmitterObject.h"

#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"
#include "GDL/CommonTools.h"


bool ParticleEmitterObject::ActEmitterXDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterXDirection( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterXDirection( GetEmitterXDirection() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterXDirection( GetEmitterXDirection() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterXDirection( GetEmitterXDirection() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterXDirection( GetEmitterXDirection() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActEmitterYDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterYDirection( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterYDirection( GetEmitterYDirection() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterYDirection( GetEmitterYDirection() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterYDirection( GetEmitterYDirection() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterYDirection( GetEmitterYDirection() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActEmitterZDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterZDirection( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterZDirection( GetEmitterZDirection() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterZDirection( GetEmitterZDirection() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterZDirection( GetEmitterZDirection() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterZDirection( GetEmitterZDirection() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActEmitterAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    float angle = atan2(GetEmitterYDirection(), GetEmitterXDirection());
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        angle = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())*3.14159f/180.0f;
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        angle += action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())*3.14159f/180.0f;
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        angle -= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())*3.14159f/180.0f;
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        angle *= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())*3.14159f/180.0f;
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        angle /= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())*3.14159f/180.0f;

    SetEmitterXDirection(cos(angle));
    SetEmitterYDirection(sin(angle));

    return true;
}
bool ParticleEmitterObject::ActEmitterAngleA( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterAngleA( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterAngleA( GetEmitterAngleA() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterAngleA( GetEmitterAngleA() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterAngleA( GetEmitterAngleA() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterAngleA( GetEmitterAngleA() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActEmitterAngleB( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterAngleB( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterAngleB( GetEmitterAngleB() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterAngleB( GetEmitterAngleB() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterAngleB( GetEmitterAngleB() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterAngleB( GetEmitterAngleB() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActConeSprayAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterAngleB( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())/180.0f*3.14159f );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterAngleB( GetEmitterAngleB() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())/180.0f*3.14159f );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterAngleB( GetEmitterAngleB() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())/180.0f*3.14159f );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterAngleB( GetEmitterAngleB() * (action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())/180.0f*3.14159f) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterAngleB( GetEmitterAngleB() / (action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())/180.0f*3.14159f) );

    return true;
}


bool ParticleEmitterObject::ActParticleGravityX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleGravityX( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleGravityX( GetParticleGravityX() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleGravityX( GetParticleGravityX() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleGravityX( GetParticleGravityX() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleGravityX( GetParticleGravityX() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleGravityY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleGravityY( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleGravityY( GetParticleGravityY() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleGravityY( GetParticleGravityY() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleGravityY( GetParticleGravityY() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleGravityY( GetParticleGravityY() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleGravityZ( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleGravityZ( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleGravityZ( GetParticleGravityZ() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleGravityZ( GetParticleGravityZ() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleGravityZ( GetParticleGravityZ() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleGravityZ( GetParticleGravityZ() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleGravityAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    float angle = atan2(GetParticleGravityY(), GetParticleGravityX());
    float length = sqrt(GetParticleGravityY()*GetParticleGravityY()+GetParticleGravityX()*GetParticleGravityX());

    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        angle = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())*3.14159f/180.0f;
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        angle += action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())*3.14159f/180.0f;
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        angle -= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())*3.14159f/180.0f;
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        angle *= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())*3.14159f/180.0f;
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        angle /= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())*3.14159f/180.0f;

    SetParticleGravityX(cos(angle)*length);
    SetParticleGravityY(sin(angle)*length);

    return true;
}
bool ParticleEmitterObject::ActParticleGravityLength( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    float angle = atan2(GetParticleGravityY(), GetParticleGravityX());
    float length = sqrt(GetParticleGravityY()*GetParticleGravityY()+GetParticleGravityX()*GetParticleGravityX());

    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        length = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        length += action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        length -= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        length *= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        length /= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());

    SetParticleGravityX(cos(angle)*length);
    SetParticleGravityY(sin(angle)*length);

    return true;
}
bool ParticleEmitterObject::ActEmitterForceMin( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterForceMin( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterForceMin( GetEmitterForceMin() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterForceMin( GetEmitterForceMin() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterForceMin( GetEmitterForceMin() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterForceMin( GetEmitterForceMin() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActEmitterForceMax( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterForceMax( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterForceMax( GetEmitterForceMax() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterForceMax( GetEmitterForceMax() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterForceMax( GetEmitterForceMax() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterForceMax( GetEmitterForceMax() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActZoneRadius( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetZoneRadius( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetZoneRadius( GetZoneRadius() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetZoneRadius( GetZoneRadius() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetZoneRadius( GetZoneRadius() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetZoneRadius( GetZoneRadius() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActFriction( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetFriction( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetFriction( GetFriction() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetFriction( GetFriction() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetFriction( GetFriction() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetFriction( GetFriction() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleLifeTimeMin( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleLifeTimeMin( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleLifeTimeMin( GetParticleLifeTimeMin() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleLifeTimeMin( GetParticleLifeTimeMin() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleLifeTimeMin( GetParticleLifeTimeMin() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleLifeTimeMin( GetParticleLifeTimeMin() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleLifeTimeMax( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleLifeTimeMax( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleLifeTimeMax( GetParticleLifeTimeMax() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleLifeTimeMax( GetParticleLifeTimeMax() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleLifeTimeMax( GetParticleLifeTimeMax() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleLifeTimeMax( GetParticleLifeTimeMax() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActRendererParam1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetRendererParam1( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetRendererParam1( GetRendererParam1() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetRendererParam1( GetRendererParam1() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetRendererParam1( GetRendererParam1() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetRendererParam1( GetRendererParam1() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActRendererParam2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetRendererParam2( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetRendererParam2( GetRendererParam2() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetRendererParam2( GetRendererParam2() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetRendererParam2( GetRendererParam2() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetRendererParam2( GetRendererParam2() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActFlow( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetFlow( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetFlow( GetFlow() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetFlow( GetFlow() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetFlow( GetFlow() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetFlow( GetFlow() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActTank( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetTank( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetTank( GetTank() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetTank( GetTank() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetTank( GetTank() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetTank( GetTank() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}

bool ParticleEmitterObject::ActParticleColor1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    vector < string > colors = SpliterStringToVector <string> (action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    SetParticleRed1(ToInt(colors[0]));
    SetParticleBlue1(ToInt(colors[1]));
    SetParticleGreen1(ToInt(colors[2]));

    return true;
}
bool ParticleEmitterObject::ActParticleColor2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    vector < string > colors = SpliterStringToVector <string> (action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    SetParticleRed2(ToInt(colors[0]));
    SetParticleBlue2(ToInt(colors[1]));
    SetParticleGreen2(ToInt(colors[2]));

    return true;
}

bool ParticleEmitterObject::ActParticleRed1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleRed1( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleRed1( GetParticleRed1() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleRed1( GetParticleRed1() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleRed1( GetParticleRed1() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleRed1( GetParticleRed1() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleRed2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleRed2( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleRed2( GetParticleRed2() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleRed2( GetParticleRed2() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleRed2( GetParticleRed2() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleRed2( GetParticleRed2() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleGreen1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleGreen1( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleGreen1( GetParticleGreen1() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleGreen1( GetParticleGreen1() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleGreen1( GetParticleGreen1() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleGreen1( GetParticleGreen1() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleGreen2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleGreen2( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleGreen2( GetParticleGreen2() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleGreen2( GetParticleGreen2() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleGreen2( GetParticleGreen2() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleGreen2( GetParticleGreen2() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleBlue1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleBlue1( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleBlue1( GetParticleBlue1() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleBlue1( GetParticleBlue1() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleBlue1( GetParticleBlue1() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleBlue1( GetParticleBlue1() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleBlue2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleBlue2( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleBlue2( GetParticleBlue2() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleBlue2( GetParticleBlue2() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleBlue2( GetParticleBlue2() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleBlue2( GetParticleBlue2() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleAlpha1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleAlpha1( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleAlpha1( GetParticleAlpha1() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleAlpha1( GetParticleAlpha1() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleAlpha1( GetParticleAlpha1() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleAlpha1( GetParticleAlpha1() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleAlpha2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleAlpha2( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleAlpha2( GetParticleAlpha2() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleAlpha2( GetParticleAlpha2() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleAlpha2( GetParticleAlpha2() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleAlpha2( GetParticleAlpha2() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleAlphaRandomness1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleAlphaRandomness1( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleAlphaRandomness1( GetParticleAlphaRandomness1() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleAlphaRandomness1( GetParticleAlphaRandomness1() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleAlphaRandomness1( GetParticleAlphaRandomness1() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleAlphaRandomness1( GetParticleAlphaRandomness1() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleAlphaRandomness2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleAlphaRandomness2( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleAlphaRandomness2( GetParticleAlphaRandomness2() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleAlphaRandomness2( GetParticleAlphaRandomness2() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleAlphaRandomness2( GetParticleAlphaRandomness2() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleAlphaRandomness2( GetParticleAlphaRandomness2() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleSize1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleSize1( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleSize1( GetParticleSize1() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleSize1( GetParticleSize1() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleSize1( GetParticleSize1() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleSize1( GetParticleSize1() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleSize2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleSize2( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleSize2( GetParticleSize2() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleSize2( GetParticleSize2() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleSize2( GetParticleSize2() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleSize2( GetParticleSize2() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleSizeRandomness1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleSizeRandomness1( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleSizeRandomness1( GetParticleSizeRandomness1() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleSizeRandomness1( GetParticleSizeRandomness1() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleSizeRandomness1( GetParticleSizeRandomness1() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleSizeRandomness1( GetParticleSizeRandomness1() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleSizeRandomness2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleSizeRandomness2( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleSizeRandomness2( GetParticleSizeRandomness2() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleSizeRandomness2( GetParticleSizeRandomness2() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleSizeRandomness2( GetParticleSizeRandomness2() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleSizeRandomness2( GetParticleSizeRandomness2() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleAngle1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleAngle1( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleAngle1( GetParticleAngle1() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleAngle1( GetParticleAngle1() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleAngle1( GetParticleAngle1() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleAngle1( GetParticleAngle1() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleAngle2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleAngle2( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleAngle2( GetParticleAngle2() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleAngle2( GetParticleAngle2() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleAngle2( GetParticleAngle2() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleAngle2( GetParticleAngle2() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleAngleRandomness1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleAngleRandomness1( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleAngleRandomness1( GetParticleAngleRandomness1() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleAngleRandomness1( GetParticleAngleRandomness1() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleAngleRandomness1( GetParticleAngleRandomness1() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleAngleRandomness1( GetParticleAngleRandomness1() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}
bool ParticleEmitterObject::ActParticleAngleRandomness2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleAngleRandomness2( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleAngleRandomness2( GetParticleAngleRandomness2() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleAngleRandomness2( GetParticleAngleRandomness2() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleAngleRandomness2( GetParticleAngleRandomness2() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleAngleRandomness2( GetParticleAngleRandomness2() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}

/**
 * Change the texture
 */
bool ParticleEmitterObject::ActTexture( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    textureParticleName = action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this());
    if ( rendererType == Quad )
    {
        //Load new texture
        particleSystem.openGLTextureParticle = scene.game->imageManager->GetOpenGLTexture(textureParticleName);

	    //Notify the renderer of the change
	    SPK::GL::GLQuadRenderer * quadRenderer = dynamic_cast<SPK::GL::GLQuadRenderer*>(particleSystem.renderer);

        if ( quadRenderer && particleSystem.openGLTextureParticle->GetOpenGLTexture() != 0 )
        {
            quadRenderer->setTexturingMode(SPK::TEXTURE_2D);
            quadRenderer->setTexture(particleSystem.openGLTextureParticle->GetOpenGLTexture());
        }
    }

    return true;
}

bool ParticleEmitterObject::ActRecreateParticleSystem( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    RecreateParticleSystem();

    return true;
}
