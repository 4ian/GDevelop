#include "BipedDef.h"

int16 BipedDef::count = 0;

const float32 k_scale = 3.0f;

BipedDef::BipedDef()
{
	SetMotorTorque(2.0f);
	SetMotorSpeed(0.0f);
	SetDensity(20.0f);
	SetRestitution(0.0f);
	SetLinearDamping(0.0f);
	SetAngularDamping(0.005f);
	SetGroupIndex(--count);
	EnableMotor();
	EnableLimit();
	
	DefaultVertices();
	DefaultPositions();
	DefaultJoints();

	LFootPoly.friction = RFootPoly.friction = 0.85f;
}

void BipedDef::IsFast(bool b)
{
	B2_NOT_USED(b);
	/*
	LFootDef.isFast			= b;
	RFootDef.isFast			= b;
	LCalfDef.isFast			= b;
	RCalfDef.isFast			= b;
	LThighDef.isFast		= b;
	RThighDef.isFast		= b;
	PelvisDef.isFast		= b;
	StomachDef.isFast		= b;
	ChestDef.isFast			= b;
	NeckDef.isFast			= b;
	HeadDef.isFast			= b;
	LUpperArmDef.isFast		= b;
	RUpperArmDef.isFast		= b;
	LForearmDef.isFast		= b;
	RForearmDef.isFast		= b;
	LHandDef.isFast			= b;
	RHandDef.isFast			= b;
	*/
}

void BipedDef::SetGroupIndex(int16 i)
{
	LFootPoly.filter.groupIndex		= i;
	RFootPoly.filter.groupIndex		= i;
	LCalfPoly.filter.groupIndex		= i;
	RCalfPoly.filter.groupIndex		= i;
	LThighPoly.filter.groupIndex		= i;
	RThighPoly.filter.groupIndex		= i;
	PelvisPoly.filter.groupIndex		= i;
	StomachPoly.filter.groupIndex		= i;
	ChestPoly.filter.groupIndex		= i;
	NeckPoly.filter.groupIndex			= i;
	HeadCirc.filter.groupIndex			= i;
	LUpperArmPoly.filter.groupIndex	= i;
	RUpperArmPoly.filter.groupIndex	= i;
	LForearmPoly.filter.groupIndex		= i;
	RForearmPoly.filter.groupIndex		= i;
	LHandPoly.filter.groupIndex		= i;
	RHandPoly.filter.groupIndex		= i;
}

void BipedDef::SetLinearDamping(float f)
{
	LFootDef.linearDamping		= f;
	RFootDef.linearDamping		= f;
	LCalfDef.linearDamping		= f;
	RCalfDef.linearDamping		= f;
	LThighDef.linearDamping		= f;
	RThighDef.linearDamping		= f;
	PelvisDef.linearDamping		= f;
	StomachDef.linearDamping	= f;
	ChestDef.linearDamping		= f;
	NeckDef.linearDamping		= f;
	HeadDef.linearDamping		= f;
	LUpperArmDef.linearDamping	= f;
	RUpperArmDef.linearDamping	= f;
	LForearmDef.linearDamping	= f;
	RForearmDef.linearDamping	= f;
	LHandDef.linearDamping		= f;
	RHandDef.linearDamping		= f;
}

void BipedDef::SetAngularDamping(float f)
{
	LFootDef.angularDamping		= f;
	RFootDef.angularDamping		= f;
	LCalfDef.angularDamping		= f;
	RCalfDef.angularDamping		= f;
	LThighDef.angularDamping	= f;
	RThighDef.angularDamping	= f;
	PelvisDef.angularDamping	= f;
	StomachDef.angularDamping	= f;
	ChestDef.angularDamping		= f;
	NeckDef.angularDamping		= f;
	HeadDef.angularDamping		= f;
	LUpperArmDef.angularDamping	= f;
	RUpperArmDef.angularDamping	= f;
	LForearmDef.angularDamping	= f;
	RForearmDef.angularDamping	= f;
	LHandDef.angularDamping		= f;
	RHandDef.angularDamping		= f;
}

