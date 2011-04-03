///////////////////////////////////////////////////////////////////////////////
// File:        steprefs.h
// Purpose:     wxSTEditor Preferences/Styles/Languages initialization
// Maintainer:
// Created:     2003-04-04
// RCS-ID:      $Id: steprefs.h,v 1.10 2007/02/15 02:20:42 jrl1 Exp $
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STEPREFS_H_
#define _STEPREFS_H_

#include "wx/stedit/stedefs.h"

class WXDLLEXPORT wxConfigBase;

//----------------------------------------------------------------------------
// wxSTEditorPrefBase - base for prefs/styles/langs, mangages editors
//----------------------------------------------------------------------------
class WXDLLIMPEXP_STEDIT wxSTEditorPrefBase : public wxObject
{
public:
    wxSTEditorPrefBase() : wxObject() {}
    virtual ~wxSTEditorPrefBase() {}
    bool Ok() const { return m_refData != NULL; }

    // Get the number of editors that this class manages
    size_t GetEditorCount() const;
    // Does this manage this editor?
    bool HasEditor(wxSTEditor* editor) const { return FindEditor(editor) != wxNOT_FOUND; }
    // What is the index of this editor? wxNOT_FOUND if unknown
    int FindEditor(wxSTEditor* editor) const;
    // Get the editor at this index
    wxSTEditor *GetEditor(size_t n) const;

    // Update this particular editor
    virtual void UpdateEditor(wxSTEditor *WXUNUSED(editor))=0;
    // Update all the editors, calling UpdateEditor on each one
    void UpdateAllEditors();

    // Add a new editor to be updated as necessary
    // NB: wxSTEditor::RegisterPrefs/Styles/Langs makes sure that you
    //     don't register the same editor to more than one prefs, styles, langs.
    void RegisterEditor(wxSTEditor *editor, bool update_now = true);
    // Remove this editor from the ones being updated
    void RemoveEditor(wxSTEditor *editor);

private:
    DECLARE_ABSTRACT_CLASS(wxSTEditorPrefBase)
};

//----------------------------------------------------------------------------
// wxSTEditorPrefBase_RefData - internal use
//----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorPrefBase_RefData : public wxObjectRefData
{
public:
    wxSTEditorPrefBase_RefData() { }
    virtual ~wxSTEditorPrefBase_RefData() { m_editors.Clear(); }

    wxArrayPtrVoid m_editors;
};

