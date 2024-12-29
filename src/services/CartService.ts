import { BehaviorSubject } from 'rxjs';
import { ArticleInterface, CartItem } from '../interfaces/ArticleInterface';
import ErrorService from './ErrorService';

/**
 * Service responsable de la gestion du panier d'achats
 * Utilise le pattern Singleton pour garantir une seule instance
 */
export default class CartService {
    // Instance unique du service
    private static instance: CartService;

    // BehaviorSubject pour gérer l'état du panier
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
    // Observable public pour que les composants puissent s'abonner aux changements
    public cartItems$ = this.cartItemsSubject.asObservable();

    // BehaviorSubject pour le montant total
    private totalSubject = new BehaviorSubject<number>(0);
    // Observable public pour le montant total
    public total$ = this.totalSubject.asObservable();

    private constructor(private errorService: ErrorService) {
        // S'abonner aux changements du panier pour calculer le total
        this.cartItems$.subscribe(items => {
            this.calculateTotal(items);
        });
    }

    /**
     * Récupère l'instance unique du service
     */
    public static getInstance(): CartService {
        if (!CartService.instance) {
            CartService.instance = new CartService(ErrorService.getInstance());
        }
        return CartService.instance;
    }

    /**
     * Ajoute un article au panier
     * Si l'article existe déjà, augmente la quantité
     */
    public addToCart(article: ArticleInterface, quantity: number): void {
        try {
            const currentItems = this.cartItemsSubject.getValue();
            const existingItem = currentItems.find(item => item.article.id === article.id);

            if (existingItem) {
                // Vérifier le stock disponible
                if (existingItem.quantity + quantity > article.stock) {
                    throw new Error('Stock insuffisant');
                }

                // Mettre à jour la quantité
                const updatedItems = currentItems.map(item =>
                    item.article.id === article.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
                this.cartItemsSubject.next(updatedItems);
            } else {
                // Vérifier le stock disponible
                if (quantity > article.stock) {
                    throw new Error('Stock insuffisant');
                }

                // Ajouter le nouvel article
                this.cartItemsSubject.next([...currentItems, { article, quantity }]);
            }
        } catch (error) {
            this.errorService.emitError(error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier');
        }
    }

    /**
     * Retire un article du panier
     */
    public removeFromCart(articleId: string): void {
        const currentItems = this.cartItemsSubject.getValue();
        const updatedItems = currentItems.filter(item => item.article.id !== articleId);
        this.cartItemsSubject.next(updatedItems);
    }

    /**
     * Met à jour la quantité d'un article dans le panier
     */
    public updateQuantity(articleId: string, quantity: number): void {
        try {
            const currentItems = this.cartItemsSubject.getValue();
            const item = currentItems.find(item => item.article.id === articleId);

            if (!item) {
                throw new Error('Article non trouvé dans le panier');
            }

            if (quantity > item.article.stock) {
                throw new Error('Stock insuffisant');
            }

            const updatedItems = currentItems.map(item =>
                item.article.id === articleId
                    ? { ...item, quantity }
                    : item
            );

            this.cartItemsSubject.next(updatedItems);
        } catch (error) {
            this.errorService.emitError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la quantité');
        }
    }

    /**
     * Vide le panier
     */
    public clearCart(): void {
        this.cartItemsSubject.next([]);
    }

    /**
     * Calcule le montant total du panier
     */
    private calculateTotal(items: CartItem[]): void {
        const total = items.reduce((sum, item) =>
            sum + (item.article.price * item.quantity), 0
        );
        this.totalSubject.next(Number(total.toFixed(2)));
    }
}