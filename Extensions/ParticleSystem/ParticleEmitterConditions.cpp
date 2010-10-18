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


bool ParticleEmitterObject::CondEmitterXDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetEmitterXDirection() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetEmitterXDirection() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetEmitterXDirection() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetEmitterXDirection() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetEmitterXDirection() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetEmitterXDirection() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondEmitterYDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetEmitterYDirection() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetEmitterYDirection() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetEmitterYDirection() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetEmitterYDirection() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetEmitterYDirection() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetEmitterYDirection() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondEmitterZDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetEmitterZDirection() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetEmitterZDirection() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetEmitterZDirection() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetEmitterZDirection() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetEmitterZDirection() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetEmitterZDirection() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondEmitterAngleA( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetEmitterAngleA() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetEmitterAngleA() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetEmitterAngleA() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetEmitterAngleA() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetEmitterAngleA() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetEmitterAngleA() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondEmitterAngleB( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetEmitterAngleB() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetEmitterAngleB() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetEmitterAngleB() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetEmitterAngleB() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetEmitterAngleB() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetEmitterAngleB() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}

bool ParticleEmitterObject::CondParticleGravityX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleGravityX() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleGravityX() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleGravityX() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleGravityX() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleGravityX() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleGravityX() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleGravityY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleGravityY() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleGravityY() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleGravityY() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleGravityY() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleGravityY() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleGravityY() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleGravityZ( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleGravityZ() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleGravityZ() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleGravityZ() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleGravityZ() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleGravityZ() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleGravityZ() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondEmitterForceMin( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetEmitterForceMin() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetEmitterForceMin() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetEmitterForceMin() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetEmitterForceMin() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetEmitterForceMin() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetEmitterForceMin() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondEmitterForceMax( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetEmitterForceMax() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetEmitterForceMax() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetEmitterForceMax() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetEmitterForceMax() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetEmitterForceMax() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetEmitterForceMax() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondTank( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetTank() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetTank() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetTank() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetTank() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetTank() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetTank() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondFlow( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetFlow() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetFlow() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetFlow() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetFlow() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetFlow() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetFlow() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondZoneRadius( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetZoneRadius() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetZoneRadius() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetZoneRadius() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetZoneRadius() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetZoneRadius() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetZoneRadius() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondFriction( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetFriction() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetFriction() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetFriction() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetFriction() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetFriction() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetFriction() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleLifeTimeMin( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleLifeTimeMin() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleLifeTimeMin() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleLifeTimeMin() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleLifeTimeMin() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleLifeTimeMin() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleLifeTimeMin() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleLifeTimeMax( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleLifeTimeMax() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleLifeTimeMax() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleLifeTimeMax() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleLifeTimeMax() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleLifeTimeMax() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleLifeTimeMax() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondRendererParam1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetRendererParam1() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetRendererParam1() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetRendererParam1() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetRendererParam1() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetRendererParam1() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetRendererParam1() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondRendererParam2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetRendererParam2() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetRendererParam2() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetRendererParam2() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetRendererParam2() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetRendererParam2() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetRendererParam2() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleRed1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleRed1() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleRed1() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleRed1() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleRed1() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleRed1() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleRed1() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleRed2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleRed2() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleRed2() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleRed2() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleRed2() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleRed2() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleRed2() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleGreen1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleGreen1() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleGreen1() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleGreen1() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleGreen1() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleGreen1() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleGreen1() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleGreen2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleGreen2() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleGreen2() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleGreen2() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleGreen2() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleGreen2() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleGreen2() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleBlue1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleBlue1() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleBlue1() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleBlue1() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleBlue1() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleBlue1() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleBlue1() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleBlue2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleBlue2() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleBlue2() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleBlue2() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleBlue2() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleBlue2() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleBlue2() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleAlpha1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleAlpha1() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleAlpha1() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleAlpha1() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleAlpha1() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleAlpha1() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleAlpha1() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleAlpha2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleAlpha2() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleAlpha2() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleAlpha2() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleAlpha2() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleAlpha2() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleAlpha2() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleSize1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleSize1() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleSize1() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleSize1() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleSize1() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleSize1() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleSize1() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleSize2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleSize2() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleSize2() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleSize2() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleSize2() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleSize2() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleSize2() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleAngle1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleAngle1() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleAngle1() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleAngle1() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleAngle1() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleAngle1() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleAngle1() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
bool ParticleEmitterObject::CondParticleAngle2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetParticleAngle2() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetParticleAngle2() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetParticleAngle2() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetParticleAngle2() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetParticleAngle2() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetParticleAngle2() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}

/**
 * Test if there is some particles remaining
 */
bool ParticleEmitterObject::CondNoMoreParticles( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    return !hasSomeParticles;
}
