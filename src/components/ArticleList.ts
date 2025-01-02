import { ArticleInterface } from '../interfaces/ArticleInterface';
import ArticleService from '../services/ArticleService';
import Article from './Article';
import ArticleFilter from './ArticleFilter';
import Component from "../utils/Component";
import ArticleForm from "./ArticleForm";
import CartService from "../services/CartService";
import EditArticle from "./EditArticle";

/**
 * Classe responsable de l'affichage et de la gestion de la liste des articles
 * Utilise le pattern Singleton pour garantir une instance unique
 */
export default class ArticleList extends Component {
    private static instance: ArticleList;
    private articleService: ArticleService;
    private articleContainer: HTMLElement;
    private mainContainer: HTMLElement;
    private articleFilter: ArticleFilter;

    /**
     * Constructeur privé pour le pattern Singleton
     * Initialise les conteneurs et services nécessaires
     */
    private constructor(private parentElement: HTMLElement) {
        super();
        this.articleService = ArticleService.getInstance();
        this.createStructure();
        this.initializeServices();
    }

    /**
     * Méthode pour obtenir l'instance unique de ArticleList
     */
    public static getInstance(parentElement: HTMLElement): ArticleList {
        if (!ArticleList.instance) {
            ArticleList.instance = new ArticleList(parentElement);
        }
        return ArticleList.instance;
    }

    /**
     * Crée la structure de base de l'interface avec Bootstrap
     */
    private createStructure(): void {
        // Conteneur principal
        this.mainContainer = this.createMarkup('div', this.parentElement, '', {
            class: 'container py-4'
        });

        // En-tête avec titre
        const header = this.createMarkup('div', this.mainContainer, '', {
            class: 'row mb-4'
        });
        const headerCol = this.createMarkup('div', header, '', {
            class: 'col'
        });
        this.createMarkup('h1', headerCol, 'Articles de Sport', {
            class: 'display-4 mb-3'
        });

        // Conteneur pour le filtre
        const filterRow = this.createMarkup('div', this.mainContainer, '', {
            class: 'row mb-4'
        });
        const filterCol = this.createMarkup('div', filterRow, '', {
            class: 'col'
        });

        // Initialisation du filtre
        this.articleFilter = new ArticleFilter(filterCol);

        // Conteneur pour la grille d'articles
        const articlesRow = this.createMarkup('div', this.mainContainer, '', {
            class: 'row'
        });
        this.articleContainer = this.createMarkup('div', articlesRow, '', {
            class: 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4'
        });

        // Écouteur d'événements pour la suppression d'articles
        this.mainContainer.addEventListener('deleteArticle', (event: Event) => {
            const customEvent = event as CustomEvent;
            this.handleArticleDelete(customEvent.detail.id);
        });
    }

    /**
     * Initialise les services et les abonnements
     */
    private initializeServices(): void {
        // Chargement initial des articles
        this.articleService.loadArticles();

        // Abonnement aux changements des articles
        this.articleService.articles$.subscribe(articles => {
            this.renderArticles(articles);
        });
    }

    /**
     * Gère la suppression d'un article
     */
    private async handleArticleDelete(articleId: string): Promise<void> {
        try {
            await this.articleService.deleteArticle(articleId);
            // Pas besoin de recharger manuellement car l'observable mettra à jour l'affichage
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    }

    /**
     * Affiche la liste des articles
     */
    // Dans ArticleList.ts
    private renderArticles(articles: ArticleInterface[]): void {
        // Vider le conteneur
        this.articleContainer.innerHTML = '';

        if (articles.length === 0) {
            const emptyCol = this.createMarkup('div', this.articleContainer, '', {
                class: 'col-12 text-center py-5'
            });
            this.createMarkup('p', emptyCol, 'Aucun article trouvé dans cette catégorie', {
                class: 'text-muted fs-4'
            });
            return;
        }

        // Création des colonnes pour chaque article
        articles.forEach(articleData => {
            // Colonne pour la carte
            const col = this.createMarkup('div', this.articleContainer, '', {
                class: 'col-md-4 mb-4'
            });

            // Création de la carte
            const card = this.createMarkup('div', col, '', {
                class: 'card h-100'
            });

            // En-tête de la carte avec l'image
            this.createMarkup('img', card, '', {
                src: articleData.image,
                class: 'card-img-top',
                alt: articleData.name,
                style: 'height: 200px; object-fit: cover;'
            });

            // Corps de la carte
            const cardBody = this.createMarkup('div', card, '', {
                class: 'card-body d-flex flex-column'
            });

            // Titre et informations
            this.createMarkup('h5', cardBody, articleData.name, {
                class: 'card-title'
            });
            this.createMarkup('h6', cardBody, articleData.brand, {
                class: 'card-subtitle mb-2 text-muted'
            });
            this.createMarkup('p', cardBody, `${articleData.price.toFixed(2)} €`, {
                class: 'card-text fs-4 text-primary fw-bold'
            });
            this.createMarkup('p', cardBody, `Stock: ${articleData.stock}`, {
                class: 'card-text'
            });

            // Conteneur pour les boutons
            const buttonGroup = this.createMarkup('div', cardBody, '', {
                class: 'mt-auto'
            });

            // Bouton d'ajout au panier
            const addToCartBtn = this.createMarkup('button', buttonGroup, 'Ajouter au panier', {
                class: `btn btn-primary w-100 mb-2 ${articleData.stock === 0 ? 'disabled' : ''}`,
                type: 'button'
            });

            // Bouton de modification
            const editBtn = this.createMarkup('button', buttonGroup, 'Modifier', {
                class: 'btn btn-warning w-100 mb-2',
                type: 'button'
            });

            // Bouton de suppression
            const deleteBtn = this.createMarkup('button', buttonGroup, 'Supprimer', {
                class: 'btn btn-danger w-100',
                type: 'button'
            });

            // Gestionnaires d'événements
            this.setupCardEventListeners(addToCartBtn, editBtn, deleteBtn, articleData);
        });
    }

    /**
     * Configure les écouteurs d'événements pour les boutons d'une carte
     * @param addToCartBtn Bouton d'ajout au panier
     * @param editBtn Bouton de modification
     * @param deleteBtn Bouton de suppression
     * @param articleData Données de l'article
     */
    private setupCardEventListeners(
        addToCartBtn: HTMLElement,
        editBtn: HTMLElement,
        deleteBtn: HTMLElement,
        articleData: ArticleInterface
    ): void {
        // Gestion de l'ajout au panier
        if (articleData.stock > 0) {
            addToCartBtn.addEventListener('click', () => {
                const cartService = CartService.getInstance();
                cartService.addToCart(articleData, 1);
            });
        }

        // Gestion de la modification avec le modal
        editBtn.addEventListener('click', () => {
            const editModal = EditArticle.getInstance();
            editModal.fillFormForEdit(articleData);
        });

        // Gestion de la suppression
        deleteBtn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
                this.articleService.deleteArticle(articleData.id);
            }
        });
    }

    /**
     * Méthode publique pour forcer une mise à jour de la liste
     */
    public update(): void {
        this.articleService.loadArticles();
    }

    // Ajout de l'écouteur d'événements pour la modification
    private initializeEventListeners(): void {
        this.mainContainer.addEventListener('editArticle', (event: Event) => {
            const customEvent = event as CustomEvent;
            const articleToEdit = customEvent.detail.article;
            // Appel de la méthode de modification du formulaire
            ArticleForm.getInstance(this.parentElement).fillFormForEdit(articleToEdit);
        });
    }
}