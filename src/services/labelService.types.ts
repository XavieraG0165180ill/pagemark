export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface LabelAssignment {
  bookmarkId: string;
  labelId: string;
}

export interface CreateLabelInput {
  name: string;
  color: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
}

export interface LabelSummary {
  id: string;
  name: string;
  color: string;
  bookmarkCount: number;
}
