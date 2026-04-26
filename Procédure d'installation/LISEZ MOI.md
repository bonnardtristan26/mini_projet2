### &#x09;	----------------------

### &#x09;	 A FAIRE DANS L'ORDRE

### &#x09;	----------------------



&#x20;**1.** Installez GitHub Desktop et liez votre compte GitHub, puis clonez votre repository dans vos **Documents**.

&#x20;   Ouvrez **l'Explorateur de Fichiers** et allez dans le document GitHub/mini\_projet2/Serveur.

&#x20;   Puis dans la barre de recherche contenant le chemin du fichier en haut de **l'Explorateur de Fichiers**,

&#x20;   effacez le chemin puis tapez **cmd**, ce qui va ouvrir une **Invite de commande** à l'emplacement du fichier.

&#x20;   On l'utilisera un peu plus tard.



&#x20;**2.** Installez **VS Code** puis installez les extensions suivantes sur VS Code :

&#x09;JavaScript

&#x09;Babel Javascript

&#x09;GitHub Repositories

&#x09;GitHub pull requests

&#x09;GitHub Actions

&#x09;Live Preview

&#x09;HTML/CSS Support

&#x20;

&#x20;   Puis liez votre compte GitHub aux onglets **Source Control, Remote Explorer et GitHub.**



&#x20;**3.** Pour WampServer, exécutez dans le fichier **FICHIERS EXECUTABLES** :

&#x09;**wampserver3\_phpsysinfo3.4.5.exe**

&#x20;   Ne faites pas l'installation maintenant, il va falloir installer les distributions de **Microsoft Visual Studio**.

&#x20;   Pour ceci, ouvrez le lien suivant :



&#x20;   **https://wampserver.aviatechno.net/**



&#x20;   Puis descendez tous en bas de la page jusqu'à trouver **All VC Redistributable Packages (x86\_x64) (32 \& 64bits) MD5**

&#x20;   Si votre distribution Windows est en 32 bits, prenez celui juste au-dessus.

&#x20;   Dézippez le dossier puis installez un à un les distributions **Microsoft VS.** Certaines distributions ne s'installeront pas

&#x20;   mais ce n'est pas grave.

&#x20;   Ensuite, installez le logiciel suivant qui vous permettra de savoir si tout à bien été installé :



&#x20;   **https://wampserver.aviatechno.net/files/tools/check\_vcredist.exe**



&#x20;   Puis vous pourrez continuer l'installation de Wampserver64.



&#x20;**4.** Après l'installation de Wampserver64 faite, vous devrez importer la base de donnée.

&#x20;   Dans la **Barre des tâches** de Windows, ouvrez le menu déroulant **Afficher les icônes cachées,** puis vérifiez si l'icône de WampServer

&#x20;   est bien verte, sinon relancez WampServer.

&#x20;   Ensuite, faites **clic gauche** sur cette icône, puis appuyez sur **Localhost.**



&#x20;   Dans **Vos Alias**, cliquez sur **PhpMyAdmin (version de phpMyAdmin),** entrez le nom d'utilisateur **root** et le mot de passe **root**

&#x20;   puis changez le chois du serveur de MySQL à **MariaDB.**

&#x20;   Ensuite dans votre repository **GitHub,** récupérez le fichier **bdd.sql** dans le fichier **Serveur/BDD/**, puis allez dans

&#x20;   l'onglet **Bases de données,** donnez un nom à votre base de donnée, puis cliquez sur **Créer.**



&#x20;   Cliquez sur le nom de votre nouvelle base de donnée à gauche, puis allez dans l'onglet **Importer,** dans la rubrique

&#x20;   **Fichier à importer,** cliquez sur **Choisir un fichier** et choisissez le fichier **bdd.sql**, descendez tous en bas

&#x20;   de la page puis cliquez sur **Importer.**



&#x20;   Votre base de donnée est maintenant importée.



&#x20;**5.** Ouvrez le fichier **node-v24.14.1-x64** puis exécutez **node-v24.14.1-x64.msi** et appuyez sur **Next** jusqu'à l'installation.

&#x20;   Il n'y a pas d'emplacement à changer ou quoi que ce soit.

&#x09;

&#x20;**6.** Il vous faudra aussi vous créer un compte **Brevo** afin de changer la **clé API** dans le code aux **lignes 70** et **72** du fichier **serveur.js**

&#x20;   Voici le lien pour le compte **Brevo** :

&#x20;   **https://app.brevo.com/settings/keys/smtp**

&#x20;   Vous devrez vous créer un compte avant d'accéder au site. Une fois que c'est fait, vous devrez vous connecter, puis accéder

&#x20;   au menu **Clés API et MCP**, puis sur **Générer une nouvelle clé API**, nommez la et c'est bon !



##### &#x09;**ATTENTION**

&#x09;**A chaque fois que vous changer de machine pour lancer votre serveur, vous devez créer une nouvelle clé API**

&#x09;

&#x20;   Si c'est la première fois que vous lancez le serveur sur votre machine, tapez les commandes suivantes :

&#x09;**npm init -y**

&#x09;**npm install express ws**

&#x20;   Puis tapez la commande suivante dans le **cmd** :

&#x09;**node serveur.js**



&#x20;   Pour les fois suivantes, il vous suffit juste de taper la dernière commande pour lancer le serveur.



&#x20;   Normalement, une demande d'autorisation devrait s'afficher, et une fois que vous aurez

&#x20;   cliqué sur **Autoriser**, le cmd affichera cela :

&#x09;**Connecté à MariaDB**

&#x09;**Serveur lancé sur http://\[IP de votre machine]:3000**

&#x20;

&#x20;   Afin d'accéder ua menu principal, vous pouvez copier le lien suivant :

&#x09;**http://localhost:3000/menu\_principal.html**

&#x20;



### &#x09;	------------------------

### &#x20;		 VOUS POUVEZ MAINTENANT

### &#x09;	  UTILISER LE SERVEUR

### &#x09;	------------------------

