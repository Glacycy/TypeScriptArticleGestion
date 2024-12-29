import Component from "../utils/Component";
import { CartItem } from '../interfaces/ArticleInterface';
import CartService from '../services/CartService';
import ErrorService from '../services/ErrorService';

export default class Cart extends Component {
    private cartContainer: HTMLElement;
    private cartItemsContainer: HTMLElement;
    private cartTotalElement: HTMLElement;
    private cartService: CartService;
    private errorService: ErrorService;

    constructor(private parentElement: HTMLElement) {
        super();
        this.cartService = CartService.getInstance();
        this.errorService = ErrorService.getInstance();
        this.render();
        this.setupSubscriptions();
    }

    /**
     * Crée la structure initiale du panier
     */
    private render(): void {
        // Création du conteneur principal du panier avec Bootstrap
        this.cartContainer = this.createMarkup('div', this.parentElement, '', {
            class: 'card'
        });

        // En-tête du panier
        const cardHeader = this.createMarkup('div', this.cartContainer, '', {
            class: 'card-header'
        });
        this.createMarkup('h3', cardHeader, 'Votre Panier', {
            class: 'card-title mb-0'
        });

        // Corps du panier
        const cardBody = this.createMarkup('div', this.cartContainer, '', {
            class: 'card-body'
        });

        // Conteneur pour les articles du panier
        this.cartItemsContainer = this.createMarkup('div', cardBody, '', {
            class: 'cart-items mb-3'
        });

        // Conteneur pour le total
        const totalContainer = this.createMarkup('div', cardBody, '', {
            class: 'cart-total d-flex justify-content-between align-items-center border-top pt-3'
        });
        this.createMarkup('span', totalContainer, 'Total:', {
            class: 'fw-bold'
        });
        this.cartTotalElement = this.createMarkup('span', totalContainer, '0.00 €', {
            class: 'fs-4 text-primary fw-bold'
        });
    }

    /**
     * Configure les abonnements aux observables du CartService
     */
    private setupSubscriptions(): void {
        // S'abonne aux changements des articles du panier
        this.cartService.cartItems$.subscribe(items => {
            this.updateCartItems(items);
        });

        // S'abonne aux changements du total
        this.cartService.total$.subscribe(total => {
            this.updateTotal(total);
        });
    }

    /**
     * Met à jour l'affichage des articles du panier
     */
    private updateCartItems(items: CartItem[]): void {
        this.cartItemsContainer.innerHTML = '';

        if (items.length === 0) {
            this.createMarkup('p', this.cartItemsContainer, 'Votre panier est vide', {
                class: 'text-muted text-center py-3'
            });
            return;
        }

        items.forEach(item => {
            const itemContainer = this.createMarkup('div', this.cartItemsContainer, '', {
                class: 'cart-item d-flex justify-content-between align-items-center border-bottom py-2'
            });

            // Informations de l'article
            const itemInfo = this.createMarkup('div', itemContainer, '', {
                class: 'flex-grow-1'
            });
            this.createMarkup('h6', itemInfo, item.article.name, {
                class: 'mb-0'
            });
            this.createMarkup('small', itemInfo, `${item.article.price.toFixed(2)} € × ${item.quantity}`, {
                class: 'text-muted'
            });

            // Sous-total pour cet article
            const subtotal = item.article.price * item.quantity;
            this.createMarkup('span', itemContainer, `${subtotal.toFixed(2)} €`, {
                class: 'mx-3'
            });

            // Bouton de suppression
            const deleteBtn = this.createMarkup('button', itemContainer, '', {
                class: 'btn btn-danger btn-sm',
                type: 'button'
            });
            this.createMarkup('i', deleteBtn, '×', {
                class: 'bi bi-x'
            });

            // Gestionnaire d'événement pour la suppression
            deleteBtn.addEventListener('click', () => {
                this.cartService.removeFromCart(item.article.id);
            });
        });
    }

    /**
     * Met à jour l'affichage du total
     */
    private updateTotal(total: number): void {
        this.cartTotalElement.textContent = `${total.toFixed(2)} €`;
    }
}