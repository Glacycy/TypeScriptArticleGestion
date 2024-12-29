import { ArticleInterface } from '../interfaces/ArticleInterface';
import ArticleService from '../services/ArticleService';
import Article from './Article';
import ArticleFilter from './ArticleFilter';
import Component from "../utils/Component";

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
    private renderArticles(articles: ArticleInterface[]): void {
        // Vider le conteneur
        this.articleContainer.innerHTML = '';

        if (articles.length === 0) {
            // Message si aucun article trouvé
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
            const col = this.createMarkup('div', this.articleContainer, '', {
                class: 'col'
            });
            // Création de l'article dans sa colonne
            new Article(articleData, col);
        });
    }

    /**
     * Méthode publique pour forcer une mise à jour de la liste
     */
    public update(): void {
        this.articleService.loadArticles();
    }
}