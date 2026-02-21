export type UserRole = 'moderator' | 'administrator' | 'every' | 'staff'

export interface CommandConfig {
  role: UserRole
  rateLimit?: number
  itemsLimit?: {
    authorization: UserRole[]
    default: number
    max: {
      public: number
      staff: number
    }
  }
}

export interface CommandModel {
  variants: string[]
  helper: string
  config: CommandConfig
  fn: (args: any) => any
}
