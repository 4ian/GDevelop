#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "obj_parser.h"
#include "list.h"
#include "string_extra.h"

#define WHITESPACE " \t\n\r"

void obj_free_half_list(list *listo)
{
	list_delete_all(listo);
	free(listo->names);
}

int obj_convert_to_list_index(int current_max, int index)
{
	if(index == 0)  //no index
		return -1;
		
	if(index < 0)  //relative to current list position
		return current_max + index;
		
	return index - 1;  //normal counting index
}

void obj_convert_to_list_index_v(int current_max, int *indices)
{
	for(int i=0; i<MAX_VERTEX_COUNT; i++)
		indices[i] = obj_convert_to_list_index(current_max, indices[i]);
}

void obj_set_material_defaults(obj_material *mtl)
{
	mtl->amb[0] = 0.2;
	mtl->amb[1] = 0.2;
	mtl->amb[2] = 0.2;
	mtl->diff[0] = 0.8;
	mtl->diff[1] = 0.8;
	mtl->diff[2] = 0.8;
	mtl->spec[0] = 1.0;
	mtl->spec[1] = 1.0;
	mtl->spec[2] = 1.0;
	mtl->reflect = 0.0;
	mtl->trans = 1;
	mtl->glossy = 98;
	mtl->shiny = 0;
	mtl->refract_index = 1;
	mtl->texture_filename[0] = '\0';
}

int obj_parse_vertex_index(int *vertex_index, int *texture_index, int *normal_index)
{
	char *temp_str;
	char *token;
	int vertex_count = 0;

	
	while( (token = strtok(NULL, WHITESPACE)) != NULL)
	{
		if(texture_index != NULL)
			texture_index[vertex_count] = 0;
		if(normal_index != NULL)
		normal_index[vertex_count] = 0;

		vertex_index[vertex_count] = atoi( token );
		
		if(contains(token, "//"))  //normal only
		{
			temp_str = strchr(token, '/');
			temp_str++;
			normal_index[vertex_count] = atoi( ++temp_str );
		}
		else if(contains(token, "/"))
		{
			temp_str = strchr(token, '/');
			texture_index[vertex_count] = atoi( ++temp_str );

			if(contains(temp_str, "/"))
			{
				temp_str = strchr(temp_str, '/');
				normal_index[vertex_count] = atoi( ++temp_str );
			}
		}
		
		vertex_count++;
	}

	return vertex_count;
}

obj_face* obj_parse_face(obj_growable_scene_data *scene)
{
	int vertex_count;
	obj_face *face = (obj_face*)malloc(sizeof(obj_face));
	
	vertex_count = obj_parse_vertex_index(face->vertex_index, face->texture_index, face->normal_index);
	obj_convert_to_list_index_v(scene->vertex_list.item_count, face->vertex_index);
	obj_convert_to_list_index_v(scene->vertex_texture_list.item_count, face->texture_index);
	obj_convert_to_list_index_v(scene->vertex_normal_list.item_count, face->normal_index);
	face->vertex_count = vertex_count;

	return face;
}

obj_sphere* obj_parse_sphere(obj_growable_scene_data *scene)
{
	int temp_indices[MAX_VERTEX_COUNT];

	obj_sphere *obj = (obj_sphere*)malloc(sizeof(obj_sphere));
	obj_parse_vertex_index(temp_indices, obj->texture_index, NULL);
	obj_convert_to_list_index_v(scene->vertex_texture_list.item_count, obj->texture_index);
	obj->pos_index = obj_convert_to_list_index(scene->vertex_list.item_count, temp_indices[0]);
	obj->up_normal_index = obj_convert_to_list_index(scene->vertex_normal_list.item_count, temp_indices[1]);
	obj->equator_normal_index = obj_convert_to_list_index(scene->vertex_normal_list.item_count, temp_indices[2]);

	return obj;
}