//----------------------------------------------------------------------------
// wxSTEditorPrefs - ref counted preferences for the wxSTEditor
//                         see STE_PrefType, stores all int/bool pref values
//
// Any wxStyledTextControl function that matches one of the enum STE_PrefType
// will be set by this class. Therefore you should use this class to get/set any
// any values and not call wxStyledTextCtrl::Get/SetXXX..
//
// Attach to an editor using wxSTEditor::RegisterPreferences
// Remove from an editor by calling
//  wxSTEditor::RegisterPreferences(wxSTEditorPrefs(false));
//
// Note: To permanently add a new preference
//  add enum STE_PrefType STE_PREF_XXX and add ID_STE_PREF_XXX (even if unused)
//    don't forget to update ID_STE_PREF__LAST
//  add to wxSTEditorPrefs::Init the init value in correct place
//  add to wxSTEditorPrefs::UpdateEditor to set value (if appropriate)
//  add to wxSTEditorPrefs::Create(wxSTEditor *editor) if possible
//  add to wxSTEditorPrefs::UpdateMenuToolItems (if appropriate)
//  add to wxSTEditorMenuManager in correct place (if desired)
//  if menu item add to wxSTEditorMenuManager::EnableEditorItems
//  add to wxSTEditor::HandleEvent if necessary
//----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorPrefs : public wxSTEditorPrefBase
{
public:
    wxSTEditorPrefs(bool create=false) { Init(); if (create) Create(); }
    wxSTEditorPrefs(const wxSTEditorPrefs &prefs) { Init(); Create(prefs); }
    virtual ~wxSTEditorPrefs() {}
    bool Ok() const { return m_refData != NULL; }
    bool Create();                                   // (re)create as new with default vals
    bool Create(const wxSTEditorPrefs &other); // make a Refed copy of other
    bool Create(wxSTEditor *editor);           // initialize from editor values (doesn't modify editor)
                                                     // not all values supported
    void Copy(const wxSTEditorPrefs &other);   // make a full copy, create if necessary
    void Reset();                                    // reset to default vals
    void Destroy() { UnRef(); }

    // Do these two prefs have the same values
    bool IsEqualTo(const wxSTEditorPrefs &prefs) const;

    //-------------------------------------------------------------------------
    // An instance of the editor preferences for many editors to share
    //   Use this in at least one editor to not let it go to waste.
    static wxSTEditorPrefs& GetGlobalEditorPrefs();

    //-------------------------------------------------------------------------

    // Get the number of preferences (=STE_PREF__MAX unless you added some)
    size_t GetPrefCount() const;

    // Get/Set preferences as int (pref_n is enum STE_PrefType unless you added some)
    //  update=true calls UpdateAllEditors, if you need to set many values
    //    use with update=false until the last one.
    wxString GetPref(size_t pref_n) const;
    bool     SetPref(size_t pref_n, const wxString& value, bool update = true);

    // Get/Set preferences as int (pref_n is of type enum STE_PrefType unless you added some)
    //   returns 0 if the pref doesn't exist or it can't be converted to int
    int  GetPrefInt(size_t pref_n) const;
    bool SetPrefInt(size_t pref_n, int value, bool update = true);

    // Get/Set preferences as a bool
    bool GetPrefBool(size_t pref_n) const { return GetPrefInt(pref_n) != 0; }
    bool SetPrefBool(size_t pref_n, bool value, bool update = true) { return SetPrefInt(pref_n, value ? 1 : 0, update); }

    // Get/Set preferences using, win_id = ID_STE_PREF__FIRST ... ID_STE_PREF__LAST
    int  GetPrefIntByID(int win_id) const { return GetPrefInt(win_id - ID_STE_PREF__FIRST); }
    bool SetPrefIntByID(int win_id, int value, bool update = true) { return SetPrefInt(win_id - ID_STE_PREF__FIRST, value, update); }

    bool GetPrefBoolByID(int win_id) const { return GetPrefIntByID(win_id) != 0; }
    bool SetPrefBoolByID(int win_id, bool value, bool update = true) { return SetPrefIntByID(win_id, value ? 1 : 0, update); }

    //-------------------------------------------------------------------------

    // Get the pref flags, see enum STE_PrefFlagType
    //  this is additional info about the pref that won't be saved in the wxConfig
    //  all instances of the prefs class share these values
    int  GetPrefFlags(size_t pref_n) const;
    bool HasPrefFlag(size_t pref_n, int flag) const { return STE_HASBIT(GetPrefFlags(pref_n), flag); }
    void SetPrefFlags(size_t pref_n, int flags);

    // Get a human readable name for the pref
    //  all instances of the prefs class share the same name per preference
    wxString GetPrefName(size_t pref_n) const;
    void SetPrefName(size_t pref_n, const wxString& prefName);

    //-------------------------------------------------------------------------
    // Setup the initial values this class is initialized with

    // Get/Set initial pref values, values this class is initialized with
    wxString GetInitPrefValue(size_t pref_n) const;
    void SetInitPrefValue(size_t pref_n, const wxString& value) const;
    // Add a initial pref, doesn't modify already created wxSTEditorPrefs
    //  returns the index of the added pref
    size_t AddInitPref(const wxString &prefName, const wxString& value, int flags = 0) const;
    size_t AddInitPref(const wxString &prefName, int value, int flags = 0) const;
    // get the number of initial preferences
    size_t GetInitPrefCount() const;

    //-------------------------------------------------------------------------
    // update editors
    virtual void UpdateEditor(wxSTEditor *editor);

    // update menu, menubar, toolbar items (ID_STE_PREF__FIRST ... ID_STE_PREF__LAST)
    // tries to update everything, doesn't fail on anything
    void UpdateMenuToolItems(wxMenu *menu, wxMenuBar *menuBar, wxToolBar *toolBar);

    // ------------------------------------------------------------------------
    // configuration load & save: [key = GetPrefName] = [value = GetPref]
    //   See also wxSTEditorOptions for paths and internal saving config.
    void LoadConfig(wxConfigBase &config,
                    const wxString &configPath = wxT("/wxSTEditor/Preferences/"));
    void SaveConfig(wxConfigBase &config,
                    const wxString &configPath = wxT("/wxSTEditor/Preferences/"),
                    int flags = 0) const;

    // ------------------------------------------------------------------------
    // operators
    wxSTEditorPrefs& operator = (const wxSTEditorPrefs& prefs)
    {
        if ( (*this) != prefs )
            Ref(prefs);
        return *this;
    }

    bool operator == (const wxSTEditorPrefs& prefs) const
        { return m_refData == prefs.m_refData; }
    bool operator != (const wxSTEditorPrefs& prefs) const
        { return m_refData != prefs.m_refData; }

private:
    void Init();
    DECLARE_DYNAMIC_CLASS(wxSTEditorPrefs)
};

#endif // _STEPREFS_H_
