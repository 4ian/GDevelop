#pragma once

#include "stdafx.h"
#include "MassData.cpp"
#include "ShapeType.cpp"

using namespace System::Collections::Generic;

namespace Box2D
{
	namespace Net
	{
		public ref class ShapeDef
		{
		internal:
			bool DeleteOnDtor;
			b2ShapeDef *def;
			ShapeDef(b2ShapeDef *defRef) : def(defRef), DeleteOnDtor(false) { }

			//Needs to work for derivative types, too
			b2ShapeDef GetShapeDef()
			{
				return *def;
			}

		public:			
			virtual ~ShapeDef()
			{
				if(DeleteOnDtor)
					delete def;
			}

			property ShapeType ShapeType
			{
				Box2D::Net::ShapeType get()
				{
					return (Box2D::Net::ShapeType) def->type;
				}

				void set(Box2D::Net::ShapeType value)
				{
					def->type = b2ShapeType(value);
				}
			}

			property float32 Friction
			{
				float32 get()
				{
					return def->friction;
				}

				void set(float32 value)
				{
					def->friction = value;
				}
			}

			property float32 Restitution
			{
				float32 get()
				{
					return def->restitution;
				}

				void set(float32 value)
				{
					def->restitution = value;
				}
			}

			property float32 Density
			{
				float32 get()
				{
					return def->density;
				}

				void set(float32 value)
				{
					def->density = value;
				}
			}

			/// <summary>
			/// The collision category bits. Normally you would just set one bit.
			/// </summary>
			property unsigned __int16 CategoryBits
			{
				unsigned __int16 get()
				{
					return def->categoryBits;
				}

				void set(unsigned __int16 value)
				{
					def->categoryBits = value;
				}
			}

			/// <summary>
			/// The collision mask bits. This states the categories that this
			/// shape would accept for collision.
			/// </summary>
			property unsigned __int16 MaskBits
			{
				unsigned __int16 get()
				{
					return def->maskBits;
				}

				void set(unsigned __int16 value)
				{
					def->maskBits = value;
				}
			}

			/// <summary>
			/// Collision groups allow a certain group of objects to never collide (negative)
			/// or always collide (positive). Zero means no collision group. Non-zero group
			/// filtering always wins against the mask bits.
			/// </summary>
			property unsigned __int16 GroupIndex
			{
				unsigned __int16 get()
				{
					return def->groupIndex;
				}

				void set(unsigned __int16 value)
				{
					def->groupIndex = value;
				}
			}

			//TODO:
			//void* userData;
		};

		public ref class CircleDef : public ShapeDef
		{
		public:
			CircleDef() : ShapeDef(new b2CircleDef())
			{
				ShapeDef::DeleteOnDtor = (true);
			}

			property float32 Radius
			{
				float32 get()
				{
					return reinterpret_cast<b2CircleDef*>(def)->radius;
				}

				void set(float32 value)
				{
					reinterpret_cast<b2CircleDef*>(def)->radius = value;
				}
			}
		};

		public ref class PolygonDef : public ShapeDef
		{
		public:
			PolygonDef() : ShapeDef(new b2PolygonDef())
			{
				DeleteOnDtor = (true);
			}

			void SetAsBox(float X, float Y)
			{
				reinterpret_cast<b2PolygonDef*>(def)->SetAsBox(X, Y);
			}

			void SetAsBox(float X, float Y, Vector^ Center, float Angle)
			{
				reinterpret_cast<b2PolygonDef*>(def)->SetAsBox(X, Y, Center->getVec2(), Angle);
			}

			property IList<Vector^>^ Verticies
			{
				IList<Vector^>^ get()
				{
					List<Vector^>^ list = gcnew List<Vector^>();
					for(int x = 0; x < reinterpret_cast<b2PolygonDef*>(def)->vertexCount; ++x)
					{
						list->Add(gcnew Vector(reinterpret_cast<b2PolygonDef*>(def)->vertices[x]));
					}
					return list;
				}

				void set(IList<Vector^>^ value)
				{
					b2PolygonDef* Def = reinterpret_cast<b2PolygonDef*>(def);
					
					for(int x = 0; x < value->Count; ++x)
						Def->vertices[x] = value[x]->getVec2();
				}
			}
		};
	}
}
