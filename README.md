# Campus Fire

Campus Fire est une borne (un écran) qui doit permettre de rassembler et de partager, plus que de donner des informations déjà accessibles en ligne. Il s’agit donc d’un objet physique et non d’une plateforme en ligne, l’objectif étant d’enrichir les interactions entres les personnes présentes sur le campus. L’idée est de permettre aux utilisateurs de publier du contenu (sous diverses formes) qui soit affiché pendant un certain temps afin que les autres puisse interagir avec. Une description du concept est celle d’un mur de graffitis numérique, proposant bien sûr plus de fonctionnalités pour rendre l’expérience intéressante pour les utilisateurs. L'application web permet de connecter la borne, les smartphones des utilisateurs et le serveur ensemble.


### Prérequis

 * [Node.js](https://nodejs.org/fr/) doit être installé.
 * Il faut également avoir une base de données MongoDB (MongoDB Cloud peut être utilisé).

### Installation

L'installation des packages se fait avec `npm install`.

Il faut ensuite créer une copie du fichier `.env.dist` et l'appeler `.env`, et y mettre la configuration. (Notamment MongoDB)

Pour finir il faut initialiser la base de données avec `node init.db.js`. Si aucune erreur ne se présente, la BDD est bien initalisée.

### Lancer le front et le back

L'application a été générée avec [Create React App](https://github.com/facebook/create-react-app) et donc plusieurs scripts sont déjà disponibles.\
Nous utilisons également [Nodemon](https://nodemon.io/) en développement.
Les étapes pour lancer toute l'appli depuis le début sont dans la partie suivante.

* pour lancer le front : `npm run start`
* pour lancer le back en développement : `npm run dev` (avec nodemon : le serveur se restart dès qu'une modification est enregistrée) ou `node server.js` (sans nodemon).

Pour accéder à l'application en développement, ouvrir `http://localhost:3000/d/fire`.

### Lancement de toute l'appli (back, front web et mobile)

Plus précisément voyons comment lancer l'application, c'est-à-dire faire tourner le back, fait tourner le front à la fois de l'appli web (display sur l'écran) et l'appli mobile utilisée pour gérer les contrôles.

Les étapes sont les suivantes:
- S'assurer que son adresse IP est bien whitelisté sur la DB (normalement c'est le cas car toutes les IP sont whitelistées pour le moment).
- S'assurer que le lien dans le .env vers la DB mongo est le bon.
- S'assurer qu'on a bien installé tous les package comme indiqué dans l'[installation](#Installation).
- S'assurer que son ordi et son téléphone sont sur le même réseau wifi. Auquel cas ils sont reliés sur le même localhost, ce qui prend son sens dans la dernière étape de ce tuto.
- Lancer le backend en se plaçant à la racine du projet. Run la commande `npm run dev` dans un terminal, ce qui va lancer le back en mode developpement avec [nodemon](#Lancer le front et le back).
- Dans un autre terminal, lancez le front avec la commande `npm run start`. De cette façon le front de l'appli web qui va sur l'écran et le front de l'appli mobile sont accessibles sur le réseau local.
- Sur votre navigateur, allez à l'url suivant : `http://localhost:3000/d/fire`. Il correspond à l'appli web.
- Sur l'appli web vous voyez un QR code en bas à droite de votre écran. Scannez le avec votre téléphone. Vous serez redirigés sur votre navigateur sur un url du type `http://localhost:3000/m/UbSNNXQE` sachant que `UbSNNXQE` est la clé qui vous identifie à ce moment là. Elle vous est attribuée lorsque vous scannez le QR code. Celui-ci change lorsqu'un nouvel appareil se connecte.

Maintenant vous pouvez manipuler le joystick en bougeant sur votre mobile.

### Déploiement

Avant de lancer en production, il faut build le front avec : `npm run build`.\
Puis pour lancer le back en production : `npm run prod`.

### BDD

L'application utilise MongoDB avec l'ORM Mongoose. Les modèles de données sont disponibles dans le dossier models/.

### Raspi
Voir le tutoriel pour utiliser une [Raspberry PI en mode Kiosk](http://blog.philippegarry.com/2018/08/19/faire-de-son-pi-une-borne-raspberry-pi-kiosk-mode-stretch-version/). 

### Docker
Le fichier `docker-compose.yml` permet de lancer l'application sous forme dockerisée. 
Pour celà, cloner le dossier et lancer la commande `docker-compose up`. Attention, la configuration des réseaux correspond à l'architecture du GInfo. A modifier si nécéssaire. 

### Architecture de l'application
Une connection websocket permet la communication entre la borne et un utilisateur en particulier. Le fichier `socket.js` fait le lien entre les composants React `Mobile` et `Display`.
...