void BipedDef::SetMotorTorque(float f)
{
	LAnkleDef.maxMotorTorque		= f;
	RAnkleDef.maxMotorTorque		= f;
	LKneeDef.maxMotorTorque		= f;
	RKneeDef.maxMotorTorque		= f;
	LHipDef.maxMotorTorque			= f;
	RHipDef.maxMotorTorque			= f;
	LowerAbsDef.maxMotorTorque		= f;
	UpperAbsDef.maxMotorTorque		= f;
	LowerNeckDef.maxMotorTorque	= f;
	UpperNeckDef.maxMotorTorque	= f;
	LShoulderDef.maxMotorTorque	= f;
	RShoulderDef.maxMotorTorque	= f;
	LElbowDef.maxMotorTorque		= f;
	RElbowDef.maxMotorTorque		= f;
	LWristDef.maxMotorTorque		= f;
	RWristDef.maxMotorTorque		= f;
}

void BipedDef::SetMotorSpeed(float f)
{
	LAnkleDef.motorSpeed		= f;
	RAnkleDef.motorSpeed		= f;
	LKneeDef.motorSpeed			= f;
	RKneeDef.motorSpeed			= f;
	LHipDef.motorSpeed			= f;
	RHipDef.motorSpeed			= f;
	LowerAbsDef.motorSpeed		= f;
	UpperAbsDef.motorSpeed		= f;
	LowerNeckDef.motorSpeed		= f;
	UpperNeckDef.motorSpeed		= f;
	LShoulderDef.motorSpeed		= f;
	RShoulderDef.motorSpeed		= f;
	LElbowDef.motorSpeed		= f;
	RElbowDef.motorSpeed		= f;
	LWristDef.motorSpeed		= f;
	RWristDef.motorSpeed		= f;
}

void BipedDef::SetDensity(float f)
{
	LFootPoly.density			= f;
	RFootPoly.density			= f;
	LCalfPoly.density			= f;
	RCalfPoly.density			= f;
	LThighPoly.density			= f;
	RThighPoly.density			= f;
	PelvisPoly.density			= f;
	StomachPoly.density			= f;
	ChestPoly.density			= f;
	NeckPoly.density			= f;
	HeadCirc.density			= f;
	LUpperArmPoly.density		= f;
	RUpperArmPoly.density		= f;
	LForearmPoly.density		= f;
	RForearmPoly.density		= f;
	LHandPoly.density			= f;
	RHandPoly.density			= f;
}

void BipedDef::SetRestitution(float f)
{
	LFootPoly.restitution		= f;
	RFootPoly.restitution		= f;
	LCalfPoly.restitution		= f;
	RCalfPoly.restitution		= f;
	LThighPoly.restitution		= f;
	RThighPoly.restitution		= f;
	PelvisPoly.restitution		= f;
	StomachPoly.restitution		= f;
	ChestPoly.restitution		= f;
	NeckPoly.restitution		= f;
	HeadCirc.restitution		= f;
	LUpperArmPoly.restitution	= f;
	RUpperArmPoly.restitution	= f;
	LForearmPoly.restitution	= f;
	RForearmPoly.restitution	= f;
	LHandPoly.restitution		= f;
	RHandPoly.restitution		= f;
}

void BipedDef::EnableLimit()
{
	SetLimit(true);
}

void BipedDef::DisableLimit()
{
	SetLimit(false);
}

void BipedDef::SetLimit(bool b)
{
	LAnkleDef.enableLimit		= b;
	RAnkleDef.enableLimit		= b;
	LKneeDef.enableLimit		= b;
	RKneeDef.enableLimit		= b;
	LHipDef.enableLimit			= b;
	RHipDef.enableLimit			= b;
	LowerAbsDef.enableLimit		= b;
	UpperAbsDef.enableLimit		= b;
	LowerNeckDef.enableLimit	= b;
	UpperNeckDef.enableLimit	= b;
	LShoulderDef.enableLimit	= b;
	RShoulderDef.enableLimit	= b;
	LElbowDef.enableLimit		= b;
	RElbowDef.enableLimit		= b;
	LWristDef.enableLimit		= b;
	RWristDef.enableLimit		= b;
}

