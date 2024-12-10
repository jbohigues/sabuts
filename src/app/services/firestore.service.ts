import { Injectable, Injector } from '@angular/core';
import {
  doc,
  setDoc,
  getDoc,
  getFirestore,
  docData,
} from '@angular/fire/firestore';
import {
  Query,
  DocumentData,
  collection,
  query,
  WhereFilterOp,
  where,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore';
import { Observable } from 'rxjs';

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

  getDocumentData(
    collectionName: string
  ): Observable<DocumentData | undefined> {
    return docData(doc(getFirestore(), collectionName));
  }

  getDocumentReference(
    collectionName: string,
    documentId: string
  ): DocumentReference<DocumentData, DocumentData> {
    return doc(getFirestore(), collectionName, documentId);
  }

  getCollectionReference(
    collectionName: string
  ): CollectionReference<DocumentData, DocumentData> {
    return collection(getFirestore(), collectionName);
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
}
