import Component from "../utils/Component";
import ArticleService from "../services/ArticleService";

export default class ArticleFilter extends Component {
    private articleService: ArticleService;
    private readonly filterContainer: HTMLElement;

    constructor(private parentElement: HTMLElement) {
        super();
        this.articleService = ArticleService.getInstance();
        this.filterContainer = this.createFilterContainer();
        this.initializeFilters();
    }

    private createFilterContainer(): HTMLElement {
        const container = this.createMarkup('div', this.parentElement, '', {
            class: 'btn-group d-flex flex-wrap gap-2 mb-4',
            role: 'group',
            'aria-label': 'Filtres par catégorie'
        });
        return container;
    }

    private initializeFilters(): void {
        // On s'abonne aux changements des articles pour recréer les filtres si nécessaire
        this.articleService.articles$.subscribe(() => {
            this.createCategoryButtons();
        });
    }

    private createCategoryButtons(): void {
        // On vide d'abord le conteneur
        this.filterContainer.innerHTML = '';

        // On récupère les catégories uniques depuis le service
        const categories = this.articleService.getCategories();

        // On crée le bouton "Tout afficher" en premier
        this.createFilterButton('Tout afficher', 'all');

        // On crée ensuite un bouton pour chaque catégorie
        categories.forEach(category => {
            if (category && category.trim() !== '') {
                this.createFilterButton(category, category.toLowerCase());
            }
        });
    }

    private createFilterButton(text: string, categoryValue: string): void {
        const button = this.createMarkup('button', this.filterContainer, text, {
            class: `btn ${this.articleService.getCurrentCategory() === categoryValue
                ? 'btn-primary'
                : 'btn-outline-primary'}`,
            type: 'button',
            'data-category': categoryValue
        });

        button.addEventListener('click', (e) => {
            const target = e.target as HTMLButtonElement;
            const category = target.getAttribute('data-category') || 'all';

            // On met à jour les classes des boutons
            this.updateButtonStates(target);

            // On applique le filtre
            this.articleService.filterByCategory(category);
        });
    }

    private updateButtonStates(activeButton: HTMLButtonElement): void {
        // On réinitialise tous les boutons
        const buttons = this.filterContainer.querySelectorAll('button');
        buttons.forEach(button => {
            button.classList.remove('btn-primary');
            button.classList.add('btn-outline-primary');
        });

        // On active le bouton cliqué
        activeButton.classList.remove('btn-outline-primary');
        activeButton.classList.add('btn-primary');
    }
}