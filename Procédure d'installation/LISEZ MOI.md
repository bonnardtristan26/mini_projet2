### &#x09;	----------------------

### &#x09;	 A FAIRE DANS L'ORDRE

### &#x09;	----------------------



&#x20;**1.** Installez GitHub Desktop et liez votre compte GitHub, puis clonez votre repository dans vos **Documents**.

&#x20;   Ouvrez **l'Explorateur de Fichiers** et allez dans le document GitHub/mini\_projet2/Serveur.

&#x20;   Puis dans la barre de recherche contenant le chemin du fichier en haut de **l'Explorateur de Fichiers**,

&#x20;   effacez le chemin puis tapez **cmd**, ce qui va ouvrir une **Invite de commande** à l'emplacement du fichier.

&#x20;   On l'utilisera un peu plus tard.



&#x20;**2.** Installez **VS Code** puis installez les extensions suivantes sur VS Code :

&#x09;**JavaScript**

&#x09;**Babel Javascript**

&#x09;**GitHub Repositories**

&#x09;**GitHub pull requests**

&#x09;**GitHub Actions**

&#x09;**Live Preview**

&#x09;**HTML/CSS Support**

&#x20;

&#x20;   Puis liez votre compte GitHub aux onglets **Source Control, Remote Explorer et GitHub.**



&#x20;**3.** Pour WampServer, exécutez dans le fichier **FICHIERS EXECUTABLES** :

&#x09;**vcredist\_arm.exe**

&#x09;**vcredist\_x64.exe**

&#x09;**vcredist\_x84.exe**

&#x09;**wampserver3\_phpsysinfo3.4.5.exe**



&#x20;   Puis vous pourrez lancer Wampserver64.



&#x20;**4.** Ouvrez le fichier **node-v24.14.1-x64** puis exécutez **node-v24.14.1-x64.msi** et appuyez sur **Next** jusqu'à l'installation.

&#x20;   Il n'y a pas d'emplacement à changer ou quoi que ce soit.

&#x09;

&#x20;**5.** Une fois tout ça installé, changez l'IP contenue à la **ligne 122** du fichier **partieClient.js**

&#x20;   et remplacez-la par l'IPV4 de votre machine (trouvable en faisant **ipconfig** dans le **cmd**).



&#x20;   **ATTENTION : NE MODIFIEZ PAS LE "ws://"**

&#x20;   **ET LE ":3000" (sauf pour celle-ci si vous voulez changer le port sur lequel le serveur est host)**

&#x20;   **CHANGEZ UNIQUEMENT L'IP.**



&#x20;   Puis tapez la commande suivante dans le **cmd** :

&#x09;**node serveur.js**



&#x20;   Normalement, une demande d'autorisation devrait s'afficher, et une fois que vous aurez

&#x20;   cliqué sur **Autoriser**, le cmd affichera cela :

&#x09;**Connecté à MariaDB**

&#x09;**Serveur lancé sur http://\[IP de votre machine]:3000**

&#x20;

&#x20;



### &#x09;	------------------------

### &#x20;		 VOUS POUVEZ MAINTENANT

### &#x09;	  UTILISER LE SERVEUR

### &#x09;	------------------------

