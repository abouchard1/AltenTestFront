import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './product.class';
import { catchError, tap,  map} from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

    private static productslist: Product[] = null;
    private products$: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>([]);

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
        if( ! ProductsService.productslist )
        {
            this.http.get<any>('http://localhost:3000/products/').subscribe(data => {
                console.log(data)
                ProductsService.productslist = data;
                
                this.products$.next(ProductsService.productslist);
            });
        }
        else
        {
            this.products$.next(ProductsService.productslist);
        }

        return this.products$;
    }

    create(prod: Product): Observable<Product[]> {
        delete prod.id
        return this.http.post<Product>(`http://localhost:3000/products/`, prod)
            .pipe(
                tap(newProduct => {
                    // Add the newly created product (returned from the server) to the local list
                    ProductsService.productslist.push(newProduct);
                    this.products$.next(ProductsService.productslist);
                }),
                map(() => ProductsService.productslist), // Map the result to the updated products list
                catchError(error => {
                    console.error('Error creating product', error);
                    return throwError(error); // Or handle the error appropriately
                })
            );
    }

    update(prod: Product): Observable<Product[]> {
        return this.http.patch<Product>(`http://localhost:3000/products/${prod.id}`, prod)
            .pipe(
                tap(updatedProduct => {
                    // Update the local products list with the updated product
                    const index = ProductsService.productslist.findIndex(p => p.id === updatedProduct.id);
                    if (index !== -1) {
                        ProductsService.productslist[index] = updatedProduct;
                    } else {
                        // Handle the case where the product might not exist in the local list
                        ProductsService.productslist.push(updatedProduct);
                    }
                    this.products$.next(ProductsService.productslist);
                }),
                map(() => ProductsService.productslist), // Map the result to the updated products list
                catchError(error => {
                    console.error('Error updating product', error);
                    return throwError(error); // Or handle the error appropriately
                })
            );
    }


    delete(id: number): Observable<Product[]>{
        ProductsService.productslist = ProductsService.productslist.filter(value => { return value.id !== id } );
        this.products$.next(ProductsService.productslist);
        return this.products$;
    }
}