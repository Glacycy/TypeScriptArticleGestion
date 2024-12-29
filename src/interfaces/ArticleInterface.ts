// Définition de l'interface Article qui décrit la structure d'un article de sport
export interface ArticleInterface {
    id: string;
    name: string;
    brand: string;
    price: number;
    category: string;
    description: string;
    stock: number;
    image: string;
}

// Définition de l'interface CartItem qui représente un article dans le panier
export interface CartItem {
    article: ArticleInterface;
    quantity: number;
}