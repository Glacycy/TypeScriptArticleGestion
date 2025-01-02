import { ArticleInterface } from '../interfaces/ArticleInterface';
import ArticleService from '../services/ArticleService';
import ErrorService from '../services/ErrorService';
import Component from '../utils/Component';

export default class ArticleForm extends Component {
    // Instance unique pour le Singleton
    private static instance: ArticleForm;
    // Propriétés de la classe
    private form: HTMLFormElement;
    private isEditMode: boolean = false;
    private currentArticleId: string | null = null;


    // Services nécessaires
    private articleService: ArticleService = ArticleService.getInstance();
    private errorService: ErrorService = ErrorService.getInstance();

    /**
     * Constructeur privé pour le pattern Singleton
     */
    private constructor(private parentElement: HTMLElement) {
        super();
        this.createForm();
        this.setupEventListeners();
    }

    /**
     * Méthode pour obtenir l'instance unique de ArticleList
     */
    public static getInstance(parentElement: HTMLElement): ArticleForm {
        if (!ArticleForm.instance) {
            ArticleForm.instance = new ArticleForm(parentElement);
        }
        return ArticleForm.instance;
    }

    /**
     * Crée la structure du formulaire HTML
     */
    private createForm(): void {
        // Création du conteneur du formulaire avec des styles Bootstrap
        const formContainer = this.createMarkup('div', this.parentElement, '', {
            class: 'card mb-4'
        });

        // En-tête du formulaire
        const cardHeader = this.createMarkup('div', formContainer, '', {
            class: 'card-header'
        });
        this.createMarkup('h3', cardHeader, 'Ajouter un Article', {
            class: 'card-title'
        });

        // Corps du formulaire
        const cardBody = this.createMarkup('div', formContainer, '', {
            class: 'card-body'
        });

        // Création du formulaire
        this.form = this.createMarkup('form', cardBody, '', {
            id: 'articleForm',
            class: 'needs-validation',
        }) as HTMLFormElement;

        // Champs du formulaire
        const fields = [
            { name: 'name', label: 'Nom', type: 'text', required: true },
            { name: 'brand', label: 'Marque', type: 'text', required: true },
            { name: 'price', label: 'Prix', type: 'number', required: true, step: '0.01' },
            { name: 'category', label: 'Catégorie', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea', required: true },
            { name: 'stock', label: 'Stock', type: 'number', required: true }
        ];

        // Création des champs du formulaire
        fields.forEach(field => {
            const formGroup = this.createMarkup('div', this.form, '', {
                class: 'form-group mb-3'
            });

            this.createMarkup('label', formGroup, field.label, {
                for: field.name,
                class: 'form-label'
            });

            if (field.type === 'textarea') {
                this.createMarkup('textarea', formGroup, '', {
                    name: field.name,
                    id: field.name,
                    class: 'form-control',
                    required: field.required ? 'true' : undefined
                });
            } else {
                this.createMarkup('input', formGroup, '', {
                    type: field.type,
                    name: field.name,
                    id: field.name,
                    class: 'form-control',
                    required: field.required ? 'true' : undefined,
                    step: field.step
                });
            }
        });

        // Boutons du formulaire
        const buttonContainer = this.createMarkup('div', this.form, '', {
            class: 'mt-4'
        });

        // Bouton de soumission
        this.createMarkup('button', buttonContainer, 'Ajouter', {
            type: 'submit',
            class: 'btn btn-primary me-2'
        });

        // Bouton de réinitialisation
        this.createMarkup('button', buttonContainer, 'Réinitialiser', {
            type: 'reset',
            class: 'btn btn-secondary'
        });
    }

    /**
     * Configure les écouteurs d'événements du formulaire
     */
    private setupEventListeners(): void {
        this.form.addEventListener('submit', async (e: Event) => {
            e.preventDefault();
            await this.handleSubmit();
        });

        this.form.addEventListener('reset', () => {
            this.resetForm();
        });
    }

    /**
     * Gère la soumission du formulaire
     */
    private async handleSubmit(): Promise<void> {
        try {
            const formData = new FormData(this.form);
            const articleData: Partial<ArticleInterface> = {
                name: formData.get('name') as string,
                brand: formData.get('brand') as string,
                price: parseFloat(formData.get('price') as string),
                category: formData.get('category') as string,
                description: formData.get('description') as string,
                stock: parseInt(formData.get('stock') as string),
            };

            if (this.isEditMode && this.currentArticleId) {
                // Mode édition
                await this.articleService.updateArticle({
                    ...articleData,
                    id: this.currentArticleId,
                    image: "https://example.com/default.jpg"
                } as ArticleInterface);
            } else {
                // Mode création
                await this.articleService.addArticle(articleData as Omit<ArticleInterface, 'id'>);
            }

            this.resetForm();
        } catch (error) {
            this.errorService.emitError('Erreur lors de la sauvegarde de l\'article');
        }
    }

    /**
     * Fait défiler la page jusqu'au formulaire
     */
    public scrollIntoView(): void {
        this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Remplit le formulaire avec les données d'un article pour l'édition
     * @param article L'article à modifier
     */
    public fillFormForEdit(article: ArticleInterface): void {
        this.isEditMode = true;
        this.currentArticleId = article.id;

        // Mise à jour du titre du formulaire
        const title = this.form.querySelector('.card-title');
        if (title) {
            title.textContent = 'Modifier l\'Article';
        }

        // Remplissage des champs
        Object.keys(article).forEach(key => {
            const input = this.form.querySelector(`[name="${key}"]`) as HTMLInputElement | null;
            if (input && key !== 'id' && key !== 'image') {
                input.value = article[key as keyof ArticleInterface].toString();
            }
        });

        // Mise à jour du texte du bouton
        const submitButton = this.form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Modifier';
        }
    }

    /**
     * Réinitialise le formulaire à son état initial
     */
    private resetForm(): void {
        this.form.reset();
        this.isEditMode = false;
        this.currentArticleId = null;

        // Réinitialisation du titre
        const title = this.form.querySelector('.card-title');
        if (title) {
            title.textContent = 'Ajouter un Article';
        }

        // Réinitialisation du texte du bouton
        const submitButton = this.form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Ajouter';
        }
    }
}