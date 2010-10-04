#ifndef OBJ_LOADER_H
#define OBJ_LOADER_H

#include "obj_parser.h"

class objLoader
{
public:
	objLoader() {}
	~objLoader()
	{
		delete_obj_data(&data);
	}

	int load(char *filename);

	obj_vector **vertexList;
	obj_vector **normalList;
	obj_vector **textureList;
	
	obj_face **faceList;
	obj_sphere **sphereList;
	obj_plane **planeList;
	
	obj_light_point **lightPointList;
	obj_light_quad **lightQuadList;
	obj_light_disc **lightDiscList;
	
	obj_material **materialList;
	
	int vertexCount;
	int normalCount;
	int textureCount;

	int faceCount;
	int sphereCount;
	int planeCount;

	int lightPointCount;
	int lightQuadCount;
	int lightDiscCount;

	int materialCount;

	obj_camera *camera;
private:
	obj_scene_data data;
};

#endif
