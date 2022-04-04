import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {

    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const product = cart.find(product => product.id === productId)
     
      api.get('products').then((response) => {
          if(!product) {
            const responseProduct = response.data[productId - 1]
            responseProduct.amount = 1;
            setCart([...cart, responseProduct]);
            return;
          }

          setCart(cart.map((product)=>{
            if(product.id === productId) {
              product.amount += 1;
            }
            return product;
          }))
      })

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      setCart(cart.filter(product => {
        return product.id !== productId;
      }))

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      setCart(cart.map((product) => {
        if(product.id === productId) product.amount = amount;
        return product;
        })
      )
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
