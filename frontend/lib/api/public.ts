import { fetchApi } from "./client";
import { Form, ResponseCreate } from "@/types";

export const publicApi = {
  getBySlug: (slug: string) => fetchApi<Form>(`/public/forms/${slug}`),
  submitResponse: (slug: string, data: ResponseCreate) =>
    fetchApi<{ success: boolean; response_id: string; message: string }>(`/public/forms/${slug}/responses`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
