import {BehaviorSubject} from 'rxjs';
import {ArticleInterface} from '../interfaces/ArticleInterface';
import ErrorService from './ErrorService';

export default class ArticleService {
    private static instance: ArticleService;
    private static endpoint = 'http://localhost:3000/articles';

    // Gestion de l'état des articles
    private articlesSubject = new BehaviorSubject<ArticleInterface[]>([]);
    public articles$ = this.articlesSubject.asObservable();
    public articlesSubject$ = this.articlesSubject;

    // Liste complète des articles non filtrés
    private allArticles: ArticleInterface[] = [];
    // Catégorie actuellement sélectionnée
    private selectedCategory: string = 'all';

    private constructor(private errorService: ErrorService) {}

    /**
     * Obtient l'instance unique du service (Singleton)
     */
    static getInstance(): ArticleService {
        if (!ArticleService.instance) {
            ArticleService.instance = new ArticleService(ErrorService.getInstance());
        }
        return ArticleService.instance;
    }

    /**
     * Charge les articles depuis l'API
     */
    async loadArticles(): Promise<void> {
        try {
            const response = await fetch(ArticleService.endpoint);
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des articles');
            }
            // Stocke la liste complète
            this.allArticles = await response.json();
            // Applique le filtre actuel
            this.updateDisplayedArticles();
        } catch (error) {
            this.errorService.emitError('Erreur lors du chargement des articles');
        }
    }

    /**
     * Ajoute un nouvel article
     */
    async addArticle(article: Omit<ArticleInterface, 'id'>): Promise<void> {
        try {
            const response = await fetch(ArticleService.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...article,
                    image: "https://example.com/default.jpg"
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'ajout de l\'article');
            }

            const newArticle = await response.json();
            this.allArticles = [...this.allArticles, newArticle];
            this.updateDisplayedArticles();
        } catch (error) {
            this.errorService.emitError('Erreur lors de l\'ajout de l\'article');
        }
    }

    /**
     * Met à jour un article existant
     */
    async updateArticle(article: ArticleInterface): Promise<void> {
        try {
            const response = await fetch(`${ArticleService.endpoint}/${article.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(article)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour de l\'article');
            }

            const updatedArticle = await response.json();
            this.allArticles = this.allArticles.map(a =>
                a.id === updatedArticle.id ? updatedArticle : a
            );
            this.updateDisplayedArticles();
        } catch (error) {
            this.errorService.emitError('Erreur lors de la mise à jour de l\'article');
        }
    }

    /**
     * Supprime un article
     */
    async deleteArticle(id: string): Promise<void> {
        try {
            const response = await fetch(`${ArticleService.endpoint}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de l\'article');
            }

            const deleteArticle = await response.json();
            this.allArticles = this.allArticles.filter(a =>
                a.id !== deleteArticle.id);
            this.updateDisplayedArticles();
        } catch (error) {
            this.errorService.emitError('Erreur lors de la suppression de l\'article');
        }
    }

    /**
     * Filtre les articles par catégorie
     */
    filterByCategory(category: string): void {
        this.selectedCategory = category;
        this.updateDisplayedArticles();
    }

    /**
     * Met à jour la liste des articles affichés selon le filtre actuel
     */
    private updateDisplayedArticles(): void {
        let articlesToDisplay = this.allArticles;

        // Applique le filtre si une catégorie spécifique est sélectionnée
        if (this.selectedCategory !== 'all') {
            articlesToDisplay = this.allArticles.filter(
                article => article.category.toLowerCase() === this.selectedCategory.toLowerCase()
            );
        }

        // Met à jour l'observable
        this.articlesSubject.next(articlesToDisplay);
    }

    /**
     * Obtient la catégorie actuellement sélectionnée
     */
    getCurrentCategory(): string {
        return this.selectedCategory;
    }

    /**
     * Réinitialise le filtre à "all"
     */
    resetFilter(): void {
        this.selectedCategory = 'all';
        this.updateDisplayedArticles();
    }

    /**
     * Obtient la liste de toutes les catégories uniques
     */
    getCategories(): string[] {
        const categories = new Set(this.allArticles.map(article => article.category));
        return Array.from(categories);
    }
}