void BipedDef::EnableMotor()
{
	SetMotor(true);
}

void BipedDef::DisableMotor()
{
	SetMotor(false);
}

void BipedDef::SetMotor(bool b)
{
	LAnkleDef.enableMotor		= b;
	RAnkleDef.enableMotor		= b;
	LKneeDef.enableMotor		= b;
	RKneeDef.enableMotor		= b;
	LHipDef.enableMotor			= b;
	RHipDef.enableMotor			= b;
	LowerAbsDef.enableMotor		= b;
	UpperAbsDef.enableMotor		= b;
	LowerNeckDef.enableMotor	= b;
	UpperNeckDef.enableMotor	= b;
	LShoulderDef.enableMotor	= b;
	RShoulderDef.enableMotor	= b;
	LElbowDef.enableMotor		= b;
	RElbowDef.enableMotor		= b;
	LWristDef.enableMotor		= b;
	RWristDef.enableMotor		= b;
}

BipedDef::~BipedDef(void)
{
}

void BipedDef::DefaultVertices()
{
	{	// feet
		LFootPoly.vertexCount = RFootPoly.vertexCount = 5;
		LFootPoly.vertices[0] = RFootPoly.vertices[0] = k_scale * b2Vec2(.033f,.143f);
		LFootPoly.vertices[1] = RFootPoly.vertices[1] = k_scale * b2Vec2(.023f,.033f);
		LFootPoly.vertices[2] = RFootPoly.vertices[2] = k_scale * b2Vec2(.267f,.035f);
		LFootPoly.vertices[3] = RFootPoly.vertices[3] = k_scale * b2Vec2(.265f,.065f);
		LFootPoly.vertices[4] = RFootPoly.vertices[4] = k_scale * b2Vec2(.117f,.143f);
	}
	{	// calves
		LCalfPoly.vertexCount = RCalfPoly.vertexCount = 4;
		LCalfPoly.vertices[0] = RCalfPoly.vertices[0] = k_scale * b2Vec2(.089f,.016f);
		LCalfPoly.vertices[1] = RCalfPoly.vertices[1] = k_scale * b2Vec2(.178f,.016f);
		LCalfPoly.vertices[2] = RCalfPoly.vertices[2] = k_scale * b2Vec2(.205f,.417f);
		LCalfPoly.vertices[3] = RCalfPoly.vertices[3] = k_scale * b2Vec2(.095f,.417f);
	}
	{	// thighs
		LThighPoly.vertexCount = RThighPoly.vertexCount = 4;
		LThighPoly.vertices[0] = RThighPoly.vertices[0] = k_scale * b2Vec2(.137f,.032f);
		LThighPoly.vertices[1] = RThighPoly.vertices[1] = k_scale * b2Vec2(.243f,.032f);
		LThighPoly.vertices[2] = RThighPoly.vertices[2] = k_scale * b2Vec2(.318f,.343f);
		LThighPoly.vertices[3] = RThighPoly.vertices[3] = k_scale * b2Vec2(.142f,.343f);
	}
	{	// pelvis
		PelvisPoly.vertexCount = 5;
		PelvisPoly.vertices[0] = k_scale * b2Vec2(.105f,.051f);
		PelvisPoly.vertices[1] = k_scale * b2Vec2(.277f,.053f);
		PelvisPoly.vertices[2] = k_scale * b2Vec2(.320f,.233f);
		PelvisPoly.vertices[3] = k_scale * b2Vec2(.112f,.233f);
		PelvisPoly.vertices[4] = k_scale * b2Vec2(.067f,.152f);
	}
	{	// stomach
		StomachPoly.vertexCount = 4;
		StomachPoly.vertices[0] = k_scale * b2Vec2(.088f,.043f);
		StomachPoly.vertices[1] = k_scale * b2Vec2(.284f,.043f);
		StomachPoly.vertices[2] = k_scale * b2Vec2(.295f,.231f);
		StomachPoly.vertices[3] = k_scale * b2Vec2(.100f,.231f);
	}
	{	// chest
		ChestPoly.vertexCount = 4;
		ChestPoly.vertices[0] = k_scale * b2Vec2(.091f,.042f);
		ChestPoly.vertices[1] = k_scale * b2Vec2(.283f,.042f);
		ChestPoly.vertices[2] = k_scale * b2Vec2(.177f,.289f);
		ChestPoly.vertices[3] = k_scale * b2Vec2(.065f,.289f);
	}
	{	// head
		HeadCirc.radius = k_scale * .115f;
	}
	{	// neck
		NeckPoly.vertexCount = 4;
		NeckPoly.vertices[0] = k_scale * b2Vec2(.038f,.054f);
		NeckPoly.vertices[1] = k_scale * b2Vec2(.149f,.054f);
		NeckPoly.vertices[2] = k_scale * b2Vec2(.154f,.102f);
		NeckPoly.vertices[3] = k_scale * b2Vec2(.054f,.113f);
	}
	{	// upper arms
		LUpperArmPoly.vertexCount = RUpperArmPoly.vertexCount = 5;
		LUpperArmPoly.vertices[0] = RUpperArmPoly.vertices[0] = k_scale * b2Vec2(.092f,.059f);
		LUpperArmPoly.vertices[1] = RUpperArmPoly.vertices[1] = k_scale * b2Vec2(.159f,.059f);
		LUpperArmPoly.vertices[2] = RUpperArmPoly.vertices[2] = k_scale * b2Vec2(.169f,.335f);
		LUpperArmPoly.vertices[3] = RUpperArmPoly.vertices[3] = k_scale * b2Vec2(.078f,.335f);
		LUpperArmPoly.vertices[4] = RUpperArmPoly.vertices[4] = k_scale * b2Vec2(.064f,.248f);
	}
	{	// forearms
		LForearmPoly.vertexCount = RForearmPoly.vertexCount = 4;
		LForearmPoly.vertices[0] = RForearmPoly.vertices[0] = k_scale * b2Vec2(.082f,.054f);
		LForearmPoly.vertices[1] = RForearmPoly.vertices[1] = k_scale * b2Vec2(.138f,.054f);
		LForearmPoly.vertices[2] = RForearmPoly.vertices[2] = k_scale * b2Vec2(.149f,.296f);
		LForearmPoly.vertices[3] = RForearmPoly.vertices[3] = k_scale * b2Vec2(.088f,.296f);
	}
	{	// hands
		LHandPoly.vertexCount = RHandPoly.vertexCount = 5;
		LHandPoly.vertices[0] = RHandPoly.vertices[0] = k_scale * b2Vec2(.066f,.031f);
		LHandPoly.vertices[1] = RHandPoly.vertices[1] = k_scale * b2Vec2(.123f,.020f);
		LHandPoly.vertices[2] = RHandPoly.vertices[2] = k_scale * b2Vec2(.160f,.127f);
		LHandPoly.vertices[3] = RHandPoly.vertices[3] = k_scale * b2Vec2(.127f,.178f);
		LHandPoly.vertices[4] = RHandPoly.vertices[4] = k_scale * b2Vec2(.074f,.178f);;
	}
}

