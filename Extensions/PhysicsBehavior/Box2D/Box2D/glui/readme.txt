Welcome to the GLUI User Interface Library, v2.3!
March 22, 2005
-------------------------------------------------

This distribution contains the latest community-maintained fork of the
GLUI Library.  It is based on the GLUI v2.1 beta version from Paul
Rademacher (http://www.cs.unc.edu/~rademach/glui/) plus the
compatibility changes made by Nigel Stewart in his "GLUI v2.2" 
(http://www.nigels.com/glt/glui) In accordance with the LGPL under
which the library is released (according to Paul's web page at least),
these changes are available to everyone in the community.

WARNING: This version (2.3) introduces some incompatible changes with
previous versions!!

CHANGES:

----------------------------------
- GLUI_String is now a std::string
  This is the main source of most incopatibilities, but I felt it was
  a necessary change, because the previous usage of a fixed-sized
  buffer was just too unsafe.  I myself was bitten a few times passing
  a char* buffer of insufficient size into GLUI as a live variable.
  It is still possible to use a char buffer, but it is not recommended.

  If you used GLUI_String before as a live var type, the easiest way
  to get your code compiling again is to change those to "char
  buf[300]".  The better way, though, is to update your code to treat
  it as a std::string.

  For instance, if you used to pass mystr to functions that take
  'const char*', now use mystr.c_str() method, instead.
  If you used strcpy(mystr, b) to set the value, now just do mystr=b.
  If you used sprintf(mystr,...) to set the value, now do 
  glui_format_string(mystr,...).
  If you used to clear the string with mystr[0]='\0', now just clear
  it with mystr="".

----------------------------------
- Enhanced GLUI_EditText
  Control keys can be used for navigation and control.  The bindings
  are bash-like: Ctrl-B for previous char, Ctrl-F for forward char, etc.
  bindings.  Also control keys that aren't bound to commands are
  simply ignored, whereas before they would be inserted as invisible
  characters.

----------------------------------
- Added GLUI_CommandLine class
  This is a GLUI_EditText with a history mechanism.

----------------------------------
- New, more object oriented construction API.
  Now instead of calling 

    glui->add_button_to_panel( panel, "my button", myid, mycallback );

  you should just call the button constructor:

    new GLUI_Button( panel, "my button", myid, mycallback );

  And similarly to add it to a GLUI instead of a panel, rather than:

    glui->add_button( glui, "my button", myid, mycallback );

  just call the constructor with the GLUI as the first argument:

    new GLUI_Button( glui, "my button", myid, mycallback );
    
  The old scheme is now deprecated, but still works.  The benefit of
  this new scheme is that now the GLUI class doesn't have to know
  about all the different types of GLUI_Controls that exist.
  Previously GLUI had to both know about all the controls, and know
  how to initialize them.  Now the responsibility for initialization
  belongs to the GLUI_Control subclasses themselves, where it
  belongs. Additionally it means that you can create your own
  GLUI_Control subclasses which will be on equal footing with the
  built-in controls, whereas before any user-created controls would
  always be "second-class citizens" since they would have to be
  constructed differently from the built-ins.


----------------------------------
- Removed need for type-declaring arguments when argment type suffices.
  This effects GLUI_Spinner and GLUI_EditText (and GLUI_CommandLine?).

  For example, instead of calling 

    new GLUI_Spinner( glui, "myspin", GLUI_SPINNER_INT, &live_int_var );

  you can just omit the GLUI_SPINNER_INT part, because the type of the
  live_int_var tells the compiler which type you want.

    new GLUI_Spinner( glui, "myspin", &live_int_var );

  If you're not using a live, var, you can still use the
  GLUI_SPINNER_INT type argument.  See glui.h for all the new 
  constructor signatures.  Note this only works with the new
  construction API, not with the old "add_blah_to_panel" style of
  API.

----------------------------------
- GLUI_Rotation uses your matrix live-variable now.
  GLUI used to ignore the matrix in your live variable.  This version
  doesn't ignore it, so you'll need to set it to the identity matrix
  yourself if that's what you want it to start as.  There could
  probably be some improvements to this API, though.
  
----------------------------------
- Improvements to 'const' usage.
  Most char*'s in GLUI functions used to be non-const even when the
  functions did not modify the string.  I changed everywhere
  appropriate to use const char* instead.

----------------------------------
- Updated license info in the headers
  Paul's web page says that GLUI is LGPL, but that wasn't declared in
  the code itself.  I've modified all the headers with the standard
  LGPL notice.

----------------------------------
- Updated examples for the API changes

----------------------------------
- Created project files for Visual Studio .NET (MSVC7.1)


That's about it.  Enjoy!


If you find yourself with too much time on your hands, the things I
think would be most useful for future improvements to GLUI would be:

1. The GLUI_TextBox and GLUI_Tree definitely need some work, still.  
2. Clipboard integration under Windows/X-Win.  I have some code that
   works on Win32 that I once integrated with GLUI, but I lost that 
   version somewhere.  I still have the Win32 clipboard code, though
   if anyone wants to work on integrating it.  I have some X-Win
   clipboard code, too, but I never got it working quite right.
3. Remove the dependency on GLUT, making the connection with window 
   system APIs into a more plug-in/adapter modular design.  
   So e.g. if you want to use GLUT, you'd link with the GLUI lib and a
   GLUI_GLUT lib, and call one extra GLUI_glut_init() function or 
   something.


Definitly consider submitting a patch if you've made some nice improvements
to GLUI.  Hopefully being an LGPL sourceforge project will attract some new
interest to the GLUI project.

Bill Baxter    
baxter
at
cs unc edu

=================================================
JOHN KEW'S ADDITIONS (March 2005)
=================================================

Thanks to John Kew of Natural Solutions Inc.,
there are some new widgets.  These are demonstrated in example6.cpp.

The new widgets are:

* GLUI_Scrollbar - A scrollbar slider widget
* GLUI_TextBox - A multi-line text widget
* GLUI_List - A static choice list
* GLUI_FileBrowser - A simple filebrowser based on GLUI_List
* GLUI_Tree - Hierarchical tree widget
* GLUI_TreePanel - Manager for the tree widget
 
And one other change:

* GLUI_Rollout has optional embossed border 

=================================================
PAUL'S ORIGINAL GLUI 2.0/2.1 README
=================================================

Welcome to the GLUI User Interface Library, v2.0 beta!
-------------------------------------------------

This distribution contains the full GLUI sources, as well as 5 example
programs.  You'll find the full manual under "glui_manual.pdf".  The
GLUI web page is at 

	http://www.cs.unc.edu/~rademach/glui


		    ---------- Windows ----------

The directory 'msvc' contains a Visual C++ workspace entitled
'glui.dsw'.  To recompile the library and examples, open this
workspace and run the menu command "Build:Batch Build:Build".  The 3
executables will be in the 'bin' directory, and the library in the
'lib' directory.

To create a new Windows executable using GLUI, create a "Win32 Console
Application" in VC++, add the GLUI library (in 'msvc/lib/glui32.lib'),
and add the OpenGL libs:

	glui32.lib glut32.lib glu32.lib opengl32.lib   (Microsoft OpenGL)

Include the file "glui.h" in any file that uses the GLUI library.


		      ---------- Unix ----------

An SGI/HP makefile is found in the file 'makefile' (certain lines may need 
to be commented/uncommented).

To include GLUI in your own apps, add the glui library to your
makefile (before the glut library 'libglut.a'), and include "glui.h"
in your sources.



----------------------------------------------------------------------

Please let me know what you think, what you'd like to change or add,
and especially what bugs you encounter.  Also, please send me your
e-mail so I can add you to a mailing list for updates.

Good luck, and thanks for trying this out!

Paul Rademacher
rademach
at
cs unc edu