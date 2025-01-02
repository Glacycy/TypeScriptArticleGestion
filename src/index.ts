// index.ts
import ArticleForm from './components/ArticleForm';
import ArticleList from './components/ArticleList';
import Cart from './components/Cart';
import ErrorService from './services/ErrorService';

// Import de Bootstrap pour le style global
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const parentElt = document.getElementById("root");

/**
 * Crée une alerte d'erreur stylisée avec Bootstrap
 * @param message Le message d'erreur à afficher
 * @returns L'élément HTML de l'alerte
 */
function createErrorAlert(message: string): HTMLElement {
    // Création du conteneur de l'alerte
    const alert = this.createMarkup('div', parentElt, '', {
        class: 'alert alert-danger alert-dismissible fade show mb-3',
        role: 'alert'
    });

    // Création du texte du message
    const messageText = document.createElement('div');
    messageText.textContent = message;

    // Création du bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.classList.add('btn-close');
    closeButton.setAttribute('data-bs-dismiss', 'alert');
    closeButton.setAttribute('aria-label', 'Close');

    // Assemblage de l'alerte
    alert.appendChild(messageText);
    alert.appendChild(closeButton);

    // Configuration de l'auto-suppression après 5 secondes
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150); // Attendre la fin de l'animation
    }, 5000);

    return alert;
}

/**
 * Crée la structure de base de l'application
 * @returns Les conteneurs pour les différentes parties de l'application
 */
function createAppStructure() {
    const rootElement = document.getElementById('root');
    if (!rootElement) return;

    // Ajout d'une classe container de Bootstrap au root
    rootElement.classList.add('container', 'py-4');

    // Création du header
    const header = document.createElement('header');
    header.classList.add('mb-5', 'text-center');

    const title = document.createElement('h1');
    title.textContent = 'E-Sport - Articles de Sport';
    title.classList.add('display-4', 'mb-3');

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Gérez votre catalogue d\'articles sportifs';
    subtitle.classList.add('lead', 'text-muted');

    header.appendChild(title);
    header.appendChild(subtitle);
    rootElement.appendChild(header);

    // Création du conteneur pour les erreurs
    const errorContainer = document.createElement('div');
    errorContainer.id = 'error-container';
    errorContainer.classList.add('position-fixed', 'top-0', 'end-0', 'p-3');
    errorContainer.style.zIndex = '1050';
    rootElement.appendChild(errorContainer);

    // Création d'une grille pour le formulaire, la liste et le panier
    const mainGrid = document.createElement('div');
    mainGrid.classList.add('row', 'g-4');

    // Colonne pour le formulaire et le panier (4 colonnes)
    const sideColumn = document.createElement('div');
    sideColumn.classList.add('col-12', 'col-lg-4');

    // Conteneur pour le formulaire
    const formContainer = document.createElement('div');
    formContainer.classList.add('mb-4');

    // Conteneur pour le panier
    const cartContainer = document.createElement('div');
    cartContainer.classList.add('sticky-top', 'pt-3'); // Le panier reste visible lors du défilement

    sideColumn.appendChild(formContainer);
    sideColumn.appendChild(cartContainer);

    // Colonne pour la liste d'articles (8 colonnes)
    const listColumn = document.createElement('div');
    listColumn.classList.add('col-12', 'col-lg-8');

    mainGrid.appendChild(sideColumn);
    mainGrid.appendChild(listColumn);
    rootElement.appendChild(mainGrid);

    return {
        formContainer,
        listContainer: listColumn,
        cartContainer,
        errorContainer
    };
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    // Création de la structure de l'application
    const containers = createAppStructure();
    if (!containers) return;

    // Initialisation des composants
    ArticleForm.getInstance(containers.formContainer);
    ArticleList.getInstance(containers.listContainer);
    new Cart(containers.cartContainer); // Initialisation du panier

    // Configuration de l'affichage des erreurs
    const errorService = ErrorService.getInstance();
    errorService.getErrorSubject().subscribe(error => {
        const errorAlert = createErrorAlert(error);
        containers.errorContainer.appendChild(errorAlert);
    });
});