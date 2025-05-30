export interface Message {
  _id: string;
  text?: string;
  sender?: string;
  senderId?: string;
  timestamp?: Date;
  createdAt?: string;
  image?: string;
}
