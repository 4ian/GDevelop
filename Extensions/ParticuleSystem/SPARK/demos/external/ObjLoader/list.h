#ifndef __LIST_H
#define __LIST_H

#ifdef _MSC_VER
#pragma warning(disable : 4996) // disables the warning about function deprecations
#endif

typedef struct
{
	int item_count;
	int current_max_size;
	char growable;

	void **items;
	char **names;	
} list;

void list_make(list *listo, int size, char growable);
int list_add_item(list *listo, void *item, char *name);
char* list_print_items(list *listo);
void* list_get_name(list *listo, char *name);
void* list_get_index(list *listo, int indx);
void* list_get_item(list *listo, void *item_to_find);
int list_find(list *listo, char *name_to_find);
void list_delete_index(list *listo, int indx);
void list_delete_name(list *listo, char *name);
void list_delete_item(list *listo, void *item);
void list_delete_all(list *listo);
void list_print_list(list *listo);
void list_free(list *listo);

void test_list();
#endif
