/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "EditCppCodeEvent.h"

//(*InternalHeaders(EditCppCodeEvent)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include "GDCore/Tools/Localization.h"
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/config.h>
#include <wx/textfile.h>
#include <wx/filename.h>
#include <fstream>
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCore/Project/SourceFile.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Events/Builtin/CppCodeEvent.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/IDE/CodeCompiler.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"

//(*IdInit(EditCppCodeEvent)
const long EditCppCodeEvent::ID_STATICBITMAP3 = wxNewId();
const long EditCppCodeEvent::ID_STATICTEXT3 = wxNewId();
const long EditCppCodeEvent::ID_PANEL1 = wxNewId();
const long EditCppCodeEvent::ID_STATICLINE2 = wxNewId();
const long EditCppCodeEvent::ID_CHECKBOX2 = wxNewId();
const long EditCppCodeEvent::ID_CHECKBOX1 = wxNewId();
const long EditCppCodeEvent::ID_TEXTCTRL3 = wxNewId();
const long EditCppCodeEvent::ID_BITMAPBUTTON1 = wxNewId();
const long EditCppCodeEvent::ID_CHECKLISTBOX1 = wxNewId();
const long EditCppCodeEvent::ID_STATICTEXT1 = wxNewId();
const long EditCppCodeEvent::ID_TEXTCTRL1 = wxNewId();
const long EditCppCodeEvent::ID_CHECKBOX3 = wxNewId();
const long EditCppCodeEvent::ID_TEXTCTRL2 = wxNewId();
const long EditCppCodeEvent::ID_STATICTEXT5 = wxNewId();
const long EditCppCodeEvent::ID_CUSTOM1 = wxNewId();
const long EditCppCodeEvent::ID_STATICTEXT4 = wxNewId();
const long EditCppCodeEvent::ID_STATICLINE1 = wxNewId();
const long EditCppCodeEvent::ID_BUTTON1 = wxNewId();
const long EditCppCodeEvent::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditCppCodeEvent,wxDialog)
	//(*EventTable(EditCppCodeEvent)
	//*)
END_EVENT_TABLE()

enum
{
    MARGIN_LINE_NUMBERS,
    MARGIN_FOLD
};

