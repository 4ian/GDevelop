/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui_filebrowser.cpp - GLUI_FileBrowser control class


          --------------------------------------------------

  Copyright (c) 1998 Paul Rademacher

  This program is freely distributable without licensing fees and is
  provided without guarantee or warrantee expressed or implied. This
  program is -not- in the public domain.

*****************************************************************************/

#include "GL/glui.h"
#include "glui_internal.h"
#include <sys/types.h>

#ifdef __GNUC__
#include <dirent.h>
#include <unistd.h>
#endif

#ifdef _WIN32
#include <windows.h>
#endif

#include <sys/stat.h>

GLUI_FileBrowser::GLUI_FileBrowser( GLUI_Node *parent, 
                                    const char *name,
                                    int type,
                                    int id,
                                    GLUI_CB cb)
{
  common_init();

  set_name( name );
  user_id    = id;
  int_val    = type;
  callback   = cb;

  parent->add_control( this );
  list = new GLUI_List(this, true, 1);
  list->set_object_callback( GLUI_FileBrowser::dir_list_callback, this );
  list->set_click_type(GLUI_DOUBLE_CLICK);
  this->fbreaddir(this->current_dir.c_str());
}

/****************************** GLUI_FileBrowser::draw() **********/

void GLUI_FileBrowser::dir_list_callback(GLUI_Control *glui_object) {
  GLUI_List *list = dynamic_cast<GLUI_List*>(glui_object);
  if (!list) 
    return;
  GLUI_FileBrowser* me = dynamic_cast<GLUI_FileBrowser*>(list->associated_object);
  if (!me)
    return;
  int this_item;
  const char *selected;
  this_item = list->get_current_item();
  if (this_item > 0) { /* file or directory selected */
    selected = list->get_item_ptr( this_item )->text.c_str();
    if (selected[0] == '/' || selected[0] == '\\') {
      if (me->allow_change_dir) {
#ifdef __GNUC__
        chdir(selected+1);
#endif
#ifdef _WIN32
        SetCurrentDirectory(selected+1);
#endif
        me->fbreaddir(".");
      }
    } else {
      me->file = selected;
      me->execute_callback();
    }
  }
}



void GLUI_FileBrowser::fbreaddir(const char *d) {
  GLUI_String item;
  int i = 0;
	
	if (!d)
    return;

#ifdef _WIN32

  WIN32_FIND_DATA FN;
  HANDLE hFind;
  //char search_arg[MAX_PATH], new_file_path[MAX_PATH];
  //sprintf(search_arg, "%s\\*.*", path_name);
  
  hFind = FindFirstFile("*.*", &FN);
  if (list) {
    list->delete_all();
    if (hFind != INVALID_HANDLE_VALUE) {
      do {
        int len = strlen(FN.cFileName);
        if (FN.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) {
          item = '\\';
          item += FN.cFileName;
        } else {
          item = FN.cFileName;
        }
        list->add_item(i,item.c_str());
        i++;
      } while (FindNextFile(hFind, &FN) != 0);
      
      if (GetLastError() == ERROR_NO_MORE_FILES)
        FindClose(&FN);
      else
        perror("fbreaddir");
    }
  }

#elif defined(__GNUC__)

  DIR *dir;
  struct dirent *dirp;
  struct stat dr;

  if (list) {
    list->delete_all();
    if ((dir = opendir(d)) == NULL)
      perror("fbreaddir:");
    else {
      while ((dirp = readdir(dir)) != NULL)   /* open directory     */
      { 
        if (!lstat(dirp->d_name,&dr) && S_ISDIR(dr.st_mode)) /* dir is directory   */
          item = dirp->d_name + GLUI_String("/");
        else
          item = dirp->d_name;

        list->add_item(i,item.c_str());
        i++;
      }
      closedir(dir);
    }
  }
#endif
}

void ProcessFiles(const char *path_name)
{	

}


void GLUI_FileBrowser::set_w(int w) 
{ 
  if (list) list->set_w(w);
}

void GLUI_FileBrowser::set_h(int h) 
{
  if (list) list->set_h(h);
}
