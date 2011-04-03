///////////////////////////////////////////////////////////////////////////////
// File:        stelangs.cpp
// Purpose:     wxSTEditor Languages initialization
// Maintainer:
// Created:     2003-04-04
// RCS-ID:      $Id: stelangs.cpp,v 1.27 2007/02/15 02:20:43 jrl1 Exp $
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

// For compilers that support precompilation, includes <wx/wx.h>.
#include "wx/wxprec.h"

#ifdef __BORLANDC__
    #pragma hdrstop
#endif

// for all others, include the necessary headers
#ifndef WX_PRECOMP
    #include "wx/wx.h"
#endif

#include "wx/stedit/stelangs.h"
#include "wx/stedit/stedit.h"
#include "wx/stc/private.h"
#include "wx/tokenzr.h"
#include "wx/config.h"
#include "wx/textfile.h"
#include "wx/filename.h"

DEFINE_PAIRARRAY_INTKEY(wxString, wxSTEPairArrayIntString)

extern wxSTEditorLangs  s_wxSTEditorLangs;

//----------------------------------------------------------------------------
// Updated to SciTE 1.71, 8/27/05
//
//  Code below marked with this copyright is under this license.
//  "Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>"
//
// Missing CSOUND, RUBY needs updating when using wxSTC/Scintilla 1.66
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// wxSTEditorLanguage - base class for storing language information
// for the Scintilla lexers (YOU WILL PROBABLY NOT EVER NEED TO USE THESE)
//
// Implementation note:
//    All the languages are in order of the STE_LANG_XXX enum
//    They are grouped by value, this makes it harder to update a single
//      language, but easier to see at a glance what the status is of any one
//      language by comparing it to the others.
//    #defines are used to allow for STE_USE_LANG_XXX to "turn off" languages
//      and the structures won't be created.
//    Hopefully the static globals that aren't used will be stripped by the
//      compiler so just ignore the warnings
//
//    If you can think of a smaller, faster, easier way please tell me.
//----------------------------------------------------------------------------

const char* STE_CharsAlpha   = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const char* STE_CharsNumeric = "0123456789";

//----------------------------------------------------------------------------
// keywordlists - these are const char and not wxChar since they don't need
//                to be translated and won't be multibyte
//----------------------------------------------------------------------------

//static const char* STE_WordList1_STE_LANG_CONTAINER

//static const char* STE_WordList1_STE_LANG_NULL

#if STE_USE_LANG_PYTHON
static const char* STE_WordList1_STE_LANG_PYTHON =
       "and assert break class continue def del elif "
       "else except exec finally for from global if import in is lambda None "
       "not or pass print raise return try while yield";
#endif //STE_USE_LANG_PYTHON

#if STE_USE_LANG_CPP || STE_USE_LANG_CPPNOCASE
static const char* STE_WordList1_STE_LANG_CPP =
       "and and_eq asm auto bitand bitor bool break case catch char class "
       "compl const const_cast continue default delete do double "
       "dynamic_cast else enum explicit export extern false float "
       "for friend goto if inline int long mutable namespace new not "
       "not_eq operator or or_eq private protected public register "
       "reinterpret_cast return short signed sizeof static static_cast "
       "struct switch template this throw true try typedef typeid "
       "typename union unsigned using virtual void volatile wchar_t while "
       "xor xor_eq";
static const char* STE_WordList2_STE_LANG_CPP = // user defined keywords
       "file";
static const char* STE_WordList3_STE_LANG_CPP =
       "a addindex addtogroup anchor arg attention author b brief bug c "
       "class code date def defgroup deprecated dontinclude e em endcode "
       "endhtmlonly endif endlatexonly endlink endverbatim enum example "
       "exception f$ f[ f] file fn hideinitializer htmlinclude htmlonly "
       "if image include ingroup internal invariant interface latexonly "
       "li line link mainpage name namespace nosubgrouping note overload "
       "p page par param post pre ref relates remarks return retval sa "
       "section see showinitializer since skip skipline struct subsection "
       "test throw todo typedef union until var verbatim verbinclude "
       "version warning weakgroup $ @ \\ & < > # { }";
#endif //STE_USE_LANG_CPP || STE_USE_LANG_CPPNOCASE

#if STE_USE_LANG_HTML
static const char* STE_WordList1_STE_LANG_HTML =
    // hypertext.elements
       "a abbr acronym address applet area b base basefont bdo big "
       "blockquote body br button caption center cite code col colgroup "
       "dd del dfn dir div dl dt em fieldset font form frame frameset h1 "
       "h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex kbd "
       "label legend li link map menu meta noframes noscript object ol "
       "optgroup option p param pre q s samp script select small span "
       "strike strong style sub sup table tbody td textarea tfoot th "
       "thead title tr tt u ul var xml xmlns "
    // hypertext.attributes
       "abbr accept-charset accept accesskey action align alink alt "
       "archive axis background bgcolor border cellpadding cellspacing "
       "char charoff charset checked cite class classid clear codebase "
       "codetype color cols colspan compact content coords data datafld "
       "dataformatas datapagesize datasrc datetime declare defer dir "
       "disabled enctype event face for frame frameborder headers height "
       "href hreflang hspace http-equiv id ismap label lang language "
       "leftmargin link longdesc marginwidth marginheight maxlength media "
       "method multiple name nohref noresize noshade nowrap object onblur "
       "onchange onclick ondblclick onfocus onkeydown onkeypress onkeyup "
       "onload onmousedown onmousemove onmouseover onmouseout onmouseup "
       "onreset onselect onsubmit onunload profile prompt readonly rel "
       "rev rows rowspan rules scheme scope selected shape size span src "
       "standby start style summary tabindex target text title topmargin "
       "type usemap valign value valuetype version vlink vspace width "
       "text password checkbox radio submit reset file hidden image "
    // html5.elements
    "article aside calendar canvas card command commandset datagrid datatree "
    "footer gauge header m menubar menulabel nav progress section switch tabbox "
    // html5.attributes
    "active command contenteditable ping "
    // others
    "public !doctype";
#endif //STE_USE_LANG_HTML

//static const char* STE_WordList1_STE_LANG_XML no keywords

#if STE_USE_LANG_PERL
static const char* STE_WordList1_STE_LANG_PERL = // 1.65
    "NULL __FILE__ __LINE__ __PACKAGE__ __DATA__ __END__ AUTOLOAD "
    "BEGIN CORE DESTROY END EQ GE GT INIT LE LT NE CHECK abs accept "
    "alarm and atan2 bind binmode bless caller chdir chmod chomp chop "
    "chown chr chroot close closedir cmp connect continue cos crypt "
    "dbmclose dbmopen defined delete die do dump each else elsif endgrent "
    "endhostent endnetent endprotoent endpwent endservent eof eq eval "
    "exec exists exit exp fcntl fileno flock for foreach fork format "
    "formline ge getc getgrent getgrgid getgrnam gethostbyaddr gethostbyname "
    "gethostent getlogin getnetbyaddr getnetbyname getnetent getpeername "
    "getpgrp getppid getpriority getprotobyname getprotobynumber getprotoent "
    "getpwent getpwnam getpwuid getservbyname getservbyport getservent "
    "getsockname getsockopt glob gmtime goto grep gt hex if index "
    "int ioctl join keys kill last lc lcfirst le length link listen "
    "local localtime lock log lstat lt map mkdir msgctl msgget msgrcv "
    "msgsnd my ne next no not oct open opendir or ord our pack package "
    "pipe pop pos print printf prototype push quotemeta qu "
    "rand read readdir readline readlink readpipe recv redo "
    "ref rename require reset return reverse rewinddir rindex rmdir "
    "scalar seek seekdir select semctl semget semop send setgrent "
    "sethostent setnetent setpgrp setpriority setprotoent setpwent "
    "setservent setsockopt shift shmctl shmget shmread shmwrite shutdown "
    "sin sleep socket socketpair sort splice split sprintf sqrt srand "
    "stat study sub substr symlink syscall sysopen sysread sysseek "
    "system syswrite tell telldir tie tied time times truncate "
    "uc ucfirst umask undef unless unlink unpack unshift untie until "
    "use utime values vec wait waitpid wantarray warn while write "
    "xor";
#endif //STE_USE_LANG_PERL

#if STE_USE_LANG_SQL
static const char* STE_WordList1_STE_LANG_SQL =
       "absolute action add admin after aggregate alias all allocate alter and any "
       "are array as asc assertion at authorization before begin binary bit blob "
       "boolean both breadth by call cascade cascaded case cast catalog char "
       "character check class clob close collate collation column commit completion "
       "connect connection constraint constraints constructor continue corresponding "
       "create cross cube current current_date current_path current_role "
       "current_time current_timestamp current_user cursor cycle data date day "
       "deallocate dec decimal declare default deferrable deferred delete depth "
       "deref desc describe descriptor destroy destructor deterministic dictionary "
       "diagnostics disconnect distinct domain double drop dynamic each else end "
       "end-exec equals escape every except exception exec execute external false "
       "fetch first float for foreign found from free full function general get "
       "global go goto grant group grouping having host hour identity if ignore "
       "immediate in indicator initialize initially inner inout input insert int "
       "integer intersect interval into is isolation iterate join key language "
       "large last lateral leading left less level like limit local localtime "
       "localtimestamp locator map match minute modifies modify module month names "
       "national natural nchar nclob new next no none not null numeric object of "
       "off old on only open operation option or order ordinality out outer output "
       "pad parameter parameters partial path postfix precision prefix preorder "
       "prepare preserve primary prior privileges procedure public read reads real "
       "recursive ref references referencing relative restrict result return returns "
       "revoke right role rollback rollup routine row rows savepoint schema scroll "
       "scope search second section select sequence session session_user set sets "
       "size smallint some| space specific specifictype sql sqlexception sqlstate "
       "sqlwarning start state statement static structure system_user table "
       "temporary terminate than then time timestamp timezone_hour timezone_minute "
       "to trailing transaction translation treat trigger true under union unique "
       "unknown unnest update usage user using value values varchar variable varying "
       "view when whenever where with without work write year zone";
#endif //STE_USE_LANG_SQL

#if STE_USE_LANG_VB || STE_USE_LANG_HTML
static const char* STE_WordList1_STE_LANG_VB =
       "addhandler addressof andalso alias and ansi as assembly auto "
       "boolean byref byte byval call case catch cbool cbyte cchar cdate "
       "cdec cdbl char cint class clng cobj const cshort csng cstr ctype "
       "date decimal declare default delegate dim do double each else "
       "elseif end enum erase error event exit false finally for friend "
       "function get gettype goto  handles if implements imports in "
       "inherits integer interface is let lib like long loop me mod "
       "module mustinherit mustoverride mybase myclass namespace new next "
       "not nothing notinheritable notoverridable object on option "
       "optional or orelse overloads overridable overrides paramarray "
       "preserve private property protected public raiseevent readonly "
       "redim rem removehandler resume return select set shadows shared "
       "short single static step stop string structure sub synclock then "
       "throw to true try typeof unicode until variant when while with "
       "withevents writeonly xor";
#endif //STE_USE_LANG_VB || STE_USE_LANG_HTML

//static const char* STE_WordList1_STE_LANG_PROPERTIES

//static const char* STE_WordList1_STE_LANG_ERRORLIST

//static const char* STE_WordList1_STE_LANG_MAKEFILE

#if STE_USE_LANG_BATCH
static const char* STE_WordList1_STE_LANG_BATCH =
       "rem set if exist errorlevel for in do break call chcp cd chdir "
       "choice cls country ctty date del erase dir echo exit goto loadfix "
       "loadhigh mkdir md move path pause prompt rename ren rmdir rd shift "
       "time type ver verify vol com con lpt nul "
       "color copy defined else not start";
#endif //STE_USE_LANG_BATCH

//static const char* STE_WordList1_STE_LANG_XCODE

#if STE_USE_LANG_LATEX || STE_USE_LANG_TEX
static const char* STE_WordList1_STE_LANG_LATEX =
    "above abovedisplayshortskip abovedisplayskip "
    "abovewithdelims accent adjdemerits advance afterassignment "
    "aftergroup atop atopwithdelims "
    "badness baselineskip batchmode begingroup "
    "belowdisplayshortskip belowdisplayskip binoppenalty botmark "
    "box boxmaxdepth brokenpenalty "
    "catcode char chardef cleaders closein closeout clubpenalty "
    "copy count countdef cr crcr csname "
    "day deadcycles def defaulthyphenchar defaultskewchar "
    "delcode delimiter delimiterfactor delimeters "
    "delimitershortfall delimeters dimen dimendef discretionary "
    "displayindent displaylimits displaystyle "
    "displaywidowpenalty displaywidth divide "
    "doublehyphendemerits dp dump "
    "edef else emergencystretch end endcsname endgroup endinput "
    "endlinechar eqno errhelp errmessage errorcontextlines "
    "errorstopmode escapechar everycr everydisplay everyhbox "
    "everyjob everymath everypar everyvbox exhyphenpenalty "
    "expandafter "
    "fam fi finalhyphendemerits firstmark floatingpenalty font "
    "fontdimen fontname futurelet "
    "gdef global group globaldefs "
    "halign hangafter hangindent hbadness hbox hfil horizontal "
    "hfill horizontal hfilneg hfuzz hoffset holdinginserts hrule "
    "hsize hskip hss horizontal ht hyphenation hyphenchar "
    "hyphenpenalty hyphen "
    "if ifcase ifcat ifdim ifeof iffalse ifhbox ifhmode ifinner "
    "ifmmode ifnum ifodd iftrue ifvbox ifvmode ifvoid ifx "
    "ignorespaces immediate indent input inputlineno input "
    "insert insertpenalties interlinepenalty "
    "jobname "
    "kern "
    "language lastbox lastkern lastpenalty lastskip lccode "
    "leaders left lefthyphenmin leftskip leqno let limits "
    "linepenalty line lineskip lineskiplimit long looseness "
    "lower lowercase "
    "mag mark mathaccent mathbin mathchar mathchardef mathchoice "
    "mathclose mathcode mathinner mathop mathopen mathord "
    "mathpunct mathrel mathsurround maxdeadcycles maxdepth "
    "meaning medmuskip message mkern month moveleft moveright "
    "mskip multiply muskip muskipdef "
    "newlinechar noalign noboundary noexpand noindent nolimits "
    "nonscript scriptscript nonstopmode nulldelimiterspace "
    "nullfont number "
    "omit openin openout or outer output outputpenalty over "
    "overfullrule overline overwithdelims "
    "pagedepth pagefilllstretch pagefillstretch pagefilstretch "
    "pagegoal pageshrink pagestretch pagetotal par parfillskip "
    "parindent parshape parskip patterns pausing penalty "
    "postdisplaypenalty predisplaypenalty predisplaysize "
    "pretolerance prevdepth prevgraf "
    "radical raise read relax relpenalty right righthyphenmin "
    "rightskip romannumeral "
    "scriptfont scriptscriptfont scriptscriptstyle scriptspace "
    "scriptstyle scrollmode setbox setlanguage sfcode shipout "
    "show showbox showboxbreadth showboxdepth showlists showthe "
    "skewchar skip skipdef spacefactor spaceskip span special "
    "splitbotmark splitfirstmark splitmaxdepth splittopskip "
    "string "
    "tabskip textfont textstyle the thickmuskip thinmuskip time "
    "toks toksdef tolerance topmark topskip tracingcommands "
    "tracinglostchars tracingmacros tracingonline tracingoutput "
    "tracingpages tracingparagraphs tracingrestores tracingstats "
    "uccode uchyph underline unhbox unhcopy unkern unpenalty "
    "unskip unvbox unvcopy uppercase "
    "vadjust valign vbadness vbox vcenter vfil vfill vfilneg "
    "vfuzz voffset vrule vsize vskip vsplit vss vtop "
    "wd widowpenalty write "
    "xdef xleaders xspaceskip "
    "year "
    // these are for etex
    "beginL beginR botmarks "
    "clubpenalties currentgrouplevel currentgrouptype "
    "currentifbranch currentiflevel currentiftype "
    "detokenize dimexpr displaywidowpenalties "
    "endL endR eTeXrevision eTeXversion everyeof "
    "firstmarks fontchardp fontcharht fontcharic fontcharwd "
    "glueexpr glueshrink glueshrinkorder gluestretch "
    "gluestretchorder gluetomu "
    "ifcsname ifdefined iffontchar interactionmode "
    "interactionmode interlinepenalties "
    "lastlinefit lastnodetype "
    "marks topmarks middle muexpr mutoglue "
    "numexpr "
    "pagediscards parshapedimen parshapeindent parshapelength "
    "predisplaydirection "
    "savinghyphcodes savingvdiscards scantokens showgroups "
    "showifs showtokens splitdiscards splitfirstmarks "
    "TeXXeTstate tracingassigns tracinggroups tracingifs "
    "tracingnesting tracingscantokens "
    "unexpanded unless "
    "widowpenalties "
    // these are for pdftex
    "pdfadjustspacing pdfannot pdfavoidoverfull "
    "pdfcatalog pdfcompresslevel "
    "pdfdecimaldigits pdfdest pdfdestmargin "
    "pdfendlink pdfendthread "
    "pdffontattr pdffontexpand pdffontname pdffontobjnum pdffontsize "
    "pdfhorigin "
    "pdfimageresolution pdfincludechars pdfinfo "
    "pdflastannot pdflastdemerits pdflastobj "
    "pdflastvbreakpenalty pdflastxform pdflastximage "
    "pdflastximagepages pdflastxpos pdflastypos "
    "pdflinesnapx pdflinesnapy pdflinkmargin pdfliteral "
    "pdfmapfile pdfmaxpenalty pdfminpenalty pdfmovechars "
    "pdfnames "
    "pdfobj pdfoptionpdfminorversion pdfoutline pdfoutput "
    "pdfpageattr pdfpageheight pdfpageresources pdfpagesattr "
    "pdfpagewidth pdfpkresolution pdfprotrudechars "
    "pdfrefobj pdfrefxform pdfrefximage "
    "pdfsavepos pdfsnaprefpoint pdfsnapx pdfsnapy pdfstartlink "
    "pdfstartthread "
    "pdftexrevision pdftexversion pdfthread pdfthreadmargin "
    "pdfuniqueresname "
    "pdfvorigin "
    "pdfxform pdfximage "
    // keywordclass.macros.plain.partial
    "TeX "
    "bgroup egroup endgraf space empty null "
    "newcount newdimen newskip newmuskip newbox newtoks newhelp newread newwrite newfam newlanguage newinsert newif "
    "maxdimen magstephalf magstep "
    "frenchspacing nonfrenchspacing normalbaselines obeylines obeyspaces raggedright ttraggedright "
    "thinspace negthinspace enspace enskip quad qquad "
    "smallskip medskip bigskip removelastskip topglue vglue hglue "
    "break nobreak allowbreak filbreak goodbreak smallbreak medbreak bigbreak "
    "line leftline rightline centerline rlap llap underbar strutbox strut "
    "cases matrix pmatrix bordermatrix eqalign displaylines eqalignno leqalignno "
    "pageno folio tracingall showhyphens fmtname fmtversion "
    "hphantom vphantom phantom smash "
    // keywordclass.macros.eplain.partial
    "eTeX "
    "newmarks grouptype interactionmode nodetype iftype "
    "tracingall loggingall tracingnone";
#endif //STE_USE_LANG_LATEX || STE_USE_LANG_TEX

#if STE_USE_LANG_LUA
static const char* STE_WordList1_STE_LANG_LUA =
       "and break do else elseif end false for function if "
       "in local nil not or repeat return then true until while";
static const char* STE_WordList2_STE_LANG_LUA =
       "_VERSION assert collectgarbage dofile error gcinfo loadfile loadstring "
       "print tonumber tostring type unpack "
       "_G getfenv getmetatable ipairs loadlib next pairs pcall rawequal rawget "
       "rawset require setfenv setmetatable xpcall string table math coroutine "
       "io os debug";
static const char* STE_WordList3_STE_LANG_LUA =
       "string.byte string.char string.dump string.find string.len "
       "string.lower string.rep string.sub string.upper string.format "
       "string.gfind string.gsub table.concat table.foreach table.foreachi "
       "table.getn table.sort table.insert table.remove table.setn math.abs "
       "math.acos math.asin math.atan math.atan2 math.ceil math.cos math.deg "
       "math.exp math.floor math.frexp math.ldexp math.log math.log10 math.max "
       "math.min math.mod math.pi math.pow math.rad math.random math.randomseed "
       "math.sin math.sqrt math.tan";
static const char* STE_WordList4_STE_LANG_LUA =
       "coroutine.create coroutine.resume coroutine.status coroutine.wrap "
       "coroutine.yield io.close io.flush io.input io.lines io.open io.output "
       "io.read io.tmpfile io.type io.write io.stdin io.stdout io.stderr "
       "os.clock os.date os.difftime os.execute os.exit os.getenv os.remove "
       "os.rename os.setlocale os.time os.tmpname "
       "coroutine.running package.cpath package.loaded package.loadlib package.path "
       "package.preload package.seeall io.popen";

// lua 4
//       "_ALERT _ERRORMESSAGE _INPUT _PROMPT _OUTPUT _STDERR _STDIN _STDOUT "
//       "call dostring foreach foreachi getn globals newtype rawget rawset "
//       "require sort tinsert tremove")
// old lua 4
//       "ALERT _ERRORMESSAGE _INPUT _PROMPT _OUTPUT _STDERR _STDIN _STDOUT "
//       "_VERSION assert call collectgarbage dofile dostring error foreach "
//       "foreachi gcinfo getn globals loadfile loadstring newtype print "
//       "rawget rawset require sort tonumber tostring tinsert tremove type "
//       "unpack";
// lua 4
//       "abs acos asin atan atan2 ceil cos deg exp floor format frexp gsub "
//       "ldexp log log10 max min mod rad random randomseed sin sqrt strbyte "
//       "strchar strfind strlen strlower strrep strsub strupper tan";
// lua 4
//       "openfile closefile readfrom writeto appendto remove rename flush seek "
//       "tmpfile tmpname read write clock date difftime execute exit getenv "
//       "setlocale time";
#endif //STE_USE_LANG_LUA

//static const char* STE_WordList1_STE_LANG_DIFF

#if STE_USE_LANG_CONF
static const char* STE_WordList1_STE_LANG_CONF =  // actually Apache
    "acceptmutex acceptpathinfo accessconfig accessfilename "
    "action addalt addaltbyencoding addaltbytype addcharset "
    "adddefaultcharset adddescription addencoding "
    "addhandler addicon addiconbyencoding addiconbytype "
    "addinputfilter addlanguage addmodule addmoduleinfo "
    "addoutputfilter addoutputfilterbytype addtype agentlog "
    "alias aliasmatch all allow allowconnect "
    "allowencodedslashes allowoverride anonymous "
    "anonymous_authoritative anonymous_logemail "
    "anonymous_mustgiveemail anonymous_nouserid "
    "anonymous_verifyemail assignuserid authauthoritative "
    "authdbauthoritative authdbgroupfile "
    "authdbmauthoritative authdbmgroupfile authdbmtype "
    "authdbmuserfile authdbuserfile authdigestalgorithm "
    "authdigestdomain authdigestfile authdigestgroupfile "
    "authdigestnccheck authdigestnonceformat "
    "authdigestnoncelifetime authdigestqop "
    "authdigestshmemsize authgroupfile "
    "authldapauthoritative authldapbinddn "
    "authldapbindpassword authldapcharsetconfig "
    "authldapcomparednonserver authldapdereferencealiases "
    "authldapenabled authldapfrontpagehack "
    "authldapgroupattribute authldapgroupattributeisdn "
    "authldapremoteuserisdn authldapurl authname authtype "
    "authuserfile bindaddress browsermatch "
    "browsermatchnocase bs2000account bufferedlogs "
    "cachedefaultexpire cachedirlength cachedirlevels "
    "cachedisable cacheenable cacheexpirycheck cachefile "
    "cacheforcecompletion cachegcclean cachegcdaily "
    "cachegcinterval cachegcmemusage cachegcunused "
    "cacheignorecachecontrol cacheignoreheaders "
    "cacheignorenolastmod cachelastmodifiedfactor "
    "cachemaxexpire cachemaxfilesize cacheminfilesize "
    "cachenegotiateddocs cacheroot cachesize "
    "cachetimemargin cgimapextension charsetdefault "
    "charsetoptions charsetsourceenc checkspelling "
    "childperuserid clearmodulelist contentdigest "
    "cookiedomain cookieexpires cookielog cookiename "
    "cookiestyle cookietracking coredumpdirectory customlog "
    "dav davdepthinfinity davlockdb davmintimeout "
    "defaulticon defaultlanguage defaulttype define "
    "deflatebuffersize deflatecompressionlevel "
    "deflatefilternote deflatememlevel deflatewindowsize "
    "deny directory directoryindex directorymatch "
    "directoryslash documentroot dumpioinput dumpiooutput "
    "enableexceptionhook enablemmap enablesendfile "
    "errordocument errorlog example expiresactive "
    "expiresbytype expiresdefault extendedstatus "
    "extfilterdefine extfilteroptions fancyindexing "
    "fileetag files filesmatch forcelanguagepriority "
    "forcetype forensiclog from group header headername "
    "hostnamelookups identitycheck ifdefine ifmodule "
    "imapbase imapdefault imapmenu include indexignore "
    "indexoptions indexorderdefault isapiappendlogtoerrors "
    "isapiappendlogtoquery isapicachefile isapifakeasync "
    "isapilognotsupported isapireadaheadbuffer keepalive "
    "keepalivetimeout languagepriority ldapcacheentries "
    "ldapcachettl ldapconnectiontimeout ldapopcacheentries "
    "ldapopcachettl ldapsharedcachefile ldapsharedcachesize "
    "ldaptrustedca ldaptrustedcatype limit limitexcept "
    "limitinternalrecursion limitrequestbody "
    "limitrequestfields limitrequestfieldsize "
    "limitrequestline limitxmlrequestbody listen "
    "listenbacklog loadfile loadmodule location "
    "locationmatch lockfile logformat loglevel maxclients "
    "maxkeepaliverequests maxmemfree maxrequestsperchild "
    "maxrequestsperthread maxspareservers maxsparethreads "
    "maxthreads maxthreadsperchild mcachemaxobjectcount "
    "mcachemaxobjectsize mcachemaxstreamingbuffer "
    "mcacheminobjectsize mcacheremovalalgorithm mcachesize "
    "metadir metafiles metasuffix mimemagicfile "
    "minspareservers minsparethreads mmapfile "
    "modmimeusepathinfo multiviewsmatch namevirtualhost "
    "nocache noproxy numservers nwssltrustedcerts "
    "nwsslupgradeable options order passenv pidfile port "
    "protocolecho proxy proxybadheader proxyblock "
    "proxydomain proxyerroroverride proxyiobuffersize "
    "proxymatch proxymaxforwards proxypass proxypassreverse "
    "proxypreservehost proxyreceivebuffersize proxyremote "
    "proxyremotematch proxyrequests proxytimeout proxyvia "
    "qsc readmename redirect redirectmatch "
    "redirectpermanent redirecttemp refererignore "
    "refererlog removecharset removeencoding removehandler "
    "removeinputfilter removelanguage removeoutputfilter "
    "removetype requestheader require resourceconfig "
    "rewritebase rewritecond rewriteengine rewritelock "
    "rewritelog rewriteloglevel rewritemap rewriteoptions "
    "rewriterule rlimitcpu rlimitmem rlimitnproc satisfy "
    "scoreboardfile script scriptalias scriptaliasmatch "
    "scriptinterpretersource scriptlog scriptlogbuffer "
    "scriptloglength scriptsock securelisten sendbuffersize "
    "serveradmin serveralias serverlimit servername "
    "serverpath serverroot serversignature servertokens "
    "servertype setenv setenvif setenvifnocase sethandler "
    "setinputfilter setoutputfilter singlelisten ssiendtag "
    "ssierrormsg ssistarttag ssitimeformat ssiundefinedecho "
    "sslcacertificatefile sslcacertificatepath "
    "sslcarevocationfile sslcarevocationpath "
    "sslcertificatechainfile sslcertificatefile "
    "sslcertificatekeyfile sslciphersuite sslengine "
    "sslmutex ssloptions sslpassphrasedialog sslprotocol "
    "sslproxycacertificatefile sslproxycacertificatepath "
    "sslproxycarevocationfile sslproxycarevocationpath "
    "sslproxyciphersuite sslproxyengine "
    "sslproxymachinecertificatefile "
    "sslproxymachinecertificatepath sslproxyprotocol "
    "sslproxyverify sslproxyverifydepth sslrandomseed "
    "sslrequire sslrequiressl sslsessioncache "
    "sslsessioncachetimeout sslusername sslverifyclient "
    "sslverifydepth startservers startthreads "
    "suexecusergroup threadlimit threadsperchild "
    "threadstacksize timeout transferlog typesconfig "
    "unsetenv usecanonicalname user userdir "
    "virtualdocumentroot virtualdocumentrootip virtualhost "
    "virtualscriptalias virtualscriptaliasip "
    "win32disableacceptex xbithack";
static const char* STE_WordList2_STE_LANG_CONF =
       "on off standalone inetd force-response-1.0 downgrade-1.0 "
       "nokeepalive indexes includes followsymlinks none "
       "x-compress x-gzip";
#endif //STE_USE_LANG_CONF

#if STE_USE_LANG_PASCAL
static const char* STE_WordList1_STE_LANG_PASCAL =
       "program const type var begin end array set packed record string "
       "if then else while for to downto do with repeat until case of "
       "goto exit label procedure function nil file and or not xor div "
       "mod unit uses implementation interface external asm inline object "
       "constructor destructor virtual far assembler near inherited "
       "stdcall cdecl library export exports end. class ansistring raise "
       "try except on index name finally resourcestring false true "
       "initialization finalization override overload";
#endif //STE_USE_LANG_PASCAL

#if STE_USE_LANG_AVE
static const char* STE_WordList1_STE_LANG_AVE =
       "nil true false else for if while then elseif end av self in exit";
#endif //STE_USE_LANG_AVE

#if STE_USE_LANG_ADA
static const char* STE_WordList1_STE_LANG_ADA =
       "abort abstract accept access aliased all array at begin body case "
       "constant declare delay delta digits do else elsif end entry "
       "exception exit for function generic goto if in is limited loop "
       "new null of others out package pragma private procedure protected "
       "raise range record renames requeue return reverse select separate "
       "subtype tagged task terminate then type until use when while with "
       "abs and mod not or rem xor";
#endif //STE_USE_LANG_ADA

#if STE_USE_LANG_LISP
static const char* STE_WordList1_STE_LANG_LISP =
       "not defun + - * / = < > <= >= princ eval apply funcall quote "
       "identity function complement backquote lambda set setq setf defun "
       "defmacro gensym make symbol intern symbol name symbol value "
       "symbol plist get getf putprop remprop hash make array aref car "
       "cdr caar cadr cdar cddr caaar caadr cadar caddr cdaar cdadr cddar "
       "cdddr caaaar caaadr caadar caaddr cadaar cadadr caddar cadddr "
       "cdaaar cdaadr cdadar cdaddr cddaar cddadr cdddar cddddr cons list "
       "append reverse last nth nthcdr member assoc subst sublis nsubst "
       "nsublis remove length list length mapc mapcar mapl maplist mapcan "
       "mapcon rplaca rplacd nconc delete atom symbolp numberp boundp "
       "null listp consp minusp zerop plusp evenp oddp eq eql equal cond "
       "case and or let l if prog prog1 prog2 progn go return do dolist "
       "dotimes catch throw error cerror break continue errset baktrace "
       "evalhook truncate float rem min max abs sin cos tan expt exp sqrt "
       "random logand logior logxor lognot bignums logeqv lognand lognor "
       "logorc2 logtest logbitp logcount integer length nil";
#endif //STE_USE_LANG_LISP

#if STE_USE_LANG_RUBY
static const char* STE_WordList1_STE_LANG_RUBY =
       "__FILE__ and def end in or self unless __LINE__ begin defined? "
       "ensure module redo super until BEGIN break do false next rescue "
       "then when END case else for nil retry true while alias class "
       "elsif if not return undef yield";
#endif //STE_USE_LANG_RUBY

#if STE_USE_LANG_EIFFEL || STE_USE_LANG_EIFFELKW
static const char* STE_WordList1_STE_LANG_EIFFEL =
       "alias all and any as bit boolean check class character clone "
       "create creation current debug deferred div do double else elseif "
       "end ensure equal expanded export external false feature forget "
       "from frozen general if implies indexing infix inherit inspect "
       "integer invariant is language like local loop mod name nochange "
       "none not obsolete old once or platform pointer prefix precursor "
       "real redefine rename require rescue result retry select separate "
       "string strip then true undefine unique until variant void when "
       "xor";

//static const char* STE_WordList1_STE_LANG_EIFFELKW uses EIFFEL
#endif //STE_USE_LANG_EIFFEL || STE_USE_LANG_EIFFELKW

#if STE_USE_LANG_TCL
static const char* STE_WordList1_STE_LANG_TCL =
       // keywordclass.tcl
       "after append array auto_execok "
       "auto_import auto_load auto_load_index auto_qualify "
       "beep bgerror binary break case catch cd clock "
       "close concat continue dde default echo else elseif "
       "encoding eof error eval exec exit expr fblocked "
       "fconfigure fcopy file fileevent flush for foreach format "
       "gets glob global history http if incr info "
       "interp join lappend lindex linsert list llength load "
       "loadTk lrange lreplace lsearch lset lsort memory msgcat "
       "namespace open package pid pkg::create pkg_mkIndex Platform-specific proc "
       "puts pwd re_syntax read regexp registry regsub rename "
       "resource return scan seek set socket source split "
       "string subst switch tclLog tclMacPkgSearch tclPkgSetup tclPkgUnknown tell "
       "time trace unknown unset update uplevel upvar variable "
       "vwait while "
       // keywordclass.tk
       "bell bind bindtags bitmap button canvas checkbutton clipboard "
       "colors console cursors destroy entry event focus font "
       "frame grab grid image Inter-client keysyms label labelframe "
       "listbox lower menu menubutton message option options pack "
       "panedwindow photo place radiobutton raise scale scrollbar selection "
       "send spinbox text tk tk_chooseColor tk_chooseDirectory tk_dialog tk_focusNext "
       "tk_getOpenFile tk_messageBox tk_optionMenu tk_popup tk_setPalette tkerror tkvars tkwait "
       "toplevel winfo wish wm "
       // keywordclass.itcl
       //"@scope body class code common component configbody "
       //"constructor define destructor hull import inherit itcl itk itk_component "
       //"itk_initialize itk_interior itk_option iwidgets keep method "
       //"private protected public "
       // keywordclass.TkCommands
        "tk_bisque tk_chooseColor tk_dialog tk_focusFollowsMouse tk_focusNext "
        "tk_focusPrev tk_getOpenFile tk_getSaveFile tk_messageBox tk_optionMenu "
        "tk_popup tk_setPalette tk_textCopy tk_textCut tk_textPaste "
        "tkButtonAutoInvoke tkButtonDown tkButtonEnter tkButtonInvoke tkButtonLeave "
        "tkButtonUp tkCancelRepeat tkCheckRadioDown tkCheckRadioEnter tkCheckRadioInvoke "
        "tkColorDialog tkColorDialog_BuildDialog tkColorDialog_CancelCmd tkColorDialog_Config tkColorDialog_CreateSelector "
        "tkColorDialog_DrawColorScale tkColorDialog_EnterColorBar tkColorDialog_HandleRGBEntry tkColorDialog_HandleSelEntry tkColorDialog_InitValues "
        "tkColorDialog_LeaveColorBar tkColorDialog_MoveSelector tkColorDialog_OkCmd tkColorDialog_RedrawColorBars tkColorDialog_RedrawFinalColor "
        "tkColorDialog_ReleaseMouse tkColorDialog_ResizeColorBars tkColorDialog_RgbToX tkColorDialog_SetRGBValue tkColorDialog_StartMove "
        "tkColorDialog_XToRgb tkConsoleAbout tkConsoleBind tkConsoleExit tkConsoleHistory "
        "tkConsoleInit tkConsoleInsert tkConsoleInvoke tkConsoleOutput tkConsolePrompt "
        "tkConsoleSource tkDarken tkEntryAutoScan tkEntryBackspace tkEntryButton1 "
        "tkEntryClosestGap tkEntryGetSelection tkEntryInsert tkEntryKeySelect tkEntryMouseSelect "
        "tkEntryNextWord tkEntryPaste tkEntryPreviousWord tkEntrySeeInsert tkEntrySetCursor "
        "tkEntryTranspose tkEventMotifBindings tkFDGetFileTypes tkFirstMenu tkFocusGroup_BindIn "
        "tkFocusGroup_BindOut tkFocusGroup_Create tkFocusGroup_Destroy tkFocusGroup_In tkFocusGroup_Out "
        "tkFocusOK tkGenerateMenuSelect tkIconList tkIconList_Add tkIconList_Arrange "
        "tkIconList_AutoScan tkIconList_Btn1 tkIconList_Config tkIconList_Create tkIconList_CtrlBtn1 "
        "tkIconList_Curselection tkIconList_DeleteAll tkIconList_Double1 tkIconList_DrawSelection tkIconList_FocusIn "
        "tkIconList_FocusOut tkIconList_Get tkIconList_Goto tkIconList_Index tkIconList_Invoke "
        "tkIconList_KeyPress tkIconList_Leave1 tkIconList_LeftRight tkIconList_Motion1 tkIconList_Reset "
        "tkIconList_ReturnKey tkIconList_See tkIconList_Select tkIconList_Selection tkIconList_ShiftBtn1 "
        "tkIconList_UpDown tkListbox tkListboxAutoScan tkListboxBeginExtend tkListboxBeginSelect "
        "tkListboxBeginToggle tkListboxCancel tkListboxDataExtend tkListboxExtendUpDown tkListboxKeyAccel_Goto "
        "tkListboxKeyAccel_Key tkListboxKeyAccel_Reset tkListboxKeyAccel_Set tkListboxKeyAccel_Unset tkListboxMotion "
        "tkListboxSelectAll tkListboxUpDown tkMbButtonUp tkMbEnter tkMbLeave "
        "tkMbMotion tkMbPost tkMenuButtonDown tkMenuDownArrow tkMenuDup "
        "tkMenuEscape tkMenuFind tkMenuFindName tkMenuFirstEntry tkMenuInvoke "
        "tkMenuLeave tkMenuLeftArrow tkMenuMotion tkMenuNextEntry tkMenuNextMenu "
        "tkMenuRightArrow tkMenuUnpost tkMenuUpArrow tkMessageBox tkMotifFDialog "
        "tkMotifFDialog_ActivateDList tkMotifFDialog_ActivateFEnt tkMotifFDialog_ActivateFList tkMotifFDialog_ActivateSEnt tkMotifFDialog_BrowseDList "
        "tkMotifFDialog_BrowseFList tkMotifFDialog_BuildUI tkMotifFDialog_CancelCmd tkMotifFDialog_Config tkMotifFDialog_Create "
        "tkMotifFDialog_FileTypes tkMotifFDialog_FilterCmd tkMotifFDialog_InterpFilter tkMotifFDialog_LoadFiles tkMotifFDialog_MakeSList "
        "tkMotifFDialog_OkCmd tkMotifFDialog_SetFilter tkMotifFDialog_SetListMode tkMotifFDialog_Update tkPostOverPoint "
        "tkRecolorTree tkRestoreOldGrab tkSaveGrabInfo tkScaleActivate tkScaleButton2Down "
        "tkScaleButtonDown tkScaleControlPress tkScaleDrag tkScaleEndDrag tkScaleIncrement "
        "tkScreenChanged tkScrollButton2Down tkScrollButtonDown tkScrollButtonDrag tkScrollButtonUp "
        "tkScrollByPages tkScrollByUnits tkScrollDrag tkScrollEndDrag tkScrollSelect "
        "tkScrollStartDrag tkScrollTopBottom tkScrollToPos tkTabToWindow tkTearOffMenu "
        "tkTextAutoScan tkTextButton1 tkTextClosestGap tkTextInsert tkTextKeyExtend "
        "tkTextKeySelect tkTextNextPara tkTextNextPos tkTextNextWord tkTextPaste "
        "tkTextPrevPara tkTextPrevPos tkTextPrevWord tkTextResetAnchor tkTextScrollPages "
        "tkTextSelectTo tkTextSetCursor tkTextTranspose tkTextUpDownLine tkTraverseToMenu "
        "tkTraverseWithinMenu";
#endif //STE_USE_LANG_TCL

#if STE_USE_LANG_NNCRONTAB
static const char* STE_WordList1_STE_LANG_NNCRONTAB =
       "AGAIN ALLOT AND Action BEGIN CASE COMPARE CONSTANT CREATE DO Days "
       "ELSE ENDCASE ENDOF EVAL-SUBST EVALUATE FALSE Hours I IF LEAVE "
       "LOOP Minutes Months NOT OF OFF ON OR PAD REPEAT Rule SET THEN "
       "TRUE Time UNTIL VALUE VARIABLE WHILE WeekDays Years";
static const char* STE_WordList2_STE_LANG_NNCRONTAB =
       "</JScript> </SCRIPT> </VBScript> <JScript> <VBScript> ACCESS-DATE "
       "BEEP CALL_DIAL CALL_HANGUP CHAR CLIPBOARD CONSOLE CREATION-DATE "
       "CUR-DATE DATE- DATE-INTERVAL DELAY DIAL DIR-CREATE DIR-DELETE "
       "DIR-EMPTY DIR-SIZE Day@ Domain ERR-MSG EXIST FILE-ACCESS-DATE "
       "FILE-APPEND FILE-COPY FILE-CREATE FILE-CREATION-DATE FILE-CROP "
       "FILE-DATE FILE-DELETE FILE-EMPTY FILE-EXIST FILE-MOVE FILE-RENAME "
       "FILE-SIZE FILE-WRITE FILE-WRITE-DATE FOR-CHILD-WINDOWS FOR-FILES "
       "FOR-WINDOWS FREE-SPACE GET-CUR-TIME GET-REG GET-VER GetTickCount "
       "HANGUP HIDE-ICON HINT HINT-OFF HINT-POS HINT-SIZE HINTW "
       "HOST-EXIST Hour@ IDLE INTERVAL IS-ARCHIVE IS-DIR IS-HIDDEN "
       "IS-READONLY IS-SYSTEM KILL LAUNCH LOG LOGGEDON LOGOFF LogonBatch "
       "LogonInteractive LogonNetwork MOUSE-LBCLK MOUSE-LBDCLK MOUSE-LBDN "
       "MOUSE-LBUP MOUSE-MOVE MOUSE-MOVER MOUSE-MOVEW MOUSE-RBCLK "
       "MOUSE-RBDCLK MOUSE-RBDN MOUSE-RBUP MSG Min@ Mon@ "
       "MonitorResponseTime NHOST-EXIST No ONLINE PAUSE PLAY-SOUND "
       "PLAY-SOUNDW POP3-CHECK POWEROFF PROC-EXIST PROC-TIME PURGE-OLD "
       "PURGE-OLDA PURGE-OLDW Password QSTART-APP QSTART-APPW QUERY QUIT "
       "RASDomain RASError RASPassword RASPhone RASSecPassword RASUser "
       "RE-ALL RE-MATCH REBOOT REG-DELETE-KEY REG-DELETE-VALUE REG-DWORD "
       "REG-SZ REMINDER RUN SEND-KEYS SEND-KEYS-DELAY SHOW-ICON SHUTDOWN "
       "START-APP START-APPW START-QUIT START-TIME Sec@ SecPassword THINT "
       "THINTW TimeSec@ TMSG TQUERY User WDay@ WIN-ACTIVATE WIN-ACTIVE "
       "WIN-CLICK WIN-CLOSE WIN-EXIST WIN-HIDE WIN-HWND WIN-MAXIMIZE "
       "WIN-MINIMIZE WIN-MOVE WIN-MOVER WIN-RESTORE WIN-SEND-KEYS "
       "WIN-SHOW WIN-TERMINATE WIN-TOPMOST WIN-VER WIN-WAIT WINAPI "
       "WRITE-DATE WatchClipboard WatchConnect WatchDir WatchDisconnect "
       "WatchDriveInsert WatchDriveRemove WatchFile WatchProc "
       "WatchProcStop WatchWinActivate WatchWinCreate WatchWinDestroy "
       "WatchWindow WinNT Year@ Yes";
static const char* STE_WordList3_STE_LANG_NNCRONTAB =
       "ALL AboveNormalPriority AsService BelowNormalPriority FILESONLY "
       "HighPriority IdlePriority LoadProfile NoActive NoDel NoLog "
       "NoRunAs NormalPriority OnceADay OnceAHour OnceAMonth OnceAWeek "
       "RECURSIVE RealtimePriority RunOnce SWHide ShowMaximized "
       "ShowMinimized ShowNoActivate ShowNormal StartIn StartPos "
       "StartSize TODEPTH WATCH-CHANGE-ATTRIBUTES WATCH-CHANGE-DIR-NAME "
       "WATCH-CHANGE-FILE-NAME WATCH-CHANGE-LAST-WRITE "
       "WATCH-CHANGE-SECURITY WATCH-CHANGE-SIZE WaitFor WatchSubtree "
       "WithoutProfile";
#endif //STE_USE_LANG_NNCRONTAB

#if STE_USE_LANG_BULLANT
static const char* STE_WordList1_STE_LANG_BULLANT =
       "abstract all ancestor and application assert attributes author "
       "begin callback class concrete config constants construct continue "
       "depends description downcast driver elif else ensures error "
       "exception exposure extension false fatal final function generics "
       "glyph help hidden host immutable in inherits is kernel label "
       "leave library locals mutable none not null obsolete options or "
       "other parameters peer private public raise reason restricted "
       "retry return returns rollback route security self settings "
       "severity step task test transaction true unknown varying warning "
       "when method end if until while trap case debug for foreach lock "
       "boolean character character$ date date$ datetime datetime$ float "
       "hex$ identifier identifier$ integer interval interval$ money "
       "money$ raw raw$ string tick tick$ time time$ version version$";
#endif //STE_USE_LANG_BULLANT

#if STE_USE_LANG_VBSCRIPT
static const char* STE_WordList1_STE_LANG_VBSCRIPT =
       "and begin case call continue do each else elseif end erase error "
       "event exit false for function get gosub goto if implement in load "
       "loop lset me mid new next not nothing on or property raiseevent "
       "rem resume return rset select set stop sub then to true unload "
       "until wend while with withevents attribute alias as boolean byref "
       "byte byval const compare currency date declare dim double enum "
       "explicit friend global integer let lib long module object option "
       "optional preserve private property public redim single static "
       "string type variant";
#endif //STE_USE_LANG_VBSCRIPT

//static const char* STE_WordList1_STE_LANG_ASP

#if STE_USE_LANG_PHP
static const char* STE_WordList1_STE_LANG_PHP =
    "and array as bool boolean break case cfunction class const continue declare "
    "default die directory do double echo else elseif empty enddeclare endfor "
    "endforeach endif endswitch endwhile eval exit extends false float for "
    "foreach function global if include include_once int integer isset list new "
    "null object old_function or parent print real require require_once resource "
    "return static stdclass string switch true unset use var while xor "
    "abstract catch clone exception final implements interface php_user_filter "
    "private protected public this throw try "
    "__class__ __file__ __function__ __line__ __method__ __sleep __wakeup";
#endif //STE_USE_LANG_PHP

// scite has empty wordlist
//static const char* STE_WordList1_STE_LANG_BAAN = "";

#if STE_USE_LANG_MATLAB || STE_USE_LANG_OCTAVE
static const char* STE_WordList1_STE_LANG_MATLAB =
       "break case catch continue else elseif end for function global if "
       "otherwise persistent return switch try while";
#endif //STE_USE_LANG_MATLAB || STE_USE_LANG_OCTAVE

#if STE_USE_LANG_SCRIPTOL
static const char* STE_WordList1_STE_LANG_SCRIPTOL =
       "act action alias always and array as bool boolean break by byte "
       "class case catch const constant continue dyn def define dict do "
       "double echo else elsif end enum error false file for float forever "
       "function globak gtk in if ifdef import include int integer java "
       "javax let long match mod nil not natural null number or print "
       "protected public real return redo scan script scriptol sol short "
       "super static step until using var text then this true try void "
       "volatile while when undef zero";
#endif //STE_USE_LANG_SCRIPTOL

#if STE_USE_LANG_ASM
static const char* STE_WordList1_STE_LANG_ASM =
       "aaa aad aam aas adc add and call cbw clc cld cli cmc cmp cmps "
       "cmpsb cmpsw cwd daa das dec div esc hlt idiv imul in inc int into "
       "iret ja jae jb jbe jc jcxz je jg jge jl jle jmp jna jnae jnb jnbe "
       "jnc jne jng jnge jnl jnle jno jnp jns jnz jo jp jpe jpo js jz "
       "lahf lds lea les lods lodsb lodsw loop loope loopew loopne "
       "loopnew loopnz loopnzw loopw loopz loopzw mov movs movsb movsw "
       "mul neg nop not or out pop popf push pushf rcl rcr ret retf retn "
       "rol ror sahf sal sar sbb scas scasb scasw shl shr stc std sti "
       "stos stosb stosw sub test wait xchg xlat xlatb xor bound enter "
       "ins insb insw leave outs outsb outsw popa pusha pushw arpl lar "
       "lsl sgdt sidt sldt smsw str verr verw clts lgdt lidt lldt lmsw "
       "ltr bsf bsr bt btc btr bts cdq cmpsd cwde insd iretd iretdf "
       "iretf jecxz lfs lgs lodsd loopd looped loopned loopnzd loopzd "
       "lss movsd movsx movzx outsd popad popfd pushad pushd pushfd scasd "
       "seta setae setb setbe setc sete setg setge setl setle setna "
       "setnae setnb setnbe setnc setne setng setnge setnl setnle setno "
       "setnp setns setnz seto setp setpe setpo sets setz shld shrd stosd "
       "bswap cmpxchg invd  invlpg  wbinvd  xadd lock rep repe repne "
       "repnz repz";
static const char* STE_WordList2_STE_LANG_ASM =
       "f2xm1 fabs fadd faddp fbld fbstp fchs fclex fcom fcomp fcompp "
       "fdecstp fdisi fdiv fdivp fdivr fdivrp feni ffree fiadd ficom "
       "ficomp fidiv fidivr fild fimul fincstp finit fist fistp fisub "
       "fisubr fld fld1 fldcw fldenv fldenvw fldl2e fldl2t fldlg2 fldln2 "
       "fldpi fldz fmul fmulp fnclex fndisi fneni fninit fnop fnsave "
       "fnsavew fnstcw fnstenv fnstenvw fnstsw fpatan fprem fptan frndint "
       "frstor frstorw fsave fsavew fscale fsqrt fst fstcw fstenv fstenvw "
       "fstp fstsw fsub fsubp fsubr fsubrp ftst fwait fxam fxch fxtract "
       "fyl2x fyl2xp1 fsetpm fcos fldenvd fnsaved fnstenvd fprem1 frstord "
       "fsaved fsin fsincos fstenvd fucom fucomp fucompp";
static const char* STE_WordList3_STE_LANG_ASM =
       "ah al ax bh bl bp bx ch cl cr0 cr2 cr3 cs cx dh di dl dr0 dr1 dr2 "
       "dr3 dr6 dr7 ds dx eax ebp ebx ecx edi edx es esi esp fs gs si sp "
       "ss st tr3 tr4 tr5 tr6 tr7";
static const char* STE_WordList4_STE_LANG_ASM =
       ".186 .286 .286c .286p .287 .386 .386c .386p .387 .486 .486p .8086 "
       ".8087 .alpha .break .code .const .continue .cref .data .data?  "
       ".dosseg .else .elseif .endif .endw .err .err1 .err2 .errb .errdef "
       ".errdif .errdifi .erre .erridn .erridni .errnb .errndef .errnz "
       ".exit .fardata .fardata? .if .lall .lfcond .list .listall .listif "
       ".listmacro .listmacroall  .model .no87 .nocref .nolist .nolistif "
       ".nolistmacro .radix .repeat .sall .seq .sfcond .stack .startup "
       ".tfcond .type .until .untilcxz .while .xall .xcref .xlist alias "
       "align assume catstr comm comment db dd df dosseg dq dt dup dw "
       "echo else elseif elseif1 elseif2 elseifb elseifdef elseifdif "
       "elseifdifi elseife elseifidn elseifidni elseifnb elseifndef end "
       "endif endm endp ends eq  equ even exitm extern externdef extrn "
       "for forc ge goto group gt high highword if if1 if2 ifb ifdef "
       "ifdif ifdifi ife  ifidn ifidni ifnb ifndef include includelib "
       "instr invoke irp irpc label le length lengthof local low lowword "
       "lroffset lt macro mask mod .msfloat name ne offset opattr option "
       "org %out page popcontext proc proto ptr public purge pushcontext "
       "record repeat rept seg segment short size sizeof sizestr struc "
       "struct substr subtitle subttl textequ this title type typedef "
       "union while width";
static const char* STE_WordList5_STE_LANG_ASM =
       "$ ? @b @f addr basic byte c carry? dword far far16 fortran fword "
       "near near16 overflow? parity? pascal qword real4 real8 real10 "
       "sbyte sdword sign? stdcall sword syscall tbyte vararg word zero? "
       "flat near32 far32 abs all assumes at casemap common compact cpu "
       "dotname emulator epilogue error export expr16 expr32 farstack "
       "flat forceframe huge language large listing ljmp loadds m510 "
       "medium memory nearstack nodotname noemulator nokeyword noljmp "
       "nom510 none nonunique nooldmacros nooldstructs noreadonly "
       "noscoped nosignextend nothing notpublic oldmacros oldstructs "
       "os_dos para private prologue radix  readonly req scoped setif2 "
       "smallstack tiny use16 use32 uses";
#endif //STE_USE_LANG_ASM

//static const char* STE_WordList5_STE_LANG_CPPNOCASE uses cpp

#if STE_USE_LANG_FORTRAN || STE_USE_LANG_F77
static const char* STE_WordList1_STE_LANG_FORTRAN =
       "allocatable allocate assignment backspace block blockdata call "
       "case character close common complex contains continue cycle data "
       "deallocate default dimension direct do double doubleprecision "
       "elemental else elseif elsewhere end endblock endblockdata enddo "
       "endfile endforall endfunction endif endinterface endmodule "
       "endprogram endselect endsubroutine endtype endwhere entry "
       "equivalence err exist exit external forall format formatted "
       "function go goto if implicit in inout include inquire integer "
       "intent interface intrinsic iolength iostat kind len logical "
       "module namelist none null nullify only open operator optional "
       "parameter pointer position precision print private procedure "
       "program public pure out read readwrite real rec recursive result "
       "return rewind save select selectcase sequence sequential stat "
       "status stop subroutine target then to type unformatted unit use "
       "where while write";
static const char* STE_WordList2_STE_LANG_FORTRAN =
       "abs achar acos acosd adjustl adjustr aimag aimax0 aimin0 aint "
       "ajmax0 ajmin0 akmax0 akmin0 all allocated alog alog10 amax0 amax1 "
       "amin0 amin1 amod anint any asin asind associated atan atan2 "
       "atan2d atand bitest bitl bitlr bitrl bjtest bit_size bktest break "
       "btest cabs ccos cdabs cdcos cdexp cdlog cdsin cdsqrt ceiling cexp "
       "char clog cmplx conjg cos cosd cosh count cpu_time cshift csin "
       "csqrt dabs dacos dacosd dasin dasind datan datan2 datan2d datand "
       "date date_and_time dble dcmplx dconjg dcos dcosd dcosh dcotan "
       "ddim dexp dfloat dflotk dfloti dflotj digits dim dimag dint dlog "
       "dlog10 dmax1 dmin1 dmod dnint dot_product dprod dreal dsign dsin "
       "dsind dsinh dsqrt dtan dtand dtanh eoshift epsilon errsns exp "
       "exponent float floati floatj floatk floor fraction free huge iabs "
       "iachar iand ibclr ibits ibset ichar idate idim idint idnint ieor "
       "ifix iiabs iiand iibclr iibits iibset iidim iidint iidnnt iieor "
       "iifix iint iior iiqint iiqnnt iishft iishftc iisign ilen imax0 "
       "imax1 imin0 imin1 imod index inint inot int int1 int2 int4 int8 "
       "iqint iqnint ior ishft ishftc isign isnan izext jiand jibclr "
       "jibits jibset jidim jidint jidnnt jieor jifix jint jior jiqint "
       "jiqnnt jishft jishftc jisign jmax0 jmax1 jmin0 jmin1 jmod jnint "
       "jnot jzext kiabs kiand kibclr kibits kibset kidim kidint kidnnt "
       "kieor kifix kind kint kior kishft kishftc kisign kmax0 kmax1 "
       "kmin0 kmin1 kmod knint knot kzext lbound leadz len len_trim "
       "lenlge lge lgt lle llt log log10 logical lshift malloc matmul "
       "max max0 max1 maxexponent maxloc maxval merge min min0 min1 "
       "minexponent minloc minval mod modulo mvbits nearest nint not "
       "nworkers number_of_processors pack popcnt poppar precision "
       "present product radix random random_number random_seed range real "
       "repeat reshape rrspacing rshift scale scan secnds "
       "selected_int_kind selected_real_kind set_exponent shape sign sin "
       "sind sinh size sizeof sngl snglq spacing spread sqrt sum "
       "system_clock tan tand tanh tiny transfer transpose trim ubound "
       "unpack verify";

// static const char* STE_WordList1_STE_LANG_F77 uses FORTRAN
#endif //STE_USE_LANG_FORTRAN || STE_USE_LANG_F77

#if STE_USE_LANG_CSS
static const char* STE_WordList1_STE_LANG_CSS =
       "left right top bottom position font-family font-style font-variant "
       "font-weight font-size font color background-color background-image "
       "background-repeat background-attachment background-position background "
       "word-spacing letter-spacing text-decoration vertical-align text-transform "
       "text-align text-indent line-height margin-top margin-right margin-bottom "
       "margin-left margin padding-top padding-right padding-bottom padding-left "
       "padding border-top-width border-right-width border-bottom-width "
       "border-left-width border-width border-top border-right border-bottom "
       "border-left border border-color border-style width height float clear "
       "display white-space list-style-type list-style-image list-style-position "
       "list-style";
static const char* STE_WordList2_STE_LANG_CSS =
       "first-letter first-line active link visited";
#endif //STE_USE_LANG_CSS

#if STE_USE_LANG_POV
static const char* STE_WordList1_STE_LANG_POV =
       "declare local include undef fopen fclose read write default version "
       "case range break debug error warning if ifdef ifndef switch while "
       "macro else end";
static const char* STE_WordList2_STE_LANG_POV =
       "camera light_source light_group object blob sphere cylinder box cone "
       "sor height_field julia_fractal lathe prism sphere_sweep superellipsoid "
       "text torus bicubic_patch disc mesh mesh2 polygon triangle "
       "smooth_triangle plane poly cubic quartic quadric isosurface parametric "
       "union intersection difference merge function array spline "
       "vertex_vectors normal_vectors uv_vectors face_indices normal_indices "
       "uv_indices texture texture_list interior_texture texture_map "
       "material_map image_map color_map colour_map pigment_map normal_map "
       "slope_map bump_map density_map pigment normal material interior finish "
       "reflection irid slope pigment_pattern image_pattern warp media "
       "scattering density background fog sky_sphere rainbow global_settings "
       "radiosity photons pattern transform looks_like projected_through "
       "contained_by clipped_by bounded_by";
static const char* STE_WordList3_STE_LANG_POV =
       "linear_spline quadratic_spline cubic_spline natural_spline "
       "bezier_spline b_spline read write append inverse open perspective "
       "orthographic fisheye ultra_wide_angle omnimax panoramic spherical "
       "spotlight jitter circular orient media_attenuation media_interaction "
       "shadowless parallel refraction collect pass_through global_lights "
       "hierarchy sturm smooth gif tga iff pot png pgm ppm jpeg tiff sys "
       "ttf quaternion hypercomplex linear_sweep conic_sweep type "
       "all_intersections split_union cutaway_textures no_shadow no_image "
       "no_reflection double_illuminate hollow uv_mapping all use_index "
       "use_color use_colour no_bump_scale conserve_energy fresnel average "
       "agate boxed bozo bumps cells crackle cylindrical density_file dents "
       "facets granite leopard marble onion planar quilted radial ripples "
       "spotted waves wood wrinkles solid use_alpha interpolate magnet "
       "noise_generator toroidal ramp_wave triangle_wave sine_wave "
       "scallop_wave cubic_wave poly_wave once map_type method fog_type "
       "hf_gray_16 charset ascii utf8 rotate scale translate matrix location "
       "right up direction sky angle look_at aperture blur_samples "
       "focal_point confidence variance radius falloff tightness point_at "
       "area_light adaptive fade_distance fade_power threshold strength "
       "water_level tolerance max_iteration precision slice u_steps v_steps "
       "flatness inside_vector accuracy max_gradient evaluate max_trace "
       "precompute target ior dispersion dispersion_samples caustics color "
       "colour rgb rgbf rgbt rgbft red green blue filter transmit gray hf "
       "fade_color fade_colour quick_color quick_colour brick checker hexagon "
       "brick_size mortar bump_size ambient diffuse brilliance crand phong "
       "phong_size metallic specular roughness reflection_exponent exponent "
       "thickness gradient spiral1 spiral2 agate_turb form metric offset df3 "
       "coords size mandel exterior julia control0 control1 altitude "
       "turbulence octaves omega lambda repeat flip black-hole orientation "
       "dist_exp major_radius frequency phase intervals samples ratio "
       "absorption emission aa_threshold aa_level eccentricity extinction "
       "distance turb_depth fog_offset fog_alt width arc_angle falloff_angle "
       "adc_bailout ambient_light assumed_gamma irid_wavelength "
       "number_of_waves always_sample brigthness count error_bound "
       "gray_threshold load_file low_error_factor max_sample minimum_reuse "
       "nearest_count pretrace_end pretrace_start recursion_limit save_file "
       "spacing gather max_trace_level autostop expand_thresholds";
static const char* STE_WordList4_STE_LANG_POV =
       "x y z t u v yes no true false on off clock clock_delta clock_on "
       "final_clock final_frame frame_number image_height image_width "
       "initial_clock initial_frame pi version";
static const char* STE_WordList5_STE_LANG_POV =
       "abs acos acosh asc asin asinh atan atanh atan2 ceil cos cosh defined "
       "degrees dimensions dimension_size div exp file_exists floor inside "
       "int ln log max min mod pow prod radians rand seed select sin sinh "
       "sqrt strcmp strlen sum tan tanh val vdot vlength min_extent "
       "max_extent trace vaxis_rotate vcross vrotate vnormalize vturbulence "
       "chr concat str strlwr strupr substr vstr sqr cube reciprocal pwr";
#endif //STE_USE_LANG_POV

#if STE_USE_LANG_LOUT
static const char* STE_WordList1_STE_LANG_LOUT =
       "@OptGall @Filter @FilterIn @FilterOut @FilterErr @FontDef @Family "
       "@Face @Name @Metrics @ExtraMetrics @Mapping @Recode @Common @Rump "
       "@Meld @Insert @OneOf @Next @Plus @Minus @Wide @High @HShift @VShift "
       "@BeginHeaderComponent @EndHeaderComponent @SetHeaderComponent "
       "@ClearHeaderComponent @OneCol @OneRow @HScale @VScale @HCover "
       "@VCover @Scale @KernShrink @HContract @VContract @HLimited @VLimited "
       "@HExpand @VExpand @StartHVSpan @StartHSpan @StartVSpan @HSpan @VSpan "
       "@PAdjust @HAdjust @VAdjust @Rotate @Background @IncludeGraphic "
       "@SysIncludeGraphic @Graphic @LinkSource @LinkDest @URLLink "
       "@PlainGraphic @Verbatim @RawVerbatim @Case @Yield @BackEnd @Char "
       "@Font @Space @YUnit @ZUnit @Break @Underline @SetColour @SetColor "
       "@SetTexture @Outline @Language @CurrLang @CurrFamily @CurrFace "
       "@CurrYUnit @CurrZUnit @LEnv @LClos @LUse @LEO @Open @Use @NotRevealed "
       "@Tagged @Database @SysDatabase @Include @SysInclude "
       "@IncludeGraphicRepeated @PrependGraphic @SysIncludeGraphicRepeated "
       "@SysPrependGraphic @Target @Null @PageLabel @Galley @ForceGalley "
       "@LInput @Split @Tag @Key @Optimize @Merge @Enclose @Begin @End "
       "@Moment @Second @Minute @Hour @Day @Month @Year @Century @WeekDay "
       "@YearDay @DaylightSaving @@A @@B @@C @@D @@E @@V";
static const char* STE_WordList2_STE_LANG_LOUT =
       "&&& && & ^// ^/ ^|| ^| ^& // / || |";
static const char* STE_WordList3_STE_LANG_LOUT =
       "def langdef force horizontally into extend import export precedence "
       "associativity left right body macro named compulsory following "
       "preceding foll_or_prec now";
#endif //STE_USE_LANG_LOUT

#if STE_USE_LANG_ESCRIPT
static const char* STE_WordList1_STE_LANG_ESCRIPT =
       "basic basicio boats cfgfile file http npc os uo util accessible "
       "addmenuitem appendconfigfileelem applyconstraint applydamage "
       "applyrawdamage assignrecttoweatherregion append baseskilltorawskill "
       "boatfromitem broadcast ban cdbl cint cstr checklineofsight checklosat "
       "checkskill consumemana consumereagents consumesubstance createaccount "
       "createitematlocation createiteminbackpack createitemininventory "
       "createitemincontainer createmenu createmultiatlocation "
       "createnpcfromtemplate createrootiteminstoragearea createstoragearea "
       "clear_script_profile_counters close damage destroyitem destroymulti "
       "destroyrootiteminstoragearea detach disableevents disconnectclient "
       "distance disable enableevents enumerateitemsincontainer "
       "enumerateonlinecharacters equipfromtemplate equipitem "
       "eraseglobalproperty eraseobjproperty enable enabled erase "
       "events_waiting exists findconfigelem findobjtypeincontainer "
       "findrootiteminstoragearea findstoragearea fclose find fopen fread "
       "fseek ftell fwrite gamestat getamount getcommandhelp getconfigint "
       "getconfigintkeys getconfigmaxintkey getconfigreal getconfigstring "
       "getconfigstringkeys getconfigstringarray getelemproperty "
       "getequipmentbylayer getglobalproperty getharvestdifficulty "
       "getmapinfo getmenuobjtypes getobjproperty getobjtype getobjtypebyname "
       "getproperty getrawskill getregionstring getskill getspelldifficulty "
       "getstandingheight getworldheight grantprivilege harvestresource "
       "healdamage hex islegalmove insert keys listequippeditems "
       "listghostsnearlocation listhostiles listitemsatlocation "
       "listitemsnearlocation listitemsnearlocationoftype "
       "listmobilesinlineofsight listmobilesnearlocation "
       "listmobilesnearlocationex listobjectsinbox loadtusscpfile "
       "left len log_profile lower makeboundingbox move moveboat "
       "moveboatrelative movecharactertolocation moveitemtocontainer "
       "moveitemtolocation move_offline_mobiles openpaperdoll open pack "
       "performaction playlightningbolteffect playmovingeffect "
       "playmovingeffectxyz playobjectcenteredeffect playsoundeffect "
       "playsoundeffectprivate playstationaryeffect printtextabove "
       "printtextaboveprivate packages polcore position print queryparam "
       "randomdiceroll randomint rawskilltobaseskill readconfigfile readgameclock "
       "releaseitem registerforspeechevents registeritemwithboat requestinput "
       "reserveitem restartscript resurrect revokeprivilege runawayfrom "
       "runawayfromlocation runtoward runtowardlocation reverse "
       "run_script_to_completion saveworldstate selectmenuitem2 self "
       "sendbuywindow senddialoggump sendevent sendopenspecialcontainer "
       "sendpacket sendsellwindow sendskillwindow sendstringastipwindow "
       "sendsysmessage sendtextentrygump setanchor setglobalproperty "
       "setname setobjproperty setopponent setproperty setrawskill "
       "setregionlightlevel setregionweatherlevel setscriptcontroller "
       "setwarmode shutdown speakpowerwords splitwords startspelleffect "
       "subtractamount systemfindboatbyserial systemfindobjectbyserial "
       "say set_critical set_debug set_priority set_priority_divide "
       "set_script_option setcmdlevel setdex setint setlightlevel setmaster "
       "setname setpassword setstr shrink size sleep sleepms sort spendgold "
       "squelch start_script syslog system_rpm target targetcoordinates "
       "targetmultiplacement turnawayfrom turnawayfromlocation turnboat "
       "turntoward turntowardlocation toggle unloadconfigfile unpack unban "
       "unload_scripts upper walkawayfrom walkawayfromlocation walktoward "
       "walktowardlocation wander writehtml writehtmlraw wait_for_event "
       "movechar_forcelocation moveitem_forcelocation moveitem_normal "
       "scriptopt_debug scriptopt_no_interrupt scriptopt_no_runaway "
       "te_cancel_disable te_cancel_enable te_style_disable te_style_normal "
       "te_style_numerical tgtopt_check_los tgtopt_harmful tgtopt_helpful "
       "tgtopt_neutral tgtopt_nocheck_los setprop getprop";
static const char* STE_WordList2_STE_LANG_ESCRIPT =
       "array const dictionary global local var and default in next not "
       "or return to include use enum";
static const char* STE_WordList3_STE_LANG_ESCRIPT =
       "while for endfor function program endprogram endfunction foreach "
       "case else elseif if endcase endenum endforeach endif endwhile";
#endif //STE_USE_LANG_ESCRIPT

#if STE_USE_LANG_PS
static const char* STE_WordList1_STE_LANG_PS =
       "$error = == FontDirectory StandardEncoding UserObjects abs add "
       "aload anchorsearch and arc arcn arcto array ashow astore atan "
       "awidthshow begin bind bitshift bytesavailable cachestatus ceiling "
       "charpath clear cleardictstack cleartomark clip clippath closefile "
       "closepath concat concatmatrix copy copypage cos count countdictstack "
       "countexecstack counttomark currentcmykcolor currentcolorspace "
       "currentdash currentdict currentfile currentflat currentfont "
       "currentgray currenthsbcolor currentlinecap currentlinejoin "
       "currentlinewidth currentmatrix currentmiterlimit currentpagedevice "
       "currentpoint currentrgbcolor currentscreen currenttransfer cvi cvlit "
       "cvn cvr cvrs cvs cvx def defaultmatrix definefont dict dictstack div "
       "dtransform dup echo end eoclip eofill eq erasepage errordict exch "
       "exec execstack executeonly executive exit exp false file fill "
       "findfont flattenpath floor flush flushfile for forall ge get "
       "getinterval grestore grestoreall gsave gt idetmatrix idiv "
       "idtransform if ifelse image imagemask index initclip initgraphics "
       "initmatrix inustroke invertmatrix itransform known kshow le length "
       "lineto ln load log loop lt makefont mark matrix maxlength mod moveto "
       "mul ne neg newpath noaccess nor not null nulldevice or pathbbox "
       "pathforall pop print prompt pstack put putinterval quit rand rcheck "
       "rcurveto read readhexstring readline readonly readstring rectstroke "
       "repeat resetfile restore reversepath rlineto rmoveto roll rotate "
       "round rrand run save scale scalefont search setblackgeneration "
       "setcachedevice setcachelimit setcharwidth setcolorscreen "
       "setcolortransfer setdash setflat setfont setgray sethsbcolor "
       "setlinecap setlinejoin setlinewidth setmatrix setmiterlimit "
       "setpagedevice setrgbcolor setscreen settransfer setvmthreshold show "
       "showpage sin sqrt srand stack start status statusdict stop stopped "
       "store string stringwidth stroke strokepath sub systemdict token "
       "token transform translate true truncate type ueofill "
       "undefineresource userdict usertime version vmstatus wcheck where "
       "widthshow write writehexstring writestring xcheck xor";
static const char* STE_WordList2_STE_LANG_PS =
       "GlobalFontDirectory ISOLatin1Encoding SharedFontDirectory UserObject "
       "arct colorimage cshow currentblackgeneration currentcacheparams "
       "currentcmykcolor currentcolor currentcolorrendering "
       "currentcolorscreen currentcolorspace currentcolortransfer "
       "currentdevparams currentglobal currentgstate currenthalftone "
       "currentobjectformat currentoverprint currentpacking "
       "currentpagedevice currentshared currentstrokeadjust "
       "currentsystemparams currentundercolorremoval currentuserparams "
       "defineresource defineuserobject deletefile execform execuserobject "
       "filenameforall fileposition filter findencoding findresource gcheck "
       "globaldict glyphshow gstate ineofill infill instroke inueofill "
       "inufill inustroke languagelevel makepattern packedarray printobject "
       "product realtime rectclip rectfill rectstroke renamefile "
       "resourceforall resourcestatus revision rootfont scheck selectfont "
       "serialnumber setbbox setblackgeneration setcachedevice2 "
       "setcacheparams setcmykcolor setcolor setcolorrendering "
       "setcolorscreen setcolorspace setcolortranfer setdevparams "
       "setfileposition setglobal setgstate sethalftone setobjectformat "
       "setoverprint setpacking setpagedevice setpattern setshared "
       "setstrokeadjust setsystemparams setucacheparams setundercolorremoval "
       "setuserparams setvmthreshold shareddict startjob uappend ucache "
       "ucachestatus ueofill ufill undef undefinefont undefineresource "
       "undefineuserobject upath ustroke ustrokepath vmreclaim writeobject "
       "xshow xyshow yshow";
static const char* STE_WordList3_STE_LANG_PS =
       "cliprestore clipsave composefont currentsmoothness "
       "findcolorrendering setsmoothness shfill";
static const char* STE_WordList4_STE_LANG_PS =
       ".begintransparencygroup .begintransparencymask .bytestring "
       ".charboxpath .currentaccuratecurves .currentblendmode "
       ".currentcurvejoin .currentdashadapt .currentdotlength "
       ".currentfilladjust2 .currentlimitclamp .currentopacityalpha "
       ".currentoverprintmode .currentrasterop .currentshapealpha "
       ".currentsourcetransparent .currenttextknockout "
       ".currenttexturetransparent .dashpath .dicttomark "
       ".discardtransparencygroup .discardtransparencymask "
       ".endtransparencygroup .endtransparencymask .execn .filename "
       ".filename .fileposition .forceput .forceundef .forgetsave "
       ".getbitsrect .getdevice .inittransparencymask .knownget .locksafe "
       ".makeoperator .namestring .oserrno .oserrorstring .peekstring "
       ".rectappend .runandhide .setaccuratecurves .setblendmode "
       ".setcurvejoin .setdashadapt .setdebug .setdefaultmatrix "
       ".setdotlength .setfilladjust2 .setlimitclamp .setmaxlength "
       ".setopacityalpha .setoverprintmode .setrasterop .setsafe "
       ".setshapealpha .setsourcetransparent .settextknockout "
       ".settexturetransparent .stringbreak .stringmatch .tempfile "
       ".type1decrypt .type1encrypt .type1execchar .unread arccos arcsin "
       "copydevice copyscanlines currentdevice finddevice findlibfile "
       "findprotodevice flushpage getdeviceprops getenv makeimagedevice "
       "makewordimagedevice max min putdeviceprops setdevice";
#endif //STE_USE_LANG_PS

#if STE_USE_LANG_NSIS
static const char* STE_WordList1_STE_LANG_NSIS =
       "What Abort AddSize AllowRootDirInstall AutoCloseWindow BGGradient "
       "BrandingText BringToFront CRCCheck Call CallInstDLL Caption "
       "ClearErrors CompletedText ComponentText CopyFiles CreateDirectory "
       "CreateShortCut Delete DeleteINISec DeleteINIStr DeleteRegKey "
       "DeleteRegValue DetailPrint DetailsButtonText DirShow DirText "
       "DisabledBitmap EnabledBitmap EnumRegKey EnumRegValue Exch Exec "
       "ExecShell ExecWait ExpandEnvStrings File FileClose FileErrorText "
       "FileOpen FileRead FileReadByte FileSeek FileWrite FileWriteByte "
       "FindClose FindFirst FindNext FindWindow Function FunctionEnd "
       "GetCurrentAddress GetDLLVersionLocal GetDllVersion GetFileTime "
       "GetFileTimeLocal GetFullPathName GetFunctionAddress GetLabelAddress "
       "GetTempFileName Goto HideWindow Icon IfErrors IfFileExists "
       "IfRebootFlag InstProgressFlags InstType InstallButtonText "
       "InstallColors InstallDir InstallDirRegKey IntCmp IntCmpU IntFmt "
       "IntOp IsWindow LicenseData LicenseText MessageBox MiscButtonText "
       "Name OutFile Pop Push Quit RMDir ReadEnvStr ReadINIStr ReadRegDword "
       "ReadRegStr Reboot RegDLL Rename Return SearchPath Section "
       "SectionDivider SectionEnd SectionIn SendMessage SetAutoClose "
       "SetCompress SetDatablockOptimize SetDateSave SetDetailsPrint "
       "SetDetailsView SetErrors SetFileAttributes SetOutPath SetOverwrite "
       "SetRebootFlag ShowInstDetails ShowUninstDetails SilentInstall "
       "SilentUnInstall Sleep SpaceTexts StrCmp StrCpy StrLen SubCaption "
       "UnRegDLL UninstallButtonText UninstallCaption UninstallEXEName "
       "UninstallIcon UninstallSubCaption UninstallText WindowIcon "
       "WriteINIStr WriteRegBin WriteRegDword WriteRegExpandStr "
       "WriteRegStr WriteUninstaller SectionGetFlags SectionSetFlags "
       "SectionSetText SectionGetText LogText LogSet CreateFont "
       "SetShellVarContext SetStaticBkColor SetBrandingImage PluginDir "
       "SubSectionEnd SubSection CheckBitmap ChangeUI SetFont "
       "AddBrandingImage XPStyle LangString !define !undef !ifdef !ifndef "
       "!endif !else !macro !echo !warning !error !verbose !macroend "
       "!insertmacro !system !include !cd !packhdr";
static const char* STE_WordList2_STE_LANG_NSIS =
       "$0 $1 $2 $3 $4 $5 $6 $7 $8 $9 $R0 $R1 $R2 $R3 $R4 $R5 $R6 $R7 $R8 "
       "$R9 $CMDLINE $DESKTOP $EXEDIR $HWNDPARENT $INSTDIR $OUTDIR "
       "$PROGRAMFILES ${NSISDIR} $\n $\r $QUICKLAUNCH $SMPROGRAMS $SMSTARTUP "
       "$STARTMENU $SYSDIR $TEMP $WINDIR";
static const char* STE_WordList3_STE_LANG_NSIS =
       "ARCHIVE FILE_ATTRIBUTE_ARCHIVE FILE_ATTRIBUTE_HIDDEN "
       "FILE_ATTRIBUTE_NORMAL FILE_ATTRIBUTE_OFFLINE FILE_ATTRIBUTE_READONLY "
       "FILE_ATTRIBUTE_SYSTEM FILE_ATTRIBUTE_TEMPORARY HIDDEN HKCC HKCR HKCU "
       "HKDD HKEY_CLASSES_ROOT HKEY_CURRENT_CONFIG HKEY_CURRENT_USER "
       "HKEY_DYN_DATA HKEY_LOCAL_MACHINE HKEY_PERFORMANCE_DATA HKEY_USERS "
       "HKLM HKPD HKU IDABORT IDCANCEL IDIGNORE IDNO IDOK IDRETRY IDYES "
       "MB_ABORTRETRYIGNORE MB_DEFBUTTON1 MB_DEFBUTTON2 MB_DEFBUTTON3 "
       "MB_DEFBUTTON4 MB_ICONEXCLAMATION MB_ICONINFORMATION MB_ICONQUESTION "
       "MB_ICONSTOP MB_OK MB_OKCANCEL MB_RETRYCANCEL MB_RIGHT "
       "MB_SETFOREGROUND MB_TOPMOST MB_YESNO MB_YESNOCANCEL NORMAL OFFLINE "
       "READONLY SW_SHOWMAXIMIZED SW_SHOWMINIMIZED SW_SHOWNORMAL SYSTEM "
       "TEMPORARY auto colored false force hide ifnewer nevershow normal off "
       "on show silent silentlog smooth true try";
static const char* STE_WordList4_STE_LANG_NSIS =
       "MyFunction MySomethingElse";
#endif //STE_USE_LANG_NSIS

#if STE_USE_LANG_MMIXAL
static const char* STE_WordList1_STE_LANG_MMIXAL =
       "2ADDU 4ADDU 8ADDU 16ADDU ADD ADDU AND ANDNH ANDNL ANDNMH ANDNML "
       "BDIF BEV BN BNN BNP BNZ BOD BP BSPEC BYTE BZ CMP CMPU CSEV CSN "
       "CSNN CSNP CSNZ CSOD CSP CSWAP CSZ DIV DIVU ESPEC EXPR FADD FCMP "
       "FCMPE FDIV FEQL FEQLE FIX FIXU FLOT FLOTU FMUL FREM FSQRT FSUB "
       "FUN FUNE GET GETA GO GREG I_BIT INCH INCL INCMH INCML IS JMP LDA "
       "LDB LDBU LDHT LDO LDOU LDSF LDT LDTU LDUNC LDVTS LDW LDWU LOC "
       "LOCAL MOR MUL MULU MUX MXOR NAND NEG NEGU NNIX NOR NXOR O_BIT "
       "OCTA ODIF OR ORH ORL ORMH ORML ORN PBEV PBN PBNN PBNP PBNZ PBOD "
       "PBP PBZ POP PREFIX PREGO PRELD PREST PUSHGO PUSHJ PUT RESUME SAVE "
       "SET SETH SETL SETMH SETML SFLOT SFLOTU SL SLU SR SRU STB STBU "
       "STCO STHT STO STOU STSF STT STTU STUNC STW STWU SUB SUBU SWYM "
       "SYNC SYNCD TDIF TETRA TRAP TRIP UNSAVE WDIF WYDEXOR ZSEV ZSN ZSNN "
       "ZSNP ZSNZ ZSOD ZSP ZSZ";
static const char* STE_WordList2_STE_LANG_MMIXAL =
       "rA rB rC rD rE rF rG rH rI rJ rK rL rM rN rO rP rQ rR rS rT rU rV "
       "rW rX rY rZ rBB rTT rWW rXX rYY rZZ";
static const char* STE_WordList3_STE_LANG_MMIXAL =
       "@ Text_Segment Data_Segment Pool_Segment Stack_Segment "
       "StdErr StdIn StdOut Fopen Fclose Fread Fwrite Fgets Fputs Fgetws "
       "Fputws Ftell Fseek TextRead TextWrite BinaryRead BinaryWrite "
       "BinaryReadWrite";
#endif //STE_USE_LANG_MMIXAL


//static const char* STE_WordList1_STE_LANG_CLW - nothing in scite

//static const char* STE_WordList1_STE_LANG_CLWNOCASE - nothing in scite

//static const char* STE_WordList1_STE_LANG_LOT - nothing in scite

#if STE_USE_LANG_YAML
static const char* STE_WordList1_STE_LANG_YAML =
    "true false yes no";
#endif //STE_USE_LANG_YAML

//static const char* STE_WordList1_STE_LANG_TEX - uses LATEX

#if STE_USE_LANG_METAPOST
static const char* STE_WordList1_STE_LANG_METAPOST =
    // keywordclass.metapost.tex
    "btex verbatimtex etex "
    // keywordclass.metapost.primitives
    "charcode day linecap linejoin miterlimit month pausing "
    "prologues showstopping time tracingcapsules tracingchoices "
    "tracingcommands tracingequations tracinglostchars "
    "tracingmacros tracingonline tracingoutput tracingrestores "
    "tracingspecs tracingstats tracingtitles truecorners "
    "warningcheck year "
    "false nullpicture pencircle true "
    "and angle arclength arctime ASCII bluepart boolean bot "
    "char color cosd cycle decimal directiontime floor fontsize "
    "greenpart hex infont intersectiontimes known length llcorner "
    "lrcorner makepath makepen mexp mlog normaldeviate not "
    "numeric oct odd or path pair pen penoffset picture point "
    "postcontrol precontrol redpart reverse rotated scaled "
    "shifted sind slanted sqrt str string subpath substring "
    "transform transformed ulcorner uniformdeviate unknown "
    "urcorner xpart xscaled xxpart xypart ypart yscaled yxpart "
    "yypart zscaled "
    "addto clip input interim let newinternal save setbounds "
    "shipout show showdependencies showtoken showvariable "
    "special "
    "begingroup endgroup of curl tension and controls "
    "reflectedabout rotatedaround interpath on off beginfig "
    "endfig def vardef enddef epxr suffix text primary secondary "
    "tertiary primarydef secondarydef tertiarydef top bottom "
    "ulft urt llft lrt randomseed also contour doublepath "
    "withcolor withpen dashed if else elseif fi for endfor forever exitif "
    "forsuffixes downto upto step until "
    "charlist extensible fontdimen headerbyte kern ligtable "
    "boundarychar chardp charext charht charic charwd designsize "
    "fontmaking charexists "
    "cullit currenttransform gfcorners grayfont hround "
    "imagerules lowres_fix nodisplays notransforms openit "
    "displaying currentwindow screen_rows screen_cols "
    "pixels_per_inch cull display openwindow numspecial "
    "totalweight autorounding fillin proofing tracingpens "
    "xoffset chardx granularity smoothing turningcheck yoffset "
    "chardy hppp tracingedges vppp "
    "extra_beginfig extra_endfig mpxbreak "
    "end "
    // keywordclass.metapost.plain
    "ahangle ahlength bboxmargin defaultpen defaultscale "
    "labeloffset background currentpen currentpicture cuttings "
    "defaultfont extra_beginfig extra_endfig "
    "beveled black blue bp butt cc cm dd ditto down epsilon "
    "evenly fullcircle green halfcircle identity in infinity left "
    "mitered mm origin pensquare pt quartercircle red right "
    "rounded squared unitsquare up white withdots "
    "abs bbox ceiling center cutafter cutbefore dir "
    "directionpoint div dotprod intersectionpoint inverse mod lft "
    "round rt unitvector whatever "
    "cutdraw draw drawarrow drawdblarrow fill filldraw drawdot "
    "loggingall pickup tracingall tracingnone undraw unfill "
    "unfilldraw "
    "buildcycle dashpattern decr dotlabel dotlabels drawoptions "
    "incr label labels max min thelabel z "
    "beginchar blacker capsule_end change_width "
    "define_blacker_pixels define_corrected_pixels "
    "define_good_x_pixels define_good_y_pixels "
    "define_horizontal_corrected_pixels define_pixels "
    "define_whole_blacker_pixels define_whole_pixels "
    "define_whole_vertical_blacker_pixels "
    "define_whole_vertical_pixels endchar extra_beginchar "
    "extra_endchar extra_setup font_coding_scheme "
    "font_extra_space";
#endif //STE_USE_LANG_METAPOST

//static const char* STE_WordList1_STE_LANG_POWERBASIC

#if STE_USE_LANG_FORTH
static const char* STE_WordList1_STE_LANG_FORTH =
    "AGAIN BEGIN CASE DO ELSE ENDCASE ENDOF IF LOOP OF REPEAT THEN UNTIL  WHILE "
    "[IF] [ELSE] [THEN] ?DO";
static const char* STE_WordList2_STE_LANG_FORTH =
    "DUP DROP ROT SWAP OVER @ ! 2@ 2! 2DUP 2DROP 2SWAP 2OVER NIP R@ >R R> 2R@ 2>R 2R> "
    "0= 0< SP@ SP! W@ W! C@ C! < > = <> 0<> "
    "SPACE SPACES KEY? KEY THROW CATCH ABORT */ 2* /MOD CELL+ CELLS CHAR+ "
    "CHARS MOVE ERASE DABS TITLE HEX DECIMAL HOLD <# # #S #> SIGN "
    "D. . U. DUMP (.\") >NUMBER ' IMMEDIATE EXIT RECURSE UNLOOP LEAVE HERE ALLOT , "
    "C, W, COMPILE, BRANCH, RET, LIT, DLIT, ?BRANCH, \", >MARK >RESOLVE1 <MARK >RESOLVE "
    "ALIGN ALIGNED USER-ALLOT USER-HERE HEADER DOES> SMUDGE HIDE :NONAME LAST-WORD "
    "?ERROR ERROR2 FIND1 SFIND SET-CURRENT GET-CURRENT DEFINITIONS GET-ORDER FORTH "
    "ONLY SET-ORDER ALSO PREVIOUS VOC-NAME. ORDER LATEST LITERAL 2LITERAL SLITERAL "
    "CLITERAL ?LITERAL1 ?SLITERAL1 HEX-LITERAL HEX-SLITERAL ?LITERAL2 ?SLITERAL2 SOURCE "
    "EndOfChunk CharAddr PeekChar IsDelimiter GetChar OnDelimiter SkipDelimiters OnNotDelimiter "
    "SkipWord SkipUpTo ParseWord NextWord PARSE SKIP CONSOLE-HANDLES REFILL DEPTH ?STACK "
    "?COMP WORD INTERPRET BYE QUIT MAIN1 EVALUATE INCLUDE-FILE INCLUDED >BODY +WORD "
    "WORDLIST CLASS! CLASS@ PAR! PAR@ ID. ?IMMEDIATE ?VOC IMMEDIATE VOC WordByAddrWl "
    "WordByAddr NLIST WORDS SAVE OPTIONS /notransl ANSI>OEM ACCEPT EMIT CR TYPE EKEY? "
    "EKEY EKEY>CHAR EXTERNTASK ERASE-IMPORTS ModuleName ModuleDirName ENVIRONMENT? "
    "DROP-EXC-HANDLER SET-EXC-HANDLER HALT ERR CLOSE-FILE CREATE-FILE CREATE-FILE-SHARED "
    "OPEN-FILE-SHARED DELETE-FILE FILE-POSITION FILE-SIZE OPEN-FILE READ-FILE REPOSITION-FILE "
    "DOS-LINES UNIX-LINES READ-LINE WRITE-FILE RESIZE-FILE WRITE-LINE ALLOCATE FREE RESIZE "
    "START SUSPEND RESUME STOP PAUSE MIN MAX TRUE FALSE ASCIIZ> "
    "R/O W/O ;CLASS ENDWITH OR AND /STRING SEARCH COMPARE EXPORT ;MODULE SPACE";
static const char* STE_WordList3_STE_LANG_FORTH =
    "VARIABLE CREATE : VALUE CONSTANT VM: M: var dvar chars OBJ "
    "CONSTR: DESTR: CLASS: OBJECT: POINTER "
    "USER USER-CREATE USER-VALUE VECT "
    "WNDPROC: VOCABULARY -- TASK: CEZ: MODULE:";
#endif //STE_USE_LANG_FORTH

#if STE_USE_LANG_ERLANG
static const char* STE_WordList1_STE_LANG_ERLANG =
    "after begin case catch cond end fun if let of query receive when "
    "define record export import include include_lib ifdef ifndef else endif undef "
    "apply attribute call do in letrec module primop try";
#endif //STE_USE_LANG_ERLANG

//static const char* STE_WordList1_STE_LANG_OCTAVE uses MATLAB

//static const char* STE_WordList1_STE_LANG_MSSQL - no words in scite

#if STE_USE_LANG_VERILOG
static const char* STE_WordList1_STE_LANG_VERILOG =
    "always and assign begin "
    "xbuf buf bufif0 bufif1 case casex casez cmos "
    "default defparam else end endcase "
    "endfunction endmodule endprimitive endspecify "
    "endtable endtask event for force forever "
    "fork function if initial inout input "
    "integer join macromodule makefile module "
    "nand negedge nmos nor not notif0 notif1 "
    "or output parameter pmos posedge primitive "
    "pulldown pullup rcmos real realtime reg "
    "repeat rnmos rpmos rtran rtranif0 rtranif1 "
    "signed specify specparam supply supply0 supply1 table "
    "task time tran tranif0 tranif1 tri tri0 "
    "tri1 triand trior trireg vectored wait "
    "wand while wire wor xnor xor";
static const char* STE_WordList2_STE_LANG_VERILOG = "";
static const char* STE_WordList3_STE_LANG_VERILOG =
    "$readmemb $readmemh $sreadmemb $sreadmemh $display $write $strobe $monitor $fdisplay $fwrite $fstrobe "
    "$fmonitor $fopen $fclose $time $stime $realtime $scale $printtimescale $timeformat $stop $finish $save "
    "$incsave $restart $input $log $nolog $key $nokey $scope $showscopes $showscopes $showvars $showvars "
    "$countdrivers $list $monitoron $monitoroff $dumpon $dumpoff $dumpfile $dumplimit $dumpflush $dumpvars "
    "$dumpall $reset $reset $reset $reset $reset $random $getpattern $rtoi $itor $realtobits $bitstoreal "
    "$setup $hold $setuphold $period $width $skew $recovery";
#endif //STE_USE_LANG_VERILOG

#if STE_USE_LANG_KIX
static const char* STE_WordList1_STE_LANG_KIX =
        "? and beep big break call cd cls color cookie1 copy "
        "debug del dim display do until exit flushkb for each next function endfunction "
        "get gets global go gosub goto if else endif md or password play quit "
        "rd redim return run select case endselect set setl setm settime "
        "shell sleep small use while loop";
static const char* STE_WordList2_STE_LANG_KIX =
        "abs addkey addprinterconnection addprogramgroup "
        "addprogramitem asc ascan at backupeventlog box cdbl chr cint cleareventlog "
        "close comparefiletimes createobject cstr dectohex delkey delprinterconnection "
        "delprogramgroup delprogramitem deltree delvalue dir enumgroup enumipinfo enumkey "
        "enumlocalgroup enumvalue execute exist existkey expandenvironmentvars fix "
        "formatnumber freefilehandle getdiskspace getfileattr getfilesize getfiletime "
        "getfileversion getobject iif ingroup instr instrrev int isdeclared join "
        "kbhit keyexist lcase left len loadhive loadkey logevent logoff ltrim "
        "memorysize messagebox open readline readprofilestring readtype readvalue "
        "redirectoutput right rnd round rtrim savekey sendkeys sendmessage setascii "
        "setconsole setdefaultprinter setfileattr setfocus setoption setsystemstate "
        "settitle setwallpaper showprogramgroup shutdown sidtoname split srnd substr "
        "trim ubound ucase unloadhive val vartype vartypename writeline "
        "writeprofilestring writevalue";
static const char* STE_WordList3_STE_LANG_KIX =
        "address build color comment cpu crlf csd curdir "
        "date day domain dos error fullname homedir homedrive homeshr hostname "
        "inwin ipaddress0 ipaddress1 ipaddress2 ipaddress3 kix lanroot ldomain "
        "ldrive lm logonmode longhomedir lserver maxpwage mdayno mhz monthno "
        "month msecs pid primarygroup priv productsuite producttype pwage ras "
        "result rserver scriptdir scriptexe scriptname serror sid site startdir "
        "syslang ticks time userid userlang wdayno wksta wuserid ydayno year";
#endif //STE_USE_LANG_KIX

//static const char* STE_WordList1_STE_LANG_GUI4CLI - nothing in scite

#if STE_USE_LANG_SPECMAN
static const char* STE_WordList1_STE_LANG_SPECMAN =
    "struct unit "
    "integer real bool int long uint nibble byte bits bytes bit time string "
    "var instance event "
    "verilog vhdl "
    "on compute start expect check that routine "
    "specman is also first only with like "
    "list of all radix hex dec bin ignore illegal "
    "traceable untraceable "
    "cover using count_only trace_only at_least transition item ranges "
    "cross text call task within "
    "packing low high "
    "locker address "
    "body code vec chars "
    "byte_array external_pointer "
    "choose matches "
    "if then else when try "
    "case casex casez default "
    "and or not xor "
    "until repeat while for from to step each do break continue "
    "before next always -kind network "
    "index it me in new return result select "
    "cycle sample events forever "
    "wait  change  negedge rise fall delay sync sim true detach eventually emit "
    "gen keep keeping soft before "
    "define as computed type extend "
    "variable global sys "
    "import "
    "untyped symtab ECHO DOECHO "
    "initialize non_terminal testgroup delayed exit finish "
    "out append print outf appendf "
    "post_generate pre_generate setup_test finalize_test extract_test "
    "init run copy as_a a set_config dut_error add clear lock quit "
    "lock unlock release swap quit to_string value stop_run "
    "crc_8 crc_32 crc_32_flip get_config add0 all_indices and_all "
    "apply average count delete exists first_index get_indices "
    "has insert is_a_permutation is_empty key key_exists key_index "
    "last last_index max max_index max_value min min_index "
    "min_value or_all pop pop0 push push0 product resize reverse "
    "sort split sum top top0 unique clear is_all_iterations "
    "get_enclosing_unit hdl_path exec deep_compare deep_compare_physical "
    "pack unpack warning error fatal "
    "size "
    "files load module ntv source_ref script read write "
    "initial idle others posedge clock cycles "
    "statement action command member exp block num file";
static const char* STE_WordList2_STE_LANG_SPECMAN =
    "TRUE FALSE MAX_INT MIN_INT NULL UNDEF ";
static const char* STE_WordList3_STE_LANG_SPECMAN =
    "any_sequence_item sequence any_sequence_driver driver "
    "created_driver  parent_sequence "
    "bfm_interaction_mode PULL_MODE PUSH_MODE MAIN SIMPLE RANDOM "
    "max_random_count max_random_depth num_of_last_items "
    "NORMAL NONE FULL LOW HIGH MEDIUM logger message "
    "get_tags show_units show_actions show_message ignore_tags "
    "set_style set_screen set_file set_flush_frequency "
    "set_format set_units set_actions at_message_verbosity "
    "short_name short_name_path short_name_style "
    "private protected package rerun any_env "
    "unqualified_clk clk reset_start reset_end "
    "message_logger verbosity tags to_file "
    "body pre_body post_body get_next_item send_to_bfm "
    "get_depth get_driver nice_string get_index grab "
    "is_blocked is_relevant ungrab mid_do post_do post_trace "
    "pre_do current_grabber get_current_item get_num_items_sent "
    "get_sequence_trace_list get_trace_list is_grabbed "
    "try_next_item check_is_relevant delay_clock "
    "get_sub_drivers regenerate_data wait_for_sequences "
    "stop";
#endif //STE_USE_LANG_SPECMAN

#if STE_USE_LANG_AU3
static const char* STE_WordList1_STE_LANG_AU3 =
    "and byref case continueloop dim do else elseif endfunc endif endselect exit exitloop for func "
    "global if local next not or return select step then to until wend while exit";
static const char* STE_WordList2_STE_LANG_AU3 =
    "abs acos adlibdisable adlibenable asc asin atan autoitsetoption autoitwingettitle autoitwinsettitle "
    "bitand bitnot bitor bitshift bitxor blockinput break call cdtray chr clipget clipput controlclick "
    "controlcommand controldisable controlenable controlfocus controlgetfocus controlgetpos controlgettext "
    "controlhide controlmove controlsend controlsettext controlshow cos dec dircopy dircreate dirmove "
    "dirremove drivegetdrive drivegetfilesystem drivegetlabel drivegetserial drivegettype drivesetlabel "
    "drivespacefree drivespacetotal drivestatus envget envset envupdate eval exp filechangedir fileclose "
    "filecopy filecreateshortcut filedelete fileexists filefindfirstfile filefindnextfile filegetattrib "
    "filegetlongname filegetshortname filegetsize filegettime filegetversion fileinstall filemove "
    "fileopen fileopendialog fileread filereadline filerecycle filerecycleempty filesavedialog fileselectfolder "
    "filesetattrib filesettime filewrite filewriteline guicreate guicreateex guidefaultfont guidelete "
    "guigetcontrolstate guihide guimsg guiread guirecvmsg guisendmsg guisetcontrol guisetcontroldata "
    "guisetcontrolex guisetcontrolfont guisetcontrolnotify guisetcoord guisetcursor guishow guiwaitclose "
    "guiwrite hex hotkeyset inidelete iniread iniwrite inputbox int isadmin isarray isdeclared isfloat "
    "isint isnumber isstring log memgetstats mod mouseclick mouseclickdrag mousedown mousegetcursor "
    "mousegetpos mousemove mouseup mousewheel msgbox number pixelchecksum pixelgetcolor pixelsearch "
    "processclose processexists processsetpriority processwait processwaitclose progressoff progresson "
    "progressset random regdelete regenumkey regenumval regread regwrite round run runasset runwait "
    "send seterror shutdown sin sleep soundplay soundsetwavevolume splashimageon splashoff splashtexton "
    "sqrt statusbargettext string stringaddcr stringformat stringinstr stringisalnum stringisalpha "
    "stringisascii stringisdigit stringisfloat stringisint stringislower stringisspace stringisupper "
    "stringisxdigit stringleft stringlen stringlower stringmid stringreplace stringright stringsplit "
    "stringstripcr stringstripws stringtrimleft stringtrimright stringupper tan timerstart timerstop "
    "tooltip traytip ubound urldownloadtofile winactivate winactive winclose winexists wingetcaretpos "
    "wingetclasslist wingetclientsize wingethandle wingetpos wingetstate wingettext wingettitle "
    "winkill winmenuselectitem winminimizeall winminimizeallundo winmove winsetontop winsetstate "
    "winsettitle winwait winwaitactive winwaitclose winwaitnotactive";
static const char* STE_WordList3_STE_LANG_AU3 =
    "@appdatacommondir @appdatadir @autoitversion @commonfilesdir @compiled @computername @comspec "
    "@cr @crlf @desktopcommondir @desktopdir @desktopheight @desktopwidth @documentscommondir @error "
    "@favoritescommondir @favoritesdir @homedrive @homepath @homeshare @hour @ipaddress1 @ipaddress2 "
    "@ipaddress3 @ipaddress4 @lf @logondnsdomain @logondomain @logonserver @mday @min @mon @mydocumentsdir "
    "@osbuild @oslang @osservicepack @ostype @osversion @programfilesdir @programscommondir @programsdir "
    "@scriptdir @scriptfullpath @scriptname @sec @startmenucommondir @startmenudir @startupcommondir "
    "@startupdir @sw_hide @sw_maximize @sw_minimize @sw_restore @sw_show @systemdir @tab @tempdir "
    "@userprofiledir @username @wday @windowsdir @workingdir @yday @year";
static const char* STE_WordList4_STE_LANG_AU3 =
    "{!} {#} {^} {{} {}} {+} {alt} {altdown} {altup} {appskey} {asc} {backspace} {browser_back} "
    "{browser_favorites} {browser_forward} {browser_home} {browser_refresh} {browser_search} {browser_stop} {bs} {capslock} {ctrlbreak} "
    "{ctrldown} {ctrlup} {del} {delete} {down} {end} {enter} {esc} {escape} {f1} {f10} {f11} {f12} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} "
    "{home} {ins} {insert} {lalt} {launch_app1} {launch_app2} {launch_mail} {launch_media} {lctrl} {left} {lshift} {lwin} "
    "{lwindown} {media_next} {media_play_pause} {media_prev} {media_stop} {numlock} "
    "{numpad0} {numpad1} {numpad2} {numpad3} {numpad4} {numpad5} {numpad6} {numpad7} {numpad8} {numpad9} "
    "{numpadadd} {numpaddiv} {numpaddot} {numpadenter} {numpadmult} {numpadsub} {pause} {pgdn} {pgup} "
    "{printscreen} {ralt} {rctrl} {right} {rshift} {rwin} {rwindown} {scrolllock} {shiftdown} {shiftup} {sleep} {space} {tab} {up} "
    "{volume_down} {volume_mute} {volume_up}";
#endif //STE_USE_LANG_AU3

//static const char* STE_WordList1_STE_LANG_APDL - nothing in scite

#if STE_USE_LANG_BASH
static const char* STE_WordList1_STE_LANG_BASH =
    "alias ar asa awk banner basename bash bc bdiff break bunzip2 "
    "bzip2 cal calendar case cat cc cd chmod cksum clear cmp col comm "
    "compress continue cp cpio crypt csplit ctags cut date dc dd "
    "declare deroff dev df diff diff3 dircmp dirname do done du echo "
    "ed egrep elif else env esac eval ex exec exit expand export expr "
    "false fc fgrep fi file find fmt fold for function functions "
    "getconf getopt getopts grep gres hash head help history iconv id "
    "if in integer jobs join kill local lc let line ln logname look "
    "ls m4 mail mailx make man mkdir more mt mv newgrp nl nm nohup "
    "ntps od pack paste patch pathchk pax pcat perl pg pr print printf "
    "ps pwd read readonly red return rev rm rmdir sed select set sh "
    "shift size sleep sort spell split start stop strings strip stty "
    "sum suspend sync tail tar tee test then time times touch tr trap "
    "true tsort tty type typeset ulimit umask unalias uname uncompress "
    "unexpand uniq unpack unset until uudecode uuencode vi vim vpax "
    "wait wc whence which while who wpaste wstart xargs zcat";
#endif //STE_USE_LANG_BASH

#if STE_USE_LANG_ASN1
static const char* STE_WordList1_STE_LANG_ASN1 =
    "ACCESS AGENT AUGMENTS "
    "BEGIN BITS "
    "CAPABILITIES CHOICE COMPLIANCE CONTACT CONVENTION "
    "DEFINITIONS DEFVAL DESCRIPTION DISPLAY "
    "END ENTERPRISE EXPORTS "
    "FALSE FROM "
    "GROUP GROUPS "
    "HINT "
    "IDENTITY IMPLIED IMPORTS INCLUDES INDEX INFO "
    "LAST "
    "MANDATORY MAX MIN MODULE "
    "NOTATION NOTIFICATION NULL "
    "OBJECTS OBJECT-TYPE OF ORGANIZATION "
    "PRODUCT "
    "RELEASE REFERENCE REQUIRES REVISION "
    "SEQUENCE SIZE STATUS SUPPORTS SYNTAX "
    "TEXTUAL TRAP TYPE TRAP-TYPE "
    "UPDATED "
    "VALUE VARIABLES VARIATION "
    "WRITE";
static const char* STE_WordList2_STE_LANG_ASN1 =
    "accessible create current deprecated for mandatory "
    "not notify not-accessible obsolete only optional "
    "read read-only read-write write";
static const char* STE_WordList3_STE_LANG_ASN1 =
    "ABSENT ANY APPLICATION BIT BOOLEAN BY COMPONENT COMPONENTS "
    "DEFAULT DEFINED ENUMERATED EXPLICIT EXTERNAL IMPLICIT INIFINITY "
    "MAX MIN MINUS OPTIONAL PRESENT PRIVATE REAL SET TAGS TRUE";
static const char* STE_WordList4_STE_LANG_ASN1 =
    "Counter Counter32 Counter64 DisplayString Gauge Gauge32 "
    "IDENTIFIER INTEGER Integer32 IpAddress NetworkAddress NsapAddress "
    "OBJECT OCTET Opaque PhysAddress STRING TimeTicks UInteger32 UNITS Unsigned32";
#endif //STE_USE_LANG_ASN1

#if STE_USE_LANG_VHDL
static const char* STE_WordList1_STE_LANG_VHDL =
    "keywords.$(file.patterns.vhdl)=access after alias all architecture array assert attribute begin block "
    "body buffer bus case component configuration constant disconnect downto else elsif end entity exit file "
    "for function generate generic group guarded if impure in inertial inout is label library linkage literal "
    "loop map new next null of on open others out package port postponed procedure process pure range record "
    "register reject report return select severity shared signal subtype then to transport type unaffected "
    "units until use variable wait when while with";
static const char* STE_WordList2_STE_LANG_VHDL =
    "abs and mod nand nor not or rem rol ror sla sll sra srl xnor xor";
static const char* STE_WordList3_STE_LANG_VHDL =
    "left right low high ascending image value pos val succ pred leftof rightof base range reverse_range "
    "length delayed stable quiet transaction event active last_event last_active last_value driving "
    "driving_value simple_name path_name instance_name";
static const char* STE_WordList4_STE_LANG_VHDL =
    "now readline read writeline write endfile resolved to_bit to_bitvector to_stdulogic to_stdlogicvector "
    "to_stdulogicvector to_x01 to_x01z to_UX01 rising_edge falling_edge is_x shift_left shift_right rotate_left "
    "rotate_right resize to_integer to_unsigned to_signed std_match to_01";
static const char* STE_WordList5_STE_LANG_VHDL =
    "std ieee work standard textio std_logic_1164 std_logic_arith std_logic_misc std_logic_signed "
    "std_logic_textio std_logic_unsigned numeric_bit numeric_std math_complex math_real vital_primitives "
    "vital_timing";
static const char* STE_WordList6_STE_LANG_VHDL =
    "boolean bit character severity_level integer real time delay_length natural positive string bit_vector "
    "file_open_kind file_open_status line text side width std_ulogic std_ulogic_vector std_logic "
    "std_logic_vector X01 X01Z UX01 UX01Z unsigned signed";
#endif //STE_USE_LANG_VHDL

#if STE_USE_LANG_JAVA
static const char* STE_WordList1_STE_LANG_JAVA =
    "abstract assert boolean break byte case catch char class const "
    "continue default do double else extends final finally float for "
    "future generic goto if implements import inner instanceof int "
    "interface long native new null outer package private protected "
    "public rest return short static super switch synchronized this "
    "throw throws transient try var void volatile while";
#endif //STE_USE_LANG_JAVA

#if STE_USE_LANG_JAVASCRIPT
static const char* STE_WordList1_STE_LANG_JAVASCRIPT =
    "abstract boolean break byte case catch char class const continue "
    "debugger default delete do double else enum export extends final "
    "finally float for function goto if implements import in "
    "instanceof int interface long native new package private "
    "protected public return short static super switch synchronized "
    "this throw throws transient try typeof var void volatile while "
    "with";
#endif //STE_USE_LANG_JAVASCRIPT

#if STE_USE_LANG_RC
static const char* STE_WordList1_STE_LANG_RC =
    "ACCELERATORS ALT AUTO3STATE AUTOCHECKBOX AUTORADIOBUTTON BEGIN "
    "BITMAP BLOCK BUTTON CAPTION CHARACTERISTICS CHECKBOX CLASS "
    "COMBOBOX CONTROL CTEXT CURSOR DEFPUSHBUTTON DIALOG DIALOGEX "
    "DISCARDABLE EDITTEXT END EXSTYLE FONT GROUPBOX ICON LANGUAGE "
    "LISTBOX LTEXT MENU MENUEX MENUITEM MESSAGETABLE POPUP PUSHBUTTON "
    "RADIOBUTTON RCDATA RTEXT SCROLLBAR SEPARATOR SHIFT STATE3 "
    "STRINGTABLE STYLE TEXTINCLUDE VALUE VERSION VERSIONINFO VIRTKEY";
#endif //STE_USE_LANG_RC

#if STE_USE_LANG_CS
static const char* STE_WordList1_STE_LANG_CS =
    "abstract as base bool break byte case catch char checked class "
    "const continue decimal default delegate do double else enum event "
    "explicit extern false finally fixed float for foreach goto if "
    "implicit in int interface internal is lock long namespace new "
    "null object operator out override params private protected public "
    "readonly ref return sbyte sealed short sizeof stackalloc static "
    "string struct switch this throw true try typeof uint ulong "
    "unchecked unsafe ushort using virtual void while";
#endif //STE_USE_LANG_CS

#if STE_USE_LANG_D
static const char* STE_WordList1_STE_LANG_D =
    "abstract alias align asm assert auto "
    "bit body break byte case cast catch cdouble cent cfloat char class const continue creal "
    "dchar debug default delegate delete deprecated do double "
    "else enum export extern false final finally float for foreach function "
    "goto idouble if ifloat import in inout int interface invariant ireal is "
    "long mixin module new null out override package pragma private protected public "
    "real return short static struct super switch synchronized "
    "template this throw true try typedef typeid typeof "
    "ubyte ucent uint ulong union unittest ushort version void volatile wchar while with";
#endif //STE_USE_LANG_D

#if STE_USE_LANG_IDL
static const char* STE_WordList1_STE_LANG_IDL =
       "aggregatable allocate appobject arrays async async_uuid "
       "uto_handle bindable boolean broadcast byte byte_count call_as "
       "callback char coclass code comm_status const context_handle "
       "context_handle_noserialize context_handle_serialize control "
       "cpp_quote custom decode default defaultbind defaultcollelem "
       "defaultvalue defaultvtable dispinterface displaybind dllname "
       "double dual enable_allocate encode endpoint entry enum "
       "error_status_t explicit_handle fault_status first_is float "
       "handle_t heap helpcontext helpfile helpstring helpstringcontext "
       "helpstringdll hidden hyper id idempotent ignore iid_as "
       "iid_is immediatebind implicit_handle import importlib in include "
       "in_line int __int64 __int3264 interface last_is lcid length_is "
       "library licensed local long max_is maybe message methods "
       "midl_pragma midl_user_allocate midl_user_free min_is module "
       "ms_union ncacn_at_dsp ncacn_dnet_nsp ncacn_http ncacn_ip_tcp "
       "ncacn_nb_ipx ncacn_nb_nb ncacn_nb_tcp ncacn_np ncacn_spx "
       "ncacn_vns_spp ncadg_ip_udp ncadg_ipx ncadg_mq ncalrpc nocode "
       "nonbrowsable noncreatable nonextensible notify object odl "
       "oleautomation optimize optional out out_of_line pipe "
       "pointer_default pragma properties propget propput propputref ptr "
       "public range readonly ref represent_as requestedit restricted "
       "retval shape short signed size_is small source "
       "strict_context_handle string struct switch switch_is switch_type "
       "transmit_as typedef uidefault union unique unsigned user_marshal "
       "usesgetlasterror uuid v1_enum vararg version void wchar_t "
       "wire_marshal";
#endif //STE_USE_LANG_IDL

#if STE_USE_LANG_PLSQL
static const char* STE_WordList1_STE_LANG_PLSQL =
       "all alter and any array as asc at authid avg begin between binary_integer "
       "body boolean bulk by char char_base check close cluster collect comment "
       "commit compress connect constant create current currval cursor date day "
       "declare decimal default delete desc distinct do drop else elsif end "
       "exception exclusive execute exists exit extends false fetch float for "
       "forall from function goto group having heap hour if immediate in index "
       "indicator insert integer interface intersect interval into is isolation "
       "java level like limited lock long loop max min minus minute mlslabel mod "
       "mode month natural naturaln new nextval nocopy not nowait null number "
       "number_base ocirowid of on opaque open operator option or order "
       "organization others out package partition pctfree pls_integer positive "
       "positiven pragma prior private procedure public raise range raw real record "
       "ref release return reverse rollback row rowid rownum rowtype savepoint "
       "second select separate set share smallint space sql sqlcode sqlerrm start "
       "stddev subtype successful sum synonym sysdate table then time timestamp to "
       "trigger true type uid union unique update use user validate values varchar "
       "varchar2 variance view when whenever where while with work write year zone";
#endif //STE_USE_LANG_PLSQL



#define STE_LexerWords_STE_LANG_CONTAINER_COUNT 0
#define DefSTE_LexerWords_STE_LANG_CONTAINER \
    STE_LexerWords* STE_LexerWords_STE_LANG_CONTAINER   = NULL;

#define STE_LexerWords_STE_LANG_NULL_COUNT 0
#define DefSTE_LexerWords_STE_LANG_NULL \
    STE_LexerWords* STE_LexerWords_STE_LANG_NULL        = NULL;

#define STE_LexerWords_STE_LANG_PYTHON_COUNT 1
#define DefSTE_LexerWords_STE_LANG_PYTHON \
    STE_LexerWords STE_LexerWords_STE_LANG_PYTHON[]     = { { 1, STE_WordList1_STE_LANG_PYTHON } };

#define STE_LexerWords_STE_LANG_CPP_COUNT 3
#define DefSTE_LexerWords_STE_LANG_CPP \
    STE_LexerWords STE_LexerWords_STE_LANG_CPP[]        = { { 1, STE_WordList1_STE_LANG_CPP }, \
                                                            { 1, STE_WordList2_STE_LANG_CPP }, \
                                                            { 1, STE_WordList3_STE_LANG_CPP } };

#define STE_LexerWords_STE_LANG_HTML_COUNT 5
#define DefSTE_LexerWords_STE_LANG_HTML \
    STE_LexerWords STE_LexerWords_STE_LANG_HTML[]       = { { 1, STE_WordList1_STE_LANG_HTML }, \
                                                            { 1, STE_WordList1_STE_LANG_JAVASCRIPT }, \
                                                            { 1, STE_WordList1_STE_LANG_VB }, \
                                                            { 1, STE_WordList1_STE_LANG_PYTHON }, \
                                                            { 1, STE_WordList1_STE_LANG_PHP } };

#define STE_LexerWords_STE_LANG_XML_COUNT 0
#define DefSTE_LexerWords_STE_LANG_XML \
    STE_LexerWords* STE_LexerWords_STE_LANG_XML         = NULL;

#define STE_LexerWords_STE_LANG_PERL_COUNT 1
#define DefSTE_LexerWords_STE_LANG_PERL \
    STE_LexerWords STE_LexerWords_STE_LANG_PERL[]       = { { 1, STE_WordList1_STE_LANG_PERL } };

#define STE_LexerWords_STE_LANG_SQL_COUNT 1
#define DefSTE_LexerWords_STE_LANG_SQL \
    STE_LexerWords STE_LexerWords_STE_LANG_SQL[]        = { { 1, STE_WordList1_STE_LANG_SQL } };

#define STE_LexerWords_STE_LANG_VB_COUNT 1
#define DefSTE_LexerWords_STE_LANG_VB \
    STE_LexerWords STE_LexerWords_STE_LANG_VB[]         = { { 1, STE_WordList1_STE_LANG_VB } };

#define STE_LexerWords_STE_LANG_PROPERTIES_COUNT 0
#define DefSTE_LexerWords_STE_LANG_PROPERTIES \
    STE_LexerWords* STE_LexerWords_STE_LANG_PROPERTIES  = NULL;

#define STE_LexerWords_STE_LANG_ERRORLIST_COUNT 0
#define DefSTE_LexerWords_STE_LANG_ERRORLIST \
    STE_LexerWords* STE_LexerWords_STE_LANG_ERRORLIST   = NULL;

#define STE_LexerWords_STE_LANG_MAKEFILE_COUNT 0
#define DefSTE_LexerWords_STE_LANG_MAKEFILE \
    STE_LexerWords* STE_LexerWords_STE_LANG_MAKEFILE    = NULL;

#define STE_LexerWords_STE_LANG_BATCH_COUNT 1
#define DefSTE_LexerWords_STE_LANG_BATCH \
    STE_LexerWords STE_LexerWords_STE_LANG_BATCH[]      = { { 1, STE_WordList1_STE_LANG_BATCH } };

#define STE_LexerWords_STE_LANG_XCODE_COUNT 0
#define DefSTE_LexerWords_STE_LANG_XCODE \
    STE_LexerWords* STE_LexerWords_STE_LANG_XCODE       = NULL;

#define STE_LexerWords_STE_LANG_LATEX_COUNT 1
#define DefSTE_LexerWords_STE_LANG_LATEX \
    STE_LexerWords STE_LexerWords_STE_LANG_LATEX[]      = { { 1, STE_WordList1_STE_LANG_LATEX } };

#define STE_LexerWords_STE_LANG_LUA_COUNT 4
#define DefSTE_LexerWords_STE_LANG_LUA \
    STE_LexerWords STE_LexerWords_STE_LANG_LUA[]        = { { 1, STE_WordList1_STE_LANG_LUA }, \
                                                            { 1, STE_WordList2_STE_LANG_LUA }, \
                                                            { 1, STE_WordList3_STE_LANG_LUA }, \
                                                            { 1, STE_WordList4_STE_LANG_LUA } };

#define STE_LexerWords_STE_LANG_DIFF_COUNT 0
#define DefSTE_LexerWords_STE_LANG_DIFF \
    STE_LexerWords* STE_LexerWords_STE_LANG_DIFF        = NULL;

#define STE_LexerWords_STE_LANG_CONF_COUNT 2
#define DefSTE_LexerWords_STE_LANG_CONF \
    STE_LexerWords STE_LexerWords_STE_LANG_CONF[]       = { { 1, STE_WordList1_STE_LANG_CONF }, \
                                                            { 1, STE_WordList2_STE_LANG_CONF } };

#define STE_LexerWords_STE_LANG_PASCAL_COUNT 1
#define DefSTE_LexerWords_STE_LANG_PASCAL \
    STE_LexerWords STE_LexerWords_STE_LANG_PASCAL[]     = { { 1, STE_WordList1_STE_LANG_PASCAL } };

#define STE_LexerWords_STE_LANG_AVE_COUNT 1
#define DefSTE_LexerWords_STE_LANG_AVE \
    STE_LexerWords STE_LexerWords_STE_LANG_AVE[]        = { { 1, STE_WordList1_STE_LANG_AVE } };

#define STE_LexerWords_STE_LANG_ADA_COUNT 1
#define DefSTE_LexerWords_STE_LANG_ADA \
    STE_LexerWords STE_LexerWords_STE_LANG_ADA[]        = { { 1, STE_WordList1_STE_LANG_ADA }  };

#define STE_LexerWords_STE_LANG_LISP_COUNT 1
#define DefSTE_LexerWords_STE_LANG_LISP \
    STE_LexerWords STE_LexerWords_STE_LANG_LISP[]       = { { 1, STE_WordList1_STE_LANG_LISP } };

#define STE_LexerWords_STE_LANG_RUBY_COUNT 1
#define DefSTE_LexerWords_STE_LANG_RUBY \
    STE_LexerWords STE_LexerWords_STE_LANG_RUBY[]       = { { 1, STE_WordList1_STE_LANG_RUBY } };

#define STE_LexerWords_STE_LANG_EIFFEL_COUNT 1
#define DefSTE_LexerWords_STE_LANG_EIFFEL \
    STE_LexerWords STE_LexerWords_STE_LANG_EIFFEL[]     = { { 1, STE_WordList1_STE_LANG_EIFFEL } };

#define STE_LexerWords_STE_LANG_EIFFELKW_COUNT 1
#define DefSTE_LexerWords_STE_LANG_EIFFELKW \
    STE_LexerWords STE_LexerWords_STE_LANG_EIFFELKW[]   = { { 1, STE_WordList1_STE_LANG_EIFFEL } };

#define STE_LexerWords_STE_LANG_TCL_COUNT 1
#define DefSTE_LexerWords_STE_LANG_TCL \
    STE_LexerWords STE_LexerWords_STE_LANG_TCL[]        = { { 1, STE_WordList1_STE_LANG_TCL } };

#define STE_LexerWords_STE_LANG_NNCRONTAB_COUNT 3
#define DefSTE_LexerWords_STE_LANG_NNCRONTAB \
    STE_LexerWords STE_LexerWords_STE_LANG_NNCRONTAB[]  = { { 1, STE_WordList1_STE_LANG_NNCRONTAB }, \
                                                            { 1, STE_WordList2_STE_LANG_NNCRONTAB }, \
                                                            { 1, STE_WordList3_STE_LANG_NNCRONTAB } };

#define STE_LexerWords_STE_LANG_BULLANT_COUNT 1
#define DefSTE_LexerWords_STE_LANG_BULLANT \
    STE_LexerWords STE_LexerWords_STE_LANG_BULLANT[]    = { { 1, STE_WordList1_STE_LANG_BULLANT } };

#define STE_LexerWords_STE_LANG_VBSCRIPT_COUNT 1
#define DefSTE_LexerWords_STE_LANG_VBSCRIPT \
    STE_LexerWords STE_LexerWords_STE_LANG_VBSCRIPT[]   = { { 1, STE_WordList1_STE_LANG_VBSCRIPT } };

#define STE_LexerWords_STE_LANG_ASP_COUNT 0
#define DefSTE_LexerWords_STE_LANG_ASP \
    STE_LexerWords* STE_LexerWords_STE_LANG_ASP         = NULL;

#define STE_LexerWords_STE_LANG_PHP_COUNT 1
#define DefSTE_LexerWords_STE_LANG_PHP \
    STE_LexerWords STE_LexerWords_STE_LANG_PHP[]        = { { 1, STE_WordList1_STE_LANG_PHP } };

#define STE_LexerWords_STE_LANG_BAAN_COUNT 0
#define DefSTE_LexerWords_STE_LANG_BAAN \
    STE_LexerWords* STE_LexerWords_STE_LANG_BAAN        = NULL;

#define STE_LexerWords_STE_LANG_MATLAB_COUNT 1
#define DefSTE_LexerWords_STE_LANG_MATLAB \
    STE_LexerWords STE_LexerWords_STE_LANG_MATLAB[]     = { { 1, STE_WordList1_STE_LANG_MATLAB } };

#define STE_LexerWords_STE_LANG_SCRIPTOL_COUNT 1
#define DefSTE_LexerWords_STE_LANG_SCRIPTOL \
    STE_LexerWords STE_LexerWords_STE_LANG_SCRIPTOL[]   = { { 1, STE_WordList1_STE_LANG_SCRIPTOL } };

#define STE_LexerWords_STE_LANG_ASM_COUNT 5
#define DefSTE_LexerWords_STE_LANG_ASM \
    STE_LexerWords STE_LexerWords_STE_LANG_ASM[]        = { { 1, STE_WordList1_STE_LANG_ASM }, \
                                                            { 1, STE_WordList2_STE_LANG_ASM }, \
                                                            { 1, STE_WordList3_STE_LANG_ASM }, \
                                                            { 1, STE_WordList4_STE_LANG_ASM }, \
                                                            { 1, STE_WordList5_STE_LANG_ASM } };

#define STE_LexerWords_STE_LANG_CPPNOCASE_COUNT 3
#define DefSTE_LexerWords_STE_LANG_CPPNOCASE \
    STE_LexerWords STE_LexerWords_STE_LANG_CPPNOCASE[]  = { { 1, STE_WordList1_STE_LANG_CPP }, \
                                                            { 1, STE_WordList2_STE_LANG_CPP }, \
                                                            { 1, STE_WordList3_STE_LANG_CPP } };

#define STE_LexerWords_STE_LANG_FORTRAN_COUNT 2
#define DefSTE_LexerWords_STE_LANG_FORTRAN \
    STE_LexerWords STE_LexerWords_STE_LANG_FORTRAN[]    = { { 1, STE_WordList1_STE_LANG_FORTRAN }, \
                                                            { 1, STE_WordList2_STE_LANG_FORTRAN } };

#define STE_LexerWords_STE_LANG_F77_COUNT 2
#define DefSTE_LexerWords_STE_LANG_F77 \
    STE_LexerWords STE_LexerWords_STE_LANG_F77[]        = { { 1, STE_WordList1_STE_LANG_FORTRAN }, \
                                                            { 1, STE_WordList2_STE_LANG_FORTRAN } };

#define STE_LexerWords_STE_LANG_CSS_COUNT 2
#define DefSTE_LexerWords_STE_LANG_CSS \
    STE_LexerWords STE_LexerWords_STE_LANG_CSS[]        = { { 1, STE_WordList1_STE_LANG_CSS }, \
                                                            { 1, STE_WordList2_STE_LANG_CSS } };

#define STE_LexerWords_STE_LANG_POV_COUNT 5
#define DefSTE_LexerWords_STE_LANG_POV \
    STE_LexerWords STE_LexerWords_STE_LANG_POV[]        = { { 1, STE_WordList1_STE_LANG_POV }, \
                                                            { 1, STE_WordList2_STE_LANG_POV }, \
                                                            { 1, STE_WordList3_STE_LANG_POV }, \
                                                            { 1, STE_WordList4_STE_LANG_POV }, \
                                                            { 1, STE_WordList5_STE_LANG_POV } };

#define STE_LexerWords_STE_LANG_LOUT_COUNT 3
#define DefSTE_LexerWords_STE_LANG_LOUT \
    STE_LexerWords STE_LexerWords_STE_LANG_LOUT[]       = { { 1, STE_WordList1_STE_LANG_LOUT }, \
                                                            { 1, STE_WordList2_STE_LANG_LOUT }, \
                                                            { 1, STE_WordList3_STE_LANG_LOUT } };

#define STE_LexerWords_STE_LANG_ESCRIPT_COUNT 3
#define DefSTE_LexerWords_STE_LANG_ESCRIPT \
    STE_LexerWords STE_LexerWords_STE_LANG_ESCRIPT[]    = { { 1, STE_WordList1_STE_LANG_ESCRIPT }, \
                                                            { 1, STE_WordList2_STE_LANG_ESCRIPT }, \
                                                            { 1, STE_WordList3_STE_LANG_ESCRIPT } };

#define STE_LexerWords_STE_LANG_PS_COUNT 4
#define DefSTE_LexerWords_STE_LANG_PS \
    STE_LexerWords STE_LexerWords_STE_LANG_PS[]         = { { 1, STE_WordList1_STE_LANG_PS }, \
                                                            { 1, STE_WordList2_STE_LANG_PS }, \
                                                            { 1, STE_WordList3_STE_LANG_PS }, \
                                                            { 1, STE_WordList4_STE_LANG_PS } };

#define STE_LexerWords_STE_LANG_NSIS_COUNT 4
#define DefSTE_LexerWords_STE_LANG_NSIS \
    STE_LexerWords STE_LexerWords_STE_LANG_NSIS[]       = { { 1, STE_WordList1_STE_LANG_NSIS }, \
                                                            { 1, STE_WordList2_STE_LANG_NSIS }, \
                                                            { 1, STE_WordList3_STE_LANG_NSIS }, \
                                                            { 1, STE_WordList4_STE_LANG_NSIS } };

#define STE_LexerWords_STE_LANG_MMIXAL_COUNT 3
#define DefSTE_LexerWords_STE_LANG_MMIXAL \
    STE_LexerWords STE_LexerWords_STE_LANG_MMIXAL[]     = { { 1, STE_WordList1_STE_LANG_MMIXAL }, \
                                                            { 1, STE_WordList2_STE_LANG_MMIXAL }, \
                                                            { 1, STE_WordList3_STE_LANG_MMIXAL } };

#define STE_LexerWords_STE_LANG_CLW_COUNT 0
#define DefSTE_LexerWords_STE_LANG_CLW  \
    STE_LexerWords* STE_LexerWords_STE_LANG_CLW         = NULL;

#define STE_LexerWords_STE_LANG_CLWNOCASE_COUNT 0
#define DefSTE_LexerWords_STE_LANG_CLWNOCASE \
    STE_LexerWords* STE_LexerWords_STE_LANG_CLWNOCASE   = NULL;

#define STE_LexerWords_STE_LANG_LOT_COUNT 0
#define DefSTE_LexerWords_STE_LANG_LOT  \
    STE_LexerWords* STE_LexerWords_STE_LANG_LOT         = NULL;

#define STE_LexerWords_STE_LANG_YAML_COUNT 1
#define DefSTE_LexerWords_STE_LANG_YAML \
    STE_LexerWords STE_LexerWords_STE_LANG_YAML[]       = { { 1, STE_WordList1_STE_LANG_YAML } };

#define STE_LexerWords_STE_LANG_TEX_COUNT 0
#define DefSTE_LexerWords_STE_LANG_TEX  \
    STE_LexerWords STE_LexerWords_STE_LANG_TEX[]        = { { 1, STE_WordList1_STE_LANG_LATEX } };

#define STE_LexerWords_STE_LANG_METAPOST_COUNT 1
#define DefSTE_LexerWords_STE_LANG_METAPOST \
    STE_LexerWords STE_LexerWords_STE_LANG_METAPOST[]   = { { 1, STE_WordList1_STE_LANG_METAPOST } };

#define STE_LexerWords_STE_LANG_POWERBASIC_COUNT 0
#define DefSTE_LexerWords_STE_LANG_POWERBASIC \
    STE_LexerWords* STE_LexerWords_STE_LANG_POWERBASIC  = NULL;

#define STE_LexerWords_STE_LANG_FORTH_COUNT 3
#define DefSTE_LexerWords_STE_LANG_FORTH \
    STE_LexerWords STE_LexerWords_STE_LANG_FORTH[]      = { { 1, STE_WordList1_STE_LANG_FORTH }, \
                                                            { 1, STE_WordList2_STE_LANG_FORTH }, \
                                                            { 1, STE_WordList3_STE_LANG_FORTH } };

#define STE_LexerWords_STE_LANG_ERLANG_COUNT 1
#define DefSTE_LexerWords_STE_LANG_ERLANG \
    STE_LexerWords STE_LexerWords_STE_LANG_ERLANG[]     = { { 1, STE_WordList1_STE_LANG_ERLANG } };

#define STE_LexerWords_STE_LANG_OCTAVE_COUNT 1
#define DefSTE_LexerWords_STE_LANG_OCTAVE \
    STE_LexerWords STE_LexerWords_STE_LANG_OCTAVE[]     = { { 1, STE_WordList1_STE_LANG_MATLAB } };

#define STE_LexerWords_STE_LANG_MSSQL_COUNT 0
#define DefSTE_LexerWords_STE_LANG_MSSQL \
    STE_LexerWords* STE_LexerWords_STE_LANG_MSSQL       = NULL;

#define STE_LexerWords_STE_LANG_VERILOG_COUNT 3
#define DefSTE_LexerWords_STE_LANG_VERILOG \
    STE_LexerWords STE_LexerWords_STE_LANG_VERILOG[]    = { { 1, STE_WordList1_STE_LANG_VERILOG }, \
                                                            { 1, STE_WordList2_STE_LANG_VERILOG }, \
                                                            { 1, STE_WordList3_STE_LANG_VERILOG } };

#define STE_LexerWords_STE_LANG_KIX_COUNT 3
#define DefSTE_LexerWords_STE_LANG_KIX \
    STE_LexerWords STE_LexerWords_STE_LANG_KIX[]        = { { 1, STE_WordList1_STE_LANG_KIX }, \
                                                            { 1, STE_WordList2_STE_LANG_KIX }, \
                                                            { 1, STE_WordList3_STE_LANG_KIX } };

#define STE_LexerWords_STE_LANG_GUI4CLI_COUNT 0
#define DefSTE_LexerWords_STE_LANG_GUI4CLI \
    STE_LexerWords* STE_LexerWords_STE_LANG_GUI4CLI     = NULL;

#define STE_LexerWords_STE_LANG_SPECMAN_COUNT 3
#define DefSTE_LexerWords_STE_LANG_SPECMAN \
    STE_LexerWords STE_LexerWords_STE_LANG_SPECMAN[]    = { { 1, STE_WordList1_STE_LANG_SPECMAN }, \
                                                            { 1, STE_WordList2_STE_LANG_SPECMAN }, \
                                                            { 1, STE_WordList3_STE_LANG_SPECMAN } };

#define STE_LexerWords_STE_LANG_AU3_COUNT 4
#define DefSTE_LexerWords_STE_LANG_AU3 \
    STE_LexerWords STE_LexerWords_STE_LANG_AU3[]        = { { 1, STE_WordList1_STE_LANG_AU3 }, \
                                                            { 1, STE_WordList2_STE_LANG_AU3 }, \
                                                            { 1, STE_WordList3_STE_LANG_AU3 }, \
                                                            { 1, STE_WordList4_STE_LANG_AU3 } };

#define STE_LexerWords_STE_LANG_APDL_COUNT 0
#define DefSTE_LexerWords_STE_LANG_APDL \
    STE_LexerWords* STE_LexerWords_STE_LANG_APDL        = NULL;

#define STE_LexerWords_STE_LANG_BASH_COUNT 1
#define DefSTE_LexerWords_STE_LANG_BASH \
    STE_LexerWords STE_LexerWords_STE_LANG_BASH[]       = { { 1, STE_WordList1_STE_LANG_BASH } };

#define STE_LexerWords_STE_LANG_ASN1_COUNT 4
#define DefSTE_LexerWords_STE_LANG_ASN1 \
    STE_LexerWords STE_LexerWords_STE_LANG_ASN1[]       = { { 1, STE_WordList1_STE_LANG_ASN1 }, \
                                                            { 1, STE_WordList2_STE_LANG_ASN1 }, \
                                                            { 1, STE_WordList3_STE_LANG_ASN1 }, \
                                                            { 1, STE_WordList4_STE_LANG_ASN1 } };

#define STE_LexerWords_STE_LANG_VHDL_COUNT 6
#define DefSTE_LexerWords_STE_LANG_VHDL \
    STE_LexerWords STE_LexerWords_STE_LANG_VHDL[]       = { { 1, STE_WordList1_STE_LANG_VHDL }, \
                                                            { 1, STE_WordList2_STE_LANG_VHDL }, \
                                                            { 1, STE_WordList3_STE_LANG_VHDL }, \
                                                            { 1, STE_WordList4_STE_LANG_VHDL }, \
                                                            { 1, STE_WordList5_STE_LANG_VHDL }, \
                                                            { 1, STE_WordList6_STE_LANG_VHDL } };

#define STE_LexerWords_STE_LANG_JAVA_COUNT 1
#define DefSTE_LexerWords_STE_LANG_JAVA \
    STE_LexerWords STE_LexerWords_STE_LANG_JAVA[]       = { { 1, STE_WordList1_STE_LANG_JAVA } };

#define STE_LexerWords_STE_LANG_JAVASCRIPT_COUNT 1
#define DefSTE_LexerWords_STE_LANG_JAVASCRIPT \
    STE_LexerWords STE_LexerWords_STE_LANG_JAVASCRIPT[] = { { 1, STE_WordList1_STE_LANG_JAVASCRIPT } };

#define STE_LexerWords_STE_LANG_RC_COUNT 1
#define DefSTE_LexerWords_STE_LANG_RC \
    STE_LexerWords STE_LexerWords_STE_LANG_RC[]         = { { 1, STE_WordList1_STE_LANG_RC } };

#define STE_LexerWords_STE_LANG_CS_COUNT 1
#define DefSTE_LexerWords_STE_LANG_CS \
    STE_LexerWords STE_LexerWords_STE_LANG_CS[]         = { { 1, STE_WordList1_STE_LANG_CS } };

#define STE_LexerWords_STE_LANG_D_COUNT 1
#define DefSTE_LexerWords_STE_LANG_D \
    STE_LexerWords STE_LexerWords_STE_LANG_D[]          = { { 1, STE_WordList1_STE_LANG_D } };

#define STE_LexerWords_STE_LANG_IDL_COUNT 1
#define DefSTE_LexerWords_STE_LANG_IDL \
    STE_LexerWords STE_LexerWords_STE_LANG_IDL[]        = { { 1, STE_WordList1_STE_LANG_IDL } };

#define STE_LexerWords_STE_LANG_PLSQL_COUNT 1
#define DefSTE_LexerWords_STE_LANG_PLSQL \
    STE_LexerWords STE_LexerWords_STE_LANG_PLSQL[]      = { { 1, STE_WordList1_STE_LANG_PLSQL } };

// ---------------------------------------------------------------------------
// Human readable names for the languages
#define STE_LexerName_STE_LANG_CONTAINER  "Container"
#define STE_LexerName_STE_LANG_NULL       "Text"
#define STE_LexerName_STE_LANG_PYTHON     "Python"
#define STE_LexerName_STE_LANG_CPP        "C/C++"
#define STE_LexerName_STE_LANG_HTML       "HTML"
#define STE_LexerName_STE_LANG_XML        "XML"
#define STE_LexerName_STE_LANG_PERL       "Perl"
#define STE_LexerName_STE_LANG_SQL        "SQL"
#define STE_LexerName_STE_LANG_VB         "Visual Basic"
#define STE_LexerName_STE_LANG_PROPERTIES "Properties"
#define STE_LexerName_STE_LANG_ERRORLIST  "ErrorList"
#define STE_LexerName_STE_LANG_MAKEFILE   "Makefile"
#define STE_LexerName_STE_LANG_BATCH      "Batch"
#define STE_LexerName_STE_LANG_XCODE      "XCode"
#define STE_LexerName_STE_LANG_LATEX      "LaTex"
#define STE_LexerName_STE_LANG_LUA        "Lua"
#define STE_LexerName_STE_LANG_DIFF       "Diff"
#define STE_LexerName_STE_LANG_CONF       "Conf"
#define STE_LexerName_STE_LANG_PASCAL     "Pascal"
#define STE_LexerName_STE_LANG_AVE        "Avenue"
#define STE_LexerName_STE_LANG_ADA        "Ada"
#define STE_LexerName_STE_LANG_LISP       "Lisp"
#define STE_LexerName_STE_LANG_RUBY       "Ruby"
#define STE_LexerName_STE_LANG_EIFFEL     "Eiffel"
#define STE_LexerName_STE_LANG_EIFFELKW   "EiffelKW"
#define STE_LexerName_STE_LANG_TCL        "TCL"
#define STE_LexerName_STE_LANG_NNCRONTAB  "NNCronTab"
#define STE_LexerName_STE_LANG_BULLANT    "Bullant"
#define STE_LexerName_STE_LANG_VBSCRIPT   "VB Script"
#define STE_LexerName_STE_LANG_ASP        "Active Server Pages (ASP)"
#define STE_LexerName_STE_LANG_PHP        "PHP"
#define STE_LexerName_STE_LANG_BAAN       "Baan"
#define STE_LexerName_STE_LANG_MATLAB     "Matlab"
#define STE_LexerName_STE_LANG_SCRIPTOL   "Scriptol"
#define STE_LexerName_STE_LANG_ASM        "Asm"
#define STE_LexerName_STE_LANG_CPPNOCASE  "C/C++ nocase"
#define STE_LexerName_STE_LANG_FORTRAN    "Fortran"
#define STE_LexerName_STE_LANG_F77        "Fortran 77"
#define STE_LexerName_STE_LANG_CSS        "Cascade Style Sheet (CSS)"
#define STE_LexerName_STE_LANG_POV        "PovRay"
#define STE_LexerName_STE_LANG_LOUT       "Lout"
#define STE_LexerName_STE_LANG_ESCRIPT    "EScript"
#define STE_LexerName_STE_LANG_PS         "PostScript"
#define STE_LexerName_STE_LANG_NSIS       "NSIS"
#define STE_LexerName_STE_LANG_MMIXAL     "MMixal"
#define STE_LexerName_STE_LANG_CLW        "CLW"
#define STE_LexerName_STE_LANG_CLWNOCASE  "CLW nocase"
#define STE_LexerName_STE_LANG_LOT        "Lot"
#define STE_LexerName_STE_LANG_YAML       "YAML"
#define STE_LexerName_STE_LANG_TEX        "Tex"
#define STE_LexerName_STE_LANG_METAPOST   "Metapost"
#define STE_LexerName_STE_LANG_POWERBASIC "PowerBasic"
#define STE_LexerName_STE_LANG_FORTH      "Forth"
#define STE_LexerName_STE_LANG_ERLANG     "Erlang"
#define STE_LexerName_STE_LANG_OCTAVE     "Octave"
#define STE_LexerName_STE_LANG_MSSQL      "MSSQL"
#define STE_LexerName_STE_LANG_VERILOG    "Verilog"
#define STE_LexerName_STE_LANG_KIX        "KIX"
#define STE_LexerName_STE_LANG_GUI4CLI    "Gui3Cli"
#define STE_LexerName_STE_LANG_SPECMAN    "Specman"
#define STE_LexerName_STE_LANG_AU3        "AU3"
#define STE_LexerName_STE_LANG_APDL       "APDL"
#define STE_LexerName_STE_LANG_BASH       "BASH"
#define STE_LexerName_STE_LANG_ASN1       "ASN1"
#define STE_LexerName_STE_LANG_VHDL       "VHDL"
#define STE_LexerName_STE_LANG_JAVA       "Java"
#define STE_LexerName_STE_LANG_JAVASCRIPT "JavaScript"
#define STE_LexerName_STE_LANG_RC         "RC"
#define STE_LexerName_STE_LANG_CS         "CS"
#define STE_LexerName_STE_LANG_D          "D"
#define STE_LexerName_STE_LANG_IDL        "IDL"
#define STE_LexerName_STE_LANG_PLSQL      "PL-SQL"

// ---------------------------------------------------------------------------
// Mapping between languages and scintilla's lexers
#define STE_LexerLang_STE_LANG_CONTAINER  wxSTC_LEX_CONTAINER
#define STE_LexerLang_STE_LANG_NULL       wxSTC_LEX_NULL
#define STE_LexerLang_STE_LANG_PYTHON     wxSTC_LEX_PYTHON
#define STE_LexerLang_STE_LANG_CPP        wxSTC_LEX_CPP
#define STE_LexerLang_STE_LANG_HTML       wxSTC_LEX_HTML
#define STE_LexerLang_STE_LANG_XML        wxSTC_LEX_XML
#define STE_LexerLang_STE_LANG_PERL       wxSTC_LEX_PERL
#define STE_LexerLang_STE_LANG_SQL        wxSTC_LEX_SQL
#define STE_LexerLang_STE_LANG_VB         wxSTC_LEX_VB
#define STE_LexerLang_STE_LANG_PROPERTIES wxSTC_LEX_PROPERTIES
#define STE_LexerLang_STE_LANG_ERRORLIST  wxSTC_LEX_ERRORLIST
#define STE_LexerLang_STE_LANG_MAKEFILE   wxSTC_LEX_MAKEFILE
#define STE_LexerLang_STE_LANG_BATCH      wxSTC_LEX_BATCH
#define STE_LexerLang_STE_LANG_XCODE      wxSTC_LEX_XCODE
#define STE_LexerLang_STE_LANG_LATEX      wxSTC_LEX_LATEX
#define STE_LexerLang_STE_LANG_LUA        wxSTC_LEX_LUA
#define STE_LexerLang_STE_LANG_DIFF       wxSTC_LEX_DIFF
#define STE_LexerLang_STE_LANG_CONF       wxSTC_LEX_CONF
#define STE_LexerLang_STE_LANG_PASCAL     wxSTC_LEX_PASCAL
#define STE_LexerLang_STE_LANG_AVE        wxSTC_LEX_AVE
#define STE_LexerLang_STE_LANG_ADA        wxSTC_LEX_ADA
#define STE_LexerLang_STE_LANG_LISP       wxSTC_LEX_LISP
#define STE_LexerLang_STE_LANG_RUBY       wxSTC_LEX_RUBY
#define STE_LexerLang_STE_LANG_EIFFEL     wxSTC_LEX_EIFFEL
#define STE_LexerLang_STE_LANG_EIFFELKW   wxSTC_LEX_EIFFELKW
#define STE_LexerLang_STE_LANG_TCL        wxSTC_LEX_TCL
#define STE_LexerLang_STE_LANG_NNCRONTAB  wxSTC_LEX_NNCRONTAB
#define STE_LexerLang_STE_LANG_BULLANT    wxSTC_LEX_BULLANT
#define STE_LexerLang_STE_LANG_VBSCRIPT   wxSTC_LEX_VBSCRIPT
#define STE_LexerLang_STE_LANG_ASP        wxSTC_LEX_ASP
#define STE_LexerLang_STE_LANG_PHP        wxSTC_LEX_PHP
#define STE_LexerLang_STE_LANG_BAAN       wxSTC_LEX_BAAN
#define STE_LexerLang_STE_LANG_MATLAB     wxSTC_LEX_MATLAB
#define STE_LexerLang_STE_LANG_SCRIPTOL   wxSTC_LEX_SCRIPTOL
#define STE_LexerLang_STE_LANG_ASM        wxSTC_LEX_ASM
#define STE_LexerLang_STE_LANG_CPPNOCASE  wxSTC_LEX_CPPNOCASE
#define STE_LexerLang_STE_LANG_FORTRAN    wxSTC_LEX_FORTRAN
#define STE_LexerLang_STE_LANG_F77        wxSTC_LEX_F77
#define STE_LexerLang_STE_LANG_CSS        wxSTC_LEX_CSS
#define STE_LexerLang_STE_LANG_POV        wxSTC_LEX_POV
#define STE_LexerLang_STE_LANG_LOUT       wxSTC_LEX_LOUT
#define STE_LexerLang_STE_LANG_ESCRIPT    wxSTC_LEX_ESCRIPT
#define STE_LexerLang_STE_LANG_PS         wxSTC_LEX_PS
#define STE_LexerLang_STE_LANG_NSIS       wxSTC_LEX_NSIS
#define STE_LexerLang_STE_LANG_MMIXAL     wxSTC_LEX_MMIXAL
#define STE_LexerLang_STE_LANG_CLW        wxSTC_LEX_CLW
#define STE_LexerLang_STE_LANG_CLWNOCASE  wxSTC_LEX_CLWNOCASE
#define STE_LexerLang_STE_LANG_LOT        wxSTC_LEX_LOT
#define STE_LexerLang_STE_LANG_YAML       wxSTC_LEX_YAML
#define STE_LexerLang_STE_LANG_TEX        wxSTC_LEX_TEX
#define STE_LexerLang_STE_LANG_METAPOST   wxSTC_LEX_METAPOST
#define STE_LexerLang_STE_LANG_POWERBASIC wxSTC_LEX_POWERBASIC
#define STE_LexerLang_STE_LANG_FORTH      wxSTC_LEX_FORTH
#define STE_LexerLang_STE_LANG_ERLANG     wxSTC_LEX_ERLANG
#define STE_LexerLang_STE_LANG_OCTAVE     wxSTC_LEX_OCTAVE
#define STE_LexerLang_STE_LANG_MSSQL      wxSTC_LEX_MSSQL
#define STE_LexerLang_STE_LANG_VERILOG    wxSTC_LEX_VERILOG
#define STE_LexerLang_STE_LANG_KIX        wxSTC_LEX_KIX
#define STE_LexerLang_STE_LANG_GUI4CLI    wxSTC_LEX_GUI4CLI
#define STE_LexerLang_STE_LANG_SPECMAN    wxSTC_LEX_SPECMAN
#define STE_LexerLang_STE_LANG_AU3        wxSTC_LEX_AU3
#define STE_LexerLang_STE_LANG_APDL       wxSTC_LEX_APDL
#define STE_LexerLang_STE_LANG_BASH       wxSTC_LEX_BASH
#define STE_LexerLang_STE_LANG_ASN1       wxSTC_LEX_ASN1
#define STE_LexerLang_STE_LANG_VHDL       wxSTC_LEX_VHDL
#define STE_LexerLang_STE_LANG_JAVA       wxSTC_LEX_CPP
#define STE_LexerLang_STE_LANG_JAVASCRIPT wxSTC_LEX_CPP
#define STE_LexerLang_STE_LANG_RC         wxSTC_LEX_CPP
#define STE_LexerLang_STE_LANG_CS         wxSTC_LEX_CPP
#define STE_LexerLang_STE_LANG_D          wxSTC_LEX_CPP
#define STE_LexerLang_STE_LANG_IDL        wxSTC_LEX_CPP
#define STE_LexerLang_STE_LANG_PLSQL      wxSTC_LEX_SQL

// ---------------------------------------------------------------------------
// Folds - FIXME probably remove this
#define STE_LexerFolds_STE_LANG_CONTAINER  0
#define STE_LexerFolds_STE_LANG_NULL       0
#define STE_LexerFolds_STE_LANG_PYTHON     0
#define STE_LexerFolds_STE_LANG_CPP        0
#define STE_LexerFolds_STE_LANG_HTML       0
#define STE_LexerFolds_STE_LANG_XML        0
#define STE_LexerFolds_STE_LANG_PERL       0
#define STE_LexerFolds_STE_LANG_SQL        0
#define STE_LexerFolds_STE_LANG_VB         0
#define STE_LexerFolds_STE_LANG_PROPERTIES 0
#define STE_LexerFolds_STE_LANG_ERRORLIST  0
#define STE_LexerFolds_STE_LANG_MAKEFILE   0
#define STE_LexerFolds_STE_LANG_BATCH      0
#define STE_LexerFolds_STE_LANG_XCODE      0
#define STE_LexerFolds_STE_LANG_LATEX      0
#define STE_LexerFolds_STE_LANG_LUA        0
#define STE_LexerFolds_STE_LANG_DIFF       0
#define STE_LexerFolds_STE_LANG_CONF       0
#define STE_LexerFolds_STE_LANG_PASCAL     0
#define STE_LexerFolds_STE_LANG_AVE        0
#define STE_LexerFolds_STE_LANG_ADA        0
#define STE_LexerFolds_STE_LANG_LISP       0
#define STE_LexerFolds_STE_LANG_RUBY       0
#define STE_LexerFolds_STE_LANG_EIFFEL     0
#define STE_LexerFolds_STE_LANG_EIFFELKW   0
#define STE_LexerFolds_STE_LANG_TCL        0
#define STE_LexerFolds_STE_LANG_NNCRONTAB  0
#define STE_LexerFolds_STE_LANG_BULLANT    0
#define STE_LexerFolds_STE_LANG_VBSCRIPT   0
#define STE_LexerFolds_STE_LANG_ASP        0
#define STE_LexerFolds_STE_LANG_PHP        0
#define STE_LexerFolds_STE_LANG_BAAN       0
#define STE_LexerFolds_STE_LANG_MATLAB     0
#define STE_LexerFolds_STE_LANG_SCRIPTOL   0
#define STE_LexerFolds_STE_LANG_ASM        0
#define STE_LexerFolds_STE_LANG_CPPNOCASE  0
#define STE_LexerFolds_STE_LANG_FORTRAN    0
#define STE_LexerFolds_STE_LANG_F77        0
#define STE_LexerFolds_STE_LANG_CSS        0
#define STE_LexerFolds_STE_LANG_POV        0
#define STE_LexerFolds_STE_LANG_LOUT       0
#define STE_LexerFolds_STE_LANG_ESCRIPT    0
#define STE_LexerFolds_STE_LANG_PS         0
#define STE_LexerFolds_STE_LANG_NSIS       0
#define STE_LexerFolds_STE_LANG_MMIXAL     0
#define STE_LexerFolds_STE_LANG_CLW        0
#define STE_LexerFolds_STE_LANG_CLWNOCASE  0
#define STE_LexerFolds_STE_LANG_LOT        0
#define STE_LexerFolds_STE_LANG_YAML       0
#define STE_LexerFolds_STE_LANG_TEX        0
#define STE_LexerFolds_STE_LANG_METAPOST   0
#define STE_LexerFolds_STE_LANG_POWERBASIC 0
#define STE_LexerFolds_STE_LANG_FORTH      0
#define STE_LexerFolds_STE_LANG_ERLANG     0
#define STE_LexerFolds_STE_LANG_OCTAVE     0
#define STE_LexerFolds_STE_LANG_MSSQL      0
#define STE_LexerFolds_STE_LANG_VERILOG    0
#define STE_LexerFolds_STE_LANG_KIX        0
#define STE_LexerFolds_STE_LANG_GUI4CLI    0
#define STE_LexerFolds_STE_LANG_SPECMAN    0
#define STE_LexerFolds_STE_LANG_AU3        0
#define STE_LexerFolds_STE_LANG_APDL       0
#define STE_LexerFolds_STE_LANG_BASH       0
#define STE_LexerFolds_STE_LANG_ASN1       0
#define STE_LexerFolds_STE_LANG_VHDL       0
#define STE_LexerFolds_STE_LANG_JAVA       0
#define STE_LexerFolds_STE_LANG_JAVASCRIPT 0
#define STE_LexerFolds_STE_LANG_RC         0
#define STE_LexerFolds_STE_LANG_CS         0
#define STE_LexerFolds_STE_LANG_D          0
#define STE_LexerFolds_STE_LANG_IDL        0
#define STE_LexerFolds_STE_LANG_PLSQL      0

// ---------------------------------------------------------------------------
// Extra user flags
#define STE_LexerFlags_STE_LANG_CONTAINER  0
#define STE_LexerFlags_STE_LANG_NULL       0
#define STE_LexerFlags_STE_LANG_PYTHON     0
#define STE_LexerFlags_STE_LANG_CPP        0
#define STE_LexerFlags_STE_LANG_HTML       0
#define STE_LexerFlags_STE_LANG_XML        0
#define STE_LexerFlags_STE_LANG_PERL       0
#define STE_LexerFlags_STE_LANG_SQL        0
#define STE_LexerFlags_STE_LANG_VB         0
#define STE_LexerFlags_STE_LANG_PROPERTIES 0
#define STE_LexerFlags_STE_LANG_ERRORLIST  0
#define STE_LexerFlags_STE_LANG_MAKEFILE   0
#define STE_LexerFlags_STE_LANG_BATCH      0
#define STE_LexerFlags_STE_LANG_XCODE      0
#define STE_LexerFlags_STE_LANG_LATEX      0
#define STE_LexerFlags_STE_LANG_LUA        0
#define STE_LexerFlags_STE_LANG_DIFF       0
#define STE_LexerFlags_STE_LANG_CONF       0
#define STE_LexerFlags_STE_LANG_PASCAL     0
#define STE_LexerFlags_STE_LANG_AVE        0
#define STE_LexerFlags_STE_LANG_ADA        0
#define STE_LexerFlags_STE_LANG_LISP       0
#define STE_LexerFlags_STE_LANG_RUBY       0
#define STE_LexerFlags_STE_LANG_EIFFEL     0
#define STE_LexerFlags_STE_LANG_EIFFELKW   0
#define STE_LexerFlags_STE_LANG_TCL        0
#define STE_LexerFlags_STE_LANG_NNCRONTAB  0
#define STE_LexerFlags_STE_LANG_BULLANT    0
#define STE_LexerFlags_STE_LANG_VBSCRIPT   0
#define STE_LexerFlags_STE_LANG_ASP        0
#define STE_LexerFlags_STE_LANG_PHP        0
#define STE_LexerFlags_STE_LANG_BAAN       0
#define STE_LexerFlags_STE_LANG_MATLAB     0
#define STE_LexerFlags_STE_LANG_SCRIPTOL   0
#define STE_LexerFlags_STE_LANG_ASM        0
#define STE_LexerFlags_STE_LANG_CPPNOCASE  0
#define STE_LexerFlags_STE_LANG_FORTRAN    0
#define STE_LexerFlags_STE_LANG_F77        0
#define STE_LexerFlags_STE_LANG_CSS        0
#define STE_LexerFlags_STE_LANG_POV        0
#define STE_LexerFlags_STE_LANG_LOUT       0
#define STE_LexerFlags_STE_LANG_ESCRIPT    0
#define STE_LexerFlags_STE_LANG_PS         0
#define STE_LexerFlags_STE_LANG_NSIS       0
#define STE_LexerFlags_STE_LANG_MMIXAL     0
#define STE_LexerFlags_STE_LANG_CLW        0
#define STE_LexerFlags_STE_LANG_CLWNOCASE  0
#define STE_LexerFlags_STE_LANG_LOT        0
#define STE_LexerFlags_STE_LANG_YAML       0
#define STE_LexerFlags_STE_LANG_TEX        0
#define STE_LexerFlags_STE_LANG_METAPOST   0
#define STE_LexerFlags_STE_LANG_POWERBASIC 0
#define STE_LexerFlags_STE_LANG_FORTH      0
#define STE_LexerFlags_STE_LANG_ERLANG     0
#define STE_LexerFlags_STE_LANG_OCTAVE     0
#define STE_LexerFlags_STE_LANG_MSSQL      0
#define STE_LexerFlags_STE_LANG_VERILOG    0
#define STE_LexerFlags_STE_LANG_KIX        0
#define STE_LexerFlags_STE_LANG_GUI4CLI    0
#define STE_LexerFlags_STE_LANG_SPECMAN    0
#define STE_LexerFlags_STE_LANG_AU3        0
#define STE_LexerFlags_STE_LANG_APDL       0
#define STE_LexerFlags_STE_LANG_BASH       0
#define STE_LexerFlags_STE_LANG_ASN1       0
#define STE_LexerFlags_STE_LANG_VHDL       0
#define STE_LexerFlags_STE_LANG_JAVA       0
#define STE_LexerFlags_STE_LANG_JAVASCRIPT 0
#define STE_LexerFlags_STE_LANG_RC         0
#define STE_LexerFlags_STE_LANG_CS         0
#define STE_LexerFlags_STE_LANG_D          0
#define STE_LexerFlags_STE_LANG_IDL        0
#define STE_LexerFlags_STE_LANG_PLSQL      0

// ---------------------------------------------------------------------------
// The file filters used to load the languages (Not used generated from file patterns)
#define STE_LexerFilters_STE_LANG_CONTAINER  ""
#define STE_LexerFilters_STE_LANG_NULL       "Text (txt log lst doc diz nfo)|*.txt;*.log;*.lst;*.doc;*.diz;*.nfo;make*|"
#define STE_LexerFilters_STE_LANG_PYTHON     "Python (py pyw)|*.py;*.pyw|"
#define STE_LexerFilters_STE_LANG_CPP        "C/C++ (c cc cpp cxx cs h hh hxx hpp dlg rc rc2 mak)|*.c;*.cc;*.cpp;*.cxx;*.cs;*.h;*.hh;*.hpp;*.hxx;*.sma;*.rc;*.rc2;*.dl;*.mak;make*|"
#define STE_LexerFilters_STE_LANG_HTML       ""
#define STE_LexerFilters_STE_LANG_XML        ""
#define STE_LexerFilters_STE_LANG_PERL       "Perl (pl pm)|*.pl;*.pm;*.cgi;*.pod|"
#define STE_LexerFilters_STE_LANG_SQL        "SQL (sql)|*.sql|"
#define STE_LexerFilters_STE_LANG_VB         "VB (vb vbp vbs bas frm cls ctl pag dsr dob)|*.vb;*.bas;*.frm;*.cls;*.ctl;*.pag;*.dsr;*.dob;*.vbs;*.dsm;*.vbp;*.vbg;*.mak;*.vbw|"
#define STE_LexerFilters_STE_LANG_PROPERTIES ""
#define STE_LexerFilters_STE_LANG_ERRORLIST  ""
#define STE_LexerFilters_STE_LANG_MAKEFILE   "Makefiles|makefile;Makefile;*.mak;configure*|"
#define STE_LexerFilters_STE_LANG_BATCH      "Batch (bat cmd nt)|*.bat;*.cmd;*.nt|"
#define STE_LexerFilters_STE_LANG_XCODE      ""
#define STE_LexerFilters_STE_LANG_LATEX      "LaTeX (tex sty)|*.tex;*.sty;*.aux;*.toc;*.idx;|"
#define STE_LexerFilters_STE_LANG_LUA        "Lua (lua)|*.lua|"
#define STE_LexerFilters_STE_LANG_DIFF       "Difference (diff patch)|*.diff;*.patch|"
#define STE_LexerFilters_STE_LANG_CONF       "Apache Conf (conf)|*.conf;.htaccess|"
#define STE_LexerFilters_STE_LANG_PASCAL     "Pascal (dpr dpk pas dfm inc)|*.dpr;*.dpk;*.pas;*.dfm;*.inc;*.pp|"
#define STE_LexerFilters_STE_LANG_AVE        "AVE (ave)|*.ave|"
#define STE_LexerFilters_STE_LANG_ADA        "Ada (ads adb)|*.ads;*.adb|"
#define STE_LexerFilters_STE_LANG_LISP       "LISP (lsp lisp)|*.lsp;*.lisp|"
#define STE_LexerFilters_STE_LANG_RUBY       "Ruby (rb rbw)|*.rb;*.rbw|"
#define STE_LexerFilters_STE_LANG_EIFFEL     "Eiffel (e)|*.e|"
#define STE_LexerFilters_STE_LANG_EIFFELKW   "EiffelKW (e)|*.e|"
#define STE_LexerFilters_STE_LANG_TCL        "Tcl (tcl)|*.tcl| '|' itcl (.itcl)|*.itcl|"
#define STE_LexerFilters_STE_LANG_NNCRONTAB  "nnCron files (tab spf)|*.tab;*.spf|"
#define STE_LexerFilters_STE_LANG_BULLANT    "Bullant (.ant)|*.ant|"
#define STE_LexerFilters_STE_LANG_VBSCRIPT   "VB Script (vbs;dsm)|*.vbs;*.dsm|"
#define STE_LexerFilters_STE_LANG_ASP        "Active Server Pages (ASP) (asp)|*.asp"
#define STE_LexerFilters_STE_LANG_PHP        "PHP (php php3 phtml)|*.php3;*.phtml;*.php|"
#define STE_LexerFilters_STE_LANG_BAAN       "Baan (baan)|*.bc;*.cln|"
#define STE_LexerFilters_STE_LANG_MATLAB     "Matlab (m)|*.m.matlab|"
#define STE_LexerFilters_STE_LANG_SCRIPTOL   "Scriptol (sol)|*.sol|"
#define STE_LexerFilters_STE_LANG_ASM        "Assembler (asm)|*.asm|"
#define STE_LexerFilters_STE_LANG_CPPNOCASE  ""
#define STE_LexerFilters_STE_LANG_FORTRAN    "Fortran (f for f90 f95 f2k)|*.f;*.for;*.f90;*.f95;*.f2k|"
#define STE_LexerFilters_STE_LANG_F77        ""
#define STE_LexerFilters_STE_LANG_CSS        "CSS (css)|*.css|"
#define STE_LexerFilters_STE_LANG_POV        "POV-Ray SDL (pov)|*.pov;*.inc|"
#define STE_LexerFilters_STE_LANG_LOUT       "Lout (lt)|*.lt|"
#define STE_LexerFilters_STE_LANG_ESCRIPT    "E-Script (src em)|*.src;*.em|"
#define STE_LexerFilters_STE_LANG_PS         "PS (PostScript)|*.ps|"
#define STE_LexerFilters_STE_LANG_NSIS       "NSIS (nsi nsh)|*.nsi;*.nsh|"
#define STE_LexerFilters_STE_LANG_MMIXAL     "MMIXAL (mms)|*.mms|"
#define STE_LexerFilters_STE_LANG_CLW        ""
#define STE_LexerFilters_STE_LANG_CLWNOCASE  ""
#define STE_LexerFilters_STE_LANG_LOT        "Lot (lot)|*.lot|"
#define STE_LexerFilters_STE_LANG_YAML       "YAML (yaml)|*.yaml;*.yml|"
#define STE_LexerFilters_STE_LANG_TEX        ""
#define STE_LexerFilters_STE_LANG_METAPOST   "MetaPost|*.mp;*.mpx;|"
#define STE_LexerFilters_STE_LANG_POWERBASIC ""
#define STE_LexerFilters_STE_LANG_FORTH      "Forth files (f spf)|*.forth|"
#define STE_LexerFilters_STE_LANG_ERLANG     ""
#define STE_LexerFilters_STE_LANG_OCTAVE     "Octave (m)|*.m.octave|"
#define STE_LexerFilters_STE_LANG_MSSQL      ""
#define STE_LexerFilters_STE_LANG_VERILOG    ""
#define STE_LexerFilters_STE_LANG_KIX        "Kix-Script (kix)|*.kix|"
#define STE_LexerFilters_STE_LANG_GUI4CLI    ""
#define STE_LexerFilters_STE_LANG_SPECMAN    "Specman (e)|*.e|"
#define STE_LexerFilters_STE_LANG_AU3        "AutoIt (au3)|*.au3|"
#define STE_LexerFilters_STE_LANG_APDL       ""
#define STE_LexerFilters_STE_LANG_BASH       "Bash (sh bsh)|*.sh;*.bsh;configure|"
#define STE_LexerFilters_STE_LANG_ASN1       "ASN.1 (asn1)|*.mib|"
#define STE_LexerFilters_STE_LANG_VHDL       "VHDL (vhd vhdl)|*.vhd;*.vhdl|"
#define STE_LexerFilters_STE_LANG_JAVA       "Java (java)|*.java|"
#define STE_LexerFilters_STE_LANG_JAVASCRIPT "JavaScript (js)|*.js|"
#define STE_LexerFilters_STE_LANG_RC         ""
#define STE_LexerFilters_STE_LANG_CS         ""
#define STE_LexerFilters_STE_LANG_D          ""
#define STE_LexerFilters_STE_LANG_IDL        "IDL (idl odl)|*.idl;*.odl|"
#define STE_LexerFilters_STE_LANG_PLSQL      ""

// ---------------------------------------------------------------------------
// The file patterns to determine what language a file is
#define STE_LexerFilePatterns_STE_LANG_CONTAINER  ""
#define STE_LexerFilePatterns_STE_LANG_NULL       "*.txt;*.log;*.lst;*.doc;*.diz;*.nfo"
#define STE_LexerFilePatterns_STE_LANG_PYTHON     "*.py;*.pyw"
#define STE_LexerFilePatterns_STE_LANG_CPP        "*.c;*.cc;*.cpp;*.cxx;*.h;*.hh;*.hpp;*.hxx;*.sma"
#define STE_LexerFilePatterns_STE_LANG_HTML       "*.html;*.htm;*.asp;*.shtml;*.htd;*.jsp;*.php3;*.phtml;*.php;*.htt;*.cfm;*.tpl;*.dtd;*.hta"
#define STE_LexerFilePatterns_STE_LANG_XML        "*.vxml;*.xml;*.xsl;*.svg;*.xul;*.xsd;*.dtd;*.xslt;*.axl;*.xrc;*.rdf"
#define STE_LexerFilePatterns_STE_LANG_PERL       "*.pl;*.pm;*.cgi;*.pod"
#define STE_LexerFilePatterns_STE_LANG_SQL        "*.sql"
#define STE_LexerFilePatterns_STE_LANG_VB         "*.vb;*.bas;*.frm;*.cls;*.ctl;*.pag;*.dsr;*.dob"
#define STE_LexerFilePatterns_STE_LANG_PROPERTIES "*.properties;*.ini;*.inf;*.reg;*.url;*.cfg;*.cnf;*.aut"
#define STE_LexerFilePatterns_STE_LANG_ERRORLIST  ""
#define STE_LexerFilePatterns_STE_LANG_MAKEFILE   "Makefile;makefile.*,configure.*;*.mak"
#define STE_LexerFilePatterns_STE_LANG_BATCH      "*.bat;*.cmd;*.nt"
#define STE_LexerFilePatterns_STE_LANG_XCODE      ""
#define STE_LexerFilePatterns_STE_LANG_LATEX      "*.tex;*.sty;*.aux;*.toc;*.idx;"
#define STE_LexerFilePatterns_STE_LANG_LUA        "*.lua"
#define STE_LexerFilePatterns_STE_LANG_DIFF       "*.diff;*.patch"
#define STE_LexerFilePatterns_STE_LANG_CONF       "*.conf;.htaccess"
#define STE_LexerFilePatterns_STE_LANG_PASCAL     "*.dpr;*.dpk;*.pas;*.dfm;*.inc;*.pp"
#define STE_LexerFilePatterns_STE_LANG_AVE        "*.ave"
#define STE_LexerFilePatterns_STE_LANG_ADA        "*.ads;*.adb"
#define STE_LexerFilePatterns_STE_LANG_LISP       "*.lsp;*.lisp"
#define STE_LexerFilePatterns_STE_LANG_RUBY       "*.rb;*.rbw"
#define STE_LexerFilePatterns_STE_LANG_EIFFEL     "*.e"
#define STE_LexerFilePatterns_STE_LANG_EIFFELKW   "*.e"
#define STE_LexerFilePatterns_STE_LANG_TCL        "*.tcl"
#define STE_LexerFilePatterns_STE_LANG_NNCRONTAB  "*.tab;*.spf"
#define STE_LexerFilePatterns_STE_LANG_BULLANT    "*.ant"
#define STE_LexerFilePatterns_STE_LANG_VBSCRIPT   "*.vbs;*.dsm"
#define STE_LexerFilePatterns_STE_LANG_ASP        "*.asp"
#define STE_LexerFilePatterns_STE_LANG_PHP        "*.php3;*.phtml;*.php"
#define STE_LexerFilePatterns_STE_LANG_BAAN       "*.bc;*.cln"
#define STE_LexerFilePatterns_STE_LANG_MATLAB     "*.m;*.matlab"
#define STE_LexerFilePatterns_STE_LANG_SCRIPTOL   "*.sol"
#define STE_LexerFilePatterns_STE_LANG_ASM        "*.asm"
#define STE_LexerFilePatterns_STE_LANG_CPPNOCASE  ""
#define STE_LexerFilePatterns_STE_LANG_FORTRAN    "*.f90;*.f95;*.f2k;*.f;*.for"
#define STE_LexerFilePatterns_STE_LANG_F77        "*.f;*.for"
#define STE_LexerFilePatterns_STE_LANG_CSS        "*.css"
#define STE_LexerFilePatterns_STE_LANG_POV        "*.pov;*.inc"
#define STE_LexerFilePatterns_STE_LANG_LOUT       "*.lt"
#define STE_LexerFilePatterns_STE_LANG_ESCRIPT    "*.src;*.em"
#define STE_LexerFilePatterns_STE_LANG_PS         "*.ps"
#define STE_LexerFilePatterns_STE_LANG_NSIS       "*.nsi;*.nsh"
#define STE_LexerFilePatterns_STE_LANG_MMIXAL     "*.mms"
#define STE_LexerFilePatterns_STE_LANG_CLW        ""
#define STE_LexerFilePatterns_STE_LANG_CLWNOCASE  ""
#define STE_LexerFilePatterns_STE_LANG_LOT        "*.lot"
#define STE_LexerFilePatterns_STE_LANG_YAML       "*.yaml;*.yml"
#define STE_LexerFilePatterns_STE_LANG_TEX        "*.tex;*.sty;"
#define STE_LexerFilePatterns_STE_LANG_METAPOST   "*.mp;*.mpx;"
#define STE_LexerFilePatterns_STE_LANG_POWERBASIC ""
#define STE_LexerFilePatterns_STE_LANG_FORTH      "*.forth"
#define STE_LexerFilePatterns_STE_LANG_ERLANG     ""
#define STE_LexerFilePatterns_STE_LANG_OCTAVE     "*.m;*.octave"
#define STE_LexerFilePatterns_STE_LANG_MSSQL      ""
#define STE_LexerFilePatterns_STE_LANG_VERILOG    ""
#define STE_LexerFilePatterns_STE_LANG_KIX        "*.kix"
#define STE_LexerFilePatterns_STE_LANG_GUI4CLI    ""
#define STE_LexerFilePatterns_STE_LANG_SPECMAN    "*.e"
#define STE_LexerFilePatterns_STE_LANG_AU3        "*.au3"
#define STE_LexerFilePatterns_STE_LANG_APDL       ""
#define STE_LexerFilePatterns_STE_LANG_BASH       "*.sh;*.bsh;configure"
#define STE_LexerFilePatterns_STE_LANG_ASN1       "*.mib"
#define STE_LexerFilePatterns_STE_LANG_VHDL       "*.vhd;*.vhdl"
#define STE_LexerFilePatterns_STE_LANG_JAVA       "*.java;*.class"
#define STE_LexerFilePatterns_STE_LANG_JAVASCRIPT "*.js"
#define STE_LexerFilePatterns_STE_LANG_RC         "*.rc;*.rc2;*.dl"
#define STE_LexerFilePatterns_STE_LANG_CS         "*.cs"
#define STE_LexerFilePatterns_STE_LANG_D          "*.d"
#define STE_LexerFilePatterns_STE_LANG_IDL        "*.idl;*.odl"
#define STE_LexerFilePatterns_STE_LANG_PLSQL      "*.spec;*.body;*.sps;*.spb;*.sf;*.sp"

// ---------------------------------------------------------------------------
// The Scintilla style used for the braces
#define STE_LexerBraces_STE_LANG_CONTAINER  0
#define STE_LexerBraces_STE_LANG_NULL       0
#define STE_LexerBraces_STE_LANG_PYTHON     10
#define STE_LexerBraces_STE_LANG_CPP        10
#define STE_LexerBraces_STE_LANG_HTML       0
#define STE_LexerBraces_STE_LANG_XML        31
#define STE_LexerBraces_STE_LANG_PERL       10
#define STE_LexerBraces_STE_LANG_SQL        10
#define STE_LexerBraces_STE_LANG_VB         0
#define STE_LexerBraces_STE_LANG_PROPERTIES 0
#define STE_LexerBraces_STE_LANG_ERRORLIST  0
#define STE_LexerBraces_STE_LANG_MAKEFILE   0
#define STE_LexerBraces_STE_LANG_BATCH      0
#define STE_LexerBraces_STE_LANG_XCODE      0
#define STE_LexerBraces_STE_LANG_LATEX      0
#define STE_LexerBraces_STE_LANG_LUA        10
#define STE_LexerBraces_STE_LANG_DIFF       0
#define STE_LexerBraces_STE_LANG_CONF       0
#define STE_LexerBraces_STE_LANG_PASCAL     10
#define STE_LexerBraces_STE_LANG_AVE        10
#define STE_LexerBraces_STE_LANG_ADA        4
#define STE_LexerBraces_STE_LANG_LISP       10
#define STE_LexerBraces_STE_LANG_RUBY       10
#define STE_LexerBraces_STE_LANG_EIFFEL     6
#define STE_LexerBraces_STE_LANG_EIFFELKW   6
#if defined(wxSTC_TCL_DEFAULT)
    #define STE_LexerBraces_STE_LANG_TCL        6
#else
    #define STE_LexerBraces_STE_LANG_TCL        10
#endif // defined(wxSTC_TCL_DEFAULT)
#define STE_LexerBraces_STE_LANG_NNCRONTAB  0
#define STE_LexerBraces_STE_LANG_BULLANT    0
#define STE_LexerBraces_STE_LANG_VBSCRIPT   0
#define STE_LexerBraces_STE_LANG_ASP        0
#define STE_LexerBraces_STE_LANG_PHP        0
#define STE_LexerBraces_STE_LANG_BAAN       10
#define STE_LexerBraces_STE_LANG_MATLAB     0
#define STE_LexerBraces_STE_LANG_SCRIPTOL   0
#define STE_LexerBraces_STE_LANG_ASM        0
#define STE_LexerBraces_STE_LANG_CPPNOCASE  0
#define STE_LexerBraces_STE_LANG_FORTRAN    0
#define STE_LexerBraces_STE_LANG_F77        0
#define STE_LexerBraces_STE_LANG_CSS        0
#define STE_LexerBraces_STE_LANG_POV        4
#define STE_LexerBraces_STE_LANG_LOUT       8
#define STE_LexerBraces_STE_LANG_ESCRIPT    0
#define STE_LexerBraces_STE_LANG_PS         11
#define STE_LexerBraces_STE_LANG_NSIS       0
#define STE_LexerBraces_STE_LANG_MMIXAL     0
#define STE_LexerBraces_STE_LANG_CLW        0
#define STE_LexerBraces_STE_LANG_CLWNOCASE  0
#define STE_LexerBraces_STE_LANG_LOT        0
#define STE_LexerBraces_STE_LANG_YAML       0
#define STE_LexerBraces_STE_LANG_TEX        0
#define STE_LexerBraces_STE_LANG_METAPOST   0
#define STE_LexerBraces_STE_LANG_POWERBASIC 0
#define STE_LexerBraces_STE_LANG_FORTH      0
#define STE_LexerBraces_STE_LANG_ERLANG     0
#define STE_LexerBraces_STE_LANG_OCTAVE     0
#define STE_LexerBraces_STE_LANG_MSSQL      0
#define STE_LexerBraces_STE_LANG_VERILOG    10
#define STE_LexerBraces_STE_LANG_KIX        0
#define STE_LexerBraces_STE_LANG_GUI4CLI    0
#define STE_LexerBraces_STE_LANG_SPECMAN    10
#define STE_LexerBraces_STE_LANG_AU3        0
#define STE_LexerBraces_STE_LANG_APDL       0
#define STE_LexerBraces_STE_LANG_BASH       7
#define STE_LexerBraces_STE_LANG_ASN1       0
#define STE_LexerBraces_STE_LANG_VHDL       10
#define STE_LexerBraces_STE_LANG_JAVA       0
#define STE_LexerBraces_STE_LANG_JAVASCRIPT 0
#define STE_LexerBraces_STE_LANG_RC         0
#define STE_LexerBraces_STE_LANG_CS         0
#define STE_LexerBraces_STE_LANG_D          0
#define STE_LexerBraces_STE_LANG_IDL        0
#define STE_LexerBraces_STE_LANG_PLSQL      0

// ---------------------------------------------------------------------------
// Symbols used for comments
#define DefSTE_LexerComments_STE_LANG_CONTAINER
#define DefSTE_LexerComments_STE_LANG_NULL
#define DefSTE_LexerComments_STE_LANG_PYTHON     STE_LexerComments _STE_LexerComments_STE_LANG_PYTHON     = { 0, "#", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_CPP        // java and others rely on this
    STE_LexerComments _STE_LexerComments_STE_LANG_CPP        = { 0, "//", "/*", "*", "*/", "/*", "*/" };
#define DefSTE_LexerComments_STE_LANG_HTML
#define DefSTE_LexerComments_STE_LANG_XML
#define DefSTE_LexerComments_STE_LANG_PERL       STE_LexerComments _STE_LexerComments_STE_LANG_PERL       = { 0, "#", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_SQL
#define DefSTE_LexerComments_STE_LANG_VB         STE_LexerComments _STE_LexerComments_STE_LANG_VB         = { 0, "'", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_PROPERTIES STE_LexerComments _STE_LexerComments_STE_LANG_PROPERTIES = { 0, "#", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_ERRORLIST
#define DefSTE_LexerComments_STE_LANG_MAKEFILE   STE_LexerComments _STE_LexerComments_STE_LANG_MAKEFILE   = { 0, "#", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_BATCH      STE_LexerComments _STE_LexerComments_STE_LANG_BATCH      = { 0, "REM ", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_XCODE
#define DefSTE_LexerComments_STE_LANG_LATEX
#define DefSTE_LexerComments_STE_LANG_LUA        STE_LexerComments _STE_LexerComments_STE_LANG_LUA        = { 1, "--", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_DIFF
#define DefSTE_LexerComments_STE_LANG_CONF
#define DefSTE_LexerComments_STE_LANG_PASCAL
#define DefSTE_LexerComments_STE_LANG_AVE        STE_LexerComments _STE_LexerComments_STE_LANG_AVE        = { 0, "'--", "'--", "'--", "'--", "", "" };
#define DefSTE_LexerComments_STE_LANG_ADA        STE_LexerComments _STE_LexerComments_STE_LANG_ADA        = { 0, "--", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_LISP       STE_LexerComments _STE_LexerComments_STE_LANG_LISP       = { 0, ";", ";;", ";;", ";;", "", "" };
#define DefSTE_LexerComments_STE_LANG_RUBY       STE_LexerComments _STE_LexerComments_STE_LANG_RUBY       = { 0, "#", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_EIFFEL
#define DefSTE_LexerComments_STE_LANG_EIFFELKW
#define DefSTE_LexerComments_STE_LANG_TCL        STE_LexerComments _STE_LexerComments_STE_LANG_TCL        = { 0, "#", "##", "#", "##", "", "" };
#define DefSTE_LexerComments_STE_LANG_NNCRONTAB  STE_LexerComments _STE_LexerComments_STE_LANG_NNCRONTAB  = { 0, "\\", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_BULLANT
#define DefSTE_LexerComments_STE_LANG_VBSCRIPT
#define DefSTE_LexerComments_STE_LANG_ASP
#define DefSTE_LexerComments_STE_LANG_PHP
#define DefSTE_LexerComments_STE_LANG_BAAN       STE_LexerComments _STE_LexerComments_STE_LANG_BAAN       = { 0, "|", "|", "|", "|", "DllUsage", "EndDllUsage" };
#define DefSTE_LexerComments_STE_LANG_MATLAB     STE_LexerComments _STE_LexerComments_STE_LANG_MATLAB     = { 0, "%", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_SCRIPTOL   STE_LexerComments _STE_LexerComments_STE_LANG_SCRIPTOL   = { 0, "`", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_ASM        STE_LexerComments _STE_LexerComments_STE_LANG_ASM        = { 0, ";", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_CPPNOCASE
#define DefSTE_LexerComments_STE_LANG_FORTRAN    STE_LexerComments _STE_LexerComments_STE_LANG_FORTRAN    = { 0, "!", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_F77
#define DefSTE_LexerComments_STE_LANG_CSS        STE_LexerComments _STE_LexerComments_STE_LANG_CSS        = { 0, "", "", "", "", "/*", "*/" };
#define DefSTE_LexerComments_STE_LANG_POV        STE_LexerComments _STE_LexerComments_STE_LANG_POV        = { 1, "//", "/*", "*", "*/", "/*", "*/" };
#define DefSTE_LexerComments_STE_LANG_LOUT       STE_LexerComments _STE_LexerComments_STE_LANG_LOUT       = { 0, "#", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_ESCRIPT
#define DefSTE_LexerComments_STE_LANG_PS         STE_LexerComments _STE_LexerComments_STE_LANG_PS         = { 0, "%", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_NSIS       STE_LexerComments _STE_LexerComments_STE_LANG_NSIS       = { 1, ";", "/*", ";", "*/", "/*", "*/" };
#define DefSTE_LexerComments_STE_LANG_MMIXAL     STE_LexerComments _STE_LexerComments_STE_LANG_MMIXAL     = { 0, "%", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_CLW
#define DefSTE_LexerComments_STE_LANG_CLWNOCASE
#define DefSTE_LexerComments_STE_LANG_LOT
#define DefSTE_LexerComments_STE_LANG_YAML       STE_LexerComments _STE_LexerComments_STE_LANG_YAML       = { 0, "#", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_TEX        STE_LexerComments _STE_LexerComments_STE_LANG_TEX        = { 1, "%", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_METAPOST   STE_LexerComments _STE_LexerComments_STE_LANG_METAPOST   = { 1, "%", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_POWERBASIC
#define DefSTE_LexerComments_STE_LANG_FORTH      STE_LexerComments _STE_LexerComments_STE_LANG_FORTH      = { 0, "\\", "\\", "\\", "\\", "(", ")" };
#define DefSTE_LexerComments_STE_LANG_ERLANG
#define DefSTE_LexerComments_STE_LANG_OCTAVE     STE_LexerComments _STE_LexerComments_STE_LANG_OCTAVE     = { 0, "#", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_MSSQL
#define DefSTE_LexerComments_STE_LANG_VERILOG
#define DefSTE_LexerComments_STE_LANG_KIX        STE_LexerComments _STE_LexerComments_STE_LANG_KIX        = { 1, ";", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_GUI4CLI
#define DefSTE_LexerComments_STE_LANG_SPECMAN    STE_LexerComments _STE_LexerComments_STE_LANG_SPECMAN    = { 1, "//", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_AU3        STE_LexerComments _STE_LexerComments_STE_LANG_AU3        = { 1, ";", "#CS", "", "#CE", "#CS", "#CE" };
#define DefSTE_LexerComments_STE_LANG_APDL
#define DefSTE_LexerComments_STE_LANG_BASH       STE_LexerComments _STE_LexerComments_STE_LANG_BASH       = { 0, "#", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_ASN1
#define DefSTE_LexerComments_STE_LANG_VHDL       STE_LexerComments _STE_LexerComments_STE_LANG_VHDL       = { 0, "--", "", "", "", "", "" };
#define DefSTE_LexerComments_STE_LANG_JAVA
#define DefSTE_LexerComments_STE_LANG_JAVASCRIPT
#define DefSTE_LexerComments_STE_LANG_RC
#define DefSTE_LexerComments_STE_LANG_CS
#define DefSTE_LexerComments_STE_LANG_D
#define DefSTE_LexerComments_STE_LANG_IDL
#define DefSTE_LexerComments_STE_LANG_PLSQL
#define STE_LexerComments_STE_LANG_CONTAINER  NULL
#define STE_LexerComments_STE_LANG_NULL       NULL
#define STE_LexerComments_STE_LANG_PYTHON     &_STE_LexerComments_STE_LANG_PYTHON
#define STE_LexerComments_STE_LANG_CPP        &_STE_LexerComments_STE_LANG_CPP
#define STE_LexerComments_STE_LANG_HTML       NULL
#define STE_LexerComments_STE_LANG_XML        NULL
#define STE_LexerComments_STE_LANG_PERL       &_STE_LexerComments_STE_LANG_PERL
#define STE_LexerComments_STE_LANG_SQL        NULL
#define STE_LexerComments_STE_LANG_VB         &_STE_LexerComments_STE_LANG_VB
#define STE_LexerComments_STE_LANG_PROPERTIES &_STE_LexerComments_STE_LANG_PROPERTIES
#define STE_LexerComments_STE_LANG_ERRORLIST  NULL
#define STE_LexerComments_STE_LANG_MAKEFILE   &_STE_LexerComments_STE_LANG_MAKEFILE
#define STE_LexerComments_STE_LANG_BATCH      &_STE_LexerComments_STE_LANG_BATCH
#define STE_LexerComments_STE_LANG_XCODE      NULL
#define STE_LexerComments_STE_LANG_LATEX      NULL
#define STE_LexerComments_STE_LANG_LUA        &_STE_LexerComments_STE_LANG_LUA
#define STE_LexerComments_STE_LANG_DIFF       NULL
#define STE_LexerComments_STE_LANG_CONF       NULL
#define STE_LexerComments_STE_LANG_PASCAL     NULL
#define STE_LexerComments_STE_LANG_AVE        &_STE_LexerComments_STE_LANG_AVE
#define STE_LexerComments_STE_LANG_ADA        &_STE_LexerComments_STE_LANG_ADA
#define STE_LexerComments_STE_LANG_LISP       &_STE_LexerComments_STE_LANG_LISP
#define STE_LexerComments_STE_LANG_RUBY       &_STE_LexerComments_STE_LANG_RUBY
#define STE_LexerComments_STE_LANG_EIFFEL     NULL
#define STE_LexerComments_STE_LANG_EIFFELKW   NULL
#define STE_LexerComments_STE_LANG_TCL        &_STE_LexerComments_STE_LANG_TCL
#define STE_LexerComments_STE_LANG_NNCRONTAB  &_STE_LexerComments_STE_LANG_NNCRONTAB
#define STE_LexerComments_STE_LANG_BULLANT    NULL
#define STE_LexerComments_STE_LANG_VBSCRIPT   NULL
#define STE_LexerComments_STE_LANG_ASP        NULL
#define STE_LexerComments_STE_LANG_PHP        NULL
#define STE_LexerComments_STE_LANG_BAAN       &_STE_LexerComments_STE_LANG_BAAN
#define STE_LexerComments_STE_LANG_MATLAB     &_STE_LexerComments_STE_LANG_MATLAB
#define STE_LexerComments_STE_LANG_SCRIPTOL   &_STE_LexerComments_STE_LANG_SCRIPTOL
#define STE_LexerComments_STE_LANG_ASM        &_STE_LexerComments_STE_LANG_ASM
#define STE_LexerComments_STE_LANG_CPPNOCASE  NULL
#define STE_LexerComments_STE_LANG_FORTRAN    &_STE_LexerComments_STE_LANG_FORTRAN
#define STE_LexerComments_STE_LANG_F77        NULL
#define STE_LexerComments_STE_LANG_CSS        &_STE_LexerComments_STE_LANG_CSS
#define STE_LexerComments_STE_LANG_POV        &_STE_LexerComments_STE_LANG_POV
#define STE_LexerComments_STE_LANG_LOUT       &_STE_LexerComments_STE_LANG_LOUT
#define STE_LexerComments_STE_LANG_ESCRIPT    NULL
#define STE_LexerComments_STE_LANG_PS         &_STE_LexerComments_STE_LANG_PS
#define STE_LexerComments_STE_LANG_NSIS       &_STE_LexerComments_STE_LANG_NSIS
#define STE_LexerComments_STE_LANG_MMIXAL     &_STE_LexerComments_STE_LANG_MMIXAL
#define STE_LexerComments_STE_LANG_CLW        NULL
#define STE_LexerComments_STE_LANG_CLWNOCASE  NULL
#define STE_LexerComments_STE_LANG_LOT        NULL
#define STE_LexerComments_STE_LANG_YAML       &_STE_LexerComments_STE_LANG_YAML
#define STE_LexerComments_STE_LANG_TEX        &_STE_LexerComments_STE_LANG_TEX
#define STE_LexerComments_STE_LANG_METAPOST   &_STE_LexerComments_STE_LANG_METAPOST
#define STE_LexerComments_STE_LANG_POWERBASIC NULL
#define STE_LexerComments_STE_LANG_FORTH      &_STE_LexerComments_STE_LANG_FORTH
#define STE_LexerComments_STE_LANG_ERLANG     NULL
#define STE_LexerComments_STE_LANG_OCTAVE     &_STE_LexerComments_STE_LANG_OCTAVE
#define STE_LexerComments_STE_LANG_MSSQL      NULL
#define STE_LexerComments_STE_LANG_VERILOG    NULL
#define STE_LexerComments_STE_LANG_KIX        &_STE_LexerComments_STE_LANG_KIX
#define STE_LexerComments_STE_LANG_GUI4CLI    NULL
#define STE_LexerComments_STE_LANG_SPECMAN    &_STE_LexerComments_STE_LANG_SPECMAN
#define STE_LexerComments_STE_LANG_AU3        &_STE_LexerComments_STE_LANG_AU3
#define STE_LexerComments_STE_LANG_APDL       NULL
#define STE_LexerComments_STE_LANG_BASH       &_STE_LexerComments_STE_LANG_BASH
#define STE_LexerComments_STE_LANG_ASN1       NULL
#define STE_LexerComments_STE_LANG_VHDL       &_STE_LexerComments_STE_LANG_VHDL
#define STE_LexerComments_STE_LANG_JAVA       &_STE_LexerComments_STE_LANG_CPP
#define STE_LexerComments_STE_LANG_JAVASCRIPT &_STE_LexerComments_STE_LANG_CPP
#define STE_LexerComments_STE_LANG_RC         &_STE_LexerComments_STE_LANG_CPP
#define STE_LexerComments_STE_LANG_CS         &_STE_LexerComments_STE_LANG_CPP
#define STE_LexerComments_STE_LANG_D          &_STE_LexerComments_STE_LANG_CPP
#define STE_LexerComments_STE_LANG_IDL        &_STE_LexerComments_STE_LANG_CPP
#define STE_LexerComments_STE_LANG_PLSQL      NULL

// ---------------------------------------------------------------------------
// Starting and ending block code
#define DefSTE_LexerBlock_STE_LANG_CONTAINER
#define DefSTE_LexerBlock_STE_LANG_NULL
#define DefSTE_LexerBlock_STE_LANG_PYTHON
#define DefSTE_LexerBlock_STE_LANG_CPP        // java and others rely on this
    STE_LexerBlock _STE_LexerBlock_STE_LANG_CPP        = { 10, "{", 10, "}" };
#define DefSTE_LexerBlock_STE_LANG_HTML
#define DefSTE_LexerBlock_STE_LANG_XML
#define DefSTE_LexerBlock_STE_LANG_PERL       STE_LexerBlock _STE_LexerBlock_STE_LANG_PERL       = { 10, "{", 10, "}" };
#define DefSTE_LexerBlock_STE_LANG_SQL
#define DefSTE_LexerBlock_STE_LANG_VB
#define DefSTE_LexerBlock_STE_LANG_PROPERTIES
#define DefSTE_LexerBlock_STE_LANG_ERRORLIST
#define DefSTE_LexerBlock_STE_LANG_MAKEFILE
#define DefSTE_LexerBlock_STE_LANG_BATCH
#define DefSTE_LexerBlock_STE_LANG_XCODE
#define DefSTE_LexerBlock_STE_LANG_LATEX
#define DefSTE_LexerBlock_STE_LANG_LUA
#define DefSTE_LexerBlock_STE_LANG_DIFF
#define DefSTE_LexerBlock_STE_LANG_CONF
#define DefSTE_LexerBlock_STE_LANG_PASCAL     STE_LexerBlock _STE_LexerBlock_STE_LANG_PASCAL     = { 10, "begin", 10, "end" };
#define DefSTE_LexerBlock_STE_LANG_AVE
#define DefSTE_LexerBlock_STE_LANG_ADA        STE_LexerBlock _STE_LexerBlock_STE_LANG_ADA        = { 10, "then is", 10, "end" };
#define DefSTE_LexerBlock_STE_LANG_LISP
#define DefSTE_LexerBlock_STE_LANG_RUBY
#define DefSTE_LexerBlock_STE_LANG_EIFFEL     STE_LexerBlock _STE_LexerBlock_STE_LANG_EIFFEL     = { 10, "check debug deferred do from if inspect once", 10, "end" };
#define DefSTE_LexerBlock_STE_LANG_EIFFELKW   STE_LexerBlock _STE_LexerBlock_STE_LANG_EIFFELKW   = { 10, "check debug deferred do from if inspect once", 10, "end" };
#define DefSTE_LexerBlock_STE_LANG_TCL        STE_LexerBlock _STE_LexerBlock_STE_LANG_TCL        = { 4, "{", 4, "}" };
#define DefSTE_LexerBlock_STE_LANG_NNCRONTAB
#define DefSTE_LexerBlock_STE_LANG_BULLANT
#define DefSTE_LexerBlock_STE_LANG_VBSCRIPT
#define DefSTE_LexerBlock_STE_LANG_ASP
#define DefSTE_LexerBlock_STE_LANG_PHP
#define DefSTE_LexerBlock_STE_LANG_BAAN
#define DefSTE_LexerBlock_STE_LANG_MATLAB
#define DefSTE_LexerBlock_STE_LANG_SCRIPTOL
#define DefSTE_LexerBlock_STE_LANG_ASM
#define DefSTE_LexerBlock_STE_LANG_CPPNOCASE
#define DefSTE_LexerBlock_STE_LANG_FORTRAN
#define DefSTE_LexerBlock_STE_LANG_F77
#define DefSTE_LexerBlock_STE_LANG_CSS        STE_LexerBlock _STE_LexerBlock_STE_LANG_CSS        = { 5, "{", 5, "}" };
#define DefSTE_LexerBlock_STE_LANG_POV
#define DefSTE_LexerBlock_STE_LANG_LOUT
#define DefSTE_LexerBlock_STE_LANG_ESCRIPT
#define DefSTE_LexerBlock_STE_LANG_PS
#define DefSTE_LexerBlock_STE_LANG_NSIS
#define DefSTE_LexerBlock_STE_LANG_MMIXAL
#define DefSTE_LexerBlock_STE_LANG_CLW
#define DefSTE_LexerBlock_STE_LANG_CLWNOCASE
#define DefSTE_LexerBlock_STE_LANG_LOT
#define DefSTE_LexerBlock_STE_LANG_YAML
#define DefSTE_LexerBlock_STE_LANG_TEX
#define DefSTE_LexerBlock_STE_LANG_METAPOST
#define DefSTE_LexerBlock_STE_LANG_POWERBASIC
#define DefSTE_LexerBlock_STE_LANG_FORTH
#define DefSTE_LexerBlock_STE_LANG_ERLANG
#define DefSTE_LexerBlock_STE_LANG_OCTAVE
#define DefSTE_LexerBlock_STE_LANG_MSSQL
#define DefSTE_LexerBlock_STE_LANG_VERILOG
#define DefSTE_LexerBlock_STE_LANG_KIX
#define DefSTE_LexerBlock_STE_LANG_GUI4CLI
#define DefSTE_LexerBlock_STE_LANG_SPECMAN
#define DefSTE_LexerBlock_STE_LANG_AU3        STE_LexerBlock _STE_LexerBlock_STE_LANG_AU3        = { 5, "case if do for func else elseif while select \
Case If Do For Func Else ElseIf While Select CASE IF DO FOR FUNC ELSE ELSEIF WHILE SELECT", 5, "case else endif elseif endfunc endselect next until wend \
Case Else EndIf ElseIf EndFunc EndSelect Next Until Wend CASE ELSE ENDIF ELSEIF ENDFUNC ENDSELECT NEXT UNTIL WEND" };
#define DefSTE_LexerBlock_STE_LANG_APDL
#define DefSTE_LexerBlock_STE_LANG_BASH
#define DefSTE_LexerBlock_STE_LANG_ASN1
#define DefSTE_LexerBlock_STE_LANG_VHDL
#define DefSTE_LexerBlock_STE_LANG_JAVA
#define DefSTE_LexerBlock_STE_LANG_JAVASCRIPT
#define DefSTE_LexerBlock_STE_LANG_RC
#define DefSTE_LexerBlock_STE_LANG_CS
#define DefSTE_LexerBlock_STE_LANG_D
#define DefSTE_LexerBlock_STE_LANG_IDL
#define DefSTE_LexerBlock_STE_LANG_PLSQL
#define STE_LexerBlock_STE_LANG_CONTAINER  NULL
#define STE_LexerBlock_STE_LANG_NULL       NULL
#define STE_LexerBlock_STE_LANG_PYTHON     NULL
#define STE_LexerBlock_STE_LANG_CPP        &_STE_LexerBlock_STE_LANG_CPP
#define STE_LexerBlock_STE_LANG_HTML       NULL
#define STE_LexerBlock_STE_LANG_XML        NULL
#define STE_LexerBlock_STE_LANG_PERL       &_STE_LexerBlock_STE_LANG_PERL
#define STE_LexerBlock_STE_LANG_SQL        NULL
#define STE_LexerBlock_STE_LANG_VB         NULL
#define STE_LexerBlock_STE_LANG_PROPERTIES NULL
#define STE_LexerBlock_STE_LANG_ERRORLIST  NULL
#define STE_LexerBlock_STE_LANG_MAKEFILE   NULL
#define STE_LexerBlock_STE_LANG_BATCH      NULL
#define STE_LexerBlock_STE_LANG_XCODE      NULL
#define STE_LexerBlock_STE_LANG_LATEX      NULL
#define STE_LexerBlock_STE_LANG_LUA        NULL
#define STE_LexerBlock_STE_LANG_DIFF       NULL
#define STE_LexerBlock_STE_LANG_CONF       NULL
#define STE_LexerBlock_STE_LANG_PASCAL     &_STE_LexerBlock_STE_LANG_PASCAL
#define STE_LexerBlock_STE_LANG_AVE        NULL
#define STE_LexerBlock_STE_LANG_ADA        &_STE_LexerBlock_STE_LANG_ADA
#define STE_LexerBlock_STE_LANG_LISP       NULL
#define STE_LexerBlock_STE_LANG_RUBY       NULL
#define STE_LexerBlock_STE_LANG_EIFFEL     &_STE_LexerBlock_STE_LANG_EIFFEL
#define STE_LexerBlock_STE_LANG_EIFFELKW   &_STE_LexerBlock_STE_LANG_EIFFELKW
#define STE_LexerBlock_STE_LANG_TCL        &_STE_LexerBlock_STE_LANG_TCL
#define STE_LexerBlock_STE_LANG_NNCRONTAB  NULL
#define STE_LexerBlock_STE_LANG_BULLANT    NULL
#define STE_LexerBlock_STE_LANG_VBSCRIPT   NULL
#define STE_LexerBlock_STE_LANG_ASP        NULL
#define STE_LexerBlock_STE_LANG_PHP        NULL
#define STE_LexerBlock_STE_LANG_BAAN       NULL
#define STE_LexerBlock_STE_LANG_MATLAB     NULL
#define STE_LexerBlock_STE_LANG_SCRIPTOL   NULL
#define STE_LexerBlock_STE_LANG_ASM        NULL
#define STE_LexerBlock_STE_LANG_CPPNOCASE  NULL
#define STE_LexerBlock_STE_LANG_FORTRAN    NULL
#define STE_LexerBlock_STE_LANG_F77        NULL
#define STE_LexerBlock_STE_LANG_CSS        &_STE_LexerBlock_STE_LANG_CSS
#define STE_LexerBlock_STE_LANG_POV        NULL
#define STE_LexerBlock_STE_LANG_LOUT       NULL
#define STE_LexerBlock_STE_LANG_ESCRIPT    NULL
#define STE_LexerBlock_STE_LANG_PS         NULL
#define STE_LexerBlock_STE_LANG_NSIS       NULL
#define STE_LexerBlock_STE_LANG_MMIXAL     NULL
#define STE_LexerBlock_STE_LANG_CLW        NULL
#define STE_LexerBlock_STE_LANG_CLWNOCASE  NULL
#define STE_LexerBlock_STE_LANG_LOT        NULL
#define STE_LexerBlock_STE_LANG_YAML       NULL
#define STE_LexerBlock_STE_LANG_TEX        NULL
#define STE_LexerBlock_STE_LANG_METAPOST   NULL
#define STE_LexerBlock_STE_LANG_POWERBASIC NULL
#define STE_LexerBlock_STE_LANG_FORTH      NULL
#define STE_LexerBlock_STE_LANG_ERLANG     NULL
#define STE_LexerBlock_STE_LANG_OCTAVE     NULL
#define STE_LexerBlock_STE_LANG_MSSQL      NULL
#define STE_LexerBlock_STE_LANG_VERILOG    NULL
#define STE_LexerBlock_STE_LANG_KIX        NULL
#define STE_LexerBlock_STE_LANG_GUI4CLI    NULL
#define STE_LexerBlock_STE_LANG_SPECMAN    NULL
#define STE_LexerBlock_STE_LANG_AU3        &_STE_LexerBlock_STE_LANG_AU3
#define STE_LexerBlock_STE_LANG_APDL       NULL
#define STE_LexerBlock_STE_LANG_BASH       NULL
#define STE_LexerBlock_STE_LANG_ASN1       NULL
#define STE_LexerBlock_STE_LANG_VHDL       NULL
#define STE_LexerBlock_STE_LANG_JAVA       &_STE_LexerBlock_STE_LANG_CPP
#define STE_LexerBlock_STE_LANG_JAVASCRIPT &_STE_LexerBlock_STE_LANG_CPP
#define STE_LexerBlock_STE_LANG_RC         &_STE_LexerBlock_STE_LANG_CPP
#define STE_LexerBlock_STE_LANG_CS         &_STE_LexerBlock_STE_LANG_CPP
#define STE_LexerBlock_STE_LANG_D          &_STE_LexerBlock_STE_LANG_CPP
#define STE_LexerBlock_STE_LANG_IDL        &_STE_LexerBlock_STE_LANG_CPP
#define STE_LexerBlock_STE_LANG_PLSQL      NULL

// ---------------------------------------------------------------------------
// Preprocessor symbols for language
#define DefSTE_LexerPreproc_STE_LANG_CONTAINER
#define DefSTE_LexerPreproc_STE_LANG_NULL
#define DefSTE_LexerPreproc_STE_LANG_PYTHON
#define DefSTE_LexerPreproc_STE_LANG_CPP        STE_LexerPreproc _STE_LexerPreproc_STE_LANG_CPP        = { "#", "if ifdef ifndef", "else elif", "endif" };
#define DefSTE_LexerPreproc_STE_LANG_HTML
#define DefSTE_LexerPreproc_STE_LANG_XML
#define DefSTE_LexerPreproc_STE_LANG_PERL
#define DefSTE_LexerPreproc_STE_LANG_SQL
#define DefSTE_LexerPreproc_STE_LANG_VB
#define DefSTE_LexerPreproc_STE_LANG_PROPERTIES
#define DefSTE_LexerPreproc_STE_LANG_ERRORLIST
#define DefSTE_LexerPreproc_STE_LANG_MAKEFILE   STE_LexerPreproc _STE_LexerPreproc_STE_LANG_MAKEFILE   = { "!", "IF IFDEF IFNDEF", "ELSE ELSEIF ELSEIFDEF ELSEIFNDEF", "ENDIF" };
#define DefSTE_LexerPreproc_STE_LANG_BATCH
#define DefSTE_LexerPreproc_STE_LANG_XCODE
#define DefSTE_LexerPreproc_STE_LANG_LATEX
#define DefSTE_LexerPreproc_STE_LANG_LUA
#define DefSTE_LexerPreproc_STE_LANG_DIFF
#define DefSTE_LexerPreproc_STE_LANG_CONF
#define DefSTE_LexerPreproc_STE_LANG_PASCAL
#define DefSTE_LexerPreproc_STE_LANG_AVE
#define DefSTE_LexerPreproc_STE_LANG_ADA
#define DefSTE_LexerPreproc_STE_LANG_LISP
#define DefSTE_LexerPreproc_STE_LANG_RUBY
#define DefSTE_LexerPreproc_STE_LANG_EIFFEL
#define DefSTE_LexerPreproc_STE_LANG_EIFFELKW
#define DefSTE_LexerPreproc_STE_LANG_TCL
#define DefSTE_LexerPreproc_STE_LANG_NNCRONTAB
#define DefSTE_LexerPreproc_STE_LANG_BULLANT
#define DefSTE_LexerPreproc_STE_LANG_VBSCRIPT
#define DefSTE_LexerPreproc_STE_LANG_ASP
#define DefSTE_LexerPreproc_STE_LANG_PHP
#define DefSTE_LexerPreproc_STE_LANG_BAAN       STE_LexerPreproc _STE_LexerPreproc_STE_LANG_BAAN       = { "#", "if ifdef ifndef", "else elif", "endif" };
#define DefSTE_LexerPreproc_STE_LANG_MATLAB
#define DefSTE_LexerPreproc_STE_LANG_SCRIPTOL
#define DefSTE_LexerPreproc_STE_LANG_ASM
#define DefSTE_LexerPreproc_STE_LANG_CPPNOCASE
#define DefSTE_LexerPreproc_STE_LANG_FORTRAN
#define DefSTE_LexerPreproc_STE_LANG_F77
#define DefSTE_LexerPreproc_STE_LANG_CSS
#define DefSTE_LexerPreproc_STE_LANG_POV        STE_LexerPreproc _STE_LexerPreproc_STE_LANG_POV        = { "#", "if ifdef ifndef switch while macro", "else", "end" };
#define DefSTE_LexerPreproc_STE_LANG_LOUT
#define DefSTE_LexerPreproc_STE_LANG_ESCRIPT
#define DefSTE_LexerPreproc_STE_LANG_PS
#define DefSTE_LexerPreproc_STE_LANG_NSIS
#define DefSTE_LexerPreproc_STE_LANG_MMIXAL
#define DefSTE_LexerPreproc_STE_LANG_CLW
#define DefSTE_LexerPreproc_STE_LANG_CLWNOCASE
#define DefSTE_LexerPreproc_STE_LANG_LOT
#define DefSTE_LexerPreproc_STE_LANG_YAML
#define DefSTE_LexerPreproc_STE_LANG_TEX
#define DefSTE_LexerPreproc_STE_LANG_METAPOST
#define DefSTE_LexerPreproc_STE_LANG_POWERBASIC
#define DefSTE_LexerPreproc_STE_LANG_FORTH
#define DefSTE_LexerPreproc_STE_LANG_ERLANG
#define DefSTE_LexerPreproc_STE_LANG_OCTAVE
#define DefSTE_LexerPreproc_STE_LANG_MSSQL
#define DefSTE_LexerPreproc_STE_LANG_VERILOG    STE_LexerPreproc _STE_LexerPreproc_STE_LANG_VERILOG    = { "`", "ifdef", "else", "endif" };
#define DefSTE_LexerPreproc_STE_LANG_KIX
#define DefSTE_LexerPreproc_STE_LANG_GUI4CLI
#define DefSTE_LexerPreproc_STE_LANG_SPECMAN    STE_LexerPreproc _STE_LexerPreproc_STE_LANG_SPECMAN    = { "#", "ifdef ifndef", "else", "}" };
#define DefSTE_LexerPreproc_STE_LANG_AU3
#define DefSTE_LexerPreproc_STE_LANG_APDL
#define DefSTE_LexerPreproc_STE_LANG_BASH
#define DefSTE_LexerPreproc_STE_LANG_ASN1
#define DefSTE_LexerPreproc_STE_LANG_VHDL
#define DefSTE_LexerPreproc_STE_LANG_JAVA
#define DefSTE_LexerPreproc_STE_LANG_JAVASCRIPT
#define DefSTE_LexerPreproc_STE_LANG_RC
#define DefSTE_LexerPreproc_STE_LANG_CS
#define DefSTE_LexerPreproc_STE_LANG_D
#define DefSTE_LexerPreproc_STE_LANG_IDL
#define DefSTE_LexerPreproc_STE_LANG_PLSQL
#define STE_LexerPreproc_STE_LANG_CONTAINER  NULL
#define STE_LexerPreproc_STE_LANG_NULL       NULL
#define STE_LexerPreproc_STE_LANG_PYTHON     NULL
#define STE_LexerPreproc_STE_LANG_CPP        &_STE_LexerPreproc_STE_LANG_CPP
#define STE_LexerPreproc_STE_LANG_HTML       NULL
#define STE_LexerPreproc_STE_LANG_XML        NULL
#define STE_LexerPreproc_STE_LANG_PERL       NULL
#define STE_LexerPreproc_STE_LANG_SQL        NULL
#define STE_LexerPreproc_STE_LANG_VB         NULL
#define STE_LexerPreproc_STE_LANG_PROPERTIES NULL
#define STE_LexerPreproc_STE_LANG_ERRORLIST  NULL
#define STE_LexerPreproc_STE_LANG_MAKEFILE   &_STE_LexerPreproc_STE_LANG_MAKEFILE
#define STE_LexerPreproc_STE_LANG_BATCH      NULL
#define STE_LexerPreproc_STE_LANG_XCODE      NULL
#define STE_LexerPreproc_STE_LANG_LATEX      NULL
#define STE_LexerPreproc_STE_LANG_LUA        NULL
#define STE_LexerPreproc_STE_LANG_DIFF       NULL
#define STE_LexerPreproc_STE_LANG_CONF       NULL
#define STE_LexerPreproc_STE_LANG_PASCAL     NULL
#define STE_LexerPreproc_STE_LANG_AVE        NULL
#define STE_LexerPreproc_STE_LANG_ADA        NULL
#define STE_LexerPreproc_STE_LANG_LISP       NULL
#define STE_LexerPreproc_STE_LANG_RUBY       NULL
#define STE_LexerPreproc_STE_LANG_EIFFEL     NULL
#define STE_LexerPreproc_STE_LANG_EIFFELKW   NULL
#define STE_LexerPreproc_STE_LANG_TCL        NULL
#define STE_LexerPreproc_STE_LANG_NNCRONTAB  NULL
#define STE_LexerPreproc_STE_LANG_BULLANT    NULL
#define STE_LexerPreproc_STE_LANG_VBSCRIPT   NULL
#define STE_LexerPreproc_STE_LANG_ASP        NULL
#define STE_LexerPreproc_STE_LANG_PHP        NULL
#define STE_LexerPreproc_STE_LANG_BAAN       &_STE_LexerPreproc_STE_LANG_BAAN
#define STE_LexerPreproc_STE_LANG_MATLAB     NULL
#define STE_LexerPreproc_STE_LANG_SCRIPTOL   NULL
#define STE_LexerPreproc_STE_LANG_ASM        NULL
#define STE_LexerPreproc_STE_LANG_CPPNOCASE  NULL
#define STE_LexerPreproc_STE_LANG_FORTRAN    NULL
#define STE_LexerPreproc_STE_LANG_F77        NULL
#define STE_LexerPreproc_STE_LANG_CSS        NULL
#define STE_LexerPreproc_STE_LANG_POV        &_STE_LexerPreproc_STE_LANG_POV
#define STE_LexerPreproc_STE_LANG_LOUT       NULL
#define STE_LexerPreproc_STE_LANG_ESCRIPT    NULL
#define STE_LexerPreproc_STE_LANG_PS         NULL
#define STE_LexerPreproc_STE_LANG_NSIS       NULL
#define STE_LexerPreproc_STE_LANG_MMIXAL     NULL
#define STE_LexerPreproc_STE_LANG_CLW        NULL
#define STE_LexerPreproc_STE_LANG_CLWNOCASE  NULL
#define STE_LexerPreproc_STE_LANG_LOT        NULL
#define STE_LexerPreproc_STE_LANG_YAML       NULL
#define STE_LexerPreproc_STE_LANG_TEX        NULL
#define STE_LexerPreproc_STE_LANG_METAPOST   NULL
#define STE_LexerPreproc_STE_LANG_POWERBASIC NULL
#define STE_LexerPreproc_STE_LANG_FORTH      NULL
#define STE_LexerPreproc_STE_LANG_ERLANG     NULL
#define STE_LexerPreproc_STE_LANG_OCTAVE     NULL
#define STE_LexerPreproc_STE_LANG_MSSQL      NULL
#define STE_LexerPreproc_STE_LANG_VERILOG    &_STE_LexerPreproc_STE_LANG_VERILOG
#define STE_LexerPreproc_STE_LANG_KIX        NULL
#define STE_LexerPreproc_STE_LANG_GUI4CLI    NULL
#define STE_LexerPreproc_STE_LANG_SPECMAN    &_STE_LexerPreproc_STE_LANG_SPECMAN
#define STE_LexerPreproc_STE_LANG_AU3        NULL
#define STE_LexerPreproc_STE_LANG_APDL       NULL
#define STE_LexerPreproc_STE_LANG_BASH       NULL
#define STE_LexerPreproc_STE_LANG_ASN1       NULL
#define STE_LexerPreproc_STE_LANG_VHDL       NULL
#define STE_LexerPreproc_STE_LANG_JAVA       NULL
#define STE_LexerPreproc_STE_LANG_JAVASCRIPT NULL
#define STE_LexerPreproc_STE_LANG_RC         NULL
#define STE_LexerPreproc_STE_LANG_CS         NULL
#define STE_LexerPreproc_STE_LANG_D          NULL
#define STE_LexerPreproc_STE_LANG_IDL        NULL
#define STE_LexerPreproc_STE_LANG_PLSQL      NULL

//----------------------------------------------------------------------------
// STE_LexerStyles_STE_LANG_XXX are a simple mapping between Scintilla's lexer
//   styles and the wxSTEditorStyles styles.
// Since Scintilla uses only a few of the different styles the STE tries to
//   create only 31 of them and map the different lexers to use them.
//----------------------------------------------------------------------------

#define STE_LexerStyles_STE_LANG_CONTAINER_COUNT 0
STE_LexerStyles *STE_LexerStyles_STE_LANG_CONTAINER = NULL;

#define STE_LexerStyles_STE_LANG_NULL_COUNT 1
static STE_LexerStyles STE_LexerStyles_STE_LANG_NULL[STE_LexerStyles_STE_LANG_NULL_COUNT] = {
    { STE_STYLE_DEFAULT, 0, "All text" }
};

#define STE_LexerStyles_STE_LANG_PYTHON_COUNT 16
static STE_LexerStyles STE_LexerStyles_STE_LANG_PYTHON[STE_LexerStyles_STE_LANG_PYTHON_COUNT] = {
    // Lexical states for SCLEX_PYTHON
    { STE_STYLE_DEFAULT,        wxSTC_P_DEFAULT,        "White space" }, // 0
    { STE_STYLE_COMMENTLINE,    wxSTC_P_COMMENTLINE,    "Comment" }, // 1
    { STE_STYLE_NUMBER,         wxSTC_P_NUMBER,         "Number" }, // 2
    { STE_STYLE_STRING,         wxSTC_P_STRING,         "String" }, // 3
    { STE_STYLE_CHARACTER,      wxSTC_P_CHARACTER,      "Single quoted string" }, // 4
    { STE_STYLE_KEYWORD1,       wxSTC_P_WORD,           "Keyword" }, // 5
    { STE_STYLE_STRING,         wxSTC_P_TRIPLE,         "Triple quotes" }, // 6
    { STE_STYLE_STRING,         wxSTC_P_TRIPLEDOUBLE,   "Triple double quotes" }, // 7
    { STE_STYLE_LABEL,          wxSTC_P_CLASSNAME,      "Class name definition" }, // 8
    { STE_STYLE_LABEL,          wxSTC_P_DEFNAME,        "Function or method name definition" }, // 9
    { STE_STYLE_OPERATOR,       wxSTC_P_OPERATOR,       "Operators" }, // 10
    { STE_STYLE_IDENTIFIER,     wxSTC_P_IDENTIFIER,     "Identifiers" }, // 11
    { STE_STYLE_COMMENTOTHER,   wxSTC_P_COMMENTBLOCK,   "Comment-blocks" }, // 12
    { STE_STYLE_STRINGEOL,      wxSTC_P_STRINGEOL,      "End of line where string is not closed" }, // 13
    { STE_STYLE_KEYWORD2,       wxSTC_P_WORD2,          "Highlighted identifiers" }, // 14
    { STE_STYLE_PARAMETER,      wxSTC_P_DECORATOR,      "Decorators" } // 15
};

#define STE_LexerStyles_STE_LANG_CPP_COUNT 20
static STE_LexerStyles STE_LexerStyles_STE_LANG_CPP[STE_LexerStyles_STE_LANG_CPP_COUNT] = {
    // Lexical states for SCLEX_CPP
    { STE_STYLE_DEFAULT,        wxSTC_C_DEFAULT,        "White space" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_C_COMMENT,        "Comment: /* */" }, // 1
    { STE_STYLE_COMMENTLINE,    wxSTC_C_COMMENTLINE,    "Line Comment: //" }, // 2
    { STE_STYLE_COMMENTDOC,     wxSTC_C_COMMENTDOC,     "Doc comment: block comments beginning with /** or /*!" }, // 3
    { STE_STYLE_NUMBER,         wxSTC_C_NUMBER,         "Number" }, // 4
    { STE_STYLE_KEYWORD1,       wxSTC_C_WORD,           "Keyword" }, // 5
    { STE_STYLE_STRING,         wxSTC_C_STRING,         "Double quoted string" }, // 6
    { STE_STYLE_CHARACTER,      wxSTC_C_CHARACTER,      "Single quoted string" }, // 7
    { STE_STYLE_UUID,           wxSTC_C_UUID,           "UUIDs (only in IDL)" }, // 8
    { STE_STYLE_PREPROCESSOR,   wxSTC_C_PREPROCESSOR,   "Preprocessor" }, // 9
    { STE_STYLE_OPERATOR,       wxSTC_C_OPERATOR,       "Operators" }, // 10
    { STE_STYLE_IDENTIFIER,     wxSTC_C_IDENTIFIER,     "Identifiers" }, // 11
    { STE_STYLE_STRINGEOL,      wxSTC_C_STRINGEOL,      "End of line where string is not closed" }, // 12
    { STE_STYLE_STRING,         wxSTC_C_VERBATIM,       "Verbatim strings for C#" }, // 13
    { STE_STYLE_REGEX,          wxSTC_C_REGEX,          "Regular expressions for JavaScript" }, // 14
    { STE_STYLE_COMMENTDOC,     wxSTC_C_COMMENTLINEDOC, "Doc Comment Line: line comments beginning with /// or //!" }, // 15
    { STE_STYLE_KEYWORD2,       wxSTC_C_WORD2,          "Keywords2" }, // 16
    { STE_STYLE_KEYWORD3,       wxSTC_C_COMMENTDOCKEYWORD,  "Comment keyword" }, // 17
    { STE_STYLE_ERROR,          wxSTC_C_COMMENTDOCKEYWORDERROR, "Comment keyword error" }, // 18
    { STE_STYLE_LABEL,          wxSTC_C_GLOBALCLASS,    "Global class" },  // 19 // FIXME made up text name not in cpp.properties
};

#define STE_LexerStyles_STE_LANG_HTML_COUNT 110
static STE_LexerStyles STE_LexerStyles_STE_LANG_HTML[STE_LexerStyles_STE_LANG_HTML_COUNT] = {
    // Lexical states for SCLEX_HTML, SCLEX_XML
    { STE_STYLE_DEFAULT,        wxSTC_H_DEFAULT,            "Text" },
    { STE_STYLE_DEFAULT,        wxSTC_H_TAG,                "Tags" },
    { STE_STYLE_DEFAULT,        wxSTC_H_TAGUNKNOWN,         "Unknown Tags" },
    { STE_STYLE_DEFAULT,        wxSTC_H_ATTRIBUTE,          "Attributes" },
    { STE_STYLE_UNDEFINED,      wxSTC_H_ATTRIBUTEUNKNOWN,   "Unknown Attributes" },
    { STE_STYLE_NUMBER,         wxSTC_H_NUMBER,             "Numbers" },
    { STE_STYLE_STRING,         wxSTC_H_DOUBLESTRING,       "Double quoted strings" },
    { STE_STYLE_STRING,         wxSTC_H_SINGLESTRING,       "Single quoted strings" },
    { STE_STYLE_DEFAULT,        wxSTC_H_OTHER,              "Other inside tag" },
    { STE_STYLE_COMMENT,        wxSTC_H_COMMENT,            "Comment" },
    { STE_STYLE_LABEL,          wxSTC_H_ENTITY,             "Entities" },
    // XML and ASP
    { STE_STYLE_DEFAULT,        wxSTC_H_TAGEND,             "XML style tag ends '/>'" },
    { STE_STYLE_DEFAULT,        wxSTC_H_XMLSTART,           "XML identifier start '<?'" },
    { STE_STYLE_DEFAULT,        wxSTC_H_XMLEND,             "XML identifier end '?>'" },
    { STE_STYLE_SCRIPT,         wxSTC_H_SCRIPT,             "SCRIPT" },
    { STE_STYLE_DEFAULT,        wxSTC_H_ASP,                "ASP <% ... %>" },
    { STE_STYLE_DEFAULT,        wxSTC_H_ASPAT,              "ASP <% ... %>" },
    { STE_STYLE_DEFAULT,        wxSTC_H_CDATA,              "CDATA" },
    { STE_STYLE_DEFAULT,        wxSTC_H_QUESTION,           "PHP" },
    // More HTML
    { STE_STYLE_VALUE,          wxSTC_H_VALUE,              "Unquoted values" },
    // X-Code
    { STE_STYLE_COMMENT,        wxSTC_H_XCCOMMENT,          "JSP Comment <%-- ... --%>" },
    // SGML
    { STE_STYLE_DEFAULT,        wxSTC_H_SGML_DEFAULT,       "SGML tags <! ... >" },
    { STE_STYLE_COMMAND,        wxSTC_H_SGML_COMMAND,       "SGML command" },
    { STE_STYLE_DEFAULT,        wxSTC_H_SGML_1ST_PARAM,     "SGML 1st param" },
    { STE_STYLE_STRING,         wxSTC_H_SGML_DOUBLESTRING,  "SGML double string" },
    { STE_STYLE_STRING,         wxSTC_H_SGML_SIMPLESTRING,  "SGML single string" },
    { STE_STYLE_ERROR,          wxSTC_H_SGML_ERROR,         "SGML error" },
    { STE_STYLE_DEFAULT,        wxSTC_H_SGML_SPECIAL,       "SGML special (#xxxx type)" },
    { STE_STYLE_LABEL,          wxSTC_H_SGML_ENTITY,        "SGML entity" },
    { STE_STYLE_COMMENT,        wxSTC_H_SGML_COMMENT,       "SGML comment" },
    { STE_STYLE_COMMENT,        wxSTC_H_SGML_1ST_PARAM_COMMENT, "SGML block" },
    { STE_STYLE_DEFAULT,        wxSTC_H_SGML_BLOCK_DEFAULT, "SGML block" },

    // Embedded Javascript
    { STE_STYLE_DEFAULT,        wxSTC_HJ_START,         "Embedded JS Start" },
    { STE_STYLE_DEFAULT,        wxSTC_HJ_DEFAULT,       "Embedded JS Default" },
    { STE_STYLE_COMMENT,        wxSTC_HJ_COMMENT,       "Embedded JS Comment" },
    { STE_STYLE_COMMENTLINE,    wxSTC_HJ_COMMENTLINE,   "Embedded JS Line Comment" },
    { STE_STYLE_COMMENTDOC,     wxSTC_HJ_COMMENTDOC,    "Embedded JS Doc comment" },
    { STE_STYLE_NUMBER,         wxSTC_HJ_NUMBER,        "Embedded JS Number" },
    { STE_STYLE_KEYWORD1,       wxSTC_HJ_WORD,          "Embedded JS Word" },
    { STE_STYLE_KEYWORD2,       wxSTC_HJ_KEYWORD,       "Embedded JS Keyword" },
    { STE_STYLE_STRING,         wxSTC_HJ_DOUBLESTRING,  "Embedded JS Double quoted string" },
    { STE_STYLE_STRING,         wxSTC_HJ_SINGLESTRING,  "Embedded JS Single quoted string" },
    { STE_STYLE_NUMBER,         wxSTC_HJ_SYMBOLS,       "Embedded JS Symbols" },
    { STE_STYLE_STRINGEOL,      wxSTC_HJ_STRINGEOL,     "Embedded JS EOL" },
    { STE_STYLE_REGEX,          wxSTC_HJ_REGEX,         "Embedded JS RegEx" },

    // ASP Javascript
    { STE_STYLE_DEFAULT,        wxSTC_HJA_START,        "ASP JS Start" },
    { STE_STYLE_DEFAULT,        wxSTC_HJA_DEFAULT,      "ASP JS Default" },
    { STE_STYLE_COMMENT,        wxSTC_HJA_COMMENT,      "ASP JS Comment" },
    { STE_STYLE_COMMENTLINE,    wxSTC_HJA_COMMENTLINE,  "ASP JS Line Comment" },
    { STE_STYLE_COMMENTDOC,     wxSTC_HJA_COMMENTDOC,   "ASP JS Doc comment" },
    { STE_STYLE_NUMBER,         wxSTC_HJA_NUMBER,       "ASP JS Number" },
    { STE_STYLE_KEYWORD1,       wxSTC_HJA_WORD,         "ASP JS Word" },
    { STE_STYLE_KEYWORD2,       wxSTC_HJA_KEYWORD,      "ASP JS Keyword" },
    { STE_STYLE_STRING,         wxSTC_HJA_DOUBLESTRING, "ASP JS Double quoted string" },
    { STE_STYLE_STRING,         wxSTC_HJA_SINGLESTRING, "ASP JS Single quoted string" },
    { STE_STYLE_NUMBER,         wxSTC_HJA_SYMBOLS,      "ASP JS Symbols" },
    { STE_STYLE_STRINGEOL,      wxSTC_HJA_STRINGEOL,    "ASP JS EOL" },
    { STE_STYLE_REGEX,          wxSTC_HJA_REGEX,        "ASP JS RegEx" },

    // Embedded VBScript
    { STE_STYLE_DEFAULT,        wxSTC_HB_START,         "Embedded VBS Start" },
    { STE_STYLE_DEFAULT,        wxSTC_HB_DEFAULT,       "Embedded VBS Default" },
    { STE_STYLE_COMMENTLINE,    wxSTC_HB_COMMENTLINE,   "Embedded VBS Comment" },
    { STE_STYLE_NUMBER,         wxSTC_HB_NUMBER,        "Embedded VBS Number" },
    { STE_STYLE_KEYWORD1,       wxSTC_HB_WORD,          "Embedded VBS KeyWord" },
    { STE_STYLE_STRING,         wxSTC_HB_STRING,        "Embedded VBS String" },
    { STE_STYLE_IDENTIFIER,     wxSTC_HB_IDENTIFIER,    "Embedded VBS Identifier" },
    { STE_STYLE_STRINGEOL,      wxSTC_HB_STRINGEOL,     "Embedded VBS Unterminated string" },

    // ASP VBScript
    { STE_STYLE_DEFAULT,        wxSTC_HBA_START,        "ASP VBS Start" },
    { STE_STYLE_DEFAULT,        wxSTC_HBA_DEFAULT,      "ASP VBS Default" },
    { STE_STYLE_COMMENTLINE,    wxSTC_HBA_COMMENTLINE,  "ASP VBS Comment" },
    { STE_STYLE_NUMBER,         wxSTC_HBA_NUMBER,       "ASP VBS Number" },
    { STE_STYLE_KEYWORD1,       wxSTC_HBA_WORD,         "ASP VBS KeyWord" },
    { STE_STYLE_STRING,         wxSTC_HBA_STRING,       "ASP VBS String" },
    { STE_STYLE_IDENTIFIER,     wxSTC_HBA_IDENTIFIER,   "ASP VBS Identifier" },
    { STE_STYLE_STRINGEOL,      wxSTC_HBA_STRINGEOL,    "ASP VBS Unterminated string" },

    // Embedded Python
    { STE_STYLE_DEFAULT,        wxSTC_HP_START,         "Embedded Python Start" },
    { STE_STYLE_DEFAULT,        wxSTC_HP_DEFAULT,       "Embedded Python Default" },
    { STE_STYLE_COMMENTLINE,    wxSTC_HP_COMMENTLINE,   "Embedded Python Comment" },
    { STE_STYLE_NUMBER,         wxSTC_HP_NUMBER,        "Embedded Python Number" },
    { STE_STYLE_STRING,         wxSTC_HP_STRING,        "Embedded Python String" },
    { STE_STYLE_CHARACTER,      wxSTC_HP_CHARACTER,     "Embedded Python Single quoted string" },
    { STE_STYLE_KEYWORD1,       wxSTC_HP_WORD,          "Embedded Python Keyword" },
    { STE_STYLE_NUMBER,         wxSTC_HP_TRIPLE,        "Embedded Python Triple quotes" },
    { STE_STYLE_NUMBER,         wxSTC_HP_TRIPLEDOUBLE,  "Embedded Python Triple double quotes" },
    { STE_STYLE_LABEL,          wxSTC_HP_CLASSNAME,     "Embedded Python Class name definition" },
    { STE_STYLE_LABEL,          wxSTC_HP_DEFNAME,       "Embedded Python Function or method name definition" },
    { STE_STYLE_OPERATOR,       wxSTC_HP_OPERATOR,      "Embedded Python Operators" },
    { STE_STYLE_IDENTIFIER,     wxSTC_HP_IDENTIFIER,    "Embedded Python Identifiers" },

    // FIXME - 1.64 add PHP complex variable 104

    // ASP Python
    { STE_STYLE_DEFAULT,        wxSTC_HPA_START,        "ASP Python Start" },
    { STE_STYLE_DEFAULT,        wxSTC_HPA_DEFAULT,      "ASP Python Default" },
    { STE_STYLE_COMMENTLINE,    wxSTC_HPA_COMMENTLINE,  "ASP Python Comment" },
    { STE_STYLE_NUMBER,         wxSTC_HPA_NUMBER,       "ASP Python Number" },
    { STE_STYLE_STRING,         wxSTC_HPA_STRING,       "ASP Python String" },
    { STE_STYLE_CHARACTER,      wxSTC_HPA_CHARACTER,    "ASP Python Single quoted string" },
    { STE_STYLE_KEYWORD1,       wxSTC_HPA_WORD,         "ASP Python Keyword" },
    { STE_STYLE_NUMBER,         wxSTC_HPA_TRIPLE,       "ASP Python Triple quotes" },
    { STE_STYLE_NUMBER,         wxSTC_HPA_TRIPLEDOUBLE, "ASP Python Triple double quotes" },
    { STE_STYLE_LABEL,          wxSTC_HPA_CLASSNAME,    "ASP Python Class name definition" },
    { STE_STYLE_LABEL,          wxSTC_HPA_DEFNAME,      "ASP Python Function or method name definition" },
    { STE_STYLE_OPERATOR,       wxSTC_HPA_OPERATOR,     "ASP Python Operators" },
    { STE_STYLE_IDENTIFIER,     wxSTC_HPA_IDENTIFIER,   "ASP Python Identifiers" },
    // PHP
    { STE_STYLE_DEFAULT,        wxSTC_HPHP_DEFAULT,     "PHP Default" },
    { STE_STYLE_STRING,         wxSTC_HPHP_HSTRING,     "PHP Double quoted String" },
    { STE_STYLE_STRING,         wxSTC_HPHP_SIMPLESTRING,"PHP Single quoted string" },
    { STE_STYLE_KEYWORD1,       wxSTC_HPHP_WORD,        "PHP Keyword" },
    { STE_STYLE_NUMBER,         wxSTC_HPHP_NUMBER,      "PHP Number" },
    { STE_STYLE_VALUE,          wxSTC_HPHP_VARIABLE,    "PHP Variable" },
    { STE_STYLE_COMMENT,        wxSTC_HPHP_COMMENT,     "PHP Comment" },
    { STE_STYLE_COMMENTLINE,    wxSTC_HPHP_COMMENTLINE, "PHP One line comment" },
    { STE_STYLE_VALUE,          wxSTC_HPHP_HSTRING_VARIABLE, "PHP Variable in double quoted string" },
    { STE_STYLE_OPERATOR,       wxSTC_HPHP_OPERATOR,    "PHP Operator" },
};

#define STE_LexerStyles_STE_LANG_XML_COUNT 32 // only use first 32
STE_LexerStyles *STE_LexerStyles_STE_LANG_XML = STE_LexerStyles_STE_LANG_HTML;

#define STE_LexerStyles_STE_LANG_PERL_COUNT 30
static STE_LexerStyles STE_LexerStyles_STE_LANG_PERL[STE_LexerStyles_STE_LANG_PERL_COUNT] = {
    // Lexical states for SCLEX_PERL
    { STE_STYLE_DEFAULT,        wxSTC_PL_DEFAULT,       "White space" }, // 0
    { STE_STYLE_ERROR,          wxSTC_PL_ERROR,         "Error" }, // 1
    { STE_STYLE_COMMENTLINE,    wxSTC_PL_COMMENTLINE,   "Comment" }, // 2
    { STE_STYLE_COMMENT,        wxSTC_PL_POD,           "POD: = at beginning of line" }, // 3
    { STE_STYLE_NUMBER,         wxSTC_PL_NUMBER,        "Number" }, // 4
    { STE_STYLE_KEYWORD1,       wxSTC_PL_WORD,          "Keyword" }, // 5
    { STE_STYLE_STRING,         wxSTC_PL_STRING,        "Double quoted string" }, // 6
    { STE_STYLE_CHARACTER,      wxSTC_PL_CHARACTER,     "Single quoted string" }, // 7
    { STE_STYLE_PUNCTUATION,    wxSTC_PL_PUNCTUATION,   "Symbols / Punctuation" }, // 8 // FIXME Currently not used by LexPerl
    { STE_STYLE_PREPROCESSOR,   wxSTC_PL_PREPROCESSOR,  "Preprocessor" }, // 9 // FIXME Currently not used by LexPerl
    { STE_STYLE_OPERATOR,       wxSTC_PL_OPERATOR,      "Operators" }, // 10
    { STE_STYLE_IDENTIFIER,     wxSTC_PL_IDENTIFIER,    "Identifiers (functions, etc.)" }, // 11
    { STE_STYLE_NUMBER,         wxSTC_PL_SCALAR,        "Scalars: $var" }, // 12
    { STE_STYLE_NUMBER,         wxSTC_PL_ARRAY,         "Array: @var" }, // 13
    { STE_STYLE_NUMBER,         wxSTC_PL_HASH,          "Hash: %var" }, // 14
    { STE_STYLE_NUMBER,         wxSTC_PL_SYMBOLTABLE,   "Symbol table: *var" }, // 15
    { STE_STYLE_REGEX,          wxSTC_PL_REGEX,         "Regex: /re/ or m{re}" }, // 17
    { STE_STYLE_DEFAULT,        wxSTC_PL_REGSUBST,      "Substitution: s/re/ore/" }, // 18
    { STE_STYLE_DEFAULT,        wxSTC_PL_LONGQUOTE,     "Long Quote (qq, qr, qw, qx)" }, // 19 FIXME - obsolete use q, qq, qx...
    { STE_STYLE_DEFAULT,        wxSTC_PL_BACKTICKS,     "Back Ticks" }, // 20
    { STE_STYLE_DEFAULT,        wxSTC_PL_DATASECTION,   "Data Section: __DATA__ or __END__ at beginning of line" }, // 21
    { STE_STYLE_DEFAULT,        wxSTC_PL_HERE_DELIM,    "Here-doc (delimiter)" }, // 22
    { STE_STYLE_DEFAULT,        wxSTC_PL_HERE_Q,        "Here-doc (single quoted, q)" }, // 23
    { STE_STYLE_DEFAULT,        wxSTC_PL_HERE_QQ,       "Here-doc (double quoted, qq)" }, // 24
    { STE_STYLE_DEFAULT,        wxSTC_PL_HERE_QX,       "Here-doc (back ticks, qx)" }, // 25
    { STE_STYLE_STRING,         wxSTC_PL_STRING_Q,      "Single quoted string, generic" }, // 26
    { STE_STYLE_STRING,         wxSTC_PL_STRING_QQ,     "qq = Double quoted string" }, // 27
    { STE_STYLE_STRING,         wxSTC_PL_STRING_QX,     "qx = Back ticks" }, // 28
    { STE_STYLE_STRING,         wxSTC_PL_STRING_QR,     "qr = Regex" }, // 29
    { STE_STYLE_STRING,         wxSTC_PL_STRING_QW,     "qw = Array" }, // 30
    // FIXME 1.64 add "POD: verbatim paragraphs" 31
};

#define STE_LexerStyles_STE_LANG_SQL_COUNT 22
static STE_LexerStyles STE_LexerStyles_STE_LANG_SQL[STE_LexerStyles_STE_LANG_SQL_COUNT] = {
    // Lexical states for SCLEX_SQL
    { STE_STYLE_DEFAULT,               0,      "White space" }, // 0
    { STE_STYLE_COMMENT,               1,      "Comment" }, // 1
    { STE_STYLE_COMMENTLINE,           2,      "Line Comment" }, // 2
    { STE_STYLE_COMMENTDOC,            3,      "Doc comment" }, // 3
    { STE_STYLE_NUMBER,                4,      "Number" }, // 4
    { STE_STYLE_KEYWORD1,              5,      "Keyword" }, // 5
    { STE_STYLE_STRING,                6,      "Double quoted string" }, // 6
    { STE_STYLE_CHARACTER,             7,      "Single quoted string" }, // 7
    { STE_STYLE_LABEL,                 8,      "SQL*Plus" }, // 8
    { STE_STYLE_LABEL,                 9,      "SQL*Plus PROMPT" }, // 9
    { STE_STYLE_OPERATOR,              10,     "Operators" }, // 10
    { STE_STYLE_IDENTIFIER,            11,     "Identifiers" }, // 11
    { STE_STYLE_STRINGEOL,             12,     "End of line where string is not closed" }, // 12 // FIXME - NOT USED
    { STE_STYLE_COMMENTOTHER,          13,     "SQL*Plus Comment" }, // 13
    // 14 is not used
    { STE_STYLE_COMMENTLINE,           15,     "Hash Line Comment" }, // 15
    { STE_STYLE_KEYWORD2,              16,     "Keywords2: Database objects" }, // 16
    { STE_STYLE_KEYWORD3,              17,     "Comment Doc Keyword" }, // 17
    { STE_STYLE_KEYWORD4,              18,     "Comment Doc Keyword Error" }, // 18
    { STE_STYLE_KEYWORD5,              19,     "Keywords5: User Keywords" }, // 19
    { STE_STYLE_KEYWORD6,              20,     "Keywords6: User Keywords" }, // 20
    { STE_STYLE_KEYWORD6,              21,     "Keywords7: User Keywords" }, // 21
    { STE_STYLE_KEYWORD6,              22,     "Keywords8: User Keywords" }, // 22
};

#define STE_LexerStyles_STE_LANG_VB_COUNT 15
static STE_LexerStyles STE_LexerStyles_STE_LANG_VB[STE_LexerStyles_STE_LANG_VB_COUNT] = {
    // Lexical states for SCLEX_VB, SCLEX_VBSCRIPT, SCLEX_POWERBASIC
    { STE_STYLE_DEFAULT,               wxSTC_B_DEFAULT,      "White space" }, // 0
    { STE_STYLE_COMMENT,               wxSTC_B_COMMENT,      "Comment" }, // 1
    { STE_STYLE_NUMBER,                wxSTC_B_NUMBER,       "Number" }, // 2
    { STE_STYLE_KEYWORD1,              wxSTC_B_KEYWORD,      "Keyword" }, // 3
    { STE_STYLE_STRING,                wxSTC_B_STRING,       "String" }, // 4
    { STE_STYLE_PREPROCESSOR,          wxSTC_B_PREPROCESSOR, "Preprocessor (directives)" }, // 5
    { STE_STYLE_OPERATOR,              wxSTC_B_OPERATOR,     "Operator" }, // 6
    { STE_STYLE_IDENTIFIER,            wxSTC_B_IDENTIFIER,   "Identifier" }, // 7
    { STE_STYLE_DEFAULT,               wxSTC_B_DATE,         "Date" }, // 8
    { STE_STYLE_STRINGEOL,             wxSTC_B_STRINGEOL,    "End of line where string is not closed" }, // 9
    { STE_STYLE_KEYWORD2,              wxSTC_B_KEYWORD2,     "Keyword 2" }, // 10
    { STE_STYLE_KEYWORD3,              wxSTC_B_KEYWORD3,     "Keyword 3" }, // 11
    { STE_STYLE_KEYWORD4,              wxSTC_B_KEYWORD4,     "Keyword 4" }, // 12
    { STE_STYLE_LABEL,                 wxSTC_B_CONSTANT,     "Constant" }, // 13
    { STE_STYLE_SCRIPT,                wxSTC_B_ASM,          "Assembly" }, // 14
};

#define STE_LexerStyles_STE_LANG_PROPERTIES_COUNT 5
static STE_LexerStyles STE_LexerStyles_STE_LANG_PROPERTIES[STE_LexerStyles_STE_LANG_PROPERTIES_COUNT] = {
    // Lexical states for SCLEX_PROPERTIES
    { STE_STYLE_DEFAULT,            wxSTC_PROPS_DEFAULT,     "Default" }, // 0
    { STE_STYLE_COMMENT,            wxSTC_PROPS_COMMENT,     "Comment" }, // 1
    { STE_STYLE_COMMAND,            wxSTC_PROPS_SECTION,     "Section" }, // 2
    { STE_STYLE_OPERATOR,           wxSTC_PROPS_ASSIGNMENT,  "Assignment operator" }, // 3
    { STE_STYLE_VALUE,              wxSTC_PROPS_DEFVAL,      "Default value (@)" }, // 4
};

#define STE_LexerStyles_STE_LANG_ERRORLIST_COUNT 21
static STE_LexerStyles STE_LexerStyles_STE_LANG_ERRORLIST[STE_LexerStyles_STE_LANG_ERRORLIST_COUNT] = {
    // Lexical states for SCLEX_ERRORLIST
    { STE_STYLE_DEFAULT,  wxSTC_ERR_DEFAULT,       "Default" }, // 0
    { STE_STYLE_ERROR,    wxSTC_ERR_PYTHON,        "python Error" }, // 1
    { STE_STYLE_ERROR,    wxSTC_ERR_GCC,           "gcc Error" }, // 2
    { STE_STYLE_ERROR,    wxSTC_ERR_MS,            "Microsoft Error" }, // 3
    { STE_STYLE_ERROR,    wxSTC_ERR_CMD,           "command or return status" }, // 4
    { STE_STYLE_ERROR,    wxSTC_ERR_BORLAND,       "Borland error and warning messages" }, // 5
    { STE_STYLE_ERROR,    wxSTC_ERR_PERL,          "perl error and warning messages" }, // 6
    { STE_STYLE_ERROR,    wxSTC_ERR_NET,           ".NET tracebacks" }, // 7
    { STE_STYLE_ERROR,    wxSTC_ERR_LUA,           "Lua error and warning messages" }, // 8
    { STE_STYLE_ERROR,    wxSTC_ERR_CTAG,          "ctags" }, // 9
    { STE_STYLE_ERROR,    wxSTC_ERR_DIFF_CHANGED,  "diff changed !" }, // 10
    { STE_STYLE_ERROR,    wxSTC_ERR_DIFF_ADDITION, "diff addition +" }, // 11
    { STE_STYLE_ERROR,    wxSTC_ERR_DIFF_DELETION, "diff deletion -" }, // 12
    { STE_STYLE_ERROR,    wxSTC_ERR_DIFF_MESSAGE,  "diff message ---" }, // 13
    { STE_STYLE_ERROR,    wxSTC_ERR_PHP,           "PHP error" }, // 14
    { STE_STYLE_ERROR,    wxSTC_ERR_ELF,           "Essential Lahey Fortran 90 error" }, // 15
    { STE_STYLE_ERROR,    wxSTC_ERR_IFC,           "Intel Fortran Compiler error" }, // 16
    { STE_STYLE_ERROR,    wxSTC_ERR_IFORT,         "Intel Fortran Compiler v8.0 error/warning" }, // 17
    { STE_STYLE_ERROR,    wxSTC_ERR_ABSF,          "Absoft Pro Fortran 90/95 v8.2 error or warning" }, // 18
    { STE_STYLE_ERROR,    wxSTC_ERR_TIDY,          "HTML Tidy" }, // 19
    { STE_STYLE_ERROR,    wxSTC_ERR_JAVA_STACK,    "Java runtime stack trace" }, // 20
};

#define STE_LexerStyles_STE_LANG_MAKEFILE_COUNT 7
static STE_LexerStyles STE_LexerStyles_STE_LANG_MAKEFILE[STE_LexerStyles_STE_LANG_MAKEFILE_COUNT] = {
    // Lexical states for SCLEX_MAKEFILE
    { STE_STYLE_DEFAULT,        wxSTC_MAKE_DEFAULT,      "Default" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_MAKE_COMMENT,      "Comment: #" }, // 1
    { STE_STYLE_PREPROCESSOR,   wxSTC_MAKE_PREPROCESSOR, "Pre-processor or other comment: !" }, // 2
    { STE_STYLE_IDENTIFIER,     wxSTC_MAKE_IDENTIFIER,   "Variable: $(x)" }, // 3
    { STE_STYLE_OPERATOR,       wxSTC_MAKE_OPERATOR,     "Operator" }, // 4
    { STE_STYLE_STRING,         wxSTC_MAKE_TARGET,       "Target" }, // 5

    { STE_STYLE_STRINGEOL,      wxSTC_MAKE_IDEOL,        "Error" }, // 9
};

#define STE_LexerStyles_STE_LANG_BATCH_COUNT 8
static STE_LexerStyles STE_LexerStyles_STE_LANG_BATCH[STE_LexerStyles_STE_LANG_BATCH_COUNT] = {
    // Lexical states for SCLEX_BATCH
    { STE_STYLE_DEFAULT,    wxSTC_BAT_DEFAULT,      "Default" }, // 0
    { STE_STYLE_COMMENT,    wxSTC_BAT_COMMENT,      "Comment (rem or ::)" }, // 1
    { STE_STYLE_KEYWORD1,   wxSTC_BAT_WORD,         "Keywords" }, // 2
    { STE_STYLE_LABEL,      wxSTC_BAT_LABEL,        "Label (line beginning with ':')" }, // 3
    { STE_STYLE_DEFAULT,    wxSTC_BAT_HIDE,         "Hide command character ('@')" }, // 4
    { STE_STYLE_COMMAND,    wxSTC_BAT_COMMAND,      "External commands" }, // 5
    { STE_STYLE_IDENTIFIER, wxSTC_BAT_IDENTIFIER,   "Variable: %%x (x is almost whatever, except space and %), %n (n in [0-9]), %EnvironmentVar%" }, // 6
    { STE_STYLE_OPERATOR,   wxSTC_BAT_OPERATOR,     "Operator: * ? < > |" }, // 7
};

#define STE_LexerStyles_STE_LANG_XCODE_COUNT 1 // FIXME just a guess no SciTE styles for this
static STE_LexerStyles STE_LexerStyles_STE_LANG_XCODE[STE_LexerStyles_STE_LANG_XCODE_COUNT] = {
    { STE_STYLE_DEFAULT,         0,   "Default text" }, // 0
};

#define STE_LexerStyles_STE_LANG_LATEX_COUNT 5
static STE_LexerStyles STE_LexerStyles_STE_LANG_LATEX[STE_LexerStyles_STE_LANG_LATEX_COUNT] = {
    // Lexical states for SCLEX_LATEX
    { STE_STYLE_DEFAULT,         wxSTC_L_DEFAULT,   "White space" }, // 0
    { STE_STYLE_COMMAND,         wxSTC_L_COMMAND,   "Command" }, // 1
    { STE_STYLE_LABEL,           wxSTC_L_TAG,       "Tag" }, // 2
    { STE_STYLE_OPERATOR,        wxSTC_L_MATH,      "Math" }, // 3
    { STE_STYLE_COMMENT,         wxSTC_L_COMMENT,   "Comment" }, // 4
};

#define STE_LexerStyles_STE_LANG_LUA_COUNT 20
static STE_LexerStyles STE_LexerStyles_STE_LANG_LUA[STE_LexerStyles_STE_LANG_LUA_COUNT] = {
    // Lexical states for SCLEX_LUA
    { STE_STYLE_DEFAULT,           wxSTC_LUA_DEFAULT,       "White space" }, // 0
    { STE_STYLE_COMMENT,           wxSTC_LUA_COMMENT,       "Block comment (Lua 5.0)" }, // 1
    { STE_STYLE_COMMENTLINE,       wxSTC_LUA_COMMENTLINE,   "Line comment" }, // 2
    { STE_STYLE_COMMENTDOC,        wxSTC_LUA_COMMENTDOC,    "Doc comment" }, // 3 // FIXME - not used yet
    { STE_STYLE_NUMBER,            wxSTC_LUA_NUMBER,        "Number" }, // 4
    { STE_STYLE_KEYWORD1,          wxSTC_LUA_WORD,          "Keyword" }, // 5
    { STE_STYLE_STRING,            wxSTC_LUA_STRING,        "String" }, // 6
    { STE_STYLE_CHARACTER,         wxSTC_LUA_CHARACTER,     "Character" }, // 7
    { STE_STYLE_STRING,            wxSTC_LUA_LITERALSTRING, "Literal string" }, // 8
    { STE_STYLE_PREPROCESSOR,      wxSTC_LUA_PREPROCESSOR,  "Preprocessor (obsolete in Lua 4.0 and up)" }, // 9
    { STE_STYLE_OPERATOR,          wxSTC_LUA_OPERATOR,      "Operators" }, // 10
    { STE_STYLE_IDENTIFIER,        wxSTC_LUA_IDENTIFIER,    "Identifier" }, // 11
    { STE_STYLE_STRINGEOL,         wxSTC_LUA_STRINGEOL,     "End of line where string is not closed" }, // 12
    { STE_STYLE_KEYWORD2,          wxSTC_LUA_WORD2,         "Keywords 2" }, // 13
    { STE_STYLE_KEYWORD3,          wxSTC_LUA_WORD3,         "Keywords 3" }, // 14
    { STE_STYLE_KEYWORD4,          wxSTC_LUA_WORD4,         "Keywords 4" }, // 15
    { STE_STYLE_KEYWORD5,          wxSTC_LUA_WORD5,         "Keywords 5" }, // 16
    { STE_STYLE_KEYWORD6,          wxSTC_LUA_WORD6,         "Keywords 6" }, // 17
    { STE_STYLE_KEYWORD6,          wxSTC_LUA_WORD7,         "Keywords 7" }, // 18
    { STE_STYLE_KEYWORD6,          wxSTC_LUA_WORD8,         "Keywords 8" }, // 19
};

#define STE_LexerStyles_STE_LANG_DIFF_COUNT 7
static STE_LexerStyles STE_LexerStyles_STE_LANG_DIFF[STE_LexerStyles_STE_LANG_DIFF_COUNT] = {
    // Lexical states for SCLEX_DIFF
    { STE_STYLE_DEFAULT,        wxSTC_DIFF_DEFAULT,     "Default" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_DIFF_COMMENT,     "Comment (part before \"diff ...\" or \"--- ...\" and , Only in ..., Binary file...)" }, // 1
    { STE_STYLE_COMMAND,        wxSTC_DIFF_COMMAND,     "Command (diff ...)" }, // 2
    { STE_STYLE_PREPROCESSOR,   wxSTC_DIFF_HEADER,      "Source file (--- ...) and Destination file (+++ ...)" }, // 3
    { STE_STYLE_NUMBER,         wxSTC_DIFF_POSITION,    "Position setting (@@ ...)" }, // 4
    { STE_STYLE_ERROR,          wxSTC_DIFF_DELETED,     "Line removal (-...)" }, // 5
    { STE_STYLE_COMMAND,        wxSTC_DIFF_ADDED,       "Line addition (+...)" }, // 6
};

#define STE_LexerStyles_STE_LANG_CONF_COUNT 10
static STE_LexerStyles STE_LexerStyles_STE_LANG_CONF[STE_LexerStyles_STE_LANG_CONF_COUNT] = {
    // Lexical states for SCLEX_CONF (Apache Configuration Files Lexer)
    { STE_STYLE_DEFAULT,    wxSTC_CONF_DEFAULT,     "White space" }, // 0
    { STE_STYLE_COMMENT,    wxSTC_CONF_COMMENT,     "Comment" }, // 1
    { STE_STYLE_NUMBER,     wxSTC_CONF_NUMBER,      "Number" }, // 2
    { STE_STYLE_IDENTIFIER, wxSTC_CONF_IDENTIFIER,  "Identifier" }, // 3
    { STE_STYLE_DEFAULT,    wxSTC_CONF_EXTENSION,   "Extensions" }, // 4
    { STE_STYLE_PARAMETER,  wxSTC_CONF_PARAMETER,   "Parameters" }, // 5
    { STE_STYLE_STRING,     wxSTC_CONF_STRING,      "Double quoted string" }, // 6
    { STE_STYLE_OPERATOR,   wxSTC_CONF_OPERATOR,    "Operators" }, // 7
    { STE_STYLE_DEFAULT,    wxSTC_CONF_IP,          "IP address" }, // 8
    { STE_STYLE_COMMENT,    wxSTC_CONF_DIRECTIVE,   "Apache Runtime Directive" }, // 9
};

#define STE_LexerStyles_STE_LANG_PASCAL_COUNT 12
static STE_LexerStyles STE_LexerStyles_STE_LANG_PASCAL[STE_LexerStyles_STE_LANG_PASCAL_COUNT] = {
    // Lexical states for PASCAL uses SCLEX_CPP
    { STE_STYLE_DEFAULT,        wxSTC_C_DEFAULT,        "White space" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_C_COMMENT,        "Comment" }, // 1
    { STE_STYLE_COMMENTLINE,    wxSTC_C_COMMENTLINE,    "Line Comment" }, // 2
    { STE_STYLE_COMMENTDOC,     wxSTC_C_COMMENTDOC,     "Doc comment" }, // 3
    { STE_STYLE_NUMBER,         wxSTC_C_NUMBER,         "Number" }, // 4
    { STE_STYLE_KEYWORD1,       wxSTC_C_WORD,           "Keyword" }, // 5
    { STE_STYLE_STRING,         wxSTC_C_STRING,         "Double quoted string" }, // 6
    { STE_STYLE_CHARACTER,      wxSTC_C_CHARACTER,      "Single quoted string" }, // 7
    { STE_STYLE_UUID,           wxSTC_C_UUID,           "Symbols" }, // 8
    { STE_STYLE_PREPROCESSOR,   wxSTC_C_PREPROCESSOR,   "Preprocessor" }, // 9
    { STE_STYLE_OPERATOR,       wxSTC_C_OPERATOR,       "Operators" }, // 10
    { STE_STYLE_REGEX,          wxSTC_C_REGEX,          "Inline Asm" }, // 14
};

#define STE_LexerStyles_STE_LANG_AVE_COUNT 15
static STE_LexerStyles STE_LexerStyles_STE_LANG_AVE[STE_LexerStyles_STE_LANG_AVE_COUNT] = {
    // Lexical states for SCLEX_AVE, Avenue
    { STE_STYLE_DEFAULT,       wxSTC_AVE_DEFAULT,   "White space" }, // 0
    { STE_STYLE_COMMENT,       wxSTC_AVE_COMMENT,   "Comment" }, // 1
    { STE_STYLE_NUMBER,        wxSTC_AVE_NUMBER,    "Number" }, // 2
    { STE_STYLE_KEYWORD1,      wxSTC_AVE_WORD,      "Keyword" }, // 3
    { STE_STYLE_STRING,        wxSTC_AVE_STRING,    "String" }, // 6
    { STE_STYLE_NUMBER,        wxSTC_AVE_ENUM,      "Enumeration" }, // 7
    { STE_STYLE_STRINGEOL,     wxSTC_AVE_STRINGEOL, "End of line where string is not closed" }, // 8
    { STE_STYLE_IDENTIFIER,    wxSTC_AVE_IDENTIFIER,"Operators" }, // 9
    { STE_STYLE_OPERATOR,      wxSTC_AVE_OPERATOR,  "Identifier (everything else...)" }, // 10
    { STE_STYLE_KEYWORD1,      wxSTC_AVE_WORD1,     "Keywords 1" }, // 11
    { STE_STYLE_KEYWORD2,      wxSTC_AVE_WORD2,     "Keywords 2" }, // 12
    { STE_STYLE_KEYWORD3,      wxSTC_AVE_WORD3,     "Keywords 3" }, // 13
    { STE_STYLE_KEYWORD4,      wxSTC_AVE_WORD4,     "Keywords 4" }, // 14
    { STE_STYLE_KEYWORD5,      wxSTC_AVE_WORD5,     "Keywords 5" }, // 15
    { STE_STYLE_KEYWORD6,      wxSTC_AVE_WORD6,     "Keywords 6" }, // 16
};

#define STE_LexerStyles_STE_LANG_ADA_COUNT 12
static STE_LexerStyles STE_LexerStyles_STE_LANG_ADA[STE_LexerStyles_STE_LANG_ADA_COUNT] = {
    // Lexical states for SCLEX_ADA
    { STE_STYLE_DEFAULT,          wxSTC_ADA_DEFAULT,      "Default" }, // 0
    { STE_STYLE_KEYWORD1,         wxSTC_ADA_WORD,         "Keyword" }, // 1
    { STE_STYLE_IDENTIFIER,       wxSTC_ADA_IDENTIFIER,   "Identifiers" }, // 2
    { STE_STYLE_NUMBER,           wxSTC_ADA_NUMBER,       "Number" }, // 3
    { STE_STYLE_DELIMITER,        wxSTC_ADA_DELIMITER,    "Operators (delimiters)" }, // 4
    { STE_STYLE_CHARACTER,        wxSTC_ADA_CHARACTER,    "Character" }, // 5
    { STE_STYLE_CHARACTEREOL,     wxSTC_ADA_CHARACTEREOL, "End of line where character is not closed" }, // 6
    { STE_STYLE_STRING,           wxSTC_ADA_STRING,       "String" }, // 7
    { STE_STYLE_STRINGEOL,        wxSTC_ADA_STRINGEOL,    "End of line where string is not closed" }, // 8
    { STE_STYLE_LABEL,            wxSTC_ADA_LABEL,        "Label" }, // 9
    { STE_STYLE_COMMENTLINE,      wxSTC_ADA_COMMENTLINE,  "Comment" }, // 10
    { STE_STYLE_ERROR,            wxSTC_ADA_ILLEGAL,      "Illegal token" }, // 11
};

#define STE_LexerStyles_STE_LANG_LISP_COUNT 8
static STE_LexerStyles STE_LexerStyles_STE_LANG_LISP[STE_LexerStyles_STE_LANG_LISP_COUNT] = {
    // Lexical states for SCLEX_LISP
    { STE_STYLE_DEFAULT,            wxSTC_LISP_DEFAULT,     "White space" }, // 0
    { STE_STYLE_COMMENT,            wxSTC_LISP_COMMENT,     "Line Comment" }, // 1
    { STE_STYLE_NUMBER,             wxSTC_LISP_NUMBER,      "Number" }, // 2
    { STE_STYLE_KEYWORD1,           wxSTC_LISP_KEYWORD,     "Keyword" }, // 3

    { STE_STYLE_STRING,             wxSTC_LISP_STRING,      "String" }, // 6

    { STE_STYLE_STRINGEOL,          wxSTC_LISP_STRINGEOL,   "End of line where string is not closed" }, // 8
    { STE_STYLE_IDENTIFIER,         wxSTC_LISP_IDENTIFIER,  "Identifiers" }, // 9
    { STE_STYLE_OPERATOR,           wxSTC_LISP_OPERATOR,    "Operators" }, // 10
};

#define STE_LexerStyles_STE_LANG_RUBY_COUNT 14
static STE_LexerStyles STE_LexerStyles_STE_LANG_RUBY[STE_LexerStyles_STE_LANG_RUBY_COUNT] = {
    // Lexical states for SCLEX_PYTHON
    { STE_STYLE_DEFAULT,        wxSTC_P_DEFAULT,        "White space" },
    { STE_STYLE_COMMENTLINE,    wxSTC_P_COMMENTLINE,    "Comment" },
    { STE_STYLE_NUMBER,         wxSTC_P_NUMBER,         "Number" },
    { STE_STYLE_STRING,         wxSTC_P_STRING,         "String" },
    { STE_STYLE_CHARACTER,      wxSTC_P_CHARACTER,      "Single quoted string" },
    { STE_STYLE_KEYWORD1,       wxSTC_P_WORD,           "Keyword" },
    { STE_STYLE_STRING,         wxSTC_P_TRIPLE,         "Triple quotes" },
    { STE_STYLE_STRING,         wxSTC_P_TRIPLEDOUBLE,   "Triple double quotes" },
    { STE_STYLE_DEFAULT,        wxSTC_P_CLASSNAME,      "Class name definition" },
    { STE_STYLE_DEFAULT,        wxSTC_P_DEFNAME,        "Function or method name definition" },
    { STE_STYLE_OPERATOR,       wxSTC_P_OPERATOR,       "Operators" },
    { STE_STYLE_IDENTIFIER,     wxSTC_P_IDENTIFIER,     "Identifiers" },
    { STE_STYLE_COMMENTOTHER,   wxSTC_P_COMMENTBLOCK,   "Comment-blocks" },
    { STE_STYLE_STRINGEOL,      wxSTC_P_STRINGEOL,      "End of line where string is not closed" }
};

#define STE_LexerStyles_STE_LANG_EIFFEL_COUNT 9
static STE_LexerStyles STE_LexerStyles_STE_LANG_EIFFEL[STE_LexerStyles_STE_LANG_EIFFEL_COUNT] = {
    // Lexical states for SCLEX_EIFFEL and SCLEX_EIFFELKW
    { STE_STYLE_DEFAULT,         wxSTC_EIFFEL_DEFAULT,      "Default" }, // 0
    { STE_STYLE_COMMENTLINE,     wxSTC_EIFFEL_COMMENTLINE,  "Line comment" }, // 1
    { STE_STYLE_NUMBER,          wxSTC_EIFFEL_NUMBER,       "Number" }, // 2
    { STE_STYLE_KEYWORD1,        wxSTC_EIFFEL_WORD,         "Keyword" }, // 3
    { STE_STYLE_STRING,          wxSTC_EIFFEL_STRING,       "String" }, // 4
    { STE_STYLE_CHARACTER,       wxSTC_EIFFEL_CHARACTER,    "Character" }, // 5
    { STE_STYLE_OPERATOR,        wxSTC_EIFFEL_OPERATOR,     "Operators" }, // 6
    { STE_STYLE_IDENTIFIER,      wxSTC_EIFFEL_IDENTIFIER,   "Identifier" }, // 7
    { STE_STYLE_STRINGEOL,       wxSTC_EIFFEL_STRINGEOL,    "End of line where string is not closed" }, // 8
};

#define STE_LexerStyles_STE_LANG_EIFFELKW_COUNT 9
static STE_LexerStyles STE_LexerStyles_STE_LANG_EIFFELKW[STE_LexerStyles_STE_LANG_EIFFELKW_COUNT] = {
    // Lexical states for SCLEX_EIFFEL and SCLEX_EIFFELKW
    { STE_STYLE_DEFAULT,         wxSTC_EIFFEL_DEFAULT,      "Default" }, // 0
    { STE_STYLE_COMMENTLINE,     wxSTC_EIFFEL_COMMENTLINE,  "Line comment" }, // 1
    { STE_STYLE_NUMBER,          wxSTC_EIFFEL_NUMBER,       "Number" }, // 2
    { STE_STYLE_KEYWORD1,        wxSTC_EIFFEL_WORD,         "Keyword" }, // 3
    { STE_STYLE_STRING,          wxSTC_EIFFEL_STRING,       "String" }, // 4
    { STE_STYLE_CHARACTER,       wxSTC_EIFFEL_CHARACTER,    "Character" }, // 5
    { STE_STYLE_OPERATOR,        wxSTC_EIFFEL_OPERATOR,     "Operators" }, // 6
    { STE_STYLE_IDENTIFIER,      wxSTC_EIFFEL_IDENTIFIER,   "Identifier" }, // 7
    { STE_STYLE_STRINGEOL,       wxSTC_EIFFEL_STRINGEOL,    "End of line where string is not closed" }, // 8
};

#if defined(wxSTC_TCL_DEFAULT)

#define STE_LexerStyles_STE_LANG_TCL_COUNT 22
static STE_LexerStyles STE_LexerStyles_STE_LANG_TCL[STE_LexerStyles_STE_LANG_TCL_COUNT] = {
    // Lexical states for SCLEX_CPP
    { STE_STYLE_DEFAULT,        wxSTC_TCL_DEFAULT,        "White space" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_TCL_COMMENT,        "Comment:.....; #comment" }, // 1
    { STE_STYLE_COMMENTLINE,    wxSTC_TCL_COMMENTLINE,    "Line Comment:  #comment" }, // 2
    { STE_STYLE_NUMBER,         wxSTC_TCL_NUMBER,         "Number and hex number (syntax #[0-f]+)" }, // 3
    { STE_STYLE_STRING,         wxSTC_TCL_WORD_IN_QUOTE,  "Keyword in quote" }, // 4
    { STE_STYLE_STRING,         wxSTC_TCL_IN_QUOTE,       "In quote" }, // 5
    { STE_STYLE_STRING,         wxSTC_TCL_OPERATOR,       "Operator" }, // 6
    { STE_STYLE_IDENTIFIER,     wxSTC_TCL_IDENTIFIER,     "Identifiers" }, // 7
    { STE_STYLE_UUID,           wxSTC_TCL_SUBSTITUTION,   "Substitution" }, // 8
    { STE_STYLE_BRACE,          wxSTC_TCL_SUB_BRACE,      "Substitution starts with a brace ${woow}" }, // 9
    { STE_STYLE_OPERATOR,       wxSTC_TCL_MODIFIER,       "Modifier -xxx" }, // 10
    { STE_STYLE_LABEL,          wxSTC_TCL_EXPAND,         "Expand (what and odd syntax)" }, // 11
    { STE_STYLE_KEYWORD1,       wxSTC_TCL_WORD,           "Keywords 1" }, // 12
    { STE_STYLE_KEYWORD2,       wxSTC_TCL_WORD2,          "Keywords 2" }, // 13

    { STE_STYLE_KEYWORD3,       wxSTC_TCL_WORD3,          "Keywords 3" }, // 14
    { STE_STYLE_KEYWORD4,       wxSTC_TCL_WORD4,          "Keywords 4" }, // 15
    { STE_STYLE_KEYWORD5,       wxSTC_TCL_WORD5,          "Keywords 5" }, // 16
    { STE_STYLE_KEYWORD6,       wxSTC_TCL_WORD6,          "Keywords 6" }, // 17
    { STE_STYLE_KEYWORD6,       wxSTC_TCL_WORD7,          "Keywords 7" }, // 18
    { STE_STYLE_KEYWORD6,       wxSTC_TCL_WORD8,          "Keywords 8" }, // 19
    { STE_STYLE_COMMENTOTHER,   wxSTC_TCL_COMMENT_BOX,    "Comment box" }, // 20
    { STE_STYLE_COMMENTOTHER,   wxSTC_TCL_BLOCK_COMMENT,  "Comment block" }, // 21
};

#else // not defined(wxSTC_TCL_DEFAULT)

#define STE_LexerStyles_STE_LANG_TCL_COUNT 14
static STE_LexerStyles STE_LexerStyles_STE_LANG_TCL[STE_LexerStyles_STE_LANG_TCL_COUNT] = {
    // Lexical states for SCLEX_CPP
    { STE_STYLE_DEFAULT,        wxSTC_C_DEFAULT,        "White space" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_C_COMMENT,        "Comment" }, // 1
    { STE_STYLE_COMMENTLINE,    wxSTC_C_COMMENTLINE,    "Number" }, // 2
    { STE_STYLE_COMMENTDOC,     wxSTC_C_COMMENTDOC,     "String" }, // 3
    { STE_STYLE_NUMBER,         wxSTC_C_NUMBER,         "Single quoted string" }, // 4
    { STE_STYLE_KEYWORD1,       wxSTC_C_WORD,           "Keyword" }, // 5
    { STE_STYLE_STRING,         wxSTC_C_STRING,         "Triple quotes" }, // 6
    { STE_STYLE_CHARACTER,      wxSTC_C_CHARACTER,      "Triple double quotes" }, // 7
    { STE_STYLE_UUID,           wxSTC_C_UUID,           "Class name definition" }, // 8
    { STE_STYLE_PREPROCESSOR,   wxSTC_C_PREPROCESSOR,   "Function or method name definition" }, // 9
    { STE_STYLE_OPERATOR,       wxSTC_C_OPERATOR,       "Operators" }, // 10
    { STE_STYLE_IDENTIFIER,     wxSTC_C_IDENTIFIER,     "Identifiers" }, // 11
    { STE_STYLE_STRINGEOL,      wxSTC_C_STRINGEOL,      "Comment-blocks" }, // 12
    { STE_STYLE_DEFAULT,        wxSTC_C_VERBATIM,       "End of line where string is not closed" }, // 13
};
#endif // defined(wxSTC_TCL_DEFAULT)

#define STE_LexerStyles_STE_LANG_NNCRONTAB_COUNT 11
static STE_LexerStyles STE_LexerStyles_STE_LANG_NNCRONTAB[STE_LexerStyles_STE_LANG_NNCRONTAB_COUNT] = {
    // Lexical states for SCLEX_NNCRONTAB (nnCron crontab Lexer)
    { STE_STYLE_DEFAULT,      wxSTC_NNCRONTAB_DEFAULT,      "White space" }, // 0
    { STE_STYLE_COMMENT,      wxSTC_NNCRONTAB_COMMENT,      "Comment" }, // 1
    { STE_STYLE_DEFAULT,      wxSTC_NNCRONTAB_TASK,         "Task start/end" }, // 2
    { STE_STYLE_DEFAULT,      wxSTC_NNCRONTAB_SECTION,      "Section keywords" }, // 3
    { STE_STYLE_KEYWORD1,     wxSTC_NNCRONTAB_KEYWORD,      "Keywords" }, // 4
    { STE_STYLE_OPERATOR,     wxSTC_NNCRONTAB_MODIFIER,     "Modificators" }, // 5
    { STE_STYLE_OPERATOR,     wxSTC_NNCRONTAB_ASTERISK,     "Asterisk" }, // 6
    { STE_STYLE_NUMBER,       wxSTC_NNCRONTAB_NUMBER,       "Number" }, // 7
    { STE_STYLE_STRING,       wxSTC_NNCRONTAB_STRING,       "Double quoted string" }, // 8
    { STE_STYLE_LABEL,        wxSTC_NNCRONTAB_ENVIRONMENT,  "Environment variable" }, // 9
    { STE_STYLE_IDENTIFIER,   wxSTC_NNCRONTAB_IDENTIFIER,   "Identifier" }, // 10
};

#define STE_LexerStyles_STE_LANG_BULLANT_COUNT 10
static STE_LexerStyles STE_LexerStyles_STE_LANG_BULLANT[STE_LexerStyles_STE_LANG_BULLANT_COUNT] = {
    // Lexical states for SCLEX_CPP
    { STE_STYLE_DEFAULT,        wxSTC_C_DEFAULT,        "White space" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_C_COMMENT,        "Comment" }, // 1
    { STE_STYLE_COMMENTLINE,    wxSTC_C_COMMENTLINE,    "Line Comment" }, // 2
    { STE_STYLE_COMMENTDOC,     wxSTC_C_COMMENTDOC,     "Doc comment" }, // 3
    { STE_STYLE_NUMBER,         wxSTC_C_NUMBER,         "Number" }, // 4
    { STE_STYLE_KEYWORD1,       wxSTC_C_WORD,           "Keyword" }, // 5
    { STE_STYLE_STRING,         wxSTC_C_STRING,         "Double quoted string" }, // 6
    { STE_STYLE_CHARACTER,      wxSTC_C_CHARACTER,      "Single quoted string" }, // 7
    { STE_STYLE_UUID,           wxSTC_C_UUID,           "Symbols" }, // 8
    { STE_STYLE_PREPROCESSOR,   wxSTC_C_PREPROCESSOR,   "Preprocessor" }, // 9
};

#define STE_LexerStyles_STE_LANG_VBSCRIPT_COUNT 15
static STE_LexerStyles STE_LexerStyles_STE_LANG_VBSCRIPT[STE_LexerStyles_STE_LANG_VBSCRIPT_COUNT] = {
    // Lexical states for SCLEX_VB, SCLEX_VBSCRIPT, SCLEX_POWERBASIC
    { STE_STYLE_DEFAULT,               wxSTC_B_DEFAULT,      "White space" }, // 0
    { STE_STYLE_COMMENT,               wxSTC_B_COMMENT,      "Comment" }, // 1
    { STE_STYLE_NUMBER,                wxSTC_B_NUMBER,       "Number" }, // 2
    { STE_STYLE_KEYWORD1,              wxSTC_B_KEYWORD,      "Keyword" }, // 3
    { STE_STYLE_STRING,                wxSTC_B_STRING,       "String" }, // 4
    { STE_STYLE_PREPROCESSOR,          wxSTC_B_PREPROCESSOR, "Preprocessor (directives)" }, // 5
    { STE_STYLE_OPERATOR,              wxSTC_B_OPERATOR,     "Operator" }, // 6
    { STE_STYLE_IDENTIFIER,            wxSTC_B_IDENTIFIER,   "Identifier" }, // 7
    { STE_STYLE_DEFAULT,               wxSTC_B_DATE,         "Date" }, // 8
    { STE_STYLE_STRINGEOL,             wxSTC_B_STRINGEOL,    "End of line where string is not closed" }, // 9
    { STE_STYLE_KEYWORD2,              wxSTC_B_KEYWORD2,     "Keyword 2" }, // 10
    { STE_STYLE_KEYWORD3,              wxSTC_B_KEYWORD3,     "Keyword 3" }, // 11
    { STE_STYLE_KEYWORD4,              wxSTC_B_KEYWORD4,     "Keyword 4" }, // 12
    { STE_STYLE_LABEL,                 wxSTC_B_CONSTANT,     "Constant" }, // 13
    { STE_STYLE_SCRIPT,                wxSTC_B_ASM,          "Assembly" }, // 14
};

#define STE_LexerStyles_STE_LANG_ASP_COUNT STE_LexerStyles_STE_LANG_HTML_COUNT
STE_LexerStyles* STE_LexerStyles_STE_LANG_ASP = STE_LexerStyles_STE_LANG_HTML;

#define STE_LexerStyles_STE_LANG_PHP_COUNT STE_LexerStyles_STE_LANG_HTML_COUNT
STE_LexerStyles* STE_LexerStyles_STE_LANG_PHP = STE_LexerStyles_STE_LANG_HTML;


#define STE_LexerStyles_STE_LANG_BAAN_COUNT 11
static STE_LexerStyles STE_LexerStyles_STE_LANG_BAAN[STE_LexerStyles_STE_LANG_BAAN_COUNT] = {
    // Lexical states for SCLEX_BAAN
    { STE_STYLE_DEFAULT,           wxSTC_BAAN_DEFAULT,      "White space" }, // 0
    { STE_STYLE_COMMENT,           wxSTC_BAAN_COMMENT,      "Comment" }, // 1
    { STE_STYLE_COMMENTDOC,        wxSTC_BAAN_COMMENTDOC,   "Doc comment" }, // 2
    { STE_STYLE_NUMBER,            wxSTC_BAAN_NUMBER,       "Number" }, // 3
    { STE_STYLE_KEYWORD1,          wxSTC_BAAN_WORD,         "Keyword" }, // 4
    { STE_STYLE_STRING,            wxSTC_BAAN_STRING,       "Double quoted string" }, // 5
    { STE_STYLE_PREPROCESSOR,      wxSTC_BAAN_PREPROCESSOR, "Preprocessor" }, // 6
    { STE_STYLE_OPERATOR,          wxSTC_BAAN_OPERATOR,     "Operators" }, // 7
    { STE_STYLE_IDENTIFIER,        wxSTC_BAAN_IDENTIFIER,   "Identifiers" }, // 8
    { STE_STYLE_STRINGEOL,         wxSTC_BAAN_STRINGEOL,    "End of line where string is not closed" }, // 9
    { STE_STYLE_KEYWORD2,          wxSTC_BAAN_WORD2,        "Keywords 2" }, // 10
};

#define STE_LexerStyles_STE_LANG_MATLAB_COUNT 9
static STE_LexerStyles STE_LexerStyles_STE_LANG_MATLAB[STE_LexerStyles_STE_LANG_MATLAB_COUNT] = {
    // Lexical states for SCLEX_MATLAB
    { STE_STYLE_DEFAULT,       wxSTC_MATLAB_DEFAULT,            "White space" }, // 0
    { STE_STYLE_COMMENT,       wxSTC_MATLAB_COMMENT,            "Comment" }, // 1
    { STE_STYLE_PREPROCESSOR,  wxSTC_MATLAB_COMMAND,            "Command" }, // 2
    { STE_STYLE_NUMBER,        wxSTC_MATLAB_NUMBER,             "Number" }, // 3
    { STE_STYLE_KEYWORD1,      wxSTC_MATLAB_KEYWORD,            "Keyword" }, // 4
    // single quoted string
    { STE_STYLE_STRING,        wxSTC_MATLAB_STRING,             "String" }, // 5
    { STE_STYLE_OPERATOR,      wxSTC_MATLAB_OPERATOR,           "Operator" }, // 6
    { STE_STYLE_IDENTIFIER,    wxSTC_MATLAB_IDENTIFIER,         "Identifier" }, // 7
    { STE_STYLE_STRING,        wxSTC_MATLAB_DOUBLEQUOTESTRING,  "String double quoted" }, // 8
};

#define STE_LexerStyles_STE_LANG_SCRIPTOL_COUNT 16
static STE_LexerStyles STE_LexerStyles_STE_LANG_SCRIPTOL[STE_LexerStyles_STE_LANG_SCRIPTOL_COUNT] = {
    // Lexical states for SCLEX_SCRIPTOL
    { STE_STYLE_DEFAULT,        wxSTC_SCRIPTOL_DEFAULT,     "Default" }, // 0
    { STE_STYLE_DEFAULT,        wxSTC_SCRIPTOL_WHITE,       "White space" }, // 1
    { STE_STYLE_COMMENTLINE,    wxSTC_SCRIPTOL_COMMENTLINE, "Scriptol style comment line" }, // 2
    { STE_STYLE_COMMENTLINE,    wxSTC_SCRIPTOL_PERSISTENT,  "Persistent comment line" }, // 3
    { STE_STYLE_COMMENTLINE,    wxSTC_SCRIPTOL_CSTYLE,      "C style comment line" }, // 4
    { STE_STYLE_COMMENTDOC,     wxSTC_SCRIPTOL_COMMENTBLOCK,"Comment-blocks" }, // 5
    { STE_STYLE_NUMBER,         wxSTC_SCRIPTOL_NUMBER,      "Number" }, // 6
    { STE_STYLE_STRING,         wxSTC_SCRIPTOL_STRING,      "String" }, // 7
    { STE_STYLE_CHARACTER,      wxSTC_SCRIPTOL_CHARACTER,   "Character/Single quoted string" }, // 8
    { STE_STYLE_STRINGEOL,      wxSTC_SCRIPTOL_STRINGEOL,   "End of line where string is not closed" }, // 9
    { STE_STYLE_KEYWORD1,       wxSTC_SCRIPTOL_KEYWORD,     "Keyword" }, // 10
    { STE_STYLE_OPERATOR,       wxSTC_SCRIPTOL_OPERATOR,    "Operators" }, // 11
    { STE_STYLE_IDENTIFIER,     wxSTC_SCRIPTOL_IDENTIFIER,  "Identifiers" }, // 12
    { STE_STYLE_NUMBER,         wxSTC_SCRIPTOL_TRIPLE,      "Triple quotes" }, // 13
    { STE_STYLE_LABEL,          wxSTC_SCRIPTOL_CLASSNAME,   "Class name definition" }, // 14
    { STE_STYLE_PREPROCESSOR,   wxSTC_SCRIPTOL_PREPROCESSOR,"Preprocessor" }, // 15
};

#define STE_LexerStyles_STE_LANG_ASM_COUNT 15
static STE_LexerStyles STE_LexerStyles_STE_LANG_ASM[STE_LexerStyles_STE_LANG_ASM_COUNT] = {
    // Lexical states for SCLEX_ASM
    { STE_STYLE_DEFAULT,        wxSTC_ASM_DEFAULT,          "Default" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_ASM_COMMENT,          "Comment" }, // 1
    { STE_STYLE_NUMBER,         wxSTC_ASM_NUMBER,           "Number" }, // 2
    { STE_STYLE_STRING,         wxSTC_ASM_STRING,           "String" }, // 3
    { STE_STYLE_OPERATOR,       wxSTC_ASM_OPERATOR,         "Operator" }, // 4
    { STE_STYLE_IDENTIFIER,     wxSTC_ASM_IDENTIFIER,       "Identifier" }, // 5
    { STE_STYLE_KEYWORD1,       wxSTC_ASM_CPUINSTRUCTION,   "CPU instruction" }, // 6
    { STE_STYLE_KEYWORD2,       wxSTC_ASM_MATHINSTRUCTION,  "FPU instruction" }, // 7
    { STE_STYLE_KEYWORD3,       wxSTC_ASM_REGISTER,         "Register" }, // 8
    { STE_STYLE_KEYWORD4,       wxSTC_ASM_DIRECTIVE,        "Assembler directive" }, // 9
    { STE_STYLE_KEYWORD5,       wxSTC_ASM_DIRECTIVEOPERAND, "Assembler Directive Operand" }, // 10
    { STE_STYLE_COMMENTDOC,     wxSTC_ASM_COMMENTBLOCK,     "Comment block (GNU as /*...*/ syntax, unimplemented)" }, // 11
    { STE_STYLE_CHARACTER,      wxSTC_ASM_CHARACTER,        "Character/String (single quote) (also character prefix in GNU as)" }, // 12
    { STE_STYLE_STRINGEOL,      wxSTC_ASM_STRINGEOL,        "End of line where string is not closed" }, // 13
    { STE_STYLE_DEFAULT,        wxSTC_ASM_EXTINSTRUCTION,   "Extended instructions" }, // 14
};

#define STE_LexerStyles_STE_LANG_CPPNOCASE_COUNT STE_LexerStyles_STE_LANG_CPP_COUNT
STE_LexerStyles *STE_LexerStyles_STE_LANG_CPPNOCASE = STE_LexerStyles_STE_LANG_CPP;

#define STE_LexerStyles_STE_LANG_FORTRAN_COUNT 15
static STE_LexerStyles STE_LexerStyles_STE_LANG_FORTRAN[STE_LexerStyles_STE_LANG_FORTRAN_COUNT] = {
    // Lexical states for SCLEX_FORTRAN
    { STE_STYLE_DEFAULT,        wxSTC_F_DEFAULT,        "Default" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_F_COMMENT,        "Comment" }, // 1
    { STE_STYLE_NUMBER,         wxSTC_F_NUMBER,         "Number" }, // 2
    { STE_STYLE_STRING,         wxSTC_F_STRING1,        "Single quoted string" }, // 3
    { STE_STYLE_STRING,         wxSTC_F_STRING2,        "Double quoted string" }, // 4
    { STE_STYLE_STRINGEOL,      wxSTC_F_STRINGEOL,      "End of line where string is not closed" }, // 5
    { STE_STYLE_OPERATOR,       wxSTC_F_OPERATOR,       "Operators" }, // 6
    { STE_STYLE_IDENTIFIER,     wxSTC_F_IDENTIFIER,     "Identifiers" }, // 7
    { STE_STYLE_KEYWORD1,       wxSTC_F_WORD,           "Keywords 1" }, // 8
    { STE_STYLE_KEYWORD2,       wxSTC_F_WORD2,          "Keywords 2" }, // 9
    { STE_STYLE_KEYWORD3,       wxSTC_F_WORD3,          "Keywords 3" }, // 10
    { STE_STYLE_PREPROCESSOR,   wxSTC_F_PREPROCESSOR,   "Preprocessor" }, // 11
    { STE_STYLE_OPERATOR,       wxSTC_F_OPERATOR2,      "Operators in .NAME. format" }, // 12
    { STE_STYLE_LABEL,          wxSTC_F_LABEL,          "Labels" }, // 13
    { STE_STYLE_DEFAULT,        wxSTC_F_CONTINUATION,   "Continuation" }, // 14
};

#define STE_LexerStyles_STE_LANG_F77_COUNT STE_LexerStyles_STE_LANG_FORTRAN_COUNT
STE_LexerStyles *STE_LexerStyles_STE_LANG_F77 = STE_LexerStyles_STE_LANG_FORTRAN;

#define STE_LexerStyles_STE_LANG_CSS_COUNT 16
static STE_LexerStyles STE_LexerStyles_STE_LANG_CSS[STE_LexerStyles_STE_LANG_CSS_COUNT] = {
    // Lexical states for SCLEX_CSS
    { STE_STYLE_DEFAULT,        wxSTC_CSS_DEFAULT,              "White space" }, // 0
    { STE_STYLE_KEYWORD1,       wxSTC_CSS_TAG,                  "Selector (HTML tag)" }, // 1
    { STE_STYLE_COMMAND,        wxSTC_CSS_CLASS,                "Class selector ([HtmlTag].classSelector)" }, // 2
    { STE_STYLE_KEYWORD2,       wxSTC_CSS_PSEUDOCLASS,          "Pseudo class (HtmlTag:pseudoClass)" }, // 3
    { STE_STYLE_ERROR,          wxSTC_CSS_UNKNOWN_PSEUDOCLASS,  "Unknown Pseudo class" }, // 4
    { STE_STYLE_OPERATOR,       wxSTC_CSS_OPERATOR,             "Operator" }, // 5
    { STE_STYLE_IDENTIFIER,     wxSTC_CSS_IDENTIFIER,           "CSS1 Property" }, // 6
    { STE_STYLE_ERROR,          wxSTC_CSS_UNKNOWN_IDENTIFIER,   "Unknown Property" }, // 7
    { STE_STYLE_VALUE,          wxSTC_CSS_VALUE,                "Value" }, // 8
    { STE_STYLE_COMMENT,        wxSTC_CSS_COMMENT,              "Comment" }, // 9
    { STE_STYLE_UUID,           wxSTC_CSS_ID,                   "ID selector (#IdSel)" }, // 10
    { STE_STYLE_DEFAULT,        wxSTC_CSS_IMPORTANT,            "Important" }, // 11
    { STE_STYLE_DEFAULT,        wxSTC_CSS_DIRECTIVE,            "At-rule (@)" }, // 12
    { STE_STYLE_STRING,         wxSTC_CSS_DOUBLESTRING,         "Double quoted strings" }, // 13
    { STE_STYLE_CHARACTER,      wxSTC_CSS_SINGLESTRING,         "Single quoted strings" }, // 14
    { STE_STYLE_IDENTIFIER,     wxSTC_CSS_IDENTIFIER2,          "CSS2 Property" }, // 15
    // FIXME 1.64 add "Attribute selection ([att='val'])" 16
};

#define STE_LexerStyles_STE_LANG_POV_COUNT 17
static STE_LexerStyles STE_LexerStyles_STE_LANG_POV[STE_LexerStyles_STE_LANG_POV_COUNT] = {
    // Lexical states for SCLEX_POV
    { STE_STYLE_DEFAULT,        wxSTC_POV_DEFAULT,      "White space" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_POV_COMMENT,      "Comment" }, // 1
    { STE_STYLE_COMMENTLINE,    wxSTC_POV_COMMENTLINE,  "Line Comment" }, // 2
    { STE_STYLE_NUMBER,         wxSTC_POV_NUMBER,       "Number" }, // 3
    { STE_STYLE_OPERATOR,       wxSTC_POV_OPERATOR,     "Operators" }, // 4
    { STE_STYLE_IDENTIFIER,     wxSTC_POV_IDENTIFIER,   "Identifiers (everything else...)" }, // 5
    { STE_STYLE_STRING,         wxSTC_POV_STRING,       "Double quoted string" }, // 6
    { STE_STYLE_STRINGEOL,      wxSTC_POV_STRINGEOL,    "End of line where string is not closed" }, // 7
    { STE_STYLE_KEYWORD1,       wxSTC_POV_DIRECTIVE,    "Directive: #keyword" }, // 8
    { STE_STYLE_ERROR,          wxSTC_POV_BADDIRECTIVE, "Directive keyword error" }, // 9
    { STE_STYLE_KEYWORD2,       wxSTC_POV_WORD2,        "Keyword 2: Objects & CSG & Appearance (xxx {})" }, // 10
    { STE_STYLE_KEYWORD3,       wxSTC_POV_WORD3,        "Keyword 3: Types & Modifiers & Items" }, // 11
    { STE_STYLE_KEYWORD4,       wxSTC_POV_WORD4,        "Keyword 4: Predefined Identifiers" }, // 12
    { STE_STYLE_KEYWORD5,       wxSTC_POV_WORD5,        "Keyword 5: Predefined Functions" }, // 13
    { STE_STYLE_KEYWORD6,       wxSTC_POV_WORD6,        "Keyword 6" }, // 14
    { STE_STYLE_KEYWORD6,       wxSTC_POV_WORD7,        "Keyword 7" }, // 15
    { STE_STYLE_KEYWORD6,       wxSTC_POV_WORD8,        "Keyword 8" }, // 16
};

#define STE_LexerStyles_STE_LANG_LOUT_COUNT 11
static STE_LexerStyles STE_LexerStyles_STE_LANG_LOUT[STE_LexerStyles_STE_LANG_LOUT_COUNT] = {
    // Lexical states for SCLEX_LOUT
    { STE_STYLE_DEFAULT,        wxSTC_LOUT_DEFAULT,     "White space" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_LOUT_COMMENT,     "Comment" }, // 1
    { STE_STYLE_NUMBER,         wxSTC_LOUT_NUMBER,      "Number" }, // 2
    { STE_STYLE_KEYWORD1,       wxSTC_LOUT_WORD,        "Keyword 1" }, // 3
    { STE_STYLE_KEYWORD2,       wxSTC_LOUT_WORD2,       "Keyword 2" }, // 4
    { STE_STYLE_KEYWORD3,       wxSTC_LOUT_WORD3,       "Keyword 3" }, // 5
    { STE_STYLE_KEYWORD4,       wxSTC_LOUT_WORD4,       "Keyword 4" }, // 6
    { STE_STYLE_STRING,         wxSTC_LOUT_STRING,      "Double quoted string" }, // 7
    { STE_STYLE_OPERATOR,       wxSTC_LOUT_OPERATOR,    "Operators" }, // 8
    { STE_STYLE_IDENTIFIER,     wxSTC_LOUT_IDENTIFIER,  "Identifiers" }, // 9
    { STE_STYLE_STRINGEOL,      wxSTC_LOUT_STRINGEOL,   "End of line where string is not closed" }, // 10
};

#define STE_LexerStyles_STE_LANG_ESCRIPT_COUNT 12
static STE_LexerStyles STE_LexerStyles_STE_LANG_ESCRIPT[STE_LexerStyles_STE_LANG_ESCRIPT_COUNT] = {
    // Lexical states for SCLEX_ESCRIPT
    { STE_STYLE_DEFAULT,        wxSTC_ESCRIPT_DEFAULT,      "Default" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_ESCRIPT_COMMENT,      "Comment" }, // 1
    { STE_STYLE_COMMENTLINE,    wxSTC_ESCRIPT_COMMENTLINE,  "Line Comment" }, // 2
    { STE_STYLE_COMMENTDOC,     wxSTC_ESCRIPT_COMMENTDOC,   "Doc comment" }, // 3
    { STE_STYLE_NUMBER,         wxSTC_ESCRIPT_NUMBER,       "Number" }, // 4
    { STE_STYLE_KEYWORD1,       wxSTC_ESCRIPT_WORD,         "Keyword" }, // 5
    { STE_STYLE_STRING,         wxSTC_ESCRIPT_STRING,       "Double quoted string" }, // 6
    { STE_STYLE_OPERATOR,       wxSTC_ESCRIPT_OPERATOR,     "Operators" }, // 7
    { STE_STYLE_IDENTIFIER,     wxSTC_ESCRIPT_IDENTIFIER,   "Identifiers" }, // 8
    { STE_STYLE_BRACE,          wxSTC_ESCRIPT_BRACE,        "Braces" }, // 9
    { STE_STYLE_KEYWORD2,       wxSTC_ESCRIPT_WORD2,        "Keywords 2" }, // 10
    { STE_STYLE_KEYWORD3,       wxSTC_ESCRIPT_WORD3,        "Keywords 3" }, // 11
};

#define STE_LexerStyles_STE_LANG_PS_COUNT 16
static STE_LexerStyles STE_LexerStyles_STE_LANG_PS[STE_LexerStyles_STE_LANG_PS_COUNT] = {
    // Lexical states for SCLEX_PS
    { STE_STYLE_DEFAULT,        wxSTC_PS_DEFAULT,       "Default" }, // 0
    { STE_STYLE_COMMENTLINE,    wxSTC_PS_COMMENT,       "Comment" }, // 1
    { STE_STYLE_COMMENTDOC,     wxSTC_PS_DSC_COMMENT,   "DSC comment" }, // 2
    { STE_STYLE_COMMENTDOC,     wxSTC_PS_DSC_VALUE,     "DSC comment value" }, // 3
    { STE_STYLE_NUMBER,         wxSTC_PS_NUMBER,        "Number" }, // 4
    { STE_STYLE_DEFAULT,        wxSTC_PS_NAME,          "Name" }, // 5
    { STE_STYLE_KEYWORD1,       wxSTC_PS_KEYWORD,       "Keyword" }, // 6
    { STE_STYLE_LABEL,          wxSTC_PS_LITERAL,       "Literal" }, // 7
    { STE_STYLE_PREPROCESSOR,   wxSTC_PS_IMMEVAL,       "Immediately evaluated literal" }, // 8
    { STE_STYLE_KEYWORD2,       wxSTC_PS_PAREN_ARRAY,   "Array parenthesis" }, // 9
    { STE_STYLE_BRACE,          wxSTC_PS_PAREN_DICT,    "Dictionary parenthesis" }, // 10
    { STE_STYLE_OPERATOR,       wxSTC_PS_PAREN_PROC,    "Procedure parenthesis" }, // 11
    { STE_STYLE_STRING,         wxSTC_PS_TEXT,          "Text" }, // 12
    { STE_STYLE_NUMBER,         wxSTC_PS_HEXSTRING,     "Hex string" }, // 13
    { STE_STYLE_NUMBER,         wxSTC_PS_BASE85STRING,  "Base85 string" }, // 14
    { STE_STYLE_ERROR,          wxSTC_PS_BADSTRINGCHAR, "Bad string character" }, // 15
};

#define STE_LexerStyles_STE_LANG_NSIS_COUNT 15
static STE_LexerStyles STE_LexerStyles_STE_LANG_NSIS[STE_LexerStyles_STE_LANG_NSIS_COUNT] = {
    // Lexical states for SCLEX_NSIS
    { STE_STYLE_DEFAULT,        wxSTC_NSIS_DEFAULT,       "Whitespace" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_NSIS_COMMENT,       "Comment" }, // 1
    { STE_STYLE_STRING,         wxSTC_NSIS_STRINGDQ,      "String double quote" }, // 2
    { STE_STYLE_STRING,         wxSTC_NSIS_STRINGLQ,      "String left quote" }, // 3
    { STE_STYLE_STRING,         wxSTC_NSIS_STRINGRQ,      "String right quote" }, // 4
    { STE_STYLE_KEYWORD1,       wxSTC_NSIS_FUNCTION,      "Function" }, // 5
    { STE_STYLE_VALUE,          wxSTC_NSIS_VARIABLE,      "Variable" }, // 6
    { STE_STYLE_KEYWORD3,       wxSTC_NSIS_LABEL,         "Label" }, // 7
    { STE_STYLE_KEYWORD4,       wxSTC_NSIS_USERDEFINED,   "User Defined" }, // 8
    { STE_STYLE_DEFAULT,        wxSTC_NSIS_SECTIONDEF,    "Section" }, // 9
    { STE_STYLE_DEFAULT,        wxSTC_NSIS_SUBSECTIONDEF, "Sub section" }, // 10
    { STE_STYLE_DEFAULT,        wxSTC_NSIS_IFDEFINEDEF,   "If def" }, // 11
    { STE_STYLE_PREPROCESSOR,   wxSTC_NSIS_MACRODEF,      "Macro def" }, // 12
    { STE_STYLE_KEYWORD2,       wxSTC_NSIS_STRINGVAR,     "Variable within string" }, // 13
    { STE_STYLE_NUMBER,         wxSTC_NSIS_NUMBER,        "Numbers" }, // 14
    // FIXME 1.64 add "Section Group" 15
    // FIXME 1.64 add "Page Ex" 16
    // FIXME 1.64 add "Function Definition" 17
    // FIXME 1.64 add "Comment Box" 18
};

#define STE_LexerStyles_STE_LANG_MMIXAL_COUNT 18
static STE_LexerStyles STE_LexerStyles_STE_LANG_MMIXAL[STE_LexerStyles_STE_LANG_MMIXAL_COUNT] = {
    // Lexical states for SCLEX_MMIXAL
    { STE_STYLE_DEFAULT,    wxSTC_MMIXAL_LEADWS,        "Divsion of leading whitespace in line" }, // 0
    { STE_STYLE_COMMENT,    wxSTC_MMIXAL_COMMENT,       "Comment" }, // 1
    { STE_STYLE_LABEL,      wxSTC_MMIXAL_LABEL,         "Label" }, // 2
    { STE_STYLE_KEYWORD1,   wxSTC_MMIXAL_OPCODE,        "Opcode (not validated)" }, // 3
    { STE_STYLE_DEFAULT,    wxSTC_MMIXAL_OPCODE_PRE,    "Division between Label and Opcode" }, // 4
    { STE_STYLE_DEFAULT,    wxSTC_MMIXAL_OPCODE_VALID,  "Valid Opcode" }, // 5
    { STE_STYLE_DEFAULT,    wxSTC_MMIXAL_OPCODE_UNKNOWN,"Unknown Opcode" }, // 6
    { STE_STYLE_DEFAULT,    wxSTC_MMIXAL_OPCODE_POST,   "Division between Opcode and Operands" }, // 7
    { STE_STYLE_OPERATOR,   wxSTC_MMIXAL_OPERANDS,      "Division of Operands" }, // 8
    { STE_STYLE_NUMBER,     wxSTC_MMIXAL_NUMBER,        "Number" }, // 9
    { STE_STYLE_DEFAULT,    wxSTC_MMIXAL_REF,           "Reference (to a Label)" }, // 10
    { STE_STYLE_CHARACTER,  wxSTC_MMIXAL_CHAR,          "Char" }, // 11
    { STE_STYLE_STRING,     wxSTC_MMIXAL_STRING,        "String" }, // 12
    { STE_STYLE_NUMBER,     wxSTC_MMIXAL_REGISTER,      "Register" }, // 13
    { STE_STYLE_NUMBER,     wxSTC_MMIXAL_HEX,           "Hexadecimal Number" }, // 14
    { STE_STYLE_OPERATOR,   wxSTC_MMIXAL_OPERATOR,      "Operator" }, // 15
    { STE_STYLE_DEFAULT,    wxSTC_MMIXAL_SYMBOL,        "Symbol" }, // 16
    { STE_STYLE_DEFAULT,    wxSTC_MMIXAL_INCLUDE,       "Comment or include" }, // 17
};

#define STE_LexerStyles_STE_LANG_CLW_COUNT 15
static STE_LexerStyles STE_LexerStyles_STE_LANG_CLW[STE_LexerStyles_STE_LANG_CLW_COUNT] = {
    // Lexical states for SCLEX_CLW
    { STE_STYLE_DEFAULT,    wxSTC_CLW_DEFAULT,               "Default" }, // 0
    { STE_STYLE_LABEL,      wxSTC_CLW_LABEL,                 "Label" }, // 1
    { STE_STYLE_COMMENT,    wxSTC_CLW_COMMENT,               "Comment" }, // 2
    { STE_STYLE_STRING,     wxSTC_CLW_STRING,                "String" }, // 3
    { STE_STYLE_IDENTIFIER, wxSTC_CLW_USER_IDENTIFIER,       "User identifier" }, // 4
    { STE_STYLE_DEFAULT,    wxSTC_CLW_INTEGER_CONSTANT,      "Integer constant" }, // 5
    { STE_STYLE_DEFAULT,    wxSTC_CLW_REAL_CONSTANT,         "Real constant" }, // 6
    { STE_STYLE_STRING,     wxSTC_CLW_PICTURE_STRING,        "Picture string" }, // 7
    { STE_STYLE_KEYWORD1,   wxSTC_CLW_KEYWORD,               "Keyword" }, // 8
    { STE_STYLE_DEFAULT,    wxSTC_CLW_COMPILER_DIRECTIVE,    "Compilier directive" }, // 9
    { STE_STYLE_DEFAULT,    wxSTC_CLW_BUILTIN_PROCEDURES_FUNCTION, "Builtin procedures function" }, // 10
    { STE_STYLE_DEFAULT,    wxSTC_CLW_STRUCTURE_DATA_TYPE,   "Stucture data type" }, // 11
    { STE_STYLE_DEFAULT,    wxSTC_CLW_ATTRIBUTE,             "Attribute" }, // 12
    { STE_STYLE_DEFAULT,    wxSTC_CLW_STANDARD_EQUATE,       "Standard equate" }, // 13
    { STE_STYLE_ERROR,      wxSTC_CLW_ERROR,                 "Error" }, // 14
};

#define STE_LexerStyles_STE_LANG_CLWNOCASE_COUNT STE_LexerStyles_STE_LANG_CLW_COUNT
STE_LexerStyles* STE_LexerStyles_STE_LANG_CLWNOCASE = STE_LexerStyles_STE_LANG_CLW;

#define STE_LexerStyles_STE_LANG_LOT_COUNT 7
static STE_LexerStyles STE_LexerStyles_STE_LANG_LOT[STE_LexerStyles_STE_LANG_LOT_COUNT] = {
    // Lexical states for SCLEX_LOT
    { STE_STYLE_DEFAULT,  wxSTC_LOT_DEFAULT,   "Default" }, // 0
    { STE_STYLE_DEFAULT,  wxSTC_LOT_HEADER,    "Header" }, // 1
    { STE_STYLE_DEFAULT,  wxSTC_LOT_BREAK,     "Break" }, // 2
    { STE_STYLE_DEFAULT,  wxSTC_LOT_SET,       "Set" }, // 3
    { STE_STYLE_DEFAULT,  wxSTC_LOT_PASS,      "Pass" }, // 4
    { STE_STYLE_DEFAULT,  wxSTC_LOT_FAIL,      "Fail" }, // 5
    { STE_STYLE_DEFAULT,  wxSTC_LOT_ABORT,     "Abort" }, // 6
};

#define STE_LexerStyles_STE_LANG_YAML_COUNT 9
static STE_LexerStyles STE_LexerStyles_STE_LANG_YAML[STE_LexerStyles_STE_LANG_YAML_COUNT] = {
    // Lexical states for SCLEX_YAML
    { STE_STYLE_DEFAULT,  wxSTC_YAML_DEFAULT,     "Default" }, // 0
    { STE_STYLE_DEFAULT,  wxSTC_YAML_COMMENT,     "Comment line" }, // 1
    { STE_STYLE_DEFAULT,  wxSTC_YAML_IDENTIFIER,  "Value identifier" }, // 2
    { STE_STYLE_DEFAULT,  wxSTC_YAML_KEYWORD,     "Keyword" }, // 3
    { STE_STYLE_DEFAULT,  wxSTC_YAML_NUMBER,      "Number" }, // 4
    { STE_STYLE_DEFAULT,  wxSTC_YAML_REFERENCE,   "Reference/repeating value" }, // 5
    { STE_STYLE_DEFAULT,  wxSTC_YAML_DOCUMENT,    "Document delimiting line" }, // 6
    { STE_STYLE_DEFAULT,  wxSTC_YAML_TEXT,        "Text block marker" }, // 7
    { STE_STYLE_DEFAULT,  wxSTC_YAML_ERROR,       "Syntax error marker" }, // 8
};

#define STE_LexerStyles_STE_LANG_TEX_COUNT 6
static STE_LexerStyles STE_LexerStyles_STE_LANG_TEX[STE_LexerStyles_STE_LANG_TEX_COUNT] = {
    // Lexical states for SCLEX_TEX
    { STE_STYLE_DEFAULT,    wxSTC_TEX_DEFAULT,   "Default" }, // 0
    { STE_STYLE_LABEL,      wxSTC_TEX_SPECIAL,   "Special" }, // 1
    { STE_STYLE_DEFAULT,    wxSTC_TEX_GROUP,     "Group" }, // 2
    { STE_STYLE_OPERATOR,   wxSTC_TEX_SYMBOL,    "Symbol" }, // 3
    { STE_STYLE_COMMAND,    wxSTC_TEX_COMMAND,   "Command" }, // 4
    { STE_STYLE_DEFAULT,    wxSTC_TEX_TEXT,      "Text" }, // 5
};

#define STE_LexerStyles_STE_LANG_METAPOST_COUNT 7
static STE_LexerStyles STE_LexerStyles_STE_LANG_METAPOST[STE_LexerStyles_STE_LANG_METAPOST_COUNT] = {
    { STE_STYLE_DEFAULT,    wxSTC_METAPOST_DEFAULT,   "Default" }, // 0
    { STE_STYLE_DEFAULT,    wxSTC_METAPOST_SPECIAL,   "Special" }, // 1
    { STE_STYLE_DEFAULT,    wxSTC_METAPOST_GROUP,     "Group" }, // 2
    { STE_STYLE_OPERATOR,   wxSTC_METAPOST_SYMBOL,    "Symbol" }, // 3
    { STE_STYLE_COMMAND,    wxSTC_METAPOST_COMMAND,   "Command" }, // 4
    { STE_STYLE_DEFAULT,    wxSTC_METAPOST_TEXT,      "Text" }, // 5
    { STE_STYLE_DEFAULT,    wxSTC_METAPOST_EXTRA,     "Extra" }, // 6
};

#define STE_LexerStyles_STE_LANG_POWERBASIC_COUNT STE_LexerStyles_STE_LANG_VB_COUNT
STE_LexerStyles* STE_LexerStyles_STE_LANG_POWERBASIC = STE_LexerStyles_STE_LANG_VB;

#define STE_LexerStyles_STE_LANG_FORTH_COUNT 12
static STE_LexerStyles STE_LexerStyles_STE_LANG_FORTH[STE_LexerStyles_STE_LANG_FORTH_COUNT] = {
    // Lexical states for SCLEX_FORTH (Forth Lexer)
    { STE_STYLE_DEFAULT,        wxSTC_FORTH_DEFAULT,     "Whitespace" }, // 0
    { STE_STYLE_COMMENT,        wxSTC_FORTH_COMMENT,     "Comment" }, // 1
    { STE_STYLE_COMMENTLINE,    wxSTC_FORTH_COMMENT_ML,  "ML comment" }, // 2
    { STE_STYLE_IDENTIFIER,     wxSTC_FORTH_IDENTIFIER,  "Identifier" }, // 3
    { STE_STYLE_COMMAND,        wxSTC_FORTH_CONTROL,     "Control" }, // 4
    { STE_STYLE_KEYWORD1,       wxSTC_FORTH_KEYWORD,     "Keywords" }, // 5
    { STE_STYLE_KEYWORD2,       wxSTC_FORTH_DEFWORD,     "Defwords" }, // 6
    { STE_STYLE_KEYWORD3,       wxSTC_FORTH_PREWORD1,    "Prewords 1" }, // 7
    { STE_STYLE_KEYWORD4,       wxSTC_FORTH_PREWORD2,    "Prewords 2" }, // 8
    { STE_STYLE_NUMBER,         wxSTC_FORTH_NUMBER,      "Number" }, // 9
    { STE_STYLE_STRING,         wxSTC_FORTH_STRING,      "Double quoted string" }, // 10
    { STE_STYLE_LABEL,          wxSTC_FORTH_LOCALE,      "Locale" }, // 11
};

#define STE_LexerStyles_STE_LANG_ERLANG_COUNT 15
static STE_LexerStyles STE_LexerStyles_STE_LANG_ERLANG[STE_LexerStyles_STE_LANG_ERLANG_COUNT] = {
    // Lexical states for SCLEX_ERLANG
    { STE_STYLE_DEFAULT,    wxSTC_ERLANG_DEFAULT,       "White space" }, // 0
    { STE_STYLE_COMMENT,    wxSTC_ERLANG_COMMENT,       "Comment" }, // 1
    { STE_STYLE_LABEL,      wxSTC_ERLANG_VARIABLE,      "Variable" }, // 2
    { STE_STYLE_NUMBER,     wxSTC_ERLANG_NUMBER,        "Number" }, // 3
    { STE_STYLE_KEYWORD1,   wxSTC_ERLANG_KEYWORD,       "Keyword" }, // 4
    { STE_STYLE_STRING,     wxSTC_ERLANG_STRING,        "String" }, // 5
    { STE_STYLE_OPERATOR,   wxSTC_ERLANG_OPERATOR,      "Operator" }, // 6
    { STE_STYLE_DEFAULT,    wxSTC_ERLANG_ATOM,          "Atom" }, // 7
    { STE_STYLE_DEFAULT,    wxSTC_ERLANG_FUNCTION_NAME, "Function name" }, // 8
    { STE_STYLE_CHARACTER,  wxSTC_ERLANG_CHARACTER,     "Character" }, // 9
    { STE_STYLE_SCRIPT,     wxSTC_ERLANG_MACRO,         "Macro" }, // 10
    { STE_STYLE_LABEL,      wxSTC_ERLANG_RECORD,        "Record" }, // 11
    { STE_STYLE_DELIMITER,  wxSTC_ERLANG_SEPARATOR,     "Separator" }, // 12
    { STE_STYLE_LABEL,      wxSTC_ERLANG_NODE_NAME,     "Node name" }, // 13
    { STE_STYLE_UNDEFINED,  wxSTC_ERLANG_UNKNOWN,       "Parse error" }, // 31
};

#define STE_LexerStyles_STE_LANG_OCTAVE_COUNT STE_LexerStyles_STE_LANG_MATLAB_COUNT
STE_LexerStyles* STE_LexerStyles_STE_LANG_OCTAVE = STE_LexerStyles_STE_LANG_MATLAB;

#define STE_LexerStyles_STE_LANG_MSSQL_COUNT 17
static STE_LexerStyles STE_LexerStyles_STE_LANG_MSSQL[STE_LexerStyles_STE_LANG_MSSQL_COUNT] = {
    // Lexical states for SCLEX_MSSQL
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_DEFAULT,            "Default" }, // 0
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_COMMENT,            "Comment" }, // 1
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_LINE_COMMENT,       "Line comment" }, // 2
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_NUMBER,             "Number" }, // 3
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_STRING,             "String" }, // 4
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_OPERATOR,           "Operator" }, // 5
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_IDENTIFIER,         "Identifier" }, // 6
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_VARIABLE,           "Variable" }, // 7
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_COLUMN_NAME,        "Column name" }, // 8
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_STATEMENT,          "Statement" }, // 9
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_DATATYPE,           "Data type" }, // 10
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_SYSTABLE,           "Sys table" }, // 11
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_GLOBAL_VARIABLE,    "Global variable" }, // 12
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_FUNCTION,           "Function" }, // 13
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_STORED_PROCEDURE,   "Procedure" }, // 14
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_DEFAULT_PREF_DATATYPE, "Data type" }, // 15
    { STE_STYLE_DEFAULT,    wxSTC_MSSQL_COLUMN_NAME_2,      "Column name 2" }, // 16
};

#define STE_LexerStyles_STE_LANG_VERILOG_COUNT 14
static STE_LexerStyles STE_LexerStyles_STE_LANG_VERILOG[STE_LexerStyles_STE_LANG_VERILOG_COUNT] = {
    // Lexical states for SCLEX_VERILOG
    { STE_STYLE_DEFAULT,    wxSTC_V_DEFAULT,        "White space" }, // 0
    { STE_STYLE_DEFAULT,    wxSTC_V_COMMENT,        "Comment" }, // 1
    { STE_STYLE_DEFAULT,    wxSTC_V_COMMENTLINE,    "Line comment" }, // 2
    { STE_STYLE_DEFAULT,    wxSTC_V_COMMENTLINEBANG,"Bang comment" }, // 3
    { STE_STYLE_DEFAULT,    wxSTC_V_NUMBER,         "Number" }, // 4
    { STE_STYLE_DEFAULT,    wxSTC_V_WORD,           "Keyword" }, // 5
    { STE_STYLE_DEFAULT,    wxSTC_V_STRING,         "Double quoted string" }, // 6
    { STE_STYLE_DEFAULT,    wxSTC_V_WORD2,          "Keyword 2" }, // 7
    { STE_STYLE_DEFAULT,    wxSTC_V_WORD3,          "System tasks" }, // 8
    { STE_STYLE_DEFAULT,    wxSTC_V_PREPROCESSOR,   "Preprocessor" }, // 9
    { STE_STYLE_DEFAULT,    wxSTC_V_OPERATOR,       "Operators" }, // 10
    { STE_STYLE_DEFAULT,    wxSTC_V_IDENTIFIER,     "Identifiers" }, // 11
    { STE_STYLE_DEFAULT,    wxSTC_V_STRINGEOL,      "End of line where string is not closed" }, // 12
    { STE_STYLE_DEFAULT,    wxSTC_V_USER,           "User defined identifiers and tasks" }, // 19
};

#define STE_LexerStyles_STE_LANG_KIX_COUNT 11
static STE_LexerStyles STE_LexerStyles_STE_LANG_KIX[STE_LexerStyles_STE_LANG_KIX_COUNT] = {
    // Lexical states for SCLEX_KIX
    { STE_STYLE_DEFAULT,    wxSTC_KIX_DEFAULT,     "White space" }, // 0
    { STE_STYLE_DEFAULT,    wxSTC_KIX_COMMENT,     "Comment" }, // 1
    { STE_STYLE_DEFAULT,    wxSTC_KIX_STRING1,     "String 1" }, // 2
    { STE_STYLE_DEFAULT,    wxSTC_KIX_STRING2,     "String 2" }, // 3
    { STE_STYLE_DEFAULT,    wxSTC_KIX_NUMBER,      "Number" }, // 4
    { STE_STYLE_DEFAULT,    wxSTC_KIX_VAR,         "Variables" }, // 5
    { STE_STYLE_DEFAULT,    wxSTC_KIX_MACRO,       "Macro" }, // 6
    { STE_STYLE_DEFAULT,    wxSTC_KIX_KEYWORD,     "Keyword" }, // 7
    { STE_STYLE_DEFAULT,    wxSTC_KIX_FUNCTIONS,   "Function" }, // 8
    { STE_STYLE_DEFAULT,    wxSTC_KIX_OPERATOR,    "Operator" }, // 9
    { STE_STYLE_DEFAULT,    wxSTC_KIX_IDENTIFIER,  "Identifier" }, // 31
};

#define STE_LexerStyles_STE_LANG_GUI4CLI_COUNT 10
static STE_LexerStyles STE_LexerStyles_STE_LANG_GUI4CLI[STE_LexerStyles_STE_LANG_GUI4CLI_COUNT] = {
    // Lexical states for SCLEX_GUI4CLI
    { STE_STYLE_DEFAULT,    wxSTC_GC_DEFAULT,       "Default" }, // 0
    { STE_STYLE_DEFAULT,    wxSTC_GC_COMMENTLINE,   "Line comment" }, // 1
    { STE_STYLE_DEFAULT,    wxSTC_GC_COMMENTBLOCK,  "Block comment" }, // 2
    { STE_STYLE_DEFAULT,    wxSTC_GC_GLOBAL,        "Global" }, // 3
    { STE_STYLE_DEFAULT,    wxSTC_GC_EVENT,         "Event" }, // 4
    { STE_STYLE_DEFAULT,    wxSTC_GC_ATTRIBUTE,     "Attribute" }, // 5
    { STE_STYLE_DEFAULT,    wxSTC_GC_CONTROL,       "Control" }, // 6
    { STE_STYLE_DEFAULT,    wxSTC_GC_COMMAND,       "Command" }, // 7
    { STE_STYLE_DEFAULT,    wxSTC_GC_STRING,        "String" }, // 8
    { STE_STYLE_DEFAULT,    wxSTC_GC_OPERATOR,      "Operator" }, // 9
};

#define STE_LexerStyles_STE_LANG_SPECMAN_COUNT 16
static STE_LexerStyles STE_LexerStyles_STE_LANG_SPECMAN[STE_LexerStyles_STE_LANG_SPECMAN_COUNT] = {
    // Lexical states for SCLEX_SPECMAN
    { STE_STYLE_DEFAULT,    wxSTC_SN_DEFAULT,           "White space" }, // 0
    { STE_STYLE_DEFAULT,    wxSTC_SN_CODE,              "Code" }, // 1
    { STE_STYLE_DEFAULT,    wxSTC_SN_COMMENTLINE,       "Line Comment" }, // 2
    { STE_STYLE_DEFAULT,    wxSTC_SN_COMMENTLINEBANG,   "Line Bang Comment" }, // 3
    { STE_STYLE_DEFAULT,    wxSTC_SN_NUMBER,            "Number" }, // 4
    { STE_STYLE_DEFAULT,    wxSTC_SN_WORD,              "Keyword" }, // 5
    { STE_STYLE_DEFAULT,    wxSTC_SN_STRING,            "Double quoted string" }, // 6
    { STE_STYLE_DEFAULT,    wxSTC_SN_WORD2,             "Keyword 2" }, // 7
    { STE_STYLE_DEFAULT,    wxSTC_SN_WORD3,             "Keyword 3" }, // 8
    { STE_STYLE_DEFAULT,    wxSTC_SN_PREPROCESSOR,      "Preprocessor" }, // 9
    { STE_STYLE_DEFAULT,    wxSTC_SN_OPERATOR,          "Operators" }, // 10
    { STE_STYLE_DEFAULT,    wxSTC_SN_IDENTIFIER,        "Identifiers" }, // 11
    { STE_STYLE_DEFAULT,    wxSTC_SN_STRINGEOL,         "End of line where string is not closed" }, // 12
    { STE_STYLE_REGEX,      wxSTC_SN_REGEXTAG,          "Regexp tag" }, // 13
    { STE_STYLE_DEFAULT,    wxSTC_SN_SIGNAL,            "HDL Signal" }, // 14
    { STE_STYLE_DEFAULT,    wxSTC_SN_USER,              "User defined" }, // 15 ? 19
};

#define STE_LexerStyles_STE_LANG_AU3_COUNT 13
static STE_LexerStyles STE_LexerStyles_STE_LANG_AU3[STE_LexerStyles_STE_LANG_AU3_COUNT] = {
    // Lexical states for SCLEX_AU3
    { STE_STYLE_DEFAULT,    wxSTC_AU3_DEFAULT,      "White space" }, // 0
    { STE_STYLE_DEFAULT,    wxSTC_AU3_COMMENT,      "Comment line" }, // 1
    { STE_STYLE_DEFAULT,    wxSTC_AU3_COMMENTBLOCK, "Comment block" }, // 2
    { STE_STYLE_DEFAULT,    wxSTC_AU3_NUMBER,       "Number" }, // 3
    { STE_STYLE_DEFAULT,    wxSTC_AU3_FUNCTION,     "Function" }, // 4
    { STE_STYLE_DEFAULT,    wxSTC_AU3_KEYWORD,      "Keyword" }, // 5
    { STE_STYLE_DEFAULT,    wxSTC_AU3_MACRO,        "Macro" }, // 6
    { STE_STYLE_DEFAULT,    wxSTC_AU3_STRING,       "String" }, // 7
    { STE_STYLE_DEFAULT,    wxSTC_AU3_OPERATOR,     "Operator" }, // 8
    { STE_STYLE_DEFAULT,    wxSTC_AU3_VARIABLE,     "Variable" }, // 9
    { STE_STYLE_DEFAULT,    wxSTC_AU3_SENT,         "Sent keys in string" }, // 10
    { STE_STYLE_DEFAULT,    wxSTC_AU3_PREPROCESSOR, "Pre-Processor" }, // 11
    { STE_STYLE_DEFAULT,    wxSTC_AU3_SPECIAL,      "Special" }, // 12
//    { STE_STYLE_DEFAULT,    wxSTC_AU3_?,      "Expand abbreviations" }, // 13 FIXME sci 1.66
//    { STE_STYLE_DEFAULT,    wxSTC_AU3_?,      "ComObjects" }, // 14 FIXME sci 1.66
};

#define STE_LexerStyles_STE_LANG_APDL_COUNT 13
static STE_LexerStyles STE_LexerStyles_STE_LANG_APDL[STE_LexerStyles_STE_LANG_APDL_COUNT] = {
    // Lexical states for SCLEX_APDL
    { STE_STYLE_DEFAULT,    wxSTC_APDL_DEFAULT,      "Default" }, // 0
    { STE_STYLE_DEFAULT,    wxSTC_APDL_COMMENT,      "Comment" }, // 1
    { STE_STYLE_DEFAULT,    wxSTC_APDL_COMMENTBLOCK, "Block comment" }, // 2
    { STE_STYLE_DEFAULT,    wxSTC_APDL_NUMBER,       "Number" }, // 3
    { STE_STYLE_DEFAULT,    wxSTC_APDL_STRING,       "String" }, // 4
    { STE_STYLE_DEFAULT,    wxSTC_APDL_OPERATOR,     "Operator" }, // 5
    { STE_STYLE_DEFAULT,    wxSTC_APDL_WORD,         "Keyword" }, // 6
    { STE_STYLE_DEFAULT,    wxSTC_APDL_PROCESSOR,    "Processor" }, // 7
    { STE_STYLE_DEFAULT,    wxSTC_APDL_COMMAND,      "Command" }, // 8
    { STE_STYLE_DEFAULT,    wxSTC_APDL_SLASHCOMMAND, "Slash command" }, // 9
    { STE_STYLE_DEFAULT,    wxSTC_APDL_STARCOMMAND,  "Star command" }, // 10
    { STE_STYLE_DEFAULT,    wxSTC_APDL_ARGUMENT,     "Argument" }, // 11
    { STE_STYLE_DEFAULT,    wxSTC_APDL_FUNCTION,     "Function" }, // 12
};

#define STE_LexerStyles_STE_LANG_BASH_COUNT 14
static STE_LexerStyles STE_LexerStyles_STE_LANG_BASH[STE_LexerStyles_STE_LANG_BASH_COUNT] = {
    // Lexical states for SCLEX_BASH
    { STE_STYLE_DEFAULT,      wxSTC_SH_DEFAULT,         "White space" }, // 0
    { STE_STYLE_ERROR,        wxSTC_SH_ERROR,           "Error" }, // 1
    { STE_STYLE_COMMENTLINE,  wxSTC_SH_COMMENTLINE,     "Comment" }, // 2
    { STE_STYLE_NUMBER,       wxSTC_SH_NUMBER,          "Number" }, // 3
    { STE_STYLE_KEYWORD1,     wxSTC_SH_WORD,            "Keyword" }, // 4
    { STE_STYLE_STRING,       wxSTC_SH_STRING,          "Double quoted string" }, // 5
    { STE_STYLE_CHARACTER,    wxSTC_SH_CHARACTER,       "Single quoted string" }, // 6
    { STE_STYLE_OPERATOR,     wxSTC_SH_OPERATOR,        "Operators" }, // 7
    { STE_STYLE_IDENTIFIER,   wxSTC_SH_IDENTIFIER,      "Identifiers (functions, etc.)" }, // 8
    { STE_STYLE_VALUE,        wxSTC_SH_SCALAR,          "Scalars: $var" }, // 9
    { STE_STYLE_PARAMETER,    wxSTC_SH_PARAM,           "Parameter expansion: ${var}" }, // 10
    { STE_STYLE_BRACE,        wxSTC_SH_BACKTICKS,       "Back Ticks" }, // 11
    { STE_STYLE_PREPROCESSOR, wxSTC_SH_HERE_DELIM,      "Here-doc (delimiter)" }, // 12
    { STE_STYLE_PREPROCESSOR, wxSTC_SH_HERE_Q,          "Here-doc (single quoted, q)" }, // 13
};

#define STE_LexerStyles_STE_LANG_ASN1_COUNT 11
static STE_LexerStyles STE_LexerStyles_STE_LANG_ASN1[STE_LexerStyles_STE_LANG_ASN1_COUNT] = {
    // Lexical states for SCLEX_ASN1
    { STE_STYLE_DEFAULT,    wxSTC_ASN1_DEFAULT,     "Default" }, // 0
    { STE_STYLE_COMMENT,    wxSTC_ASN1_COMMENT,     "Comment" }, // 1
    { STE_STYLE_IDENTIFIER, wxSTC_ASN1_IDENTIFIER,  "Identifiers" }, // 2
    { STE_STYLE_STRING,     wxSTC_ASN1_STRING,      "Double quoted string" }, // 3
    { STE_STYLE_DEFAULT,    wxSTC_ASN1_OID,         "Numeric OID definition" }, // 4
    { STE_STYLE_NUMBER,     wxSTC_ASN1_SCALAR,      "Non OID numbers" }, // 5
    { STE_STYLE_KEYWORD1,   wxSTC_ASN1_KEYWORD,     "Keywords" }, // 6
    { STE_STYLE_DEFAULT,    wxSTC_ASN1_ATTRIBUTE,   "Attributes" }, // 7
    { STE_STYLE_DEFAULT,    wxSTC_ASN1_DESCRIPTOR,  "Descriptors" }, // 8
    { STE_STYLE_DEFAULT,    wxSTC_ASN1_TYPE,        "Types" }, // 9
    { STE_STYLE_OPERATOR,   wxSTC_ASN1_OPERATOR,    "Operators" }, // 10
};

#define STE_LexerStyles_STE_LANG_VHDL_COUNT 15
static STE_LexerStyles STE_LexerStyles_STE_LANG_VHDL[STE_LexerStyles_STE_LANG_VHDL_COUNT] = {
    // Lexical states for SCLEX_VHDL
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_DEFAULT,         "White space" }, // 0
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_COMMENT,         "Comment" }, // 1
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_COMMENTLINEBANG, "Bang comment" }, // 2
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_NUMBER,          "Number" }, // 3
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_STRING,          "Double quoted string" }, // 4
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_OPERATOR,        "Operators" }, // 5
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_IDENTIFIER,      "Identifiers" }, // 6
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_STRINGEOL,       "End of line where string is not closed" }, // 7
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_KEYWORD,         "Keyword" }, // 8
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_STDOPERATOR,     "Std operator" }, // 9
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_ATTRIBUTE,       "Attribute" }, // 10
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_STDFUNCTION,     "Std Function" }, // 11
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_STDPACKAGE,      "Std Package" }, // 12
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_STDTYPE,         "Std Type" }, // 13
    { STE_STYLE_DEFAULT,    wxSTC_VHDL_USERWORD,        "User defined identifiers and tasks" }, // 14
};

#define STE_LexerStyles_STE_LANG_JAVA_COUNT STE_LexerStyles_STE_LANG_CPP_COUNT
STE_LexerStyles* STE_LexerStyles_STE_LANG_JAVA = STE_LexerStyles_STE_LANG_CPP;

#define STE_LexerStyles_STE_LANG_JAVASCRIPT_COUNT STE_LexerStyles_STE_LANG_CPP_COUNT
STE_LexerStyles* STE_LexerStyles_STE_LANG_JAVASCRIPT = STE_LexerStyles_STE_LANG_CPP;

#define STE_LexerStyles_STE_LANG_RC_COUNT STE_LexerStyles_STE_LANG_CPP_COUNT
STE_LexerStyles* STE_LexerStyles_STE_LANG_RC = STE_LexerStyles_STE_LANG_CPP;

#define STE_LexerStyles_STE_LANG_CS_COUNT STE_LexerStyles_STE_LANG_CPP_COUNT
STE_LexerStyles* STE_LexerStyles_STE_LANG_CS = STE_LexerStyles_STE_LANG_CPP;

#define STE_LexerStyles_STE_LANG_D_COUNT STE_LexerStyles_STE_LANG_CPP_COUNT
STE_LexerStyles* STE_LexerStyles_STE_LANG_D = STE_LexerStyles_STE_LANG_CPP;

#define STE_LexerStyles_STE_LANG_IDL_COUNT STE_LexerStyles_STE_LANG_CPP_COUNT
STE_LexerStyles* STE_LexerStyles_STE_LANG_IDL = STE_LexerStyles_STE_LANG_CPP;

#define STE_LexerStyles_STE_LANG_PLSQL_COUNT STE_LexerStyles_STE_LANG_SQL_COUNT
STE_LexerStyles* STE_LexerStyles_STE_LANG_PLSQL = STE_LexerStyles_STE_LANG_SQL;

// ---------------------------------------------------------------------------

#define DEFINE_STE_LANG(TYPE) \
    DefSTE_LexerWords_##TYPE \
    DefSTE_LexerComments_##TYPE \
    DefSTE_LexerBlock_##TYPE \
    DefSTE_LexerPreproc_##TYPE \
    STE_Language _STE_Lang_##TYPE = { \
        STE_LexerName_##TYPE, \
        STE_LexerLang_##TYPE, \
        STE_LexerFilePatterns_##TYPE, \
        STE_LexerStyles_##TYPE, \
        STE_LexerStyles_##TYPE##_COUNT, \
        STE_LexerWords_##TYPE, \
        STE_LexerWords_##TYPE##_COUNT, \
        STE_LexerComments_##TYPE, \
        STE_LexerBlock_##TYPE, \
        STE_LexerPreproc_##TYPE, \
        STE_LexerBraces_##TYPE, \
        STE_LexerFolds_##TYPE, \
        STE_LexerFlags_##TYPE };


// CREATE LEXERS ------------------------
#if STE_USE_LANG_CONTAINER
    DEFINE_STE_LANG(STE_LANG_CONTAINER )
    #define STE_Lang_STE_LANG_CONTAINER  &_STE_Lang_STE_LANG_CONTAINER
#else
    #define STE_Lang_STE_LANG_CONTAINER  NULL
#endif
#if STE_USE_LANG_NULL
    DEFINE_STE_LANG(STE_LANG_NULL      )
    #define STE_Lang_STE_LANG_NULL       &_STE_Lang_STE_LANG_NULL
#else
    #define STE_Lang_STE_LANG_NULL       NULL
#endif
#if STE_USE_LANG_PYTHON
    DEFINE_STE_LANG(STE_LANG_PYTHON    )
    #define STE_Lang_STE_LANG_PYTHON     &_STE_Lang_STE_LANG_PYTHON
#else
    #define STE_Lang_STE_LANG_PYTHON     NULL
#endif
#if STE_USE_LANG_CPP
    DEFINE_STE_LANG(STE_LANG_CPP       )
    #define STE_Lang_STE_LANG_CPP        &_STE_Lang_STE_LANG_CPP
#else
    #define STE_Lang_STE_LANG_CPP        NULL
#endif
#if STE_USE_LANG_HTML
    DEFINE_STE_LANG(STE_LANG_HTML      )
    #define STE_Lang_STE_LANG_HTML       &_STE_Lang_STE_LANG_HTML
#else
    #define STE_Lang_STE_LANG_HTML       NULL
#endif
#if STE_USE_LANG_XML
    DEFINE_STE_LANG(STE_LANG_XML       )
    #define STE_Lang_STE_LANG_XML        &_STE_Lang_STE_LANG_XML
#else
    #define STE_Lang_STE_LANG_XML        NULL
#endif
#if STE_USE_LANG_PERL
    DEFINE_STE_LANG(STE_LANG_PERL      )
    #define STE_Lang_STE_LANG_PERL       &_STE_Lang_STE_LANG_PERL
#else
    #define STE_Lang_STE_LANG_PERL       NULL
#endif
#if STE_USE_LANG_SQL
    DEFINE_STE_LANG(STE_LANG_SQL       )
    #define STE_Lang_STE_LANG_SQL        &_STE_Lang_STE_LANG_SQL
#else
    #define STE_Lang_STE_LANG_SQL        NULL
#endif
#if STE_USE_LANG_VB
    DEFINE_STE_LANG(STE_LANG_VB        )
    #define STE_Lang_STE_LANG_VB         &_STE_Lang_STE_LANG_VB
#else
    #define STE_Lang_STE_LANG_VB         NULL
#endif
#if STE_USE_LANG_PROPERTIES
    DEFINE_STE_LANG(STE_LANG_PROPERTIES)
    #define STE_Lang_STE_LANG_PROPERTIES &_STE_Lang_STE_LANG_PROPERTIES
#else
    #define STE_Lang_STE_LANG_PROPERTIES NULL
#endif
#if STE_USE_LANG_ERRORLIST
    DEFINE_STE_LANG(STE_LANG_ERRORLIST )
    #define STE_Lang_STE_LANG_ERRORLIST  &_STE_Lang_STE_LANG_ERRORLIST
#else
    #define STE_Lang_STE_LANG_ERRORLIST  NULL
#endif
#if STE_USE_LANG_MAKEFILE
    DEFINE_STE_LANG(STE_LANG_MAKEFILE  )
    #define STE_Lang_STE_LANG_MAKEFILE   &_STE_Lang_STE_LANG_MAKEFILE
#else
    #define STE_Lang_STE_LANG_MAKEFILE   NULL
#endif
#if STE_USE_LANG_BATCH
    DEFINE_STE_LANG(STE_LANG_BATCH     )
    #define STE_Lang_STE_LANG_BATCH      &_STE_Lang_STE_LANG_BATCH
#else
    #define STE_Lang_STE_LANG_BATCH      NULL
#endif
#if STE_USE_LANG_XCODE
    DEFINE_STE_LANG(STE_LANG_XCODE     )
    #define STE_Lang_STE_LANG_XCODE      &_STE_Lang_STE_LANG_XCODE
#else
    #define STE_Lang_STE_LANG_XCODE      NULL
#endif
#if STE_USE_LANG_LATEX
    DEFINE_STE_LANG(STE_LANG_LATEX     )
    #define STE_Lang_STE_LANG_LATEX      &_STE_Lang_STE_LANG_LATEX
#else
    #define STE_Lang_STE_LANG_LATEX      NULL
#endif
#if STE_USE_LANG_LUA
    DEFINE_STE_LANG(STE_LANG_LUA       )
    #define STE_Lang_STE_LANG_LUA        &_STE_Lang_STE_LANG_LUA
#else
    #define STE_Lang_STE_LANG_LUA        NULL
#endif
#if STE_USE_LANG_DIFF
    DEFINE_STE_LANG(STE_LANG_DIFF      )
    #define STE_Lang_STE_LANG_DIFF       &_STE_Lang_STE_LANG_DIFF
#else
    #define STE_Lang_STE_LANG_DIFF       NULL
#endif
#if STE_USE_LANG_CONF
    DEFINE_STE_LANG(STE_LANG_CONF      )
    #define STE_Lang_STE_LANG_CONF       &_STE_Lang_STE_LANG_CONF
#else
    #define STE_Lang_STE_LANG_CONF       NULL
#endif
#if STE_USE_LANG_PASCAL
    DEFINE_STE_LANG(STE_LANG_PASCAL    )
    #define STE_Lang_STE_LANG_PASCAL     &_STE_Lang_STE_LANG_PASCAL
#else
    #define STE_Lang_STE_LANG_PASCAL     NULL
#endif
#if STE_USE_LANG_AVE
    DEFINE_STE_LANG(STE_LANG_AVE       )
    #define STE_Lang_STE_LANG_AVE        &_STE_Lang_STE_LANG_AVE
#else
    #define STE_Lang_STE_LANG_AVE        NULL
#endif
#if STE_USE_LANG_ADA
    DEFINE_STE_LANG(STE_LANG_ADA       )
    #define STE_Lang_STE_LANG_ADA        &_STE_Lang_STE_LANG_ADA
#else
    #define STE_Lang_STE_LANG_ADA        NULL
#endif
#if STE_USE_LANG_LISP
    DEFINE_STE_LANG(STE_LANG_LISP      )
    #define STE_Lang_STE_LANG_LISP       &_STE_Lang_STE_LANG_LISP
#else
    #define STE_Lang_STE_LANG_LISP       NULL
#endif
#if STE_USE_LANG_RUBY
    DEFINE_STE_LANG(STE_LANG_RUBY      )
    #define STE_Lang_STE_LANG_RUBY       &_STE_Lang_STE_LANG_RUBY
#else
    #define STE_Lang_STE_LANG_RUBY       NULL
#endif
#if STE_USE_LANG_EIFFEL
    DEFINE_STE_LANG(STE_LANG_EIFFEL    )
    #define STE_Lang_STE_LANG_EIFFEL     &_STE_Lang_STE_LANG_EIFFEL
#else
    #define STE_Lang_STE_LANG_EIFFEL     NULL
#endif
#if STE_USE_LANG_EIFFELKW
    DEFINE_STE_LANG(STE_LANG_EIFFELKW  )
    #define STE_Lang_STE_LANG_EIFFELKW   &_STE_Lang_STE_LANG_EIFFELKW
#else
    #define STE_Lang_STE_LANG_EIFFELKW   NULL
#endif
#if STE_USE_LANG_TCL
    DEFINE_STE_LANG(STE_LANG_TCL       )
    #define STE_Lang_STE_LANG_TCL        &_STE_Lang_STE_LANG_TCL
#else
    #define STE_Lang_STE_LANG_TCL        NULL
#endif
#if STE_USE_LANG_NNCRONTAB
    DEFINE_STE_LANG(STE_LANG_NNCRONTAB )
    #define STE_Lang_STE_LANG_NNCRONTAB  &_STE_Lang_STE_LANG_NNCRONTAB
#else
    #define STE_Lang_STE_LANG_NNCRONTAB  NULL
#endif
#if STE_USE_LANG_BULLANT
    DEFINE_STE_LANG(STE_LANG_BULLANT   )
    #define STE_Lang_STE_LANG_BULLANT    &_STE_Lang_STE_LANG_BULLANT
#else
    #define STE_Lang_STE_LANG_BULLANT    NULL
#endif
#if STE_USE_LANG_VBSCRIPT
    DEFINE_STE_LANG(STE_LANG_VBSCRIPT  )
    #define STE_Lang_STE_LANG_VBSCRIPT   &_STE_Lang_STE_LANG_VBSCRIPT
#else
    #define STE_Lang_STE_LANG_VBSCRIPT   NULL
#endif

#if STE_USE_LANG_ASP && defined(wxSTC_LEX_ASP) // not in 2.7.0
    DEFINE_STE_LANG(STE_LANG_ASP       )
    #define STE_Lang_STE_LANG_ASP        &_STE_Lang_STE_LANG_ASP
#else
    #define STE_Lang_STE_LANG_ASP        NULL
#endif
#if STE_USE_LANG_PHP && defined(wxSTC_LEX_PHP) // not in 2.7.0
    DEFINE_STE_LANG(STE_LANG_PHP       )
    #define STE_Lang_STE_LANG_PHP        &_STE_Lang_STE_LANG_PHP
#else
    #define STE_Lang_STE_LANG_PHP        NULL
#endif

#if STE_USE_LANG_BAAN
    DEFINE_STE_LANG(STE_LANG_BAAN      )
    #define STE_Lang_STE_LANG_BAAN       &_STE_Lang_STE_LANG_BAAN
#else
    #define STE_Lang_STE_LANG_BAAN       NULL
#endif
#if STE_USE_LANG_MATLAB
    DEFINE_STE_LANG(STE_LANG_MATLAB    )
    #define STE_Lang_STE_LANG_MATLAB     &_STE_Lang_STE_LANG_MATLAB
#else
    #define STE_Lang_STE_LANG_MATLAB     NULL
#endif
#if STE_USE_LANG_SCRIPTOL
    DEFINE_STE_LANG(STE_LANG_SCRIPTOL  )
    #define STE_Lang_STE_LANG_SCRIPTOL   &_STE_Lang_STE_LANG_SCRIPTOL
#else
    #define STE_Lang_STE_LANG_SCRIPTOL   NULL
#endif
#if STE_USE_LANG_ASM
    DEFINE_STE_LANG(STE_LANG_ASM       )
    #define STE_Lang_STE_LANG_ASM        &_STE_Lang_STE_LANG_ASM
#else
    #define STE_Lang_STE_LANG_ASM        NULL
#endif
#if STE_USE_LANG_CPPNOCASE
    DEFINE_STE_LANG(STE_LANG_CPPNOCASE )
    #define STE_Lang_STE_LANG_CPPNOCASE  &_STE_Lang_STE_LANG_CPPNOCASE
#else
    #define STE_Lang_STE_LANG_CPPNOCASE  NULL
#endif
#if STE_USE_LANG_FORTRAN
    DEFINE_STE_LANG(STE_LANG_FORTRAN   )
    #define STE_Lang_STE_LANG_FORTRAN    &_STE_Lang_STE_LANG_FORTRAN
#else
    #define STE_Lang_STE_LANG_FORTRAN    NULL
#endif
#if STE_USE_LANG_F77
    DEFINE_STE_LANG(STE_LANG_F77       )
    #define STE_Lang_STE_LANG_F77        &_STE_Lang_STE_LANG_F77
#else
    #define STE_Lang_STE_LANG_F77        NULL
#endif
#if STE_USE_LANG_CSS
    DEFINE_STE_LANG(STE_LANG_CSS       )
    #define STE_Lang_STE_LANG_CSS        &_STE_Lang_STE_LANG_CSS
#else
    #define STE_Lang_STE_LANG_CSS        NULL
#endif
#if STE_USE_LANG_POV
    DEFINE_STE_LANG(STE_LANG_POV       )
    #define STE_Lang_STE_LANG_POV        &_STE_Lang_STE_LANG_POV
#else
    #define STE_Lang_STE_LANG_POV        NULL
#endif
#if STE_USE_LANG_LOUT
    DEFINE_STE_LANG(STE_LANG_LOUT      )
    #define STE_Lang_STE_LANG_LOUT       &_STE_Lang_STE_LANG_LOUT
#else
    #define STE_Lang_STE_LANG_LOUT       NULL
#endif
#if STE_USE_LANG_ESCRIPT
    DEFINE_STE_LANG(STE_LANG_ESCRIPT   )
    #define STE_Lang_STE_LANG_ESCRIPT    &_STE_Lang_STE_LANG_ESCRIPT
#else
    #define STE_Lang_STE_LANG_ESCRIPT    NULL
#endif
#if STE_USE_LANG_PS
    DEFINE_STE_LANG(STE_LANG_PS        )
    #define STE_Lang_STE_LANG_PS         &_STE_Lang_STE_LANG_PS
#else
    #define STE_Lang_STE_LANG_PS         NULL
#endif
#if STE_USE_LANG_NSIS
    DEFINE_STE_LANG(STE_LANG_NSIS      )
    #define STE_Lang_STE_LANG_NSIS       &_STE_Lang_STE_LANG_NSIS
#else
    #define STE_Lang_STE_LANG_NSIS       NULL
#endif
#if STE_USE_LANG_MMIXAL
    DEFINE_STE_LANG(STE_LANG_MMIXAL    )
    #define STE_Lang_STE_LANG_MMIXAL     &_STE_Lang_STE_LANG_MMIXAL
#else
    #define STE_Lang_STE_LANG_MMIXAL     NULL
#endif
#if STE_USE_LANG_CLW
    DEFINE_STE_LANG(STE_LANG_CLW       )
    #define STE_Lang_STE_LANG_CLW        &_STE_Lang_STE_LANG_CLW
#else
    #define STE_Lang_STE_LANG_CLW        NULL
#endif
#if STE_USE_LANG_CLWNOCASE
    DEFINE_STE_LANG(STE_LANG_CLWNOCASE )
    #define STE_Lang_STE_LANG_CLWNOCASE  &_STE_Lang_STE_LANG_CLWNOCASE
#else
    #define STE_Lang_STE_LANG_CLWNOCASE  NULL
#endif
#if STE_USE_LANG_LOT
    DEFINE_STE_LANG(STE_LANG_LOT       )
    #define STE_Lang_STE_LANG_LOT        &_STE_Lang_STE_LANG_LOT
#else
    #define STE_Lang_STE_LANG_LOT        NULL
#endif
#if STE_USE_LANG_YAML
    DEFINE_STE_LANG(STE_LANG_YAML      )
    #define STE_Lang_STE_LANG_YAML       &_STE_Lang_STE_LANG_YAML
#else
    #define STE_Lang_STE_LANG_YAML       NULL
#endif
#if STE_USE_LANG_TEX
    DEFINE_STE_LANG(STE_LANG_TEX       )
    #define STE_Lang_STE_LANG_TEX        &_STE_Lang_STE_LANG_TEX
#else
    #define STE_Lang_STE_LANG_TEX        NULL
#endif
#if STE_USE_LANG_METAPOST
    DEFINE_STE_LANG(STE_LANG_METAPOST  )
    #define STE_Lang_STE_LANG_METAPOST   &_STE_Lang_STE_LANG_METAPOST
#else
    #define STE_Lang_STE_LANG_METAPOST   NULL
#endif
#if STE_USE_LANG_POWERBASIC
    DEFINE_STE_LANG(STE_LANG_POWERBASIC)
    #define STE_Lang_STE_LANG_POWERBASIC &_STE_Lang_STE_LANG_POWERBASIC
#else
    #define STE_Lang_STE_LANG_POWERBASIC NULL
#endif
#if STE_USE_LANG_FORTH
    DEFINE_STE_LANG(STE_LANG_FORTH     )
    #define STE_Lang_STE_LANG_FORTH      &_STE_Lang_STE_LANG_FORTH
#else
    #define STE_Lang_STE_LANG_FORTH      NULL
#endif
#if STE_USE_LANG_ERLANG
    DEFINE_STE_LANG(STE_LANG_ERLANG    )
    #define STE_Lang_STE_LANG_ERLANG     &_STE_Lang_STE_LANG_ERLANG
#else
    #define STE_Lang_STE_LANG_ERLANG     NULL
#endif
#if STE_USE_LANG_OCTAVE
    DEFINE_STE_LANG(STE_LANG_OCTAVE    )
    #define STE_Lang_STE_LANG_OCTAVE     &_STE_Lang_STE_LANG_OCTAVE
#else
    #define STE_Lang_STE_LANG_OCTAVE     NULL
#endif
#if STE_USE_LANG_MSSQL
    DEFINE_STE_LANG(STE_LANG_MSSQL     )
    #define STE_Lang_STE_LANG_MSSQL      &_STE_Lang_STE_LANG_MSSQL
#else
    #define STE_Lang_STE_LANG_MSSQL      NULL
#endif
#if STE_USE_LANG_VERILOG
    DEFINE_STE_LANG(STE_LANG_VERILOG   )
    #define STE_Lang_STE_LANG_VERILOG    &_STE_Lang_STE_LANG_VERILOG
#else
    #define STE_Lang_STE_LANG_VERILOG    NULL
#endif
#if STE_USE_LANG_KIX
    DEFINE_STE_LANG(STE_LANG_KIX       )
    #define STE_Lang_STE_LANG_KIX        &_STE_Lang_STE_LANG_KIX
#else
    #define STE_Lang_STE_LANG_KIX        NULL
#endif
#if STE_USE_LANG_GUI4CLI
    DEFINE_STE_LANG(STE_LANG_GUI4CLI   )
    #define STE_Lang_STE_LANG_GUI4CLI    &_STE_Lang_STE_LANG_GUI4CLI
#else
    #define STE_Lang_STE_LANG_GUI4CLI    NULL
#endif
#if STE_USE_LANG_SPECMAN
    DEFINE_STE_LANG(STE_LANG_SPECMAN   )
    #define STE_Lang_STE_LANG_SPECMAN    &_STE_Lang_STE_LANG_SPECMAN
#else
    #define STE_Lang_STE_LANG_SPECMAN    NULL
#endif
#if STE_USE_LANG_AU3
    DEFINE_STE_LANG(STE_LANG_AU3       )
    #define STE_Lang_STE_LANG_AU3        &_STE_Lang_STE_LANG_AU3
#else
    #define STE_Lang_STE_LANG_AU3        NULL
#endif
#if STE_USE_LANG_APDL
    DEFINE_STE_LANG(STE_LANG_APDL      )
    #define STE_Lang_STE_LANG_APDL       &_STE_Lang_STE_LANG_APDL
#else
    #define STE_Lang_STE_LANG_APDL       NULL
#endif
#if STE_USE_LANG_BASH
    DEFINE_STE_LANG(STE_LANG_BASH      )
    #define STE_Lang_STE_LANG_BASH       &_STE_Lang_STE_LANG_BASH
#else
    #define STE_Lang_STE_LANG_BASH       NULL
#endif
#if STE_USE_LANG_ASN1
    DEFINE_STE_LANG(STE_LANG_ASN1      )
    #define STE_Lang_STE_LANG_ASN1       &_STE_Lang_STE_LANG_ASN1
#else
    #define STE_Lang_STE_LANG_ASN1       NULL
#endif
#if STE_USE_LANG_VHDL
    DEFINE_STE_LANG(STE_LANG_VHDL      )
    #define STE_Lang_STE_LANG_VHDL       &_STE_Lang_STE_LANG_VHDL
#else
    #define STE_Lang_STE_LANG_VHDL       NULL
#endif
#if STE_USE_LANG_JAVA
    DEFINE_STE_LANG(STE_LANG_JAVA      )
    #define STE_Lang_STE_LANG_JAVA       &_STE_Lang_STE_LANG_JAVA
#else
    #define STE_Lang_STE_LANG_JAVA       NULL
#endif
#if STE_USE_LANG_JAVASCRIPT
    DEFINE_STE_LANG(STE_LANG_JAVASCRIPT)
    #define STE_Lang_STE_LANG_JAVASCRIPT &_STE_Lang_STE_LANG_JAVASCRIPT
#else
    #define STE_Lang_STE_LANG_JAVASCRIPT NULL
#endif
#if STE_USE_LANG_RC
    DEFINE_STE_LANG(STE_LANG_RC        )
    #define STE_Lang_STE_LANG_RC         &_STE_Lang_STE_LANG_RC
#else
    #define STE_Lang_STE_LANG_RC         NULL
#endif
#if STE_USE_LANG_CS
    DEFINE_STE_LANG(STE_LANG_CS        )
    #define STE_Lang_STE_LANG_CS         &_STE_Lang_STE_LANG_CS
#else
    #define STE_Lang_STE_LANG_CS         NULL
#endif
#if STE_USE_LANG_D
    DEFINE_STE_LANG(STE_LANG_D        )
    #define STE_Lang_STE_LANG_D         &_STE_Lang_STE_LANG_D
#else
    #define STE_Lang_STE_LANG_D         NULL
#endif
#if STE_USE_LANG_IDL
    DEFINE_STE_LANG(STE_LANG_IDL       )
    #define STE_Lang_STE_LANG_IDL        &_STE_Lang_STE_LANG_IDL
#else
    #define STE_Lang_STE_LANG_IDL        NULL
#endif

#if STE_USE_LANG_PLSQL
    DEFINE_STE_LANG(STE_LANG_PLSQL     )
    #define STE_Lang_STE_LANG_PLSQL      &_STE_Lang_STE_LANG_PLSQL
#else
    #define STE_Lang_STE_LANG_PLSQL      NULL
#endif

// CREATE LEXER ARRAY ------------------------
STE_Language *s_STE_Languages[STE_LANG__MAX] = {
    STE_Lang_STE_LANG_CONTAINER ,
    STE_Lang_STE_LANG_NULL      ,
    STE_Lang_STE_LANG_PYTHON    ,
    STE_Lang_STE_LANG_CPP       ,
    STE_Lang_STE_LANG_HTML      ,
    STE_Lang_STE_LANG_XML       ,
    STE_Lang_STE_LANG_PERL      ,
    STE_Lang_STE_LANG_SQL       ,
    STE_Lang_STE_LANG_VB        ,
    STE_Lang_STE_LANG_PROPERTIES,
    STE_Lang_STE_LANG_ERRORLIST ,
    STE_Lang_STE_LANG_MAKEFILE  ,
    STE_Lang_STE_LANG_BATCH     ,
    STE_Lang_STE_LANG_XCODE     ,
    STE_Lang_STE_LANG_LATEX     ,
    STE_Lang_STE_LANG_LUA       ,
    STE_Lang_STE_LANG_DIFF      ,
    STE_Lang_STE_LANG_CONF      ,
    STE_Lang_STE_LANG_PASCAL    ,
    STE_Lang_STE_LANG_AVE       ,
    STE_Lang_STE_LANG_ADA       ,
    STE_Lang_STE_LANG_LISP      ,
    STE_Lang_STE_LANG_RUBY      ,
    STE_Lang_STE_LANG_EIFFEL    ,
    STE_Lang_STE_LANG_EIFFELKW  ,
    STE_Lang_STE_LANG_TCL       ,
    STE_Lang_STE_LANG_NNCRONTAB ,
    STE_Lang_STE_LANG_BULLANT   ,
    STE_Lang_STE_LANG_VBSCRIPT  ,
    STE_Lang_STE_LANG_ASP       ,
    STE_Lang_STE_LANG_PHP       ,
    STE_Lang_STE_LANG_BAAN      ,
    STE_Lang_STE_LANG_MATLAB    ,
    STE_Lang_STE_LANG_SCRIPTOL  ,
    STE_Lang_STE_LANG_ASM       ,
    STE_Lang_STE_LANG_CPPNOCASE ,
    STE_Lang_STE_LANG_FORTRAN   ,
    STE_Lang_STE_LANG_F77       ,
    STE_Lang_STE_LANG_CSS       ,
    STE_Lang_STE_LANG_POV       ,
    STE_Lang_STE_LANG_LOUT      ,
    STE_Lang_STE_LANG_ESCRIPT   ,
    STE_Lang_STE_LANG_PS        ,
    STE_Lang_STE_LANG_NSIS      ,
    STE_Lang_STE_LANG_MMIXAL    ,
    STE_Lang_STE_LANG_CLW       ,
    STE_Lang_STE_LANG_CLWNOCASE ,
    STE_Lang_STE_LANG_LOT       ,
    STE_Lang_STE_LANG_YAML      ,
    STE_Lang_STE_LANG_TEX       ,
    STE_Lang_STE_LANG_METAPOST  ,
    STE_Lang_STE_LANG_POWERBASIC,
    STE_Lang_STE_LANG_FORTH     ,
    STE_Lang_STE_LANG_ERLANG    ,
    STE_Lang_STE_LANG_OCTAVE    ,
    STE_Lang_STE_LANG_MSSQL     ,
    STE_Lang_STE_LANG_VERILOG   ,
    STE_Lang_STE_LANG_KIX       ,
    STE_Lang_STE_LANG_GUI4CLI   ,
    STE_Lang_STE_LANG_SPECMAN   ,
    STE_Lang_STE_LANG_AU3       ,
    STE_Lang_STE_LANG_APDL      ,
    STE_Lang_STE_LANG_BASH      ,
    STE_Lang_STE_LANG_ASN1      ,
    STE_Lang_STE_LANG_VHDL      ,
    STE_Lang_STE_LANG_JAVA      ,
    STE_Lang_STE_LANG_JAVASCRIPT,
    STE_Lang_STE_LANG_RC        ,
    STE_Lang_STE_LANG_CS        ,
    STE_Lang_STE_LANG_D         ,
    STE_Lang_STE_LANG_IDL       ,
    STE_Lang_STE_LANG_PLSQL     ,
};

//-----------------------------------------------------------------------------
// wxSTEditorLangs_RefData
//-----------------------------------------------------------------------------

class wxSTEditorLangs_RefData : public wxSTEditorPrefBase_RefData
{
public:
    wxSTEditorLangs_RefData()
    {
        size_t n, count = WXSIZEOF(s_STE_Languages);
        m_langs.Alloc(count);
        for (n = 0; n < count; n++)
            m_langs.Add(s_STE_Languages[n]);
    }

    wxArrayPtrVoid m_langs;
    wxSTEPairArrayIntString m_userFilePatterns; // user defined file patterns
    wxSTEPairArrayIntString m_userStyles;       // user defined styles
                                                //   mapped langID*1000+style_n
    wxSTEPairArrayIntString m_userKeyWords;     // user defined extra words
                                                //   mapped langID*1000+word_n
};

//-----------------------------------------------------------------------------
// wxSTEditorLangs
//-----------------------------------------------------------------------------

IMPLEMENT_DYNAMIC_CLASS(wxSTEditorLangs, wxSTEditorPrefBase)

#define M_LANGDATA ((wxSTEditorLangs_RefData *)m_refData)

wxSTEditorLangs& wxSTEditorLangs::GetGlobalEditorLangs()
{
    return s_wxSTEditorLangs;
}

bool wxSTEditorLangs::Create()
{
    UnRef();
    m_refData = new wxSTEditorLangs_RefData();
    return true;
}

bool wxSTEditorLangs::Create(const wxSTEditorLangs &other)
{
    Ref(other);
    return true;
}

void wxSTEditorLangs::Copy(const wxSTEditorLangs &other)
{
    wxCHECK_RET(other.Ok(), wxT("Langs not created"));
    if (!Ok()) Create();
    if (*this == other) return;

    wxSTEditorLangs_RefData *otherLangData = (wxSTEditorLangs_RefData *)other.GetRefData();

    M_LANGDATA->m_langs            = otherLangData->m_langs;
    M_LANGDATA->m_userFilePatterns = otherLangData->m_userFilePatterns;
    M_LANGDATA->m_userStyles       = otherLangData->m_userStyles;
    M_LANGDATA->m_userKeyWords     = otherLangData->m_userKeyWords;
}

void wxSTEditorLangs::Reset()
{
    wxCHECK_RET(Ok(), wxT("Langs not created"));
    M_LANGDATA->m_userFilePatterns.Clear();
    M_LANGDATA->m_userStyles.Clear();
    M_LANGDATA->m_userKeyWords.Clear();
}

bool wxSTEditorLangs::IsEqualTo(const wxSTEditorLangs &langs) const
{
    wxCHECK_MSG(Ok() && langs.Ok(), false, wxT("Langs not created"));
    wxSTEditorLangs_RefData *otherLangData = (wxSTEditorLangs_RefData *)langs.GetRefData();

    if ((M_LANGDATA->m_langs.GetCount() != otherLangData->m_langs.GetCount()) ||
        (M_LANGDATA->m_userFilePatterns != otherLangData->m_userFilePatterns) ||
        (M_LANGDATA->m_userStyles       != otherLangData->m_userStyles) ||
        (M_LANGDATA->m_userKeyWords     != otherLangData->m_userKeyWords))
        return false;

    size_t n, count = M_LANGDATA->m_langs.GetCount();
    for (n = 0; n < count; n++)
    {
        if (M_LANGDATA->m_langs[n] != otherLangData->m_langs[n]) return false;
    }

    return true;
}

int wxSTEditorLangs::AddLanguage(STE_Language* lang)
{
    wxCHECK_MSG(Ok() && lang, -1, wxT("Langs not created"));
    M_LANGDATA->m_langs.Add(lang);
    return M_LANGDATA->m_langs.GetCount() - 1;
}

size_t wxSTEditorLangs::GetCount() const
{
    wxCHECK_MSG(Ok(), 0, wxT("Langs not created"));
    return M_LANGDATA->m_langs.GetCount();
}

int wxSTEditorLangs::FindLanguageByFilename(const wxString& fileName_) const
{
    int fallback = STE_LANG_NULL;

    wxCHECK_MSG(Ok(), fallback, wxT("Langs not created"));

    wxString fileName = fileName_;
    if (fileName_.Find(wxFILE_SEP_PATH) != wxNOT_FOUND)
        fileName = fileName_.AfterLast(wxFILE_SEP_PATH);

    wxFileName wxFN(fileName);
    wxString name = wxFN.GetName().Lower();
    wxString ext  = wxFN.GetExt().Lower();

    // determine language from filepatterns
    size_t lang_n, lang_count = GetCount();
    for (lang_n = 0; lang_n < lang_count; lang_n++)
    {
        if (!HasLanguage(lang_n) || !GetUseLanguage(lang_n)) continue;

        wxString filePattern = GetFilePattern(lang_n).Lower();
        wxStringTokenizer tokenizer(filePattern, wxT(";"));
        while ( tokenizer.HasMoreTokens() )
        {
            wxString wildToken = tokenizer.GetNextToken();
            wxFileName wildFileName(wildToken);
            wxString wildName = wildFileName.GetName();
            wxString wildExt  = wildFileName.GetExt();

            if ((wildToken == wxT("*")) || (wildToken == wxT("*.*")))
            {
                fallback = lang_n; // try for better match
            }
            else if ( ((wildExt  == wxT("*")) || (wildExt  == ext )) &&
                      ((wildName == wxT("*")) || (wildName == name)) )
            {
                return lang_n;
            }
        }
    }

    return fallback;
}

STE_Language* wxSTEditorLangs::GetLanguage(size_t lang_n) const
{
    wxCHECK_MSG(Ok(), NULL, wxT("Langs not created"));
    wxCHECK_MSG(lang_n<GetCount(), NULL, wxT("Invalid language index"));
    return ((STE_Language *)(M_LANGDATA->m_langs.Item(lang_n)));
}

wxString wxSTEditorLangs::GetName(size_t lang_n) const
{
    return GetLanguage(lang_n) ? stc2wx(GetLanguage(lang_n)->name) : wxString();
}
wxString wxSTEditorLangs::GetFilePattern(size_t lang_n, bool get_default) const
{
    if (!get_default)
    {
        wxString userFilePatterns = GetUserFilePattern(lang_n);
        if (!userFilePatterns.IsEmpty()) return userFilePatterns;
    }

    return GetLanguage(lang_n) ? stc2wx(GetLanguage(lang_n)->filePattern) : wxString();
}
wxString wxSTEditorLangs::GetUserFilePattern(size_t lang_n) const
{
    if (M_LANGDATA->m_userFilePatterns.HasKey(lang_n))
        return M_LANGDATA->m_userFilePatterns.GetValue(lang_n);

    return wxEmptyString;
}

wxString wxSTEditorLangs::GetFileFilter(size_t lang_n) const
{
    wxString filePattern(GetFilePattern(lang_n));
    if (filePattern.IsEmpty())
        return wxEmptyString;

    return GetName(lang_n) + wxT(" (") + filePattern + wxT(")|") + filePattern;
}
int wxSTEditorLangs::GetLexer(size_t lang_n) const
{
    return GetLanguage(lang_n) ? GetLanguage(lang_n)->lexer : 0;
}

size_t wxSTEditorLangs::GetStyleCount(size_t lang_n) const
{
    return GetLanguage(lang_n) ? GetLanguage(lang_n)->styles_count : 0;
}
int wxSTEditorLangs::GetSciStyle(size_t lang_n, size_t style_n) const
{
    wxCHECK_MSG(style_n<GetStyleCount(lang_n), 0, wxT("Invalid language style type"));
    return GetLanguage(lang_n) ? GetLanguage(lang_n)->styles[style_n].sci_style : 0;
}
int wxSTEditorLangs::GetSTEStyle(size_t lang_n, size_t style_n, bool get_default) const
{
    wxCHECK_MSG(style_n<GetStyleCount(lang_n), 0, wxT("Invalid language style type"));

    if (!get_default)
    {
        int user_style = GetUserSTEStyle(lang_n, style_n);
        if (user_style != -1) return user_style;
    }

    return GetLanguage(lang_n) ? GetLanguage(lang_n)->styles[style_n].ste_style : 0;
}
int wxSTEditorLangs::GetUserSTEStyle(size_t lang_n, size_t style_n) const
{
    wxCHECK_MSG(style_n<GetStyleCount(lang_n), -1, wxT("Invalid language style type"));
    if (M_LANGDATA->m_userStyles.HasKey(lang_n*1000+style_n))
    {
        long val = -1;
        if (M_LANGDATA->m_userStyles.GetValue(lang_n*1000+style_n).ToLong(&val))
            return int(val);
    }

    return -1;
}
int wxSTEditorLangs::SciToSTEStyle(size_t lang_n, int sci_style) const
{
    // these are the same for all languages
    switch (sci_style)
    {
        case wxSTC_STYLE_DEFAULT     : return STE_STYLE_DEFAULT;
        case wxSTC_STYLE_LINENUMBER  : return STE_STYLE_LINENUMBER;
        case wxSTC_STYLE_BRACELIGHT  : return STE_STYLE_BRACELIGHT;
        case wxSTC_STYLE_BRACEBAD    : return STE_STYLE_BRACEBAD;
        case wxSTC_STYLE_CONTROLCHAR : return STE_STYLE_CONTROLCHAR;
        case wxSTC_STYLE_INDENTGUIDE : return STE_STYLE_INDENTGUIDE;
        default : break;
    }

    if (!GetLanguage(lang_n)) return -1;
    size_t style_n, style_count = GetStyleCount(lang_n);
    for (style_n = 0; style_n < style_count; style_n++)
    {
        if (GetSciStyle(lang_n, style_n) == sci_style)
            return GetSTEStyle(lang_n, style_n);
    }

    return -1;
}

wxString wxSTEditorLangs::GetStyleDescription(size_t lang_n, size_t style_n) const
{
    wxCHECK_MSG(style_n<GetStyleCount(lang_n), wxEmptyString, wxT("Invalid language style type"));
    return GetLanguage(lang_n) ? stc2wx(GetLanguage(lang_n)->styles[style_n].description) : wxString();
}

size_t wxSTEditorLangs::GetKeyWordsCount(size_t lang_n) const
{
    return GetLanguage(lang_n) ? GetLanguage(lang_n)->words_count : 0;
}
wxString wxSTEditorLangs::GetKeyWords(size_t lang_n, size_t word_n, bool get_default) const
{
    wxCHECK_MSG(word_n<GetKeyWordsCount(lang_n), wxEmptyString, wxT("Invalid language keyword"));
    wxString words;
    if (GetLanguage(lang_n)) words = stc2wx(GetLanguage(lang_n)->words[word_n].words);

    if (!get_default)
    {
        wxString userWords = GetUserKeyWords(lang_n, word_n);
        if (!words.IsEmpty() && !userWords.IsEmpty())
            words += wxT(" ");

        words += userWords;
    }

    return words;
}
wxString wxSTEditorLangs::GetUserKeyWords(size_t lang_n, size_t word_n) const
{
    wxCHECK_MSG(word_n<GetKeyWordsCount(lang_n), wxEmptyString, wxT("Invalid language keyword"));
    if (M_LANGDATA->m_userKeyWords.HasKey(lang_n*1000+word_n))
        return M_LANGDATA->m_userKeyWords.GetValue(lang_n*1000+word_n);

    return wxEmptyString;
}

bool wxSTEditorLangs::HasBlock(size_t lang_n) const
{
    return GetLanguage(lang_n) && GetLanguage(lang_n)->block;
}
wxString wxSTEditorLangs::GetBlockStart(size_t lang_n) const
{
    return HasBlock(lang_n) ? stc2wx(GetLanguage(lang_n)->block->start) : wxString();
}
wxString wxSTEditorLangs::GetBlockEnd(size_t lang_n) const
{
    return HasBlock(lang_n) ? stc2wx(GetLanguage(lang_n)->block->end) : wxString();
}
int wxSTEditorLangs::GetBlockStartSTCStyle(size_t lang_n) const
{
    return HasBlock(lang_n) ? GetLanguage(lang_n)->block->sci_start_style : 0;
}
int wxSTEditorLangs::GetBlockEndSTCStyle(size_t lang_n) const
{
    return HasBlock(lang_n) ? GetLanguage(lang_n)->block->sci_end_style : 0;
}

bool wxSTEditorLangs::HasPreprocessor(size_t lang_n) const
{
    return GetLanguage(lang_n) && GetLanguage(lang_n)->preproc;
}
wxString wxSTEditorLangs::GetPreprocessorSymbol(size_t lang_n) const
{
    return HasPreprocessor(lang_n) ? stc2wx(GetLanguage(lang_n)->preproc->symbol) : wxString();
}
wxString wxSTEditorLangs::GetPreprocessorStart(size_t lang_n) const
{
    return HasPreprocessor(lang_n) ? stc2wx(GetLanguage(lang_n)->preproc->boxStart) : wxString();
}
wxString wxSTEditorLangs::GetPreprocessorMid(size_t lang_n) const
{
    return HasPreprocessor(lang_n) ? stc2wx(GetLanguage(lang_n)->preproc->boxMiddle) : wxString();
}
wxString wxSTEditorLangs::GetPreprocessorEnd(size_t lang_n) const
{
    return HasPreprocessor(lang_n) ? stc2wx(GetLanguage(lang_n)->preproc->boxEnd) : wxString();
}

bool wxSTEditorLangs::HasComments(size_t lang_n) const
{
    return GetLanguage(lang_n) && GetLanguage(lang_n)->comment;
}
int wxSTEditorLangs::GetCommentBlockAtLineStart(size_t lang_n) const
{
    return HasComments(lang_n) ? GetLanguage(lang_n)->comment->blockAtLineStart : 0;
}
wxString wxSTEditorLangs::GetCommentBlock(size_t lang_n) const
{
    return HasComments(lang_n) ? stc2wx(GetLanguage(lang_n)->comment->block) : wxString();
}
wxString wxSTEditorLangs::GetCommentBoxStart(size_t lang_n) const
{
    return HasComments(lang_n) ? stc2wx(GetLanguage(lang_n)->comment->boxStart) : wxString();
}
wxString wxSTEditorLangs::GetCommentBoxMiddle(size_t lang_n) const
{
    return HasComments(lang_n) ? stc2wx(GetLanguage(lang_n)->comment->boxMiddle) : wxString();
}
wxString wxSTEditorLangs::GetCommentBoxEnd(size_t lang_n) const
{
    return HasComments(lang_n) ? stc2wx(GetLanguage(lang_n)->comment->boxEnd) : wxString();
}
wxString wxSTEditorLangs::GetCommentStreamStart(size_t lang_n) const
{
    return HasComments(lang_n) ? stc2wx(GetLanguage(lang_n)->comment->streamStart) : wxString();
}
wxString wxSTEditorLangs::GetCommentStreamEnd(size_t lang_n) const
{
    return HasComments(lang_n) ? stc2wx(GetLanguage(lang_n)->comment->streamEnd) : wxString();
}

int wxSTEditorLangs::GetBracesStyle(size_t lang_n) const
{
    wxCHECK_MSG(HasLanguage(lang_n), 0, wxT("Invalid language"));
    return GetLanguage(lang_n)->braces_style;
}

int wxSTEditorLangs::GetFolds(size_t lang_n) const
{
    return GetLanguage(lang_n) ? GetLanguage(lang_n)->folds : 0;
}

int wxSTEditorLangs::GetFlags(size_t lang_n) const
{
    return GetLanguage(lang_n) ? GetLanguage(lang_n)->flags : 0;
}

void wxSTEditorLangs::SetUserFilePattern(size_t lang_n, const wxString &filePattern)
{
    wxCHECK_RET(GetLanguage(lang_n), wxT("Langs not created"));
    wxCHECK_RET(lang_n<GetCount(), wxT("Invalid language info item"));

    bool is_default = (filePattern == GetFilePattern(lang_n, true));

    if (M_LANGDATA->m_userFilePatterns.HasKey(lang_n))
    {
        if ( is_default )
            M_LANGDATA->m_userFilePatterns.Remove(lang_n);
        else
            M_LANGDATA->m_userFilePatterns.Add(lang_n, filePattern);
    }
    else if (!is_default)
    {
        M_LANGDATA->m_userFilePatterns.Add(lang_n, filePattern);
    }
}

void wxSTEditorLangs::SetSTEStyle(size_t lang_n, size_t style_n, int ste_style)
{
    wxCHECK_RET(GetLanguage(lang_n), wxT("Langs not created"));
    wxCHECK_RET(style_n<GetStyleCount(lang_n), wxT("Invalid language style type"));
    GetLanguage(lang_n)->styles[style_n].ste_style = ste_style;
}

void wxSTEditorLangs::SetUserSTEStyle(size_t lang_n, size_t style_n, int ste_style)
{
    wxCHECK_RET(GetLanguage(lang_n), wxT("Langs not created"));
    wxCHECK_RET(style_n<GetStyleCount(lang_n), wxT("Invalid language style type"));

    bool is_default = (ste_style == GetSTEStyle(lang_n, style_n, true));

    wxString strStyle = wxString::Format(wxT("%d"), ste_style);

    if (M_LANGDATA->m_userStyles.HasKey(lang_n*1000+style_n))
    {
        if ( is_default )
            M_LANGDATA->m_userStyles.Remove(lang_n*1000+style_n);
        else
            M_LANGDATA->m_userStyles.Add(lang_n*1000+style_n, strStyle);
    }
    else if (!is_default)
    {
        M_LANGDATA->m_userStyles.Add(lang_n*1000+style_n, strStyle);
    }
}

void wxSTEditorLangs::SetUserKeyWords(size_t lang_n, size_t word_n, const wxString& words)
{
    wxCHECK_RET(GetLanguage(lang_n), wxT("Langs not created"));
    wxCHECK_RET(lang_n<GetCount(), wxT("Invalid language info item"));
    wxCHECK_RET(word_n<GetKeyWordsCount(lang_n), wxT("Invalid language keyword"));

    bool is_default = (words == GetKeyWords(lang_n, word_n, true));

    if (M_LANGDATA->m_userKeyWords.HasKey(lang_n*1000+word_n))
    {
        if ( is_default || words.IsEmpty() )
            M_LANGDATA->m_userKeyWords.Remove(lang_n*1000+word_n);
        else
            M_LANGDATA->m_userKeyWords.Add(lang_n*1000+word_n, words);
    }
    else if (!is_default && !words.IsEmpty())
    {
        M_LANGDATA->m_userKeyWords.Add(lang_n*1000+word_n, words);
    }
}

void wxSTEditorLangs::LoadConfig( wxConfigBase &config,
                                  const wxString &configPath )
{
    wxCHECK_RET(Ok(), wxT("Langs not created"));
    wxString group = wxSTEditorOptions::FixConfigPath(configPath, false);
    wxString key   = wxSTEditorOptions::FixConfigPath(configPath, true);

    if (!config.Exists(group))
        return;

    for (size_t lang_n = 0; lang_n < GetCount(); lang_n++)
    {
        if (!HasLanguage(lang_n)) continue;

        wxString keyBase = key + GetName(lang_n);
        wxString keyName;
        wxString value;

        // Read in the file patterns
        keyName = keyBase + wxT("/FilePattern");
        if (config.Read(keyName, &value))
            SetUserFilePattern(lang_n, value);

        // Read in the styles
        for (size_t style_n = 0; style_n < GetStyleCount(lang_n); style_n++)
        {
            keyName = keyBase + wxString::Format(wxT("/Style_%d"), style_n);
            long l_value = 0;
            if (config.Read(keyName, &l_value))
                SetUserSTEStyle(lang_n, style_n, l_value);
        }

        // Read in the keywords
        for (size_t word_n = 0; word_n < GetKeyWordsCount(lang_n); word_n++)
        {
            keyName = keyBase + wxString::Format(wxT("/Keyword_%d"), word_n);
            if (config.Read(keyName, &value))
                SetUserKeyWords(lang_n, word_n, value);
        }
    }
}

void wxSTEditorLangs::SaveConfig( wxConfigBase &config,
                                  const wxString &configPath,
                                  int WXUNUSED(flags) ) const
{
    wxCHECK_RET(Ok(), wxT("Langs not created"));
    wxString key = wxSTEditorOptions::FixConfigPath(configPath, true);

    for (size_t lang_n = 0; lang_n < GetCount(); lang_n++)
    {
        if (!HasLanguage(lang_n)) continue;

        wxString keyBase = key + GetName(lang_n);
        wxString keyName;
        wxString value;

        // Write out the file patterns if not default
        keyName = keyBase + wxT("/FilePattern");
        value   = GetUserFilePattern(lang_n);
        if (!value.IsEmpty())
            config.Write(keyName, value);
        else if (config.HasEntry(keyName))
            config.DeleteEntry(keyName);

        // Write out the styles if not default
        for (size_t style_n = 0; style_n < GetStyleCount(lang_n); style_n++)
        {
            keyName        = keyBase + wxString::Format(wxT("/Style_%d"), style_n);
            int user_style = GetUserSTEStyle(lang_n, style_n);
            value          = wxString::Format(wxT("%d"), user_style);

            if (user_style >= 0)
                config.Write(keyName, value);
            else if (config.HasEntry(keyName))
                config.DeleteEntry(keyName);
        }

        // Write out the keywords if not default
        for (size_t word_n = 0; word_n < GetKeyWordsCount(lang_n); word_n++)
        {
            value   = GetUserKeyWords(lang_n, word_n);
            keyName = keyBase + wxString::Format(wxT("/Keyword_%d"), word_n);

            if (!value.IsEmpty())
                config.Write(keyName, value);
            else if (config.HasEntry(keyName))
                config.DeleteEntry(keyName);
        }
    }
}

void wxSTEditorLangs::UpdateEditor( wxSTEditor *editor )
{
    wxCHECK_RET(Ok(), wxT("Langs not created"));
    wxCHECK_RET(editor, wxT("Invalid wxSTEditor"));

    int lang_n = editor->GetLanguageId();
    wxCHECK_RET(HasLanguage(lang_n), wxT("Invalid language id"));

    editor->SetLexer(GetLexer(lang_n));

    // initialize settings
    wxSTEditorPrefs stePrefs = editor->GetEditorPrefs();
    bool syntax_enable = stePrefs.Ok() ? stePrefs.GetPrefBool(STE_PREF_HIGHLIGHT_SYNTAX) : true;
    wxSTEditorStyles steStyles = editor->GetEditorStyles();
    if (!steStyles.Ok())
        return;

    size_t style_n, style_count = GetStyleCount(lang_n);

    // Match the style bits of the editor with that of the lexer
    // typically only 5 bits are needed, but HTML requires all 7
    // resets it to use as few bits as possible.
    int current_style_bits = editor->GetStyleBits();
    int style_bits = style_count <= 32 ? 5 : (style_count <= 64 ? 6 : 7);
    if (style_bits != current_style_bits)
        editor->SetStyleBits(style_bits);

    for (style_n = 0; style_n < style_count; style_n++)
    {
        int sci_style = GetSciStyle(lang_n, style_n);
        int ste_style = GetSTEStyle(lang_n, style_n);
        if ((sci_style == -1) || (ste_style == -1))
            continue;
        if (!syntax_enable)
            ste_style = STE_STYLE_DEFAULT;

        steStyles.SetEditorStyle(sci_style, ste_style, editor);
    }

    size_t word_n, keyword_count = GetKeyWordsCount(lang_n);
    for (word_n = 0; word_n < keyword_count; word_n++)
        editor->SetKeyWords(word_n, GetKeyWords(lang_n, word_n));

    editor->Colourise(0, -1); // FIXME this can take awhile! but otherwise it gets garbled
}

// global precreated wxSTEditorLangs
wxSTEditorLangs  s_wxSTEditorLangs(true);

#include "wx/fileconf.h"
// FIXME - test code to see how it would look in a wxFileConfig
void LangConfig()
{
    wxFileConfig c(wxT("wxStEditLangs"), wxT("wxWidgets"),
                   wxT("stelangsfconfig.txt"), wxEmptyString,
                   wxCONFIG_USE_RELATIVE_PATH);

    wxFileConfig *config = &c;

    wxString configRoot = wxT("wxSTEditor");
    wxString configGroup = wxT("/Languages");
    wxString key = configRoot + configGroup + wxT("/");

    size_t n, i;

    wxSTEditorLangs langs(s_wxSTEditorLangs);
    for (n = 0; n < langs.GetCount(); n++)
    {
        // wxString::Format(wxT("%d "), n) +
        wxString keyName = key + langs.GetName(n) + wxT("/");

        config->Write(keyName + wxT("File_Patterns"), langs.GetFilePattern(n));
        config->Write(keyName + wxT("File_Filters"),  langs.GetFileFilter(n));
        config->Write(keyName + wxT("Lexer"),         langs.GetLexer(n));

        //config->Write(keyName + wxT("Style_Count"),  langs.GetStyleCount(n));
        //for (i = 0; i < langs.GetStyleCount(n); i++)
        //    config->Write(keyName + wxString::Format(wxT("S%d"), i), langs.GetSTEStyle(n, i));

        //config->Write(keyName + wxT("Keyword_Count"),  langs.GetKeyWordsCount(n));
        for (i = 0; i < langs.GetKeyWordsCount(n); i++)
            config->Write(keyName + wxString::Format(wxT("Keyword%d"), i), langs.GetKeyWords(n, i));

        if (!langs.GetBlockStart(n).IsEmpty())
            config->Write(keyName + wxT("BlockStart"),         langs.GetBlockStart(n));
        if (!langs.GetBlockEnd(n).IsEmpty())
            config->Write(keyName + wxT("BlockEnd"),           langs.GetBlockEnd(n));

        if (!langs.GetPreprocessorSymbol(n).IsEmpty())
            config->Write(keyName + wxT("PreprocessorSymbol"), langs.GetPreprocessorSymbol(n));
        if (!langs.GetPreprocessorStart(n).IsEmpty())
            config->Write(keyName + wxT("PreprocessorStart"),  langs.GetPreprocessorStart(n));
        if (!langs.GetPreprocessorMid(n).IsEmpty())
            config->Write(keyName + wxT("PreprocessorMid"),    langs.GetPreprocessorMid(n));
        if (!langs.GetPreprocessorEnd(n).IsEmpty())
            config->Write(keyName + wxT("PreprocessorEnd"),    langs.GetPreprocessorEnd(n));

        if (langs.HasComments(n))
        {
            config->Write(keyName + wxT("CommentBlockAtLineStart"),    langs.GetCommentBlockAtLineStart(n));
            if (!langs.GetCommentBlock(n).IsEmpty())
                config->Write(keyName + wxT("CommentBlock"),    langs.GetCommentBlock(n));
            if (!langs.GetCommentBoxStart(n).IsEmpty())
                config->Write(keyName + wxT("CommentBoxStart"),    langs.GetCommentBoxStart(n));
            if (!langs.GetCommentBoxMiddle(n).IsEmpty())
                config->Write(keyName + wxT("CommentBoxMiddle"),    langs.GetCommentBoxMiddle(n));
            if (!langs.GetCommentBoxEnd(n).IsEmpty())
                config->Write(keyName + wxT("CommentBoxEnd"),    langs.GetCommentBoxEnd(n));
            if (!langs.GetCommentStreamStart(n).IsEmpty())
                config->Write(keyName + wxT("CommentStreamStart"),    langs.GetCommentStreamStart(n));
            if (!langs.GetCommentStreamEnd(n).IsEmpty())
                config->Write(keyName + wxT("CommentStreamEnd"),    langs.GetCommentStreamEnd(n));
        }

        config->Write(keyName + wxT("Folds"),              langs.GetFolds(n));
        config->Write(keyName + wxT("Flags"),              langs.GetFlags(n));
    }

    config->Flush();
}
