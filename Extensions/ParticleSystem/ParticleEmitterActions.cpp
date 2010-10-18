/**

Game Develop - Particle System Extension
Copyright (c) 2010 Florian Rival (Florian.Rival@gmail.com)

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
        SetEmitterXDirection( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterXDirection( GetEmitterXDirection() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterXDirection( GetEmitterXDirection() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterXDirection( GetEmitterXDirection() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterXDirection( GetEmitterXDirection() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActEmitterYDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterYDirection( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterYDirection( GetEmitterYDirection() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterYDirection( GetEmitterYDirection() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterYDirection( GetEmitterYDirection() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterYDirection( GetEmitterYDirection() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActEmitterZDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterZDirection( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterZDirection( GetEmitterZDirection() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterZDirection( GetEmitterZDirection() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterZDirection( GetEmitterZDirection() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterZDirection( GetEmitterZDirection() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActEmitterAngleA( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterAngleA( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterAngleA( GetEmitterAngleA() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterAngleA( GetEmitterAngleA() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterAngleA( GetEmitterAngleA() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterAngleA( GetEmitterAngleA() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActEmitterAngleB( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterAngleB( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterAngleB( GetEmitterAngleB() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterAngleB( GetEmitterAngleB() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterAngleB( GetEmitterAngleB() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterAngleB( GetEmitterAngleB() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}


bool ParticleEmitterObject::ActParticleGravityX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleGravityX( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleGravityX( GetParticleGravityX() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleGravityX( GetParticleGravityX() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleGravityX( GetParticleGravityX() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleGravityX( GetParticleGravityX() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleGravityY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleGravityY( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleGravityY( GetParticleGravityY() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleGravityY( GetParticleGravityY() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleGravityY( GetParticleGravityY() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleGravityY( GetParticleGravityY() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleGravityZ( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleGravityZ( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleGravityZ( GetParticleGravityZ() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleGravityZ( GetParticleGravityZ() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleGravityZ( GetParticleGravityZ() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleGravityZ( GetParticleGravityZ() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActEmitterForceMin( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterForceMin( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterForceMin( GetEmitterForceMin() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterForceMin( GetEmitterForceMin() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterForceMin( GetEmitterForceMin() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterForceMin( GetEmitterForceMin() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActEmitterForceMax( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetEmitterForceMax( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetEmitterForceMax( GetEmitterForceMax() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetEmitterForceMax( GetEmitterForceMax() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetEmitterForceMax( GetEmitterForceMax() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetEmitterForceMax( GetEmitterForceMax() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActZoneRadius( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetZoneRadius( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetZoneRadius( GetZoneRadius() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetZoneRadius( GetZoneRadius() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetZoneRadius( GetZoneRadius() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetZoneRadius( GetZoneRadius() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActFriction( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetFriction( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetFriction( GetFriction() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetFriction( GetFriction() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetFriction( GetFriction() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetFriction( GetFriction() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleLifeTimeMin( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleLifeTimeMin( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleLifeTimeMin( GetParticleLifeTimeMin() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleLifeTimeMin( GetParticleLifeTimeMin() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleLifeTimeMin( GetParticleLifeTimeMin() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleLifeTimeMin( GetParticleLifeTimeMin() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleLifeTimeMax( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleLifeTimeMax( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleLifeTimeMax( GetParticleLifeTimeMax() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleLifeTimeMax( GetParticleLifeTimeMax() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleLifeTimeMax( GetParticleLifeTimeMax() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleLifeTimeMax( GetParticleLifeTimeMax() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActRendererParam1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetRendererParam1( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetRendererParam1( GetRendererParam1() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetRendererParam1( GetRendererParam1() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetRendererParam1( GetRendererParam1() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetRendererParam1( GetRendererParam1() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActRendererParam2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetRendererParam2( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetRendererParam2( GetRendererParam2() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetRendererParam2( GetRendererParam2() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetRendererParam2( GetRendererParam2() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetRendererParam2( GetRendererParam2() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActFlow( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetFlow( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetFlow( GetFlow() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetFlow( GetFlow() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetFlow( GetFlow() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetFlow( GetFlow() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActTank( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetTank( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetTank( GetTank() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetTank( GetTank() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetTank( GetTank() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetTank( GetTank() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleRed1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleRed1( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleRed1( GetParticleRed1() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleRed1( GetParticleRed1() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleRed1( GetParticleRed1() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleRed1( GetParticleRed1() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleRed2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleRed2( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleRed2( GetParticleRed2() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleRed2( GetParticleRed2() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleRed2( GetParticleRed2() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleRed2( GetParticleRed2() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleGreen1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleGreen1( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleGreen1( GetParticleGreen1() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleGreen1( GetParticleGreen1() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleGreen1( GetParticleGreen1() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleGreen1( GetParticleGreen1() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleGreen2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleGreen2( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleGreen2( GetParticleGreen2() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleGreen2( GetParticleGreen2() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleGreen2( GetParticleGreen2() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleGreen2( GetParticleGreen2() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleBlue1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleBlue1( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleBlue1( GetParticleBlue1() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleBlue1( GetParticleBlue1() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleBlue1( GetParticleBlue1() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleBlue1( GetParticleBlue1() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleBlue2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleBlue2( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleBlue2( GetParticleBlue2() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleBlue2( GetParticleBlue2() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleBlue2( GetParticleBlue2() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleBlue2( GetParticleBlue2() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleAlpha1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleAlpha1( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleAlpha1( GetParticleAlpha1() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleAlpha1( GetParticleAlpha1() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleAlpha1( GetParticleAlpha1() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleAlpha1( GetParticleAlpha1() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleAlpha2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleAlpha2( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleAlpha2( GetParticleAlpha2() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleAlpha2( GetParticleAlpha2() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleAlpha2( GetParticleAlpha2() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleAlpha2( GetParticleAlpha2() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleSize1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleSize1( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleSize1( GetParticleSize1() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleSize1( GetParticleSize1() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleSize1( GetParticleSize1() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleSize1( GetParticleSize1() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleSize2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleSize2( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleSize2( GetParticleSize2() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleSize2( GetParticleSize2() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleSize2( GetParticleSize2() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleSize2( GetParticleSize2() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleAngle1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleAngle1( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleAngle1( GetParticleAngle1() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleAngle1( GetParticleAngle1() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleAngle1( GetParticleAngle1() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleAngle1( GetParticleAngle1() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
bool ParticleEmitterObject::ActParticleAngle2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetParticleAngle2( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetParticleAngle2( GetParticleAngle2() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetParticleAngle2( GetParticleAngle2() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetParticleAngle2( GetParticleAngle2() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetParticleAngle2( GetParticleAngle2() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}

bool ParticleEmitterObject::ActRecreateParticleSystem( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    RecreateParticleSystem();

    return true;
}
