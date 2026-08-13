import { QuestionType } from "@/types";
import {
  AlignLeft,
  FileText,
  CheckSquare,
  ChevronDown,
  Mail,
  Hash,
  ToggleLeft,
  Star,
} from "lucide-react";

export interface QuestionTypeConfig {
  type: QuestionType;
  label: string;
  description: string;
  icon: any;
  defaultTitle: string;
  defaultOptions?: { label: string; value: string }[];
  defaultSettings?: Record<string, any>;
}

export const QUESTION_TYPES: QuestionTypeConfig[] = [
  {
    type: "short_text",
    label: "Short Text",
    description: "A single line text response",
    icon: AlignLeft,
    defaultTitle: "What is your answer?",
  },
  {
    type: "long_text",
    label: "Long Text",
    description: "A multi-line text response for detailed feedback",
    icon: FileText,
    defaultTitle: "Please share your detailed feedback",
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    description: "Select one choice from a list of options",
    icon: CheckSquare,
    defaultTitle: "Choose one option below",
    defaultOptions: [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
      { label: "Option 3", value: "option_3" },
    ],
  },
  {
    type: "dropdown",
    label: "Dropdown",
    description: "Select a single option from a drop-down menu",
    icon: ChevronDown,
    defaultTitle: "Select from the list",
    defaultOptions: [
      { label: "Choice A", value: "choice_a" },
      { label: "Choice B", value: "choice_b" },
      { label: "Choice C", value: "choice_c" },
    ],
  },
  {
    type: "email",
    label: "Email",
    description: "Capture validated email addresses",
    icon: Mail,
    defaultTitle: "What is your email address?",
  },
  {
    type: "number",
    label: "Number",
    description: "Numeric input field with validation",
    icon: Hash,
    defaultTitle: "Enter a number",
  },
  {
    type: "yes_no",
    label: "Yes / No",
    description: "Quick binary choice buttons",
    icon: ToggleLeft,
    defaultTitle: "Do you agree with this statement?",
  },
  {
    type: "rating",
    label: "Rating Scale",
    description: "Interactive rating scale (1-5)",
    icon: Star,
    defaultTitle: "How would you rate your experience?",
    defaultSettings: { max_rating: 5, min_label: "Poor", max_label: "Excellent" },
  },
];

export function getQuestionConfig(type: QuestionType): QuestionTypeConfig {
  const config = QUESTION_TYPES.find((q) => q.type === type);
  return (
    config || {
      type: "short_text",
      label: "Short Text",
      description: "A single line text response",
      icon: AlignLeft,
      defaultTitle: "Question",
    }
  );
}
