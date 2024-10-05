import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  DocumentData,
  DocumentReference,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);

  constructor() {}

  getDocument<type>(path: string) {
    const document = doc(this.firestore, path) as DocumentReference<type, any>;
    return getDoc<type, any>(document);
  }

  getDocumentChanges<type>(path: string) {
    console.log('getDocumentChanges -> ', path);
    const document = doc(this.firestore, path);
    return docData(document) as Observable<type>;
  }

  getCollectionChanges<type>(path: string) {
    const referenceCollection = collection(this.firestore, path);
    return collectionData(referenceCollection) as Observable<type[]>;
  }

  createDocument(data: any, path: string, id?: string) {
    if (id) {
      // Si se proporciona un ID, usamos setDoc con una referencia de documento específica
      const document = doc(this.firestore, path, id);
      return setDoc(document, data);
    } else {
      // Si no se proporciona un ID, usamos addDoc para generar un ID automático
      const collectionRef = collection(this.firestore, path);
      return addDoc(collectionRef, data);
    }
  }

  async updateDocument(data: any, path: string) {
    const document = doc(this.firestore, path);
    return updateDoc(document, data);
  }

  async updateDocumentID(data: any, path: string, idDoc: string) {
    const document = doc(this.firestore, `${path}/${idDoc}`);
    return updateDoc(document, data);
  }

  deleteDocFromRef(ref: DocumentReference<unknown, DocumentData>) {
    return deleteDoc(ref);
  }

  deleteDocumentID(path: string, idDoc: string) {
    const document = doc(this.firestore, `${path}/${idDoc}`);
    return deleteDoc(document);
  }
}
