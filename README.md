# Campus Fire

Campus Fire est une borne (un écran) qui doit permettre de rassembler et de partager, plus que de donner des informations déjà accessibles en ligne. Il s’agit donc d’un objet physique et non d’une plateforme en ligne, l’objectif étant d’enrichir les interactions entres les personnes présentes sur le campus. L’idée est de permettre aux utilisateurs de publier du contenu (sous diverses formes) qui soit affiché pendant un certain temps afin que les autres puisse interagir avec. Une description du concept est celle d’un mur de graffitis numérique, proposant bien sûr plus de fonctionnalités pour rendre l’expérience intéressante pour les utilisateurs. L'application web permet de connecter la borne, les smartphones des utilisateurs et le serveur ensemble.


### Prérequis

[Node.js](https://nodejs.org/fr/) doit être installé.

### Installation

L'installation des packages se fait avec `npm i`.

### Lancement

L'application a été générée avec [Create React App](https://github.com/facebook/create-react-app) et donc plusieurs scripts sont déjà disponibles.\
Nous utilisons également [Nodemon](https://nodemon.io/) en développement.

* pour lancer le front : `npm run start`
* pour lancer le back en développement : `npm run dev`

Pour accéder à l'application en développement, ouvrir `http://localhost:3000/d/fire`.

### Déploiement

Avant de lancer en production, il faut build le front avec : `npm run build`.\
Puis pour lancer le back en production : `npm run prod`.

### BDD
?

### Tests
?

### Raspi
?

### Docker
?

### Architecture de l'application
Une connection websocket permet la communication entre la borne et un utilisateur en particulier. Le fichier `socket.js` fait le lien entre les composants React `Mobile` et `Display`.
...