obj_plane* obj_parse_plane(obj_growable_scene_data *scene)
{
	int temp_indices[MAX_VERTEX_COUNT];

	obj_plane *obj = (obj_plane*)malloc(sizeof(obj_plane));
	obj_parse_vertex_index(temp_indices, obj->texture_index, NULL);
	obj_convert_to_list_index_v(scene->vertex_texture_list.item_count, obj->texture_index);
	obj->pos_index = obj_convert_to_list_index(scene->vertex_list.item_count, temp_indices[0]);
	obj->normal_index = obj_convert_to_list_index(scene->vertex_normal_list.item_count, temp_indices[1]);
	obj->rotation_normal_index = obj_convert_to_list_index(scene->vertex_normal_list.item_count, temp_indices[2]);

	return obj;
}

obj_light_point* obj_parse_light_point(obj_growable_scene_data *scene)
{
	obj_light_point *o= (obj_light_point*)malloc(sizeof(obj_light_point));
	o->pos_index = obj_convert_to_list_index(scene->vertex_list.item_count, atoi( strtok(NULL, WHITESPACE)) );
	return o;
}

obj_light_quad* obj_parse_light_quad(obj_growable_scene_data *scene)
{
	obj_light_quad *o = (obj_light_quad*)malloc(sizeof(obj_light_quad));
	obj_parse_vertex_index(o->vertex_index, NULL, NULL);
	obj_convert_to_list_index_v(scene->vertex_list.item_count, o->vertex_index);

	return o;
}

obj_light_disc* obj_parse_light_disc(obj_growable_scene_data *scene)
{
	int temp_indices[MAX_VERTEX_COUNT];

	obj_light_disc *obj = (obj_light_disc*)malloc(sizeof(obj_light_disc));
	obj_parse_vertex_index(temp_indices, NULL, NULL);
	obj->pos_index = obj_convert_to_list_index(scene->vertex_list.item_count, temp_indices[0]);
	obj->normal_index = obj_convert_to_list_index(scene->vertex_normal_list.item_count, temp_indices[1]);

	return obj;
}

obj_vector* obj_parse_vector()
{
	obj_vector *v = (obj_vector*)malloc(sizeof(obj_vector));
	v->e[0] = atof( strtok(NULL, WHITESPACE));
	v->e[1] = atof( strtok(NULL, WHITESPACE));
	v->e[2] = atof( strtok(NULL, WHITESPACE));
	return v;
}

void obj_parse_camera(obj_growable_scene_data *scene, obj_camera *camera)
{
	int indices[3];
	obj_parse_vertex_index(indices, NULL, NULL);
	camera->camera_pos_index = obj_convert_to_list_index(scene->vertex_list.item_count, indices[0]);
	camera->camera_look_point_index = obj_convert_to_list_index(scene->vertex_list.item_count, indices[1]);
	camera->camera_up_norm_index = obj_convert_to_list_index(scene->vertex_normal_list.item_count, indices[2]);
}

