<?php
/*
Fichier de configuration pour l'affichage et l'envoi de données par internet pour Game Develop.
Remplissez ce fichier pour personnaliser l'enregistrement et l'affichage des données du joueur.

Crée par 4ian ( Compil Games )
Ce fichier est dans le domaine public. Vous pouvez l'éditer et l'utiliser librement.
N'hésitez pas à faire part de vos améliorations sur le site de Game Develop : www.compilgames.net
*/

//--------------------------------------------------
//Personnalisations indispensables
//--------------------------------------------------

//Mot de passe de sécurité.
//Afin de garantir la sécurité et la fiablité des données envoyés par votre jeu, choisissez un mot de passe,
//et entrez le ici. Le mot de passe doit être le même entre ce fichier et votre jeu.
$mdp = "remplacez ceci par votre mot de passe";

//Titre des colonnes.
// Pour chaque données envoyées, vous pouvez personnaliser le titre affiché dans le tableau
// Laissez vide pour ne rien afficher.
$titre1 = "Score";
$titre2 = "Niveau";
$titre3 = "";
$titre4 = "";
$titre5 = "";
$titre6 = "";

//Modifiez l'ordre d'affichage en choississant la donnée à trier et
//choississez si le tri doit être croissant ( "C" ) ou décroissant ( "D" ) 
$datatri = 1;
$typetri = "D";

//--------------------------------------------------
//Autres personnalisations
//--------------------------------------------------

//Message d'erreur lors de la vérification des données
$erreurCheck = "<b>Erreur lors de la vérification des données.</b><br /><br />Les données transmises semblent être invalides.<br />-Vérifiez que vous possédez la dernière version du jeu.<br />-Réessayez de renvoyer les données depuis le jeu.<br />-Contactez l'auteur du jeu si le problème persiste.<br />";

//Message pour insérer le pseudonyme
$pseudoMsg = "Entrez votre nom ou pseudonyme :";

//Message de remerciement
$enregistreMsg = "Vos données ont été correctement enregistrées !<br/><br/><a href=\"view.php\" >Cliquez ici pour accéder au tableau complet !</a>";

//Message données déjà existante
$ExistMsg = "<b>Impossible d'ajouter les données.</b><br/><br/>Les données existent déjà dans la base de données.";

//Titre du tableau récapitulatif
$TitreTableau = "Tableau des scores :";

?>