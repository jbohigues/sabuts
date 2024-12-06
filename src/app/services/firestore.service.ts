import { Injectable, Injector } from '@angular/core';
import { doc, setDoc, getDoc, getFirestore } from '@angular/fire/firestore';
import {
  Query,
  DocumentData,
  collection,
  query,
  WhereFilterOp,
  where,
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
  deps: [Injector],
})
export class FirestoreService {
  //! BASE DE DATOS
  getFirestore() {
    return getFirestore();
  }

  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  createQuery(
    collectionName: string,
    ...conditions: [string, WhereFilterOp, any][]
  ): Query<DocumentData> {
    const collectionRef = collection(getFirestore(), collectionName);
    const queryConditions = conditions.map(([field, operator, value]) =>
      where(field, operator, value)
    );
    return query(collectionRef, ...queryConditions);
  }

  //! INTENTO DE HACER METODOS ABSTRACTOS
  // /**
  //  * Obtiene una colección con actualizaciones en tiempo real
  //  * @param collectionName Nombre de la colección
  //  * @param queryFn Función de consulta opcional para filtrar resultados
  //  * @returns Observable con los documentos de la colección
  //  */
  // getCollectionRealtime<T>(
  //   collectionName: string,
  //   queryFn?: QueryFn
  // ): Observable<T[]> {
  //   return this.angularFirestore
  //     .collection<T>(collectionName, queryFn)
  //     .valueChanges({ idField: 'id' });
  // }

  // /**
  //  * Obtiene un documento específico con actualizaciones en tiempo real
  //  * @param collectionName Nombre de la colección
  //  * @param documentId ID del documento
  //  * @returns Observable con el documento
  //  */
  // getDocumentRealtime<T>(
  //   collectionName: string,
  //   documentId: string
  // ): Observable<T | null> {
  //   return this.angularFirestore
  //     .collection(collectionName)
  //     .doc<T>(documentId)
  //     .valueChanges({ idField: 'id' })
  //     .pipe(map((data) => data ?? null));
  // }

  // /**
  //  * Añade un nuevo documento a una colección
  //  * @param collectionName Nombre de la colección
  //  * @param data Datos a añadir
  //  * @returns Promesa con el ID del documento creado
  //  */
  // addDocument<T>(collectionName: string, data: T): Promise<string> {
  //   return this.angularFirestore
  //     .collection(collectionName)
  //     .add(data)
  //     .then((docRef) => docRef.id);
  // }

  // /**
  //  * Actualiza un documento existente
  //  * @param collectionName Nombre de la colección
  //  * @param documentId ID del documento
  //  * @param data Datos a actualizar
  //  * @returns Promesa void
  //  */
  // updateDocument<T>(
  //   collectionName: string,
  //   documentId: string,
  //   data: Partial<T>
  // ): Promise<void> {
  //   return this.angularFirestore
  //     .collection(collectionName)
  //     .doc(documentId)
  //     .update(data);
  // }

  // /**
  //  * Elimina un documento
  //  * @param collectionName Nombre de la colección
  //  * @param documentId ID del documento
  //  * @returns Promesa void
  //  */
  // deleteDocument(collectionName: string, documentId: string): Promise<void> {
  //   return this.angularFirestore
  //     .collection(collectionName)
  //     .doc(documentId)
  //     .delete();
  // }
}