int obj_parse_mtl_file(char *filename, list *material_list)
{
	int line_number = 0;
	char *current_token;
	char current_line[OBJ_LINE_SIZE];
	char material_open = 0;
	obj_material *current_mtl = NULL;
	FILE *mtl_file_stream;
	
	// open scene
	mtl_file_stream = fopen( filename, "r");
	if(mtl_file_stream == 0)
	{
		fprintf(stderr, "Error reading file: %s\n", filename);
		return 0;
	}
		
	list_make(material_list, 10, 1);

	while( fgets(current_line, OBJ_LINE_SIZE, mtl_file_stream) )
	{
		current_token = strtok( current_line, " \t\n\r");
		line_number++;
		
		//skip comments
		if( current_token == NULL || strequal(current_token, "//") || strequal(current_token, "#"))
			continue;
		

		//start material
		else if( strequal(current_token, "newmtl"))
		{
			material_open = 1;
			current_mtl = (obj_material*) malloc(sizeof(obj_material));
			obj_set_material_defaults(current_mtl);
			
			// get the name
			strncpy(current_mtl->name, strtok(NULL, " \t"), MATERIAL_NAME_SIZE);
			list_add_item(material_list, current_mtl, current_mtl->name);
		}
		
		//ambient
		else if( strequal(current_token, "Ka") && material_open)
		{
			current_mtl->amb[0] = atof( strtok(NULL, " \t"));
			current_mtl->amb[1] = atof( strtok(NULL, " \t"));
			current_mtl->amb[2] = atof( strtok(NULL, " \t"));
		}

		//diff
		else if( strequal(current_token, "Kd") && material_open)
		{
			current_mtl->diff[0] = atof( strtok(NULL, " \t"));
			current_mtl->diff[1] = atof( strtok(NULL, " \t"));
			current_mtl->diff[2] = atof( strtok(NULL, " \t"));
		}
		
		//specular
		else if( strequal(current_token, "Ks") && material_open)
		{
			current_mtl->spec[0] = atof( strtok(NULL, " \t"));
			current_mtl->spec[1] = atof( strtok(NULL, " \t"));
			current_mtl->spec[2] = atof( strtok(NULL, " \t"));
		}
		//shiny
		else if( strequal(current_token, "Ns") && material_open)
		{
			current_mtl->shiny = atof( strtok(NULL, " \t"));
		}
		//transparent
		else if( strequal(current_token, "d") && material_open)
		{
			current_mtl->trans = atof( strtok(NULL, " \t"));
		}
		//reflection
		else if( strequal(current_token, "r") && material_open)
		{
			current_mtl->reflect = atof( strtok(NULL, " \t"));
		}
		//glossy
		else if( strequal(current_token, "sharpness") && material_open)
		{
			current_mtl->glossy = atof( strtok(NULL, " \t"));
		}
		//refract index
		else if( strequal(current_token, "Ni") && material_open)
		{
			current_mtl->refract_index = atof( strtok(NULL, " \t"));
		}
		// illumination type
		else if( strequal(current_token, "illum") && material_open)
		{
		}
		// texture map
		else if( strequal(current_token, "map_Ka") && material_open)
		{
			strncpy(current_mtl->texture_filename, strtok(NULL, " \t"), OBJ_FILENAME_LENGTH);
		}
		else
		{
			fprintf(stderr, "Unknown command '%s' in material file %s at line %i:\n\t%s\n",
					current_token, filename, line_number, current_line);
			//return 0;
		}
	}
	
	fclose(mtl_file_stream);

	return 1;

}

