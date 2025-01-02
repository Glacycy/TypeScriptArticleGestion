import Component from "../utils/Component";
import { ArticleInterface } from "../interfaces/ArticleInterface";
import CartService from "../services/CartService";
import ArticleService from "../services/ArticleService";
import ErrorService from "../services/ErrorService";
import EditArticle from "./EditArticle";

export default class Article extends Component implements ArticleInterface {
    // Propriétés obligatoires de l'interface ArticleInterface
    id: string;
    name: string;
    brand: string;
    price: number;
    category: string;
    description: string;
    stock: number;
    image: string;

    // Services nécessaires pour la gestion de l'article
    private cartService: CartService;
    private articleService: ArticleService;
    private errorService: ErrorService;

    // Éléments du DOM que nous devrons manipuler
    private cardElement: HTMLElement;
    private quantityInput: HTMLInputElement;

    constructor(
        article: ArticleInterface,
        private parentElement: HTMLElement
    ) {
        super();
        // Copie des propriétés de l'article reçu
        Object.assign(this, article);

        // Initialisation des services
        this.cartService = CartService.getInstance();
        this.articleService = ArticleService.getInstance();
        this.errorService = ErrorService.getInstance();

        // Création de l'affichage de l'article
        this.render();
    }

    private render(): void {
        // Création de la carte principale
        this.cardElement = this.createMarkup('div', this.parentElement, '', {
            class: 'card h-100'
        });

        // Image de l'article
        this.createMarkup('img', this.cardElement, '', {
            src: this.image,
            alt: this.name,
            class: 'card-img-top',
            style: 'height: 200px; object-fit: cover;'
        });

        // Corps de la carte
        const cardBody = this.createMarkup('div', this.cardElement, '', {
            class: 'card-body d-flex flex-column'
        });

        // Informations de l'article
        this.createMarkup('h5', cardBody, this.name, {
            class: 'card-title mb-2'
        });
        this.createMarkup('h6', cardBody, this.brand, {
            class: 'card-subtitle text-muted mb-2'
        });
        this.createMarkup('p', cardBody, this.description, {
            class: 'card-text'
        });
        this.createMarkup('p', cardBody, `${this.price.toFixed(2)} €`, {
            class: 'card-text fs-4 text-primary fw-bold'
        });
        this.createMarkup('p', cardBody, `Stock: ${this.stock}`, {
            class: 'text-muted mb-3'
        });

        // Conteneur pour les contrôles
        const controlsContainer = this.createMarkup('div', cardBody, '', {
            class: 'mt-auto'
        });

        // Groupe de contrôle de quantité
        const quantityGroup = this.createMarkup('div', controlsContainer, '', {
            class: 'input-group mb-3'
        });

        this.createMarkup('span', quantityGroup, 'Quantité', {
            class: 'input-group-text'
        });

        this.quantityInput = this.createMarkup('input', quantityGroup, '', {
            type: 'number',
            class: 'form-control',
            value: '1',
            min: '1',
            max: this.stock.toString()
        }) as HTMLInputElement;

        // Conteneur pour les boutons d'action
        const buttonGroup = this.createMarkup('div', controlsContainer, '', {
            class: 'd-grid gap-2'
        });

        // Bouton d'ajout au panier
        const addToCartBtn = this.createMarkup('button', buttonGroup, 'Ajouter au panier', {
            class: `btn btn-primary ${this.stock === 0 ? 'disabled' : ''}`,
            type: 'button'
        });

        // Bouton de modification
        const editBtn = this.createMarkup('button', buttonGroup, 'Modifier', {
            class: 'btn btn-warning',
            type: 'button'
        });

        // Bouton de suppression
        const deleteBtn = this.createMarkup('button', buttonGroup, 'Supprimer', {
            class: 'btn btn-danger',
            type: 'button'
        });

        // Configuration des gestionnaires d'événements
        this.setupEventListeners(addToCartBtn, editBtn, deleteBtn);
    }

    private setupEventListeners(
        addToCartBtn: HTMLElement,
        editBtn: HTMLElement,
        deleteBtn: HTMLElement
    ): void {
        // Gestion de l'ajout au panier
        if (this.stock > 0) {
            addToCartBtn.addEventListener('click', () => this.handleAddToCart());
        }

        // Gestion de la modification
        editBtn.addEventListener('click', () => this.handleEdit());

        // Gestion de la suppression
        deleteBtn.addEventListener('click', () => this.handleDelete());

        // Validation de la quantité
        this.quantityInput.addEventListener('change', () => this.validateQuantity());
    }

    private handleAddToCart(): void {
        try {
            const quantity = parseInt(this.quantityInput.value);
            if (quantity > 0 && quantity <= this.stock) {
                this.cartService.addToCart(this, quantity);
            } else {
                throw new Error('Quantité invalide');
            }
        } catch (error) {
            this.errorService.emitError('Erreur lors de l\'ajout au panier');
        }
    }

    private handleEdit(): void {
        // Obtient l'instance unique de EditArticle et remplit le formulaire
        const editModal = EditArticle.getInstance();
        editModal.fillFormForEdit({
            id: this.id,
            name: this.name,
            brand: this.brand,
            price: this.price,
            category: this.category,
            description: this.description,
            stock: this.stock,
            image: this.image
        });
    }

    private async handleDelete(): Promise<void> {
        const confirmation = confirm('Êtes-vous sûr de vouloir supprimer cet article ?');

        if (confirmation) {
            try {
                await this.articleService.deleteArticle(this.id);
                this.cardElement.remove();
            } catch (error) {
                this.errorService.emitError('Erreur lors de la suppression de l\'article');
            }
        }
    }

    private validateQuantity(): void {
        let value = parseInt(this.quantityInput.value);

        if (isNaN(value) || value < 1) {
            value = 1;
        } else if (value > this.stock) {
            value = this.stock;
        }

        this.quantityInput.value = value.toString();
    }
}