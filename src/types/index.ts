export type Role = 'BORROWER' | 'LIBRARIAN' | 'ADMIN';

export type ItemType =
  | 'BookPhysical'
  | 'StoryPhysical'
  | 'BookOnline'
  | 'StoryOnline';

export type ReservationStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'RETURNED'
  | 'EXPIRED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string;
}

export interface AuthState {
  token: string;
  user: User;
}

export interface Author {
  name: string;
  nationality?: string;
  birthDate?: string;
}

export interface Copy {
  id: string;
  status: 'AVAILABLE' | 'BORROWED' | 'RESERVED';
}

export interface LibraryItem {
  id: string;
  type: ItemType;
  title: string;
  description?: string;
  language?: string;
  edition?: string;
  image?: string;
  numOfCopies?: number;
  availableCopies?: number;
  author: Author;
  copies?: Copy[];
}

export interface Reservation {
  id: string;
  itemId: string;
  itemTitle?: string;
  itemType?: ItemType;
  copyId?: string;
  borrowerId?: string;
  borrowerName?: string;
  status: ReservationStatus;
  reservationDate?: string;
  dueDate?: string;
  returnDate?: string;
}

export interface Borrower {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: Role;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}