void BipedDef::DefaultJoints()
{
	//b.LAnkleDef.body1		= LFoot;
	//b.LAnkleDef.body2		= LCalf;
	//b.RAnkleDef.body1		= RFoot;
	//b.RAnkleDef.body2		= RCalf;
	{	// ankles
		b2Vec2 anchor = k_scale * b2Vec2(-.045f,-.75f);
		LAnkleDef.localAnchor1		= RAnkleDef.localAnchor1	= anchor - LFootDef.position;
		LAnkleDef.localAnchor2		= RAnkleDef.localAnchor2	= anchor - LCalfDef.position;
		LAnkleDef.referenceAngle	= RAnkleDef.referenceAngle	= 0.0f;
		LAnkleDef.lowerAngle		= RAnkleDef.lowerAngle		= -0.523598776f;
		LAnkleDef.upperAngle		= RAnkleDef.upperAngle		= 0.523598776f;
	}

	//b.LKneeDef.body1		= LCalf;
	//b.LKneeDef.body2		= LThigh;
	//b.RKneeDef.body1		= RCalf;
	//b.RKneeDef.body2		= RThigh;
	{	// knees
		b2Vec2 anchor = k_scale * b2Vec2(-.030f,-.355f);
		LKneeDef.localAnchor1	= RKneeDef.localAnchor1		= anchor - LCalfDef.position;
		LKneeDef.localAnchor2	= RKneeDef.localAnchor2		= anchor - LThighDef.position;
		LKneeDef.referenceAngle	= RKneeDef.referenceAngle	= 0.0f;
		LKneeDef.lowerAngle		= RKneeDef.lowerAngle		= 0;
		LKneeDef.upperAngle		= RKneeDef.upperAngle		= 2.61799388f;
	}

	//b.LHipDef.body1			= LThigh;
	//b.LHipDef.body2			= Pelvis;
	//b.RHipDef.body1			= RThigh;
	//b.RHipDef.body2			= Pelvis;
	{	// hips
		b2Vec2 anchor = k_scale * b2Vec2(.005f,-.045f);
		LHipDef.localAnchor1	= RHipDef.localAnchor1		= anchor - LThighDef.position;
		LHipDef.localAnchor2	= RHipDef.localAnchor2		= anchor - PelvisDef.position;
		LHipDef.referenceAngle	= RHipDef.referenceAngle	= 0.0f;
		LHipDef.lowerAngle		= RHipDef.lowerAngle		= -2.26892803f;
		LHipDef.upperAngle		= RHipDef.upperAngle		= 0;
	}

	//b.LowerAbsDef.body1		= Pelvis;
	//b.LowerAbsDef.body2		= Stomach;
	{	// lower abs
		b2Vec2 anchor = k_scale * b2Vec2(.035f,.135f);
		LowerAbsDef.localAnchor1	= anchor - PelvisDef.position;
		LowerAbsDef.localAnchor2	= anchor - StomachDef.position;
		LowerAbsDef.referenceAngle	= 0.0f;
		LowerAbsDef.lowerAngle		= -0.523598776f;
		LowerAbsDef.upperAngle		= 0.523598776f;
	}

	//b.UpperAbsDef.body1		= Stomach;
	//b.UpperAbsDef.body2		= Chest;
	{	// upper abs
		b2Vec2 anchor = k_scale * b2Vec2(.045f,.320f);
		UpperAbsDef.localAnchor1	= anchor - StomachDef.position;
		UpperAbsDef.localAnchor2	= anchor - ChestDef.position;
		UpperAbsDef.referenceAngle	= 0.0f;
		UpperAbsDef.lowerAngle		= -0.523598776f;
		UpperAbsDef.upperAngle		= 0.174532925f;
	}

	//b.LowerNeckDef.body1	= Chest;
	//b.LowerNeckDef.body2	= Neck;
	{	// lower neck
		b2Vec2 anchor = k_scale * b2Vec2(-.015f,.575f);
		LowerNeckDef.localAnchor1	= anchor - ChestDef.position;
		LowerNeckDef.localAnchor2	= anchor - NeckDef.position;
		LowerNeckDef.referenceAngle	= 0.0f;
		LowerNeckDef.lowerAngle		= -0.174532925f;
		LowerNeckDef.upperAngle		= 0.174532925f;
	}

	//b.UpperNeckDef.body1	= Chest;
	//b.UpperNeckDef.body2	= Head;
	{	// upper neck
		b2Vec2 anchor = k_scale * b2Vec2(-.005f,.630f);
		UpperNeckDef.localAnchor1	= anchor - ChestDef.position;
		UpperNeckDef.localAnchor2	= anchor - HeadDef.position;
		UpperNeckDef.referenceAngle	= 0.0f;
		UpperNeckDef.lowerAngle		= -0.610865238f;
		UpperNeckDef.upperAngle		= 0.785398163f;
	}

	//b.LShoulderDef.body1	= Chest;
	//b.LShoulderDef.body2	= LUpperArm;
	//b.RShoulderDef.body1	= Chest;
	//b.RShoulderDef.body2	= RUpperArm;
	{	// shoulders
		b2Vec2 anchor = k_scale * b2Vec2(-.015f,.545f);
		LShoulderDef.localAnchor1	= RShoulderDef.localAnchor1		= anchor - ChestDef.position;
		LShoulderDef.localAnchor2	= RShoulderDef.localAnchor2		= anchor - LUpperArmDef.position;
		LShoulderDef.referenceAngle	= RShoulderDef.referenceAngle	= 0.0f;
		LShoulderDef.lowerAngle		= RShoulderDef.lowerAngle		= -1.04719755f;
		LShoulderDef.upperAngle		= RShoulderDef.upperAngle		= 3.14159265f;
	}

	//b.LElbowDef.body1		= LForearm;
	//b.LElbowDef.body2		= LUpperArm;
	//b.RElbowDef.body1		= RForearm;
	//b.RElbowDef.body2		= RUpperArm;
	{	// elbows
		b2Vec2 anchor = k_scale * b2Vec2(-.005f,.290f);
		LElbowDef.localAnchor1		= RElbowDef.localAnchor1	= anchor - LForearmDef.position;
		LElbowDef.localAnchor2		= RElbowDef.localAnchor2	= anchor - LUpperArmDef.position;
		LElbowDef.referenceAngle	= RElbowDef.referenceAngle	= 0.0f;
		LElbowDef.lowerAngle		= RElbowDef.lowerAngle		= -2.7925268f;
		LElbowDef.upperAngle		= RElbowDef.upperAngle		= 0;
	}

	//b.LWristDef.body1		= LHand;
	//b.LWristDef.body2		= LForearm;
	//b.RWristDef.body1		= RHand;
	//b.RWristDef.body2		= RForearm;
	{	// wrists
		b2Vec2 anchor = k_scale * b2Vec2(-.010f,.045f);
		LWristDef.localAnchor1		= RWristDef.localAnchor1	= anchor - LHandDef.position;
		LWristDef.localAnchor2		= RWristDef.localAnchor2	= anchor - LForearmDef.position;
		LWristDef.referenceAngle	= RWristDef.referenceAngle	= 0.0f;
		LWristDef.lowerAngle		= RWristDef.lowerAngle		= -0.174532925f;
		LWristDef.upperAngle		= RWristDef.upperAngle		= 0.174532925f;
	}
}

void BipedDef::DefaultPositions()
{
	LFootDef.position		= RFootDef.position			= k_scale * b2Vec2(-.122f,-.901f);
	LCalfDef.position		= RCalfDef.position			= k_scale * b2Vec2(-.177f,-.771f);
	LThighDef.position		= RThighDef.position		= k_scale * b2Vec2(-.217f,-.391f);
	LUpperArmDef.position	= RUpperArmDef.position		= k_scale * b2Vec2(-.127f,.228f);
	LForearmDef.position	= RForearmDef.position		= k_scale * b2Vec2(-.117f,-.011f);
	LHandDef.position		= RHandDef.position			= k_scale * b2Vec2(-.112f,-.136f);
	PelvisDef.position									= k_scale * b2Vec2(-.177f,-.101f);
	StomachDef.position									= k_scale * b2Vec2(-.142f,.088f);
	ChestDef.position									= k_scale * b2Vec2(-.132f,.282f);
	NeckDef.position									= k_scale * b2Vec2(-.102f,.518f);
	HeadDef.position									= k_scale * b2Vec2(.022f,.738f);
}
