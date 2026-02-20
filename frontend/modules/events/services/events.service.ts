/**
 * Events Service
 * Handles all event-related API calls
 */

import { BaseApiClient } from '@/shared/lib/api/base-client';
import type { Event, EventFormData } from '../types';
import type { PaginationParams, PaginationResponse } from '@/shared/types/common';

export interface EventsResponse {
  events: any[];
  pagination: any;
}

export class EventsService extends BaseApiClient {
  async getEvents(
    params: PaginationParams = {}
  ): Promise<EventsResponse> {
    const { page = 1, limit = 10 } = params;
    return this.request<EventsResponse>(
      `/api/events?page=${page}&limit=${limit}`,
      {
        requiresAuth: true,
      }
    );
  }

  async createEvent(eventData: any): Promise<Event> {
    return this.request<Event>('/api/events', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: any): Promise<Event> {
    return this.request<Event>(`/api/events/${id}`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    return this.request<void>(`/api/events/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }
}

export const eventsService = new EventsService();