int obj_parse_obj_file(obj_growable_scene_data *growable_data, char *filename)
{
	FILE* obj_file_stream;
	int current_material = -1; 
	char *current_token = NULL;
	char current_line[OBJ_LINE_SIZE];
	int line_number = 0;
	// open scene
	obj_file_stream = fopen( filename, "r");
	if(obj_file_stream == 0)
	{
		fprintf(stderr, "Error reading file: %s\n", filename);
		return 0;
	}

/*		
	extreme_dimensions[0].x = INFINITY; extreme_dimensions[0].y = INFINITY; extreme_dimensions[0].z = INFINITY;
	extreme_dimensions[1].x = -INFINITY; extreme_dimensions[1].y = -INFINITY; extreme_dimensions[1].z = -INFINITY;

			if(v->x < extreme_dimensions[0].x) extreme_dimensions[0].x = v->x;
			if(v->x > extreme_dimensions[1].x) extreme_dimensions[1].x = v->x;
			if(v->y < extreme_dimensions[0].y) extreme_dimensions[0].y = v->y;
			if(v->y > extreme_dimensions[1].y) extreme_dimensions[1].y = v->y;
			if(v->z < extreme_dimensions[0].z) extreme_dimensions[0].z = v->z;
			if(v->z > extreme_dimensions[1].z) extreme_dimensions[1].z = v->z;*/


	//parser loop
	while( fgets(current_line, OBJ_LINE_SIZE, obj_file_stream) )
	{
		current_token = strtok( current_line, " \t\n\r");
		line_number++;
		
		//skip comments
		if( current_token == NULL || current_token[0] == '#')
			continue;

		//parse objects
		else if( strequal(current_token, "v") ) //process vertex
		{
			list_add_item(&growable_data->vertex_list,  obj_parse_vector(), NULL);
		}
		
		else if( strequal(current_token, "vn") ) //process vertex normal
		{
			list_add_item(&growable_data->vertex_normal_list,  obj_parse_vector(), NULL);
		}
		
		else if( strequal(current_token, "vt") ) //process vertex texture
		{
			list_add_item(&growable_data->vertex_texture_list,  obj_parse_vector(), NULL);
		}
		
		else if( strequal(current_token, "f") ) //process face
		{
			obj_face *face = obj_parse_face(growable_data);
			face->material_index = current_material;
			list_add_item(&growable_data->face_list, face, NULL);
		}
		
		else if( strequal(current_token, "sp") ) //process sphere
		{
			obj_sphere *sphr = obj_parse_sphere(growable_data);
			sphr->material_index = current_material;
			list_add_item(&growable_data->sphere_list, sphr, NULL);
		}
		
		else if( strequal(current_token, "pl") ) //process plane
		{
			obj_plane *pl = obj_parse_plane(growable_data);
			pl->material_index = current_material;
			list_add_item(&growable_data->plane_list, pl, NULL);
		}
		
		else if( strequal(current_token, "p") ) //process point
		{
			//make a small sphere to represent the point?
		}
		
		else if( strequal(current_token, "lp") ) //light point source
		{
			obj_light_point *o = obj_parse_light_point(growable_data);
			o->material_index = current_material;
			list_add_item(&growable_data->light_point_list, o, NULL);
		}
		
		else if( strequal(current_token, "ld") ) //process light disc
		{
			obj_light_disc *o = obj_parse_light_disc(growable_data);
			o->material_index = current_material;
			list_add_item(&growable_data->light_disc_list, o, NULL);
		}
		
		else if( strequal(current_token, "lq") ) //process light quad
		{
			obj_light_quad *o = obj_parse_light_quad(growable_data);
			o->material_index = current_material;
			list_add_item(&growable_data->light_quad_list, o, NULL);
		}
		
		else if( strequal(current_token, "c") ) //camera
		{
			growable_data->camera = (obj_camera*) malloc(sizeof(obj_camera));
			obj_parse_camera(growable_data, growable_data->camera);
		}
		
		else if( strequal(current_token, "usemtl") ) // usemtl
		{
			current_material = list_find(&growable_data->material_list, strtok(NULL, WHITESPACE));
		}
		
		else if( strequal(current_token, "mtllib") ) // mtllib
		{
			strncpy(growable_data->material_filename, strtok(NULL, WHITESPACE), OBJ_FILENAME_LENGTH);
			obj_parse_mtl_file(growable_data->material_filename, &growable_data->material_list);
			continue;
		}
		
		else if( strequal(current_token, "o") ) //object name
		{ }
		else if( strequal(current_token, "s") ) //smoothing
		{ }
		else if( strequal(current_token, "g") ) // group
		{ }		

		else
		{
			printf("Unknown command '%s' in scene code at line %i: \"%s\".\n",
					current_token, line_number, current_line);
		}
	}

	fclose(obj_file_stream);
	
	return 1;
}


void obj_init_temp_storage(obj_growable_scene_data *growable_data)
{
	list_make(&growable_data->vertex_list, 10, 1);
	list_make(&growable_data->vertex_normal_list, 10, 1);
	list_make(&growable_data->vertex_texture_list, 10, 1);
	
	list_make(&growable_data->face_list, 10, 1);
	list_make(&growable_data->sphere_list, 10, 1);
	list_make(&growable_data->plane_list, 10, 1);
	
	list_make(&growable_data->light_point_list, 10, 1);
	list_make(&growable_data->light_quad_list, 10, 1);
	list_make(&growable_data->light_disc_list, 10, 1);
	
	list_make(&growable_data->material_list, 10, 1);	
	
	growable_data->camera = NULL;
}

void obj_free_temp_storage(obj_growable_scene_data *growable_data)
{
	obj_free_half_list(&growable_data->vertex_list);
	obj_free_half_list(&growable_data->vertex_normal_list);
	obj_free_half_list(&growable_data->vertex_texture_list);
	
	obj_free_half_list(&growable_data->face_list);
	obj_free_half_list(&growable_data->sphere_list);
	obj_free_half_list(&growable_data->plane_list);
	
	obj_free_half_list(&growable_data->light_point_list);
	obj_free_half_list(&growable_data->light_quad_list);
	obj_free_half_list(&growable_data->light_disc_list);
	
	obj_free_half_list(&growable_data->material_list);
}

