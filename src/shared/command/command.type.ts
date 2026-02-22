export interface CommandResponse {
  success: boolean
  msg: string
}


export interface CommandSecurity {
  minRole?: UserRole 
  rules?: {
    [argIndex: number]: {
      minRole: UserRole 
      fallbackValue?: any 
    }
  }
}


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
  default: {
    variants: string[]
    helper: string
    config: CommandConfig
    fn: (args: any) => any
  }
}


export interface Command {
  variants: string[]
  helper: string
  security?: CommandSecurity 
  fn: (args: string[], message: any) => Promise<any>
}

interface List {
  success: boolean
  data: Datas
  timestamp: string
}

interface Datas {
  words: string[]
  occurrences: {
    [key: string]: string
  }
}