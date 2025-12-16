/**
 * Events module types
 */

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  [key: string]: any;
}

export interface EventFormData {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  [key: string]: any;
}