void delete_obj_data(obj_scene_data *data_out)
{
	int i;
	
	for(i=0; i<data_out->vertex_count; i++)
		free(data_out->vertex_list[i]);
	free(data_out->vertex_list);
	for(i=0; i<data_out->vertex_normal_count; i++)
		free(data_out->vertex_normal_list[i]);
	free(data_out->vertex_normal_list);
	for(i=0; i<data_out->vertex_texture_count; i++)
		free(data_out->vertex_texture_list[i]);
	free(data_out->vertex_texture_list);

	for(i=0; i<data_out->face_count; i++)
		free(data_out->face_list[i]);
	free(data_out->face_list);
	for(i=0; i<data_out->sphere_count; i++)
		free(data_out->sphere_list[i]);
	free(data_out->sphere_list);
	for(i=0; i<data_out->plane_count; i++)
		free(data_out->plane_list[i]);
	free(data_out->plane_list);

	for(i=0; i<data_out->light_point_count; i++)
		free(data_out->light_point_list[i]);
	free(data_out->light_point_list);
	for(i=0; i<data_out->light_disc_count; i++)
		free(data_out->light_disc_list[i]);
	free(data_out->light_disc_list);
	for(i=0; i<data_out->light_quad_count; i++)
		free(data_out->light_quad_list[i]);
	free(data_out->light_quad_list);

	for(i=0; i<data_out->material_count; i++)
		free(data_out->material_list[i]);
	free(data_out->material_list);

	free(data_out->camera);
}

void obj_copy_to_out_storage(obj_scene_data *data_out, obj_growable_scene_data *growable_data)
{
	data_out->vertex_count = growable_data->vertex_list.item_count;
	data_out->vertex_normal_count = growable_data->vertex_normal_list.item_count;
	data_out->vertex_texture_count = growable_data->vertex_texture_list.item_count;

	data_out->face_count = growable_data->face_list.item_count;
	data_out->sphere_count = growable_data->sphere_list.item_count;
	data_out->plane_count = growable_data->plane_list.item_count;

	data_out->light_point_count = growable_data->light_point_list.item_count;
	data_out->light_disc_count = growable_data->light_disc_list.item_count;
	data_out->light_quad_count = growable_data->light_quad_list.item_count;

	data_out->material_count = growable_data->material_list.item_count;
	
	data_out->vertex_list = (obj_vector**)growable_data->vertex_list.items;
	data_out->vertex_normal_list = (obj_vector**)growable_data->vertex_normal_list.items;
	data_out->vertex_texture_list = (obj_vector**)growable_data->vertex_texture_list.items;

	data_out->face_list = (obj_face**)growable_data->face_list.items;
	data_out->sphere_list = (obj_sphere**)growable_data->sphere_list.items;
	data_out->plane_list = (obj_plane**)growable_data->plane_list.items;

	data_out->light_point_list = (obj_light_point**)growable_data->light_point_list.items;
	data_out->light_disc_list = (obj_light_disc**)growable_data->light_disc_list.items;
	data_out->light_quad_list = (obj_light_quad**)growable_data->light_quad_list.items;
	
	data_out->material_list = (obj_material**)growable_data->material_list.items;
	
	data_out->camera = growable_data->camera;
}

int parse_obj_scene(obj_scene_data *data_out, char *filename)
{
	obj_growable_scene_data growable_data;

	obj_init_temp_storage(&growable_data);
	if( obj_parse_obj_file(&growable_data, filename) == 0)
		return 0;
	
	//print_vector(NORMAL, "Max bounds are: ", &growable_data->extreme_dimensions[1]);
	//print_vector(NORMAL, "Min bounds are: ", &growable_data->extreme_dimensions[0]);

	obj_copy_to_out_storage(data_out, &growable_data);
	obj_free_temp_storage(&growable_data);
	return 1;
}

