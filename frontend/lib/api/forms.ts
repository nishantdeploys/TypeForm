import { fetchApi } from "./client";
import { Form, FormCreate, FormUpdate } from "@/types";

export const formsApi = {
  list: () => fetchApi<Form[]>("/forms"),
  getById: (id: string) => fetchApi<Form>(`/forms/${id}`),
  create: (data: FormCreate) => fetchApi<Form>("/forms", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: FormUpdate) => fetchApi<Form>(`/forms/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/forms/${id}`, { method: "DELETE" }),
  duplicate: (id: string) => fetchApi<Form>(`/forms/${id}/duplicate`, { method: "POST" }),
  publish: (id: string) => fetchApi<Form>(`/forms/${id}/publish`, { method: "POST" }),
  unpublish: (id: string) => fetchApi<Form>(`/forms/${id}/unpublish`, { method: "POST" }),
};
