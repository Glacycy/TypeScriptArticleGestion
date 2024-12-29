import Component from "../utils/Component";
import { ArticleInterface } from "../interfaces/ArticleInterface";
import CartService from "../services/CartService";

export default class Article extends Component implements ArticleInterface {
    // Propriétés de l'interface ArticleInterface
    id: string;
    name: string;
    brand: string;
    price: number;
    category: string;
    description: string;
    stock: number;
    image: string;

    private cartService: CartService;
    private element: HTMLElement;

    constructor(
        article: ArticleInterface,
        private parentElement: HTMLElement
    ) {
        super();
        Object.assign(this, article);
        this.cartService = CartService.getInstance();
        this.render();
    }

    /**
     * Crée et rend l'article avec style Bootstrap
     */
    private render(): void {
        // Création de la carte article avec Bootstrap
        const card = this.createMarkup('div', this.parentElement, '', {
            class: 'card h-100'
        });

        // Image de l'article
        const img = this.createMarkup('img', card, '', {
            src: this.image,
            alt: this.name,
            class: 'card-img-top'
        });

        // Corps de la carte
        const cardBody = this.createMarkup('div', card, '', {
            class: 'card-body'
        });

        // En-tête avec nom et marque
        this.createMarkup('h5', cardBody, this.name, {
            class: 'card-title'
        });
        this.createMarkup('h6', cardBody, this.brand, {
            class: 'card-subtitle mb-2 text-muted'
        });

        // Prix et stock
        this.createMarkup('p', cardBody, `${this.price.toFixed(2)} €`, {
            class: 'fs-4 fw-bold text-primary'
        });
        this.createMarkup('p', cardBody, `Stock: ${this.stock}`, {
            class: 'text-muted'
        });

        // Conteneur pour les boutons
        const buttonContainer = this.createMarkup('div', cardBody, '', {
            class: 'd-grid gap-2'
        });

        // Bouton d'ajout au panier
        const addToCartBtn = this.createMarkup('button', buttonContainer, 'Ajouter au panier', {
            class: `btn btn-primary ${this.stock === 0 ? 'disabled' : ''}`
        });

        // Bouton de suppression
        const deleteBtn = this.createMarkup('button', buttonContainer, 'Supprimer', {
            class: 'btn btn-danger'
        });

        this.setupEventListeners(addToCartBtn, deleteBtn);
    }

    /**
     * Configure les écouteurs d'événements pour les boutons
     */
    private setupEventListeners(
        addToCartBtn: HTMLElement,
        deleteBtn: HTMLElement
    ): void {
        if (this.stock > 0) {
            addToCartBtn.addEventListener('click', () => {
                this.cartService.addToCart(this, 1);
            });
        }

        deleteBtn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
                // Émet un événement personnalisé pour la suppression
                this.parentElement.dispatchEvent(new CustomEvent('deleteArticle', {
                    detail: { id: this.id },
                    bubbles: true
                }));
            }
        });
    }
}