EditCppCodeEvent::EditCppCodeEvent(wxWindow* parent, CppCodeEvent & event_, gd::Project & game_, gd::Layout & scene_) :
    editedEvent(event_),
    game(game_),
    scene(scene_)
{
	//(*Initialize(EditCppCodeEvent)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxStaticBoxSizer* StaticBoxSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer15;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer14;
	wxFlexGridSizer* FlexGridSizer13;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;
	wxFlexGridSizer* FlexGridSizer17;
	wxStaticBoxSizer* StaticBoxSizer5;

	Create(parent, wxID_ANY, _("C++ code"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(1);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(1);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/source_cpp64.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Panel1, ID_STATICTEXT3, _("The C++ code events allow you to call a function written in C++,\nwith if needed the scene or some objects passed as arguments.\nYou can also specify the external source files which must be compiled\nif your function is refering to features implemented in external source files."), wxDefaultPosition, wxSize(760,75), 0, _T("ID_STATICTEXT3"));
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->Fit(Panel1);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer9->AddGrowableCol(1);
	FlexGridSizer9->AddGrowableRow(0);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer11->AddGrowableCol(0);
	FlexGridSizer11->AddGrowableRow(0);
	FlexGridSizer12 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	FlexGridSizer12->AddGrowableRow(1);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Call to function"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	sceneRefCheck = new wxCheckBox(this, ID_CHECKBOX2, _("Pass a reference to the scene"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	sceneRefCheck->SetValue(true);
	FlexGridSizer7->Add(sceneRefCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer8->AddGrowableCol(0);
	objectsListCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Pass a list of pointers to objects:"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	objectsListCheck->SetValue(false);
	FlexGridSizer8->Add(objectsListCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer13 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer13->AddGrowableCol(1);
	FlexGridSizer13->Add(15,15,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	objectPassedAsParameterEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(111,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer13->Add(objectPassedAsParameterEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	objectBt = new wxBitmapButton(this, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/objeticon.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	objectBt->SetDefault();
	FlexGridSizer13->Add(objectBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer7->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Dependencies"));
	FlexGridSizer14 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer14->AddGrowableCol(0);
	FlexGridSizer14->AddGrowableRow(0);
	dependenciesList = new wxCheckListBox(this, ID_CHECKLISTBOX1, wxDefaultPosition, wxSize(224,129), 0, 0, 0, wxDefaultValidator, _T("ID_CHECKLISTBOX1"));
	FlexGridSizer14->Add(dependenciesList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer4->Add(FlexGridSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer5 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Events editor displaying"));
	FlexGridSizer15 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer15->AddGrowableCol(0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Name/Comment displayed for the event:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer15->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	displayedNameEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(209,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer15->Add(displayedNameEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	displayCodeCheck = new wxCheckBox(this, ID_CHECKBOX3, _("Display the code in the events editor"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
	displayCodeCheck->SetValue(false);
	FlexGridSizer15->Add(displayCodeCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer5->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12->Add(StaticBoxSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer11->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer10->AddGrowableCol(0);
	FlexGridSizer10->AddGrowableRow(1);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Includes"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	includeTextCtrl = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer1->Add(includeTextCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(1);
	functionPrototypeTxt = new wxStaticText(this, ID_STATICTEXT5, _("void Function()\n{"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer4->Add(functionPrototypeTxt, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	codeEdit = new wxStyledTextCtrl(this,ID_CUSTOM1,wxDefaultPosition,wxSize(460,40),0,_T("ID_CUSTOM1"));
	FlexGridSizer4->Add(codeEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("}"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer4->Add(StaticText4, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer2->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer5->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer5->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer5, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(this);
	FlexGridSizer2->SetSizeHints(this);

	Connect(ID_CHECKBOX2,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditCppCodeEvent::OnsceneRefCheckClick);
	Connect(ID_CHECKBOX1,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditCppCodeEvent::OnobjectsListCheckClick);
	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditCppCodeEvent::OnobjectBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditCppCodeEvent::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditCppCodeEvent::OncancelBtClick);
	//*)
	Connect(ID_CUSTOM1, wxEVT_STC_UPDATEUI, (wxObjectEventFunction)&EditCppCodeEvent::UpdateTextCtrl);

	codeEdit->SetLexer(wxSTC_LEX_CPP);
    codeEdit->StyleSetFont(wxSTC_STYLE_DEFAULT, gd::EventsRenderingHelper::Get()->GetFont());
	codeEdit->StyleSetBackground(34, wxColour(119, 255, 119)); //Brace
	codeEdit->StyleSetBackground(35, wxColour(255, 119, 119)); //Brace
	codeEdit->StyleSetForeground(wxSTC_C_STRING, *wxBLUE);
	codeEdit->StyleSetForeground(wxSTC_C_OPERATOR, *wxRED);
    codeEdit->StyleSetForeground(wxSTC_C_IDENTIFIER, wxColour(40,0,60));
    codeEdit->StyleSetForeground(wxSTC_C_CHARACTER, wxColour(150,0,0));
    codeEdit->StyleSetForeground(wxSTC_C_WORD, wxColour(0,0,150));
    codeEdit->StyleSetForeground(wxSTC_C_WORD2, wxColour(0,150,0));
	codeEdit->StyleSetForeground(wxSTC_C_COMMENT, wxColour(0,78,193));
	codeEdit->StyleSetForeground(wxSTC_C_COMMENTLINE, wxColour(0,78,193));
	codeEdit->StyleSetForeground(wxSTC_C_COMMENTLINEDOC, wxColour(0,78,193));
	codeEdit->StyleSetForeground(wxSTC_C_NUMBER, wxColour(203,73,170));
    codeEdit->StyleSetBold(wxSTC_C_WORD, true);
    codeEdit->StyleSetBold(wxSTC_C_WORD2, true);
    codeEdit->StyleSetBold(wxSTC_C_COMMENTDOCKEYWORD, true);
    codeEdit->SetKeyWords(0, wxT("_Char16_t _Char32_t align_union alignof asm auto bool break case catch char class const const_cast constexpr continue decltype default delete do double dynamic_cast else enum explicit export extern false final float for friend goto if import inline int long mutable namespace new nullptr operator override private protected public register reinterpret_cast return short signed sizeof static static_cast struct switch template this throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while static_assert int8_t uint8_t int16_t uint16_t int32_t uint32_t int64_t uint64_t int_least8_t uint_least8_t int_least16_t uint_least16_t int_least32_t uint_least32_t int_least64_t uint_least64_t int_fast8_t uint_fast8_t int_fast16_t uint_fast16_t int_fast32_t uint_fast32_t int_fast64_t uint_fast64_t intptr_t uintptr_t intmax_t uintmax_t wint_t wchar_t wctrans_t wctype_t size_t time_t and and_eq bitand bitor compl not not_eq or or_eq xor xor_eq"));
    codeEdit->SetKeyWords(1, wxT("__gnu_cxx accumulate add_const add_cv add_lvalue_reference add_pointer add_reference add_rvalue_reference add_volatile adjacent_difference adjacent_find aligned_storage Alignment alignment_of all_of allocate_shared allocator allocator_base allocator_chunklist allocator_fixed_size allocator_newdel allocator_suballoc allocator_unbounded allocator_variable_size any_of array assign at atomic_bool atomic_char atomic_char16_t atomic_char32_t atomic_compare_exchange_strong atomic_compare_exchange_strong_explicit atomic_compare_exchange_weak atomic_compare_exchange_weak_explicit atomic_exchange atomic_exchange_explicit atomic_fetch_add atomic_fetch_and atomic_fetch_or atomic_fetch_sub atomic_fetch_xor atomic_int atomic_int_fast16_t atomic_int_fast32_t atomic_int_fast64_t atomic_int_fast8_t atomic_int_least16_t atomic_int_least32_t atomic_int_least64_t atomic_int_least8_t atomic_intmax_t atomic_intptr_t atomic_is_lock_free atomic_llong atomic_load atomic_load_explicit atomic_long atomic_ptrdiff_t atomic_schar atomic_short atomic_size_t atomic_ssize_t atomic_store atomic_store_explicit atomic_uchar atomic_uint atomic_uint_fast16_t atomic_uint_fast32_t atomic_uint_fast64_t atomic_uint_fast8_t atomic_uint_least16_t atomic_uint_least32_t atomic_uint_least64_t atomic_uint_least8_t atomic_uintmax_t atomic_uintptr_t atomic_ullong atomic_ulong atomic_ushort atomic_wchar_t auto_ptr back back_insert_iterator back_item bad_alloc bad_function_call bad_weak_ptr basic_filebuf basic_fstream basic_ifstream basic_ofstream basic_regex basic_streambuf basic_string begin bernoulli_distribution bidirectional_iterator_tag binary_function binary_negate binary_search bind bind1st bind2nd binder1st binder2nd binomial_distribution bit_and bit_or bit_xor bitset boost cache_chunklist cache_freelist cache_suballoc cauchy_distribution cbegin cend cerr char_traits checked_array_iterator checked_uninitialized_copy checked_uninitialized_fill_n chi_squared_distribution cin clear codecvt codecvt_base codecvt_byname codecvt_mode codecvt_utf16 codecvt_utf8 codecvt_utf8_utf16 collate collate_byname common_type compare_exchange_strong compare_exchange_weak complex condition_variable conditional const_iterator const_mem_fun_ref_t const_mem_fun_t const_mem_fun1_ref_t const_mem_fun1_t const_pointer_cast const_reference const_reverse_iterator copy copy_backward copy_if copy_n count count_if cout crbegin cref crend ctype ctype_base ctype_byname decay declare_no_pointers declare_reachable declval default_delete default_random_engine deque difference_type discard_block discard_block_engine discrete_distribution divides domain_error dynamic_pointer_cast empty enable_if enable_shared_from_this end equal equal_range equal_to EqualityComparable erase error_category error_code error_condition exception exponential_distribution extent extreme_value_distribution fetch_add fetch_and fetch_or fetch_sub fetch_xor filebuf fill fill_n find find_end find_first_of find_if find_if_not fisher_f_distribution float_denorm_style float_round_style for_each forward forward_iterator_tag forward_list freelist front front_insert_iterator front_item fstream function gamma_distribution generate generate_n generic_container generic_iterator generic_reverse_iterator generic_value geometric_distribution get_deleter get_pointer_safety get_temporary_buffer greater greater_equal has_nothrow_assign has_nothrow_constructor has_nothrow_copy has_nothrow_copy_assign has_nothrow_copy_constructor has_nothrow_default_constructor has_trivial_assign has_trivial_constructor has_trivial_copy has_trivial_copy_assign has_trivial_copy_constructor has_trivial_default_constructor has_trivial_destructor has_virtual_destructor hash hash_map hash_set ifstream includes independent_bits_engine initializer_list inner_product inplace_merge input_iterator_tag insert insert_iterator integral_constant invalid_argument iostream is_abstract is_arithmetic is_array is_base_of is_bind_expression is_class is_compound is_const is_constructible is_convertible is_empty is_enum is_error_code_enum is_error_condition_enum is_explicitly_convertible is_floating_point is_function is_fundamental is_heap is_heap_until is_integral is_literal_type is_lock_free is_lvalue_reference is_member_function_pointer is_member_object_pointer is_member_pointer is_nothrow_constructible is_object is_partitioned is_placeholder is_pod is_pointer is_polymorphic is_reference is_rvalue_reference is_same is_scalar is_signed is_sorted is_sorted_until is_standard_layout is_trivial is_union is_unsigned is_void is_volatile istream istream_iterator istreambuf_iterator iter_swap iterator iterator_traits knuth_b length_error less less_equal LessThanComparable lexicographical_compare linear_congruential linear_congruential_engine list locale logic_error logical_and logical_not logical_or lognormal_distribution lower_bound make_checked_array_iterator make_heap make_shared make_signed make_unsigned map match_results max max_element max_fixed_size max_none max_unbounded max_variable_size mem_fn mem_fun mem_fun_ref mem_fun_ref_t mem_fun_t mem_fun1_ref_t mem_fun1_t merge mersenne_twister mersenne_twister_engine messages messages_base messages_byname min min_element minmax minmax_element minstd_rand minstd_rand0 minus mismatch modulus money_base money_get money_put moneypunct moneypunct_byname move move_backward move_iterator mt19937 mt19937_64 multimap multiplies multiset negate negative_binomial_distribution new_handler next_permutation none_of normal_distribution not_equal_to not1 not2 nothrow nothrow_t nth_element num_get num_put numeric_limits numpunct numpunct_byname ofstream ostream_iterator ostreambuf_iterator out_of_range output_iterator_tag overflow_error owner_less pair partial_sort partial_sort_copy partial_sum partition partition_copy partition_point piecewise_constant_distribution piecewise_linear_distribution plus pointer_safety pointer_to_binary_function pointer_to_unary_function poisson_distribution pop_back pop_front pop_heap prev_permutation priority_queue ptr_fun push_back push_front push_heap queue random_access_iterator_tag random_device random_shuffle range_error rank ranlux_base_01 ranlux24 ranlux24_base ranlux3 ranlux3_01 ranlux4 ranlux4_01 ranlux48 ranlux48_base ranlux64_base_01 ratio ratio_add ratio_divide ratio_multiply ratio_subtract raw_storage_iterator rbegin ref reference reference_wrapper regex regex_constants regex_error regex_iterator regex_token_iterator regex_traits remove remove_all_extents remove_const remove_copy remove_copy_if remove_cv remove_extent remove_if remove_pointer remove_reference remove_volatile rend replace replace_copy replace_copy_if replace_if requires resize result_of return_temporary_buffer reverse reverse_copy reverse_iterator rotate rotate_copy rts_alloc runtime_error search search_n seed_seq set set_difference set_intersection set_new_handler set_symmetric_difference set_union shared_ptr shuffle_order_engine size size_type sort sort_heap stable_partition stable_sort stack static_pointer_cast std string student_t_distribution sub_match subtract_with_carry subtract_with_carry_01 subtract_with_carry_engine swap swap_ranges sync_none sync_per_container sync_per_thread sync_shared system_error time_base time_get time_get_byname time_put time_put_byname to_array tr1 transform tuple tuple_element tuple_size type_info unary_function unary_negate unchecked_uninitialized_copy unchecked_uninitialized_fill_n undeclare_no_pointers undeclare_reachable underflow_error uniform_int uniform_int_distribution uniform_real uniform_real_distribution uninitialized_copy uninitialized_copy_n uninitialized_fill uninitialized_fill_n unique unique_copy unique_ptr unordered_map unordered_multimap unordered_multiset unordered_set upper_bound valarray value_type variate_generator vector wcerr wcin wcout weak_ptr weibull_distribution wfilebuf wfstream wifstream wiostream wistream wofstream wregex xor_combine"));
    codeEdit->SetKeyWords(2, wxT("a addindex addtogroup anchor arg attention author b brief bug c class code date def defgroup deprecated dontinclude e em endcode endhtmlonly endif endlatexonly endlink endverbatim enum example exception f$ f[ f] file fn hideinitializer htmlinclude htmlonly if image include ingroup internal invariant interface latexonly li line link mainpage name namespace nosubgrouping note overload p page par param post pre ref relates remarks return retval sa section see showinitializer since skip skipline struct subsection test throw todo typedef union until var verbatim verbinclude version warning weakgroup $ @ \\ < > # { }"));
	codeEdit->SetTabWidth(4);

    codeEdit->SetMarginWidth (MARGIN_LINE_NUMBERS, 20);
    codeEdit->StyleSetForeground (wxSTC_STYLE_LINENUMBER, wxColour (75, 75, 75) );
    codeEdit->StyleSetBackground (wxSTC_STYLE_LINENUMBER, wxColour (220, 220, 220));
    codeEdit->SetMarginType (MARGIN_LINE_NUMBERS, wxSTC_MARGIN_NUMBER);

    //Load values from the event
    codeEdit->SetText(editedEvent.GetInlineCode());
    for (std::size_t i = 0;i<editedEvent.GetIncludeFiles().size();++i)
    {
        includeTextCtrl->AppendText(editedEvent.GetIncludeFiles()[i]+"\n");
    }
    sceneRefCheck->SetValue(editedEvent.GetPassSceneAsParameter());
    objectsListCheck->SetValue(editedEvent.GetPassObjectListAsParameter());
    objectPassedAsParameterEdit->SetValue(editedEvent.GetObjectToPassAsParameter());
    displayedNameEdit->SetValue(editedEvent.GetDisplayedName());
    displayCodeCheck->SetValue(editedEvent.IsCodeDisplayedInEditor());

	const std::vector < std::shared_ptr<gd::SourceFile> > & allFiles = game.GetAllSourceFiles();
    for (std::size_t i = 0;i<allFiles.size();++i)
    {
        if ( allFiles[i]->IsGDManaged() ) continue;
        if ( allFiles[i]->GetLanguage() != "C++" ) continue;

        dependenciesList->Append(allFiles[i]->GetFileName());

        if ( std::find(editedEvent.GetDependencies().begin(), editedEvent.GetDependencies().end(), allFiles[i]->GetFileName() ) != editedEvent.GetDependencies().end() )
            dependenciesList->Check(dependenciesList->GetCount()-1, true);
    }

    UpdateFunctionPrototype();
}

EditCppCodeEvent::~EditCppCodeEvent()
{
	//(*Destroy(EditCppCodeEvent)
	//*)
}


void EditCppCodeEvent::OnokBtClick(wxCommandEvent& event)
{
    editedEvent.SetInlineCode(codeEdit->GetText());
    editedEvent.SetIncludeFiles( gd::String(includeTextCtrl->GetValue()).Split(U'\n') );
    editedEvent.SetPassSceneAsParameter( sceneRefCheck->GetValue() );
    editedEvent.SetPassObjectListAsParameter( objectsListCheck->GetValue() );
    editedEvent.SetObjectToPassAsParameter(objectPassedAsParameterEdit->GetValue());
    editedEvent.SetDisplayedName(displayedNameEdit->GetValue());
    editedEvent.EnableCodeDisplayedInEditor(displayCodeCheck->GetValue());

    std::vector<gd::String> dependencies;
    std::size_t listIndex = 0;
	const std::vector < std::shared_ptr<gd::SourceFile> > & allFiles = game.GetAllSourceFiles();
    for (std::size_t i = 0;i<allFiles.size();++i)
    {
        if ( allFiles[i]->IsGDManaged() ) continue;
        if ( allFiles[i]->GetLanguage() != "C++" ) continue;

        if ( dependenciesList->IsChecked(listIndex) ) dependencies.push_back(allFiles[i]->GetFileName());
        listIndex++;
    }
    editedEvent.SetDependencies(dependencies);
    editedEvent.SetLastChangeTimeStamp(wxDateTime::Now().GetTicks());

    editedEvent.EnsureAssociatedSourceFileIsUpToDate(game);

    EndModal(1);
}

void EditCppCodeEvent::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditCppCodeEvent::OnobjectBtClick(wxCommandEvent& event)
{
    gd::ChooseObjectDialog dialog(this, game, scene, true);
    if ( dialog.ShowModal() == 1 )
        objectPassedAsParameterEdit->ChangeValue(dialog.GetChosenObject());

    return;
}

void EditCppCodeEvent::UpdateFunctionPrototype()
{
    functionPrototypeTxt->SetLabel(gd::String("void Function(")+ (sceneRefCheck->GetValue() ? gd::String("RuntimeScene & scene") :gd::String("")) + ((sceneRefCheck->GetValue()&&objectsListCheck->GetValue()) ? ", ":"")+ (objectsListCheck->GetValue() ? gd::String("std::vector<RuntimeObject*> objectsList") :"") + ")\n{");
}

void EditCppCodeEvent::OnobjectsListCheckClick(wxCommandEvent& event)
{
    UpdateFunctionPrototype();
}

void EditCppCodeEvent::OnsceneRefCheckClick(wxCommandEvent& event)
{
    UpdateFunctionPrototype();
}
/**
 * Syntax highlighting
 */
void EditCppCodeEvent::UpdateTextCtrl(wxStyledTextEvent& event)
{
    char currentChar = codeEdit->GetCharAt(codeEdit->GetCurrentPos());
    if ( currentChar != '(' && currentChar != ')')
    {
        codeEdit->BraceHighlight(wxSTC_INVALID_POSITION, wxSTC_INVALID_POSITION);
        return;
    }

    int otherBrace = codeEdit->BraceMatch(codeEdit->GetCurrentPos());

    if ( otherBrace != wxSTC_INVALID_POSITION)
        codeEdit->BraceHighlight(codeEdit->GetCurrentPos(), otherBrace);
    else
        codeEdit->BraceBadLight(codeEdit->GetCurrentPos());
}
#endif
