import { fetchApi } from "./client";
import { ResponseListItem, ResponseDetail, FormStats } from "@/types";

export const responsesApi = {
  list: (formId: string) => fetchApi<ResponseListItem[]>(`/forms/${formId}/responses`),
  getDetail: (formId: string, responseId: string) => fetchApi<ResponseDetail>(`/forms/${formId}/responses/${responseId}`),
  getStats: (formId: string) => fetchApi<FormStats>(`/forms/${formId}/statistics`),
};
