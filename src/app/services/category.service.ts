import { inject, Injectable } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { CategoryModel } from '@models/category.model';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private firestore = inject(Firestore);

  getCategories(): Observable<CategoryModel[]> {
    const categoriesRef = collection(this.firestore, 'categories');
    return from(getDocs(categoriesRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as CategoryModel)
        )
      )
    );
  }
}
