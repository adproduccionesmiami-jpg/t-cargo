import { TripFinancials } from '../services/trip-service'

export interface DashboardState {
    trips: TripFinancials[];
    isLoading: boolean;
    error: string | null;
}
