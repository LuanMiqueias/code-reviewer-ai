export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	perPage: number;
}
