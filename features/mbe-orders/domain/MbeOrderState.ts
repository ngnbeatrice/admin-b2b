export const MbeOrderState = {
  DRAFT: 0,
  CONFIRMED: 1,
  DELETED: 2,
  FULFILLED: 3,
} as const

export type MbeOrderState = (typeof MbeOrderState)[keyof typeof MbeOrderState]
