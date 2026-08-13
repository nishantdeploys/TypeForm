export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating";

export type FormStatus = "draft" | "published";

export interface QuestionOption {
  id?: string;
  question_id?: string;
  label: string;
  value: string;
  position?: number;
}

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description?: string | null;
  required: boolean;
  position: number;
  settings_json?: string | null;
  created_at?: string;
  updated_at?: string;
  options: QuestionOption[];
}

export interface QuestionCreate {
  type: QuestionType;
  title: string;
  description?: string;
  required?: boolean;
  position?: number;
  settings_json?: string;
  options?: { label: string; value?: string; position?: number }[];
}

export interface QuestionUpdate {
  type?: QuestionType;
  title?: string;
  description?: string | null;
  required?: boolean;
  position?: number;
  settings_json?: string | null;
  options?: { label: string; value?: string; position?: number }[];
}

export interface Form {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  status: FormStatus;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  question_count: number;
  response_count: number;
  questions?: Question[];
}

export interface FormCreate {
  title: string;
  description?: string;
}

export interface FormUpdate {
  title?: string;
  description?: string;
  status?: FormStatus;
}

export interface ResponseAnswerCreate {
  question_id: string;
  answer_text?: string | null;
  answer_number?: number | null;
  answer_json?: string | null;
}

export interface ResponseCreate {
  completion_time?: number;
  metadata_json?: string;
  answers: ResponseAnswerCreate[];
}

export interface ResponseAnswer {
  id: string;
  question_id: string;
  question_title?: string;
  question_type?: QuestionType;
  answer_text?: string | null;
  answer_number?: number | null;
  answer_json?: string | null;
}

export interface ResponseListItem {
  id: string;
  form_id: string;
  submitted_at: string;
  completion_time?: number | null;
  answers_count: number;
  preview_answers: Record<string, any>;
}

export interface ResponseDetail {
  id: string;
  form_id: string;
  submitted_at: string;
  completion_time?: number | null;
  metadata_json?: string;
  answers: ResponseAnswer[];
}

export interface OptionStat {
  label: string;
  value: string;
  count: number;
  percentage: number;
}

export interface QuestionStat {
  question_id: string;
  title: string;
  type: QuestionType;
  total_answers: number;
  average_number?: number | null;
  options: OptionStat[];
  text_samples: string[];
}

export interface FormStats {
  form_id: string;
  total_responses: number;
  avg_completion_time?: number | null;
  questions_stats: QuestionStat[];
}
