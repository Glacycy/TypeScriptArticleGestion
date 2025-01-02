import Component from "../utils/Component";
import { ArticleInterface } from "../interfaces/ArticleInterface";
import ArticleService from "../services/ArticleService";
import ErrorService from "../services/ErrorService";

export default class EditArticle extends Component {
    private static instance: EditArticle;
    private modal: HTMLElement;
    private form: HTMLFormElement;
    private currentArticle: ArticleInterface | null = null;
    private articleService: ArticleService;
    private errorService: ErrorService;

    private constructor() {
        super();
        this.articleService = ArticleService.getInstance();
        this.errorService = ErrorService.getInstance();
        this.createModal();
        this.setupEventListeners();
    }

    public static getInstance(): EditArticle {
        if (!EditArticle.instance) {
            EditArticle.instance = new EditArticle();
        }
        return EditArticle.instance;
    }

    /**
     * Crée la structure HTML du modal
     */
    private createModal(): void {
        // Création du conteneur modal avec les classes Bootstrap
        this.modal = this.createMarkup('div', document.body, '', {
            class: 'modal',  // Classes Bootstrap pour le style
            id: 'editModal',
            style: 'display: none'  // Caché par défaut
        });

        // Fond sombre du modal
        const modalBackdrop = this.createMarkup('div', document.body, '', {
            class: 'modal-backdrop fade show',
            style: 'display: none'
        });

        const modalDialog = this.createMarkup('div', this.modal, '', {
            class: 'modal-dialog modal-lg'
        });

        const modalContent = this.createMarkup('div', modalDialog, '', {
            class: 'modal-content'
        });

        // En-tête du modal
        const modalHeader = this.createMarkup('div', modalContent, '', {
            class: 'modal-header'
        });
        this.createMarkup('h5', modalHeader, 'Modifier l\'article', {
            class: 'modal-title'
        });
        const closeButton = this.createMarkup('button', modalHeader, '×', {
            class: 'btn-close',
            type: 'button'
        });

        // Corps du modal
        const modalBody = this.createMarkup('div', modalContent, '', {
            class: 'modal-body'
        });

        // Création du formulaire
        this.form = this.createMarkup('form', modalBody, '', {
            id: 'editArticleForm'
        }) as HTMLFormElement;

        // Champs du formulaire
        const fields = [
            { name: 'name', label: 'Nom', type: 'text' },
            { name: 'brand', label: 'Marque', type: 'text' },
            { name: 'price', label: 'Prix', type: 'number', step: '0.01' },
            { name: 'category', label: 'Catégorie', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'stock', label: 'Stock', type: 'number' }
        ];

        fields.forEach(field => {
            const formGroup = this.createMarkup('div', this.form, '', {
                class: 'mb-3'
            });

            this.createMarkup('label', formGroup, field.label, {
                for: `edit_${field.name}`,
                class: 'form-label'
            });

            if (field.type === 'textarea') {
                this.createMarkup('textarea', formGroup, '', {
                    id: `edit_${field.name}`,
                    name: field.name,
                    class: 'form-control'
                });
            } else {
                this.createMarkup('input', formGroup, '', {
                    type: field.type,
                    id: `edit_${field.name}`,
                    name: field.name,
                    class: 'form-control',
                    step: field.step
                });
            }
        });

        // Pied du modal
        const modalFooter = this.createMarkup('div', modalContent, '', {
            class: 'modal-footer'
        });

        const cancelButton = this.createMarkup('button', modalFooter, 'Annuler', {
            class: 'btn btn-secondary',
            type: 'button'
        });

        const saveButton = this.createMarkup('button', modalFooter, 'Enregistrer', {
            class: 'btn btn-primary',
            type: 'submit',
            form: 'editArticleForm'
        });

        // Gestionnaires d'événements pour fermer le modal
        [closeButton, cancelButton].forEach(button => {
            button.addEventListener('click', () => this.hideModal());
        });
    }

    /**
     * Configuration des événements
     */
    private setupEventListeners(): void {
        this.form.addEventListener('submit', async (e: Event) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    /**
     * Affiche le modal
     */
    private showModal(): void {
        this.modal.style.display = 'block';
        document.body.classList.add('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            (backdrop as HTMLElement).style.display = 'block';
        }
    }

    /**
     * Cache le modal
     */
    private hideModal(): void {
        this.modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            (backdrop as HTMLElement).style.display = 'none';
        }
    }

    /**
     * Remplit le formulaire pour la modification
     */
    public fillFormForEdit(article: ArticleInterface): void {
        this.currentArticle = article;

        Object.keys(article).forEach(key => {
            const input = this.form.querySelector(`[name="${key}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
            if (input && key !== 'id' && key !== 'image') {
                input.value = article[key as keyof ArticleInterface].toString();
            }
        });

        this.showModal();
    }

    /**
     * Gère la soumission du formulaire
     */
    private async handleSubmit(): Promise<void> {
        try {
            if (!this.currentArticle) {
                throw new Error('Aucun article sélectionné pour la modification');
            }

            const formData = new FormData(this.form);
            const updatedArticle: ArticleInterface = {
                ...this.currentArticle,
                name: formData.get('name') as string,
                brand: formData.get('brand') as string,
                price: parseFloat(formData.get('price') as string),
                category: formData.get('category') as string,
                description: formData.get('description') as string,
                stock: parseInt(formData.get('stock') as string)
            };

            await this.articleService.updateArticle(updatedArticle);
            this.hideModal();
            this.form.reset();
            this.currentArticle = null;
        } catch (error) {
            this.errorService.emitError('Erreur lors de la modification de l\'article');
        }
    }
}