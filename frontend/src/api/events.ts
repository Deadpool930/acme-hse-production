import client from './client';

export const fetchEvents = async () => {
    const { data } = await client.get('/events/');
    return data;
};

export const createEvent = async (eventData: any) => {
    const { data } = await client.post('/events/', eventData);
    return data;
};

export const syncOfflineEvents = async (events: any[]) => {
    const { data } = await client.post('/events/sync', events);
    return data;
};
