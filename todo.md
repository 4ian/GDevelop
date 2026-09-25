# Reste à faire sur le debugger

## Sommaire

- [Tree views : porter les améliorations de l'inspecteur](#tree-views--porter-les-améliorations-de-linspecteur)
- [Vérifications à la main](#vérifications-à-la-main)

## Tree views : porter les améliorations de l'inspecteur

> ca c'est super ce treeview, mais tu peux pas porté ça sur les treeview existant pour les améliorer?

Constat : le sticky scroll et la recherche ne sont pas propres à l'inspecteur. Ils vivent dans `UI/TreeView` depuis `master` (`StickyRows.js`, `searchText`, `shouldApplySearchToItem`), et `enableStickyAncestors` est déjà activé sur ObjectsList, ProjectManager, LayersList, ObjectGroupsList, EventsFunctionsList, PropertyListEditor et InstructionOrObjectSelector. Ce qui est propre à l'inspecteur, et qu'il faudrait remonter dans `UI/TreeView` pour en faire profiter les autres :

1. **Lignes pleine largeur et z-index des lignes sticky** : `InspectorTreeView.module.css:77-125` force aujourd'hui les classes internes de `ReadOnlyTreeView` (`[class*=...]` et `!important`). À remplacer par des props de `ReadOnlyTreeView` et de `TreeView` (par exemple `fullWidthRows`), sans quoi le moindre renommage de classe casse l'inspecteur.
2. **Colonne de droite** (valeur, nombre d'enfants d'un dossier, indice en italique) : une prop `renderRightComponent(item)`, que WatchedVariablesPanel demande aussi. Le nombre d'enfants d'un dossier serait utile dans ObjectsList et ProjectManager.
3. **Barre de recherche intégrée** : `SearchBar` + `AutoSizer` + `ReadOnlyTreeView` + portail des lignes sticky sont assemblés deux fois (`InspectorsList.js`, `InspectorTreeView.js`). À factoriser en `UI/TreeView/SearchableReadOnlyTreeView`.
4. **Recherche sur le texte secondaire** : l'inspecteur cherche dans le nom et dans la valeur via `shouldApplySearchToItem`. La prop existe déjà : il reste à l'utiliser ailleurs, par exemple pour chercher un objet par son type ou par le nom d'un behavior.
5. **Portail des lignes sticky** (`stickyPortalTarget`, ajouté par la branche à `ReadOnlyTreeView` seulement) : à porter sur `TreeView` si un autre arbre tombe dans un conteneur qui coupe le débordement.

Garde-fou : l'inspecteur est la référence visuelle. Chaque étape doit laisser les stories `Debugger/InspectorTreeView` et `Debugger/InspectorsList` identiques (capture avant/après), et l'inspecteur ne doit passer sur les nouvelles props qu'une fois qu'elles reproduisent exactement ce que fait le CSS actuel.

## Vérifications à la main

Prérequis : libGD.js a été reconstruit, donc recharger l'IDE de dev avec Ctrl+Shift+R. Ouvrir l'onglet Debugger **avant** de lancer la preview, sinon rien n'est instrumenté.

### Temps affichés dans les événements (lot 1 du retour testeur)

- [ ] Une preview lancée avec le debugger ouvert affiche les temps en ms sur les instructions, et un total sur chaque groupe.
- [ ] Après la fermeture de la fenêtre de preview, les temps de la dernière frame restent affichés.
- [ ] Fermer l'onglet Debugger efface tous les temps.
- [ ] Le bouton Clear efface tout sans fermer la preview.
- [ ] Fermer le projet efface tout.
- [ ] Démarrer un enregistrement ne fait pas clignoter l'inspecteur, et les nœuds dépliés restent dépliés.

### Variables de toutes les instances (lot 3 du retour testeur)

- [ ] Sur une scène avec 5 instances aux valeurs différentes, une variable d'objet surveillée affiche « 1 / 5 ».
- [ ] Déplier la ligne liste les 5 instances par `#id`, avec la bonne valeur pour chacune.
- [ ] Le filtre (loupe) trouve une instance par son id et par sa valeur.
- [ ] Créer puis détruire des instances pendant la preview met la liste à jour.
- [ ] Avec un millier d'instances, le panneau reste fluide et la liste s'arrête au plafond (ligne « N more »).
- [ ] **Nouveau** : une variable lue sur un groupe mêlant deux objets (`Fighters.Life`) liste les instances des deux objets, nommées `Player #12` et `Enemy #40`. Le filtre trouve aussi une instance par le nom de son objet.
- [ ] **Nouveau** : avec un groupe qui ne contient qu'un seul objet, les instances restent nommées `#id`.

### Export, import et comparaison (lots 4 et 5 du retour testeur)

- [ ] Enregistrer sur un jeu 3D puis sur un jeu 2D pur : le Profiler montre les sous-sections de `render` (une par calque, plus « state resets »).
- [ ] Le panneau Performance montre les compteurs (draw calls, triangles, calques, objets rendus, textures gérées).
- [ ] Quand `render` dépasse la moitié de la frame, un conseil s'affiche sous le tableau des mesures.
- [ ] « Export the recorded data… », fermer le projet, puis « Import a recording… » : les panneaux Profiler, Performance et Resources montrent la même chose qu'avant l'export, et Record reste désactivé sur l'enregistrement importé.
- [ ] « Compare the other recordings to this one », puis relancer une preview et enregistrer : le tableau des mesures affiche les écarts, les cartes de Performance disent « better / worse than the reference », et les courbes de référence sont superposées.
- [ ] **Nouveau** : le panneau Resources affiche les colonnes « Memory vs ref. » et « Load time vs ref. » seulement quand une référence est épinglée, avec des valeurs signées (`+1.20 MB`, `-30 ms`, `=`).
- [ ] **Nouveau** : une ressource absente de la référence affiche « new ».
- [ ] **Nouveau** : sur l'enregistrement de référence lui-même, les colonnes « vs ref. » n'apparaissent pas.

### Son joué depuis une expression (lot 6 du retour testeur)

- [ ] Dans l'action « Play a sound », « Use an expression » permet de saisir `"Jump" + ToString(1) + ".mp3"`. Le son est joué en preview, puis dans un export HTML5.
- [ ] **Nouveau** : en mode expression, un texte d'aide sous le champ explique que le son n'est pas préchargé et qu'il n'est pas vu par le nettoyage ni par le renommage des ressources. Le texte n'apparaît pas dans la version inline du champ.
- [ ] **Nouveau** : une expression qui donne un nom inconnu affiche en console « No audio resource is named "..." », une seule fois même si l'action est jouée à chaque frame.
- [ ] Un son choisi normalement (sans expression) marche toujours, et ne déclenche aucun avertissement.
- [ ] Une ressource dont le nom contient des parenthèses (`Jump (1).mp3`) est toujours jouée et exportée (risque L1.3 du plan de review).
