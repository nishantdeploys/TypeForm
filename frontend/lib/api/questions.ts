import { fetchApi } from "./client";
import { Question, QuestionCreate, QuestionUpdate } from "@/types";

export const questionsApi = {
  add: (formId: string, data: QuestionCreate) =>
    fetchApi<Question>(`/forms/${formId}/questions`, { method: "POST", body: JSON.stringify(data) }),
  update: (questionId: string, data: QuestionUpdate) =>
    fetchApi<Question>(`/questions/${questionId}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (questionId: string) =>
    fetchApi<void>(`/questions/${questionId}`, { method: "DELETE" }),
  reorder: (formId: string, items: { id: string; position: number }[]) =>
    fetchApi<Question[]>(`/forms/${formId}/questions/reorder`, {
      method: "POST",
      body: JSON.stringify({ questions: items }),
    }),
};
