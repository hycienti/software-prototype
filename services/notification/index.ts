import { apiClient } from "../api/client";
import { getApiUrl } from "@/constants/api";
import type { Notification, NotificationListResponse } from "@/types/notification";

class NotificationService {
	async list(): Promise<NotificationListResponse> {
		return apiClient.get<NotificationListResponse>(getApiUrl("/notifications"));
	}

	async markAllRead(): Promise<void> {
		await apiClient.patch<void>(getApiUrl("/notifications/mark-all-read"));
	}

	async markRead(id: number): Promise<Notification> {
		return apiClient.patch<Notification>(getApiUrl(`/notifications/${id}`));
	}

	async delete(id: number): Promise<void> {
		await apiClient.delete<void>(getApiUrl(`/notifications/${id}`));
	}
}

export default new NotificationService();