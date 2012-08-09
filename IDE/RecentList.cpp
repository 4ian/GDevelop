#include "RecentList.h"

RecentList::RecentList()
{
    p_iMax=0;
    sEntry.Clear();
    p_Menu=NULL;
}

RecentList::~RecentList()
{

}

void RecentList::Append(const wxString &sValue)
{
    wxString sTxt;
    if (((int)sEntry.Count()<p_iMax)&&(sValue!=wxEmptyString))
    {
        sEntry.Add(sValue);
        UpdateMenu();
    }
}

void RecentList::SetLastUsed(const wxString &sValue)
{
    if (sValue==wxEmptyString) return;
    wxString pSVal=sValue;
    /*if (pSVal.Last()!='\\') pSVal+='\\';*/
    int idx=sEntry.Index(pSVal,FALSE);
    wxString sTxt;
    // si l'entrée existe déjà dans la liste
    if (idx!=wxNOT_FOUND)
    {
        // Si l'entrée est déjà au début de la liste,
        // alors, il n'y a rien à faire => On sort
        if (idx==0) return;
        // sinon, on enlève l'entrée de son emplacement actuel
        sEntry.RemoveAt(idx);
    }
    // On insert l'entrée au début de celle-ci
    sEntry.Insert(pSVal,0);
    // Si on a dépassé le nombre maxi d'entrées voulues, alors, on enlève la dernière
    while ((int)sEntry.Count()>p_iMax)
    {
        sEntry.RemoveAt(sEntry.Count()-1);
    }
    // Mise à jour éventuelle du menu associé
    UpdateMenu();
}

int RecentList::GetEntryCount()
{
    return (int)sEntry.Count();
}

int RecentList::GetMaxEntries()
{
    return p_iMax;
}

wxString RecentList::GetEntry(int Index)
{
    if (Index>(p_iMax-1)) return wxEmptyString;
    if (Index>(int)(sEntry.Count()-1)) return wxEmptyString;
    return sEntry[Index];
}

void RecentList::SetMaxEntries(int iNbEntries)
{
    if ((iNbEntries==0)||(iNbEntries==p_iMax)) return;
    // On ne peut mettre que 9 entrées maximum, sinon, il faut passer par des
    // IDs personnalisés
    if (iNbEntries>9) return;
    // Si on veut diminuer le nombre maximum d'entrées
    if (iNbEntries<p_iMax)
    {
        // on supprime la dernière entrée jusqu'à obtenir
        // le nombre correct de valeurs
        while(iNbEntries<(int)sEntry.Count())
        {
            sEntry.RemoveAt(sEntry.Count()-1);
        }
    }
    // Dans les deux cas, on définit le nouveau nombre maximum d'entrées dans la liste
    p_iMax=iNbEntries;
    // et on met à jour le menu
    UpdateMenu();
}

void RecentList::SetAssociatedMenu(wxMenu *Menu)
{
    p_Menu=Menu;
    if (p_Menu==NULL) return;
    if ((int)Menu->GetMenuItemCount()>0) return;
    int imax;
    wxString sTxt;
    imax=p_iMax;
    if ((int)sEntry.Count()<imax) imax=sEntry.Count();
    // On crée la première entrée du menu ici
    p_Menu->Append(wxID_FILE1,_("Liste vide"));
    p_Menu->Enable(wxID_FILE1,false);
    UpdateMenu();
}

void RecentList::UpdateMenu()
{
    int i,imax,immax;
    wxString sTxt;
    if (p_Menu==NULL) return;
    immax=p_Menu->GetMenuItemCount();
    imax=sEntry.Count();
    if (immax!=imax) // Si on n'a pas le même nombre d'entrées que de menuitems
    {
        // il y a un cas particulier : 1 menuitem et 0 entrées dans la liste
        // c'est normal, l'item est "Liste Vide"
        if ((immax==1)&&(imax==0)) return;
        // Si on a plus de menuitems que d'entrées dans la liste, ce qui peut
        // se produire lors d'un changement du nombre maxi d'entrées
        while(immax>imax)
        {
            p_Menu->Destroy(wxID_FILE1+immax-1);
            immax--;
        }
        // Si on a moins de menuitems que d'entrées dans la liste
        while(immax<imax)
        {
            // On crée un menuitem avec un texte temporaire
            p_Menu->Append(wxID_FILE1+immax,_T("Recent Entry"));
            immax++;
        }
    }
    // Mise à jour des entrées du menu
    for (i=0;i<immax;i++)
    {
        sTxt.Printf(_("Ouvrir le fichier \"%s\""),sEntry[i].c_str());
        p_Menu->SetLabel(wxID_FILE1+i,sEntry[i]);
        p_Menu->SetHelpString(wxID_FILE1+i,sTxt);
    }
    // Activation de la première entrée, si ce n'étais pas déjà fait
    p_Menu->Enable(wxID_FILE1,true);
}
