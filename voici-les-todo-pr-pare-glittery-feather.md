# Retour de test du debugger : plan de traitement

## Sommaire

- [Contexte](#contexte)
- [État de la vérification](#état-de-la-vérification)
- [Ordre de livraison](#ordre-de-livraison)
- [Lot 1 : les trois bugs](#lot-1--les-trois-bugs)
- [Lot 2 : pourcentage et temps par groupe d'événements](#lot-2--pourcentage-et-temps-par-groupe-dévénements)
- [Lot 3 : variables de toutes les instances](#lot-3--variables-de-toutes-les-instances)
- [Lot 4 : export, import et comparaison côte à côte](#lot-4--export-import-et-comparaison-côte-à-côte)
- [Lot 5 : rendre le « render » exploitable](#lot-5--rendre-le--render--exploitable)
- [Lot 6 : jouer un son depuis une expression](#lot-6--jouer-un-son-depuis-une-expression)
- [Vérification](#vérification)
- [Risques transverses](#risques-transverses)

## Contexte

Un testeur a utilisé le debugger refondu de la branche `events-execution-profiler` et a rendu un retour détaillé (`todo.md`). Il valide l'essentiel (surbrillance des instructions exécutées, profiler dans les extensions, pause et ralenti, fin de la limite de 600 frames) et bute sur six points : trois bugs, et quatre manques qui l'empêchent d'exploiter l'outil pour ce qu'il en attend, à savoir mesurer l'effet réel de ses optimisations sur plusieurs semaines de travail.

Le fil rouge de son retour : il ne cherche pas plus de chiffres, il cherche à **savoir quoi conclure**. « Render à 75 % » ne lui dit pas quoi corriger ; une valeur de variable ne lui dit pas de quelle instance elle vient ; un enregistrement perdu à la fermeture du projet ne lui permet pas de prouver qu'il a optimisé plutôt qu'alourdi.

Deux contraintes structurent tout le plan :

1. **Règle « zéro coût sans debugger »** (demande explicite du mainteneur) : aucune instrumentation ne doit peser sur le jeu quand le debugger n'est pas ouvert. Tout nouveau compteur vit derrière `game.getProfiler()` (null hors enregistrement) ou dans le chemin d'évaluation à la demande.
2. **Ne jamais changer la sémantique du code généré du jeu.** Les évolutions de debug passent par `LayoutCodeGenerator::GenerateExpressionEvaluationCode`, jamais par `EventsCodeGenerator::GenerateGetVariable` ni `GenerateObjectFunctionCall`.

## État de la vérification

Le plan a été confronté au code le 17 septembre 2026, sur la branche `events-execution-profiler`, dernier commit `6fcbcefea3`. **Aucun constat n'est invalidé et aucun lot ne change de coût.** Les numéros de ligne ont été rafraîchis, et trois choses ont bougé dans l'arbre de travail non committé :

- Un plafond de taille a été posé sur le dump de l'inspecteur (`abstract-debugger-client.ts`), ce qui change la nature du risque transverse correspondant.
- Les `<Trans>` interpolés de `RecordingControls.js`, `Profiler/index.js` et `Performance/index.js` ont été découpés : le lot 1c est réduit d'autant.
- Les inspecteurs ont été refondus, et `FrameStats` a gagné un champ. Le lot 1b et le format de fichier du lot 4 en tiennent compte.

## Ordre de livraison

Les bugs d'abord (courts, visibles, sans risque architectural), puis une feature par lot vérifiable :

| Lot | Sujet | Coût | Rebuild libGD.js |
|---|---|---|---|
| 1 | Trois bugs | faible | non |
| 2 | % et ms par groupe | moyen | non |
| 3 | Variables de toutes les instances | moyen | **oui** |
| 4 | Export/import + comparaison | élevé | non |
| 5 | Render exploitable | moyen à élevé | non |
| 6 | Son par expression | moyen | **oui** |

## Lot 1 : les trois bugs

### 1a. Les temps en ms ne s'effacent jamais

Cause racine confirmée : à la fermeture de la dernière preview, [UseEventsExecutionTracking.js:80](newIDE/app/src/EventsExecutionTracking/UseEventsExecutionTracking.js#L80) appelle `store.setHighlightsPersistent(true)`, qui **annule le timer d'expiration** ([EventsExecutionTrackingStore.js:115-127](newIDE/app/src/EventsExecutionTracking/EventsExecutionTrackingStore.js#L115-L127)). C'est délibéré (garder la dernière frame visible comme sur un jeu en pause) mais les entrées ne sont alors plus jamais supprimées. Fermer l'onglet debugger ne nettoie rien : `setDebuggerOpened` ne fait que stocker un booléen ([l.106-108](newIDE/app/src/EventsExecutionTracking/EventsExecutionTrackingStore.js#L106-L108)) et il est appelé **pendant le render** ([UseEventsExecutionTracking.js:32](newIDE/app/src/EventsExecutionTracking/UseEventsExecutionTracking.js#L32)), hors de tout effet.

À faire, en préservant l'intention d'origine (la dernière frame reste visible tant que quelqu'un la regarde) :

- `EventsExecutionTrackingStore.js` : `setDebuggerOpened` mémorise l'ancienne valeur et, au passage à `false`, fait `setHighlightsPersistent(false)` puis `clear()`. Nouvelle méthode `onAllPreviewsClosed()` : persiste si le debugger est ouvert, efface sinon.
- `UseEventsExecutionTracking.js` : déplacer `setDebuggerOpened` dans un `useEffect` dédié (deps `[store, isDebuggerOpened]`), et remplacer le corps de `onConnectionClosed` par `store.onAllPreviewsClosed()`. Ne pas toucher aux deps de l'effet principal (l.111) pour éviter de réenregistrer les callbacks du serveur à chaque ouverture d'onglet.
- `Debugger/index.js` : ajouter `static contextType = EventsExecutionTrackingContext` (la classe n'a aucun `contextType` aujourd'hui, et `MainFrame` accède déjà au store via ce contexte, donc c'est l'instance partagée) et appeler `this.context.clear()` depuis `_clear` ([l.499-506](newIDE/app/src/Debugger/index.js#L499-L506)). **Surtout pas** depuis `_forgetRecordedData`, qui est aussi appelé par `_startProfiler` et effacerait la dernière frame d'un jeu débogué image par image.
- `MainFrame/index.js` : dans la fermeture de projet, ajouter `.clear()` à côté du `clearWatchedExpressions()` existant ([l.1243](newIDE/app/src/MainFrame/index.js#L1243)).
- Au passage, deux défauts de `_scheduleExpiration` ([l.328-354](newIDE/app/src/EventsExecutionTracking/EventsExecutionTrackingStore.js#L328-L354)) : ne notifie pas les événements dont seules des instructions ont expiré, et ne se replanifie que si `_instructionExecutions.size > 0` (des entrées d'événement orphelines survivent).

### 1b. L'Inspector clignote au démarrage d'un enregistrement

`_startProfiler` ([Debugger/index.js:478-487](newIDE/app/src/Debugger/index.js#L478-L487)) appelle `_forgetRecordedData`, qui supprime `debuggerGameData[id]` ([l.514](newIDE/app/src/Debugger/index.js#L514)). Or [InspectorsList.js:163](newIDE/app/src/Debugger/InspectorsList.js#L163) fait `if (!gameData) return null` : l'arbre est **démonté**, et `ReadOnlyTreeView` ne garde les nœuds ouverts que dans un `useState(initiallyOpenedNodeIds)`, donc tout se replie. Pire, rien ne redemande de `dump` ensuite (le dump n'est produit que sur les commandes `pause` et `refresh`), donc l'arbre reste vide jusqu'à une action manuelle.

À faire :
- Ne pas jeter l'état inspecté quand on démarre un enregistrement : sortir `debuggerGameData` de `_forgetRecordedData`, ou donner à cette fonction un drapeau pour préserver l'état inspecté dans le cas « clear on record ».
- Enchaîner un `refresh` après un clear explicite, pour que l'arbre se repeuple au lieu de rester vide.
- Rendre le repli de l'arbre insensible au démontage : conserver les nœuds ouverts hors du composant (état remonté dans `DebuggerContent`, ou `InspectorsList` qui rend un arbre vide plutôt que `null`).

Réserve : les inspecteurs ont été refondus depuis la rédaction de ce plan (`Inspectors/InspectedValue.js`, `RuntimeSceneInspector.js`, `VariablesContainerInspector.js`, `BehaviorsInspector.js`, `TimersInspector.js` et le nouveau `Inspectors/variablesContainerData.js`). Le diagnostic reste exact, mais la forme de la solution est à confronter à cette refonte avant d'écrire la moindre ligne.

### 1c. Les libellés bruts type `MAX_FRAMES_IN_FLAME_CHART`

Ce n'est **pas** un libellé oublié. `src/locales/en/messages.js` est un catalogue généré et committé par le pipeline automatique de traductions (`git log` : « [Auto PR] Update translations »). Les chaînes nouvelles de cette branche n'y sont donc pas encore, et Lingui 2 renvoie alors l'id du message tel quel, placeholders compris : les chaînes sans interpolation s'affichent bien, celles avec interpolation montrent `{0}` ou `{MAX_FRAMES_IN_FLAME_CHART}`. C'est un artefact de branche, qui se résorbe à la fusion.

Déjà traité depuis la rédaction de ce plan : `RecordingControls.js` (l.64 et l.77), `Profiler/index.js` et `Performance/index.js`, dont les `<Trans>` ont été découpés en fragments non interpolés.

Reste du vrai travail :
- [FlameChart.js:27 et 270-282](newIDE/app/src/Debugger/Profiler/FlameChart.js#L270-L282) : ne pas interpoler la constante `MAX_FRAMES_IN_FLAME_CHART` dans un `<Trans>`, sinon l'id du message porte ce nom même après extraction. C'est le cas exact remonté par le testeur. Passer par une variable locale lisible.
- Même revue sur les `<Trans>` interpolés restants : `Resources/index.js` (l.163, l.269), `Resources/MemoryBar.js` (l.104-108, l.132), `Resources/ResourcesTable.js` (l.272), `Resources/LoadTimeline.js` (l.413), `DebuggerConsole.js` (l.259, l.268).
- Quatre libellés de l'arbre sans `<Trans>` : `GDJSInspectorDescriptions.js` l.64, 77, 99, 111 (`Global variables`, `Scenes`, `Scene variables`, `Instances`).
- Trancher la méthode, et s'y tenir : sortir la valeur du `<Trans>` (ce qui a été fait sur `RecordingControls.js`) rend la chaîne lisible sans traduction mais fige l'ordre des mots, ce qui gêne les langues qui le changent. L'alternative est de garder l'interpolation avec un nom de variable en minuscules, lisible tel quel dans le message non traduit.
- Pour les builds portables destinés aux testeurs : lancer `npm run extract-all-translations` puis `npm run compile-translations` avant le build, **sans committer** le résultat (l'extraction régénère une trentaine de locales, c'est le rôle du pipeline).

## Lot 2 : pourcentage et temps par groupe d'événements

Demande : voir sur un groupe son temps et sa part, pour repérer les groupes coûteux. Constat : la feuille d'événements n'affiche aucun pourcentage aujourd'hui, seulement des ms, et un groupe n'a **aucune** entrée de durée puisque `_eventExecutions` ne somme que les instructions portées directement par un événement.

Deux voies existent. La voie profiler (relier les sections nommées aux événements) est écartée : le nom de section est le seul lien (donc collision entre deux groupes de même nom), et les fonctions d'extension ne produisent aucune section (`compilationForRuntime = true` forcé par `EventsFunctionsExtensionsLoader/index.js`), alors que le testeur apprécie justement le suivi dans les extensions.

Voie retenue, **entièrement côté IDE, sans changement runtime ni C++** : cumuler récursivement les durées des sous-événements, puisque `buildEventsTreeData` ([EventsSheet/EventsTree/index.js](newIDE/app/src/EventsSheet/EventsTree/index.js), vers l.1003-1071) descend déjà dans les sous-événements même repliés et indexe par `event.ptr`.

- `EventsExecutionTrackingStore.js` : une map parent par feuille (`registerEventsHierarchy` / `unregisterEventsHierarchy`, la feuille remplit sa map en place), une map `_cumulatedEventExecutions` alimentée à l'ingestion en remontant la chaîne des parents, et un getter dédié.
- Pourcentage : part du total suivi dans le dernier rapport. Numérateur et dénominateur viennent des mêmes mesures, donc le ratio est cohérent et gratuit. Le « % de frame » demanderait d'ajouter une durée de référence au payload de `GDJS/Runtime/events-execution-tracker.ts` ; le profiler répond déjà mieux à cette question, donc c'est une extension optionnelle.
- Lissage : moyenne mobile exponentielle sur la valeur cumulée, désactivée quand les surbrillances sont persistantes (pause et image par image doivent montrer la valeur exacte). Sans lissage, un badge recalculé toutes les 100 ms est illisible.
- Affichage : un petit composant qui lit `TrackedEventPtrContext` (déjà posé par ligne) et rend le badge, inséré à droite du titre dans [Renderers/GroupEvent.js](newIDE/app/src/EventsSheet/EventsTree/Renderers/GroupEvent.js) (vers l.150-165). `GroupEvent` est une classe dont le `contextType` est déjà pris, d'où le composant séparé. Style à côté de `.instruction-execution-time` dans [EventsSheet.css](newIDE/app/src/UI/Theme/Global/EventsSheet.css#L44-L58), avec une couleur lisible sur le fond coloré du groupe.
- Limite à documenter : le tracker fait `set` et non `+=` par instruction, donc une instruction dans une boucle ne compte que sa dernière exécution. Le cumul d'un groupe est « équivalent une frame » et sous-estime les boucles.

## Lot 3 : variables de toutes les instances

Demande retenue : lister les valeurs de **toutes** les instances, avec filtre et plafond. Aujourd'hui tout affiche silencieusement la première instance : `GenerateGetVariable` génère `ObjList[0].getVariables()`, et `GenerateExpressionEvaluationCode` remplit pourtant `ObjList` avec toutes les instances de la scène sans en utiliser qu'une.

Levier déterminant : `context.SetCurrentObject(name)` fait déjà générer `ObjList[i]` au lieu de `ObjList[0]`. Une itération par instance ne demande donc **aucune modification de `GenerateGetVariable`**, il suffit que `LayoutCodeGenerator` pose l'objet courant et emballe le résultat dans une boucle.

- `GDJS/GDJS/Events/CodeGeneration/LayoutCodeGenerator.cpp` (+ `.h`, `Bindings.idl`) : un **setter** `SetEvaluateForAllInstances(bool)` plutôt qu'un paramètre supplémentaire, sur le modèle de `SetGenerateEventsExecutionTracking`, pour que la signature à quatre arguments reste valide côté JS. Quand le drapeau est posé et que l'expression est une variable d'objet (le re-routage `objectvar` de [l.124-135](GDJS/GDJS/Events/CodeGeneration/LayoutCodeGenerator.cpp#L124-L135) connaît déjà la racine), émettre une boucle bornée qui produit `[{ id, result }]`, et retourner `{ result, instancesCount, instances, variables }`. Remettre `SetNoCurrentObject()` avant de générer `variablesCode`, sinon la liste de variables devient dépendante de l'itération.
- Plafond à deux niveaux (constante C++ et plafond IDE) : le payload part toutes les 300 ms et le timeout de réponse est de 1000 ms.
- Groupes d'objets : `GetCurrentObject()` est comparé aux objets réels issus de `ExpandObjectName`, donc un nom de groupe ne déclenche jamais la branche indexée. Soit étendre le groupe dans `LayoutCodeGenerator` et concaténer les instances en étiquetant l'objet, soit refuser proprement le mode par instance sur un groupe et afficher « N instances, valeur de la première ». Le comportement actuel (première instance du dernier objet du groupe) est de toute façon à documenter comme un piège.
- `GDJS/Runtime/debugger-client/abstract-debugger-client.ts` ([`sendExpressionValues`, l.1038-1069](GDJS/Runtime/debugger-client/abstract-debugger-client.ts#L1038)) : passer `instances` dans le payload en appliquant `toDebuggerValue` à chaque valeur.
- [WatchedVariablesPanel.js](newIDE/app/src/EventsExecutionTracking/WatchedVariablesPanel.js) : mode par instance **opt-in par ligne** (au dépliage d'une variable d'objet), un niveau intermédiaire `#id` dans `buildChildrenItems` (vers l.85-113), un champ de filtre et une ligne « et N autres » au-delà du plafond. Les lignes non dépliées restent en mode léger : le coût réseau reste borné.
- Bonus quasi gratuit à inclure : afficher « 1 / 12 » même en mode léger, en ajoutant `instancesCount` au retour. C'est ce qui lève l'ambiguïté pour l'utilisateur qui ne déplie pas.

Non retenu pour ce lot (à garder pour plus tard) : cibler une instance depuis l'Inspector, et le résumé des valeurs distinctes dans la tooltip de la feuille d'événements. Noter au passage un défaut réel repéré : l'arbre de l'Inspector indexe les instances par **position** ([`key: index` en l.158](newIDE/app/src/Debugger/GDJSInspectorDescriptions.js#L158), face au `label: #${runtimeObject.id}` de la l.156) alors que `runtimeObject.id` est stable, donc la sélection « #42 » suit une autre instance dès qu'une instance est créée ou détruite. Correction à faire dans le même commit que le résolveur de chemin runtime, sinon les chemins `inspector.dump` cassent.

## Lot 4 : export, import et comparaison côte à côte

Besoin réel : comparer deux enregistrements pris à des semaines d'intervalle, pour prouver qu'une optimisation a bien allégé le jeu. Tout est perdu à la fermeture du projet aujourd'hui, et aucune donnée du debugger n'est persistée.

Bonne nouvelle : toutes les données ont déjà transité en JSON par le protocole debugger, donc elles sont sérialisables telles quelles. Seuls les conteneurs ne le sont pas (`Map`, `Set`, timers).

**Fichier** : un module `Debugger/Export/DebuggerRecordingFile.js`, format versionné `{ kind, formatVersion, metadata, profiler, resources, logs }`. `metadata` porte le nom du projet, la version de l'IDE ([Version.js](newIDE/app/src/Version.js)), la date, la scène, la durée et le nombre de frames (via `getRecordingTimeBounds` et `getFrameStats`). Exclure l'état de transport (`recordingId`, `nextChunkIndex`, `nameIdOffset`). Écrire sans indentation (le `null, 2` doublerait la taille ; un enregistrement de 5 minutes fait environ 18 000 frames).

`FrameStats` bouge encore : le champ `slowestFrameStartTimeMs` y a été ajouté depuis la rédaction de ce plan. Poser donc comme règle de lecture que **tout champ de statistiques est optionnel**, et ne jamais faire dépendre l'affichage de sa présence : un fichier exporté aujourd'hui doit rester lisible par un IDE plus récent qui aura gagné trois compteurs, et l'inverse aussi. C'est la même exigence que la nullabilité demandée au lot 5 pour les anciens moteurs, appliquée aux versions successives de l'IDE.

**Injection** : ajouter `setRecording(debuggerId, recording)` à [ProfilerRecordingStore.js](newIDE/app/src/Debugger/ProfilerRecording/ProfilerRecordingStore.js) plutôt que de rejouer des chunks (le rejeu obligerait à re-découper et à gérer `nameIdOffset`). Laisser [ProfilerRecordingFixtures.js](newIDE/app/src/Debugger/ProfilerRecording/ProfilerRecordingFixtures.js) tel quel : il teste justement la voie du rejeu.

**Identité d'un enregistrement importé** : `DebuggerId` est une chaîne, donc réserver un préfixe `imported:<n>`, et stocker les métadonnées dans un état séparé de `debuggerStatus` (sinon `_forgetClosedDebuggers` supprimerait la référence au prochain lancement de preview, précisément quand on veut comparer). Conséquences à traiter : `_canShowSelectedDebugger`, les boutons Record/Pause/Restart désactivés, le message « This game was closed » remplacé par un bandeau « lecture seule », et `DebuggerSelector` qui doit lister les importés.

**Entrées/sorties** : un seul module `Debugger/Export/DebuggerRecordingIO.js`, `fs-extra` plus [Utils/FileSystem.js](newIDE/app/src/Utils/FileSystem.js) (`openFilePicker`, `readJSONFile`) côté desktop, blob plus `<input type="file">` côté web (même technique que `BrowserEventsFunctionsExtensionWriter` et [BlobDownloadUrlHolder.js](newIDE/app/src/Utils/BlobDownloadUrlHolder.js#L47-L60)). Le patron Writer/Opener injecté par Providers est plus propre mais coûte du câblage sur cinq fichiers pour un seul consommateur.

**UI** : « Export the recorded data… » et « Import a recording… » dans `recordMenuTemplate` ([Toolbar.js:178-191](newIDE/app/src/Debugger/Toolbar.js#L178-L191)), qui contient déjà « Clear the recorded data ».

**Comparaison côte à côte** (choix validé) : un enregistrement épinglé comme référence, et chaque vue affiche les deux séries, avec la géométrie qui convient au panneau :
- `ProfilerRecordingAggregation.js` : `compareMeasures(measures, baselineMeasures)` produisant un arbre avec les deux temps, union des clés. Trivial : l'arbre est déjà indexé par nom de section et déjà moyenné par frame.
- `Profiler/MeasuresTable.js` : colonnes appariées (courant, référence, écart en ms et en %), tri par écart, lignes présentes d'un seul côté grisées plutôt que masquées (un groupe renommé ne doit pas disparaître silencieusement).
- `Performance/index.js` : courbes de référence superposées en pointillés, avec un axe X **normalisé en temps écoulé depuis le début de chaque enregistrement** (pas en temps de jeu absolu). C'est le seul morceau non trivial. Les cartes de stats ont déjà un champ `note` pour porter l'écart.
- Resources : table appariée par nom de ressource, en option.
- Écarté : diff de flame chart (les spans ne s'alignent pas d'une frame à l'autre).

Pièges à traiter : durées ou machines différentes (bandeau d'avertissement si la version de l'IDE ou le user agent diffèrent, avertissement sous une centaine de frames), `usedJSHeapBytes` absent hors Chromium (écart affiché vide, jamais zéro), et taille de fichier (prévoir un export « résumé » sans les frames si le complet devient trop gros).

## Lot 5 : rendre le « render » exploitable

`render` est une section monolithique, ouverte dans `_render` et fermée après le flush du renderer : aucune sous-section, ni par calque, ni 2D contre 3D, ni post-traitement. Et les cartes 3D du panneau Performance lisent `legacyOutput.stats`, donc elles affichent un tiret pendant l'enregistrement et toujours un tiret sur un jeu 2D pur, ce qui explique une bonne part de la frustration.

Du moins cher au plus intrusif :

1. **Découper `render`** : passer le profiler au renderer (paramètre optionnel, la voie VR et `RuntimeScene.render()` appellent aussi ce chemin) et ouvrir des sous-sections dans `pixi-renderers/runtimescene-pixi-renderer.ts` : resets d'état, un par calque visible, post-traitement, rendu 2D dans une texture 3D, debug draw. « 60 % du render dans le calque Lighting » est immédiatement actionnable.
2. **Exposer `_layerRenderingMetrics`** : la structure existe déjà (vers l.15-21), est incrémentée à cinq endroits et **n'est lue nulle part** (il reste un `console.log` commenté). Ajouter un getter, plus le nombre d'objets rendus par calque via `children.length` quand le profiler est actif.
3. **Remonter les compteurs par sample** au lieu de seulement à l'arrêt : étendre `ProfilerPerformanceSample` (draw calls 3D, triangles, calques 2D et 3D rendus, textures PIXI gérées), avec les champs **nullables** pour rester compatible avec les anciens moteurs et les fichiers importés. Attention : `threeRenderer.info.autoReset = false` et le reset est fait par frame, donc accumuler dans `record3DRendererInfo` et vider l'accumulateur dans `_takeSample`.
4. **Textures PIXI** : `renderer.texture.managedTextures.length` et `textureGC.count` sont présents dans le bundle et jamais lus. « 300 textures gérées pour 12 sprites » signale un atlas manquant.
5. **Draw calls 2D** (le plus intrusif, en dernier) : PIXI 7 legacy n'a aucun compteur au niveau du `Renderer` (les `drawCalls` du bundle appartiennent à `GraphicsGeometry`) et le `BatchRenderer` est minifié. Voie réaliste : envelopper `gl.drawElements` et compagnie au démarrage de l'enregistrement et restaurer à l'arrêt, en soustrayant les appels de Three.js. C'est la mesure qui répond littéralement au testeur (il avait travaillé sur la réduction des draw calls sans pouvoir la mesurer), mais elle mérite une étape séparée : perte de contexte WebGL, code ayant capturé la méthode.
6. **Rendre les chiffres actionnables** : utiliser le champ `note` des cartes de stats pour dire quoi conclure, et afficher un conseil sous le tableau de mesures quand `render` dépasse la moitié de la frame et qu'une sous-section domine.

## Lot 6 : jouer un son depuis une expression

Demande : `Jouer le son Save.Equipement.Main.NomObjet + "_" + Temp.Nombre + ".mp3"` au lieu d'un sélecteur figé.

Le patron « sélecteur ou expression » existe et est mature (une quinzaine de champs, modèle [SceneNameField.js](newIDE/app/src/EventsSheet/ParameterFields/SceneNameField.js) et `LayerField.js` : état `isExpressionField`, `TextFieldWithButtonLayout`, bascule vers `GenericExpressionField`), mais il n'a jamais été porté sur un champ ressource, parce que les deux familles ont des conventions de stockage **opposées** : un type `string` stocke le littéral avec ses guillemets, un type ressource stocke le nom nu et c'est le générateur qui ajoute les guillemets.

D'où la décision centrale : **distinguer les deux par la présence de guillemets**, exactement comme `SceneNameField` le fait déjà (`"MaScene"` pour une valeur choisie, expression libre sinon). C'est rétrocompatible (les projets existants ont des noms nus, donc inchangés), ça ne crée aucun type de paramètre, et ça vaut potentiellement pour les onze types ressource. Quatre verrous à lever :

1. `Core/GDCore/Events/CodeGeneration/EventsCodeGenerator.cpp` (branche ressource, vers l.957-979) : router vers `ExpressionCodeGenerator` quand la valeur est une expression, au lieu de toujours produire un littéral quoté.
2. [ResourceSelector.js](newIDE/app/src/ResourcesList/ResourceSelector.js) (vers l.167-188) : aujourd'hui une valeur inconnue n'est **pas persistée**, ce qui bloque toute saisie libre. Et `AudioResourceField.js` à réécrire sur le modèle `SceneNameField`, avec les noms de ressources audio proposés en autocomplétion via `onGetAdditionalAutocompletions`.
3. `Core/GDCore/IDE/InstructionValidator.cpp` (vers l.116-121) : un paramètre ressource dont la valeur n'est pas une ressource existante est marqué invalide, ce qui soulignerait en rouge toute expression (répercussions dans `Instruction.js` et `EventsValidationScanner.js`).
4. `Core/GDCore/IDE/Project/ArbitraryResourceWorker.cpp` (vers l.239-300) : décider du sort des expressions, soit les ignorer comme le sont déjà les paramètres et propriétés d'extension, soit en extraire les littéraux sur le modèle de `EventsIdentifiersFinder`.

Conséquences tranchées par l'exploration :
- **Export : aucun risque.** `ExposeWholeProjectResources` copie toutes les ressources déclarées et le runtime charge la table complète, donc un nom calculé sera bien résolu.
- **Préchargement : risque réel.** La ressource n'entrera pas dans les `usedResources` de la scène, d'où une latence à la première lecture et un déchargement possible au changement de scène. Atténuation immédiate et déjà disponible : les actions `PreloadSound` et `PreloadMusic` existent et acceptent déjà n'importe quelle chaîne au runtime. À documenter dans la description de l'action.
- **Risque secondaire à documenter** : le nettoyage des ressources inutilisées et le renommage de ressources considéreront ces sons comme non référencés.
- **Échec silencieux** : un nom inconnu est traité comme un chemin de fichier et n'échoue qu'en console. Prévoir un message d'erreur exploitable quand l'expression produit un nom introuvable.

Précédent à citer en revue : la PR #7942 « Allow events to use resources parameters and properties » a résolu un problème voisin par une indirection typée (`ResourcesContainer`) plutôt que par les expressions, donc ce choix devra être justifié auprès des mainteneurs.

## Vérification

Aucun de ces lots ne se valide par des tests seuls : il faut voir le debugger en marche.

- **Tests unitaires** : créer `EventsExecutionTrackingStore.spec.js` (il n'en existe aucun ; calquer sur `ProfilerRecordingStore.spec.js`) pour l'expiration avec faux timers, l'effacement à la fermeture de l'onglet, le cumul par hiérarchie et le pourcentage. Étendre `ProfilerRecordingAggregation.spec.js` pour `compareMeasures` (sections communes, d'un seul côté, renommées ; les noms `Group A` et `MyExt::Fn` y sont déjà), et ajouter `DebuggerRecordingFile.spec.js` (aller-retour, fichier corrompu, version future).
- **Tests d'intégration C++/JS** : `GDevelop.js/__tests__/GDJSExpressionEvaluationCodeGenerationIntegrationTests.js` pour le mode par instance (et corriger le commentaire l.108 qui documente le comportement actuel), plus `GDJSEventsExecutionTracking*` et `GDJSCodeGenerationIntegrationTests*` comme garde-fou : **aucune sortie du code du jeu ne doit bouger**.
- **Runtime** : `GDJS/tests/tests/profiler.js` pour les sous-sections de render et la remise à zéro des accumulateurs par sample.
- **Stories** : étendre `ProfilerRecordingFixtures.js` (sous-sections de render, nouveaux champs de sample, un second store servant de référence) et ajouter un cas « comparé à une référence » aux stories Profiler, MeasuresTable et Performance.
- **À la main, lot 1** : preview avec l'onglet debugger ouvert, badges visibles ; fermer la fenêtre de preview, la dernière frame reste ; fermer l'onglet debugger, tout disparaît ; bouton Clear, tout disparaît sans fermer la preview ; démarrer un enregistrement, l'arbre de l'Inspector ne se replie pas et se repeuple ; fermer puis réouvrir le projet, rien ne réapparaît.
- **À la main, lot 3** : une scène avec cinq instances portant des valeurs différentes, vérifier « 1 / 5 » puis le dépliage par `#id`, créer et détruire des instances pendant la preview, puis tester avec un millier d'instances (latence du panneau, taille du payload, timeout de 1000 ms).
- **À la main, lots 4 et 5** : enregistrer sur un jeu 3D **et** sur un jeu 2D pur, exporter, fermer le projet, réimporter, vérifier que les trois panneaux montrent la même chose et que Record reste désactivé, épingler en référence, relancer une preview et lire les écarts. Vérifier enfin qu'avec le debugger fermé le profiler est nul et qu'aucun compteur n'est lu.

## Risques transverses

- **Ne jamais toucher** `EventsCodeGenerator::GenerateGetVariable` ni `GenerateObjectFunctionCall` : ils produisent le code du jeu. Tout le lot 3 passe par `LayoutCodeGenerator`.
- Deux lots imposent un rebuild de libGD.js (3 et 6), coûteux, et l'IDE de dev déjà ouvert garde l'ancien wasm : rechargement forcé obligatoire après rebuild.
- Les ptr d'événements peuvent être réutilisés après suppression sans hot reload, ce qui peut allumer le mauvais événement pendant quelques centaines de millisecondes. Limite connue, non aggravée par ce plan.
- Le dump complet n'exclut toujours pas `_instances`, mais il est désormais plafonné à 200 000 objets et tableaux parcourus (`MAX_DUMPED_NODES_COUNT` dans `abstract-debugger-client.ts`), au-delà desquels les valeurs sont remplacées par `[Dump too large: not sent to the debugger]`. Le risque de geler le jeu est donc borné ; celui qui reste est la **troncature silencieuse**, un arbre incomplet sans que l'utilisateur sache pourquoi. Tout ajout de champ au dump rapproche de ce plafond, et le lot 3 doit décider de ce qui est montré quand il est atteint.
- Le canal debugger est sollicité toutes les 300 ms pour l'évaluation d'expressions, avec un timeout de 1000 ms : tout élargissement de payload doit rester plafonné et optionnel.
- Changer la clé des instances dans l'arbre de l'Inspector casse les chemins `inspector.dump`, `inspector.call`, `set` et `call` si le résolveur runtime n'est pas livré dans le même commit.
