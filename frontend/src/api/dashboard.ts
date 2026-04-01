import client from './client';

export const fetchDashboardSummary = async () => {
    const { data } = await client.get('/dashboard/summary');
    return data;
};
