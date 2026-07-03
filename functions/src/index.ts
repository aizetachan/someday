import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { deliverLetters } from './deliverLetters';
export { deliverLetterAt } from './tasksDelivery';
export { dailyReminders } from './reminders';
export { onLetterSealed, onUserCreated } from './triggers';
export { deleteAccount } from './deleteAccount';
