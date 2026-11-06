// Where a made-to-fit piece was off, for the customer's fit feedback.
// Mirrors the backend's modules/orders/fit-feedback.ts lists; keep them in
// step. Round-the-body areas are tight or loose; lengths are long or short.
// One entry per area, at most six, and none when the fit was perfect.

export const ROUND_AREAS = ['neck', 'chest', 'waist', 'hip', 'shoulder', 'arm', 'thigh'] as const;
export const LENGTH_AREAS = ['sleeve_length', 'top_length', 'trouser_length', 'dress_length'] as const;
export const FIT_AREAS = [...ROUND_AREAS, ...LENGTH_AREAS] as const;
export type FitArea = (typeof FIT_AREAS)[number];

export type FitProblem = 'tight' | 'loose' | 'long' | 'short';

export interface FitIssue {
  area: FitArea;
  problem: FitProblem;
}

export const MAX_FIT_ISSUES = 6;

export const FIT_AREA_LABELS: Record<FitArea, string> = {
  neck: 'Neck',
  chest: 'Chest',
  waist: 'Waist',
  hip: 'Hips',
  shoulder: 'Shoulders',
  arm: 'Arms',
  thigh: 'Thighs',
  sleeve_length: 'Sleeve length',
  top_length: 'Top length',
  trouser_length: 'Trouser length',
  dress_length: 'Dress length',
};

export const FIT_PROBLEM_LABELS: Record<FitProblem, string> = {
  tight: 'Tight',
  loose: 'Loose',
  long: 'Too long',
  short: 'Too short',
};

/** The two problems that make sense for an area. */
export const problemsFor = (area: FitArea): FitProblem[] =>
  (ROUND_AREAS as readonly string[]).includes(area) ? ['tight', 'loose'] : ['long', 'short'];

/** "Tight at the chest", "Sleeve length too long". */
export function describeFitIssue(issue: { area: string; problem: string }): string {
  const area = FIT_AREA_LABELS[issue.area as FitArea] ?? issue.area;
  const problem = FIT_PROBLEM_LABELS[issue.problem as FitProblem] ?? issue.problem;
  return (LENGTH_AREAS as readonly string[]).includes(issue.area)
    ? `${area} ${problem.toLowerCase()}`
    : `${problem} at the ${area.toLowerCase()}`;
}
