import { DataManager, USERS_DATA_PATH } from '@data/data-manager';
import type { User } from '@shared/user/user-registry.type';

export class UserRegistry {
  private static instance: UserRegistry | null = null;
  private _users: User[] = [];
  private readonly dataManager = new DataManager();

  constructor() {}

  static getInstance(): UserRegistry {
    if (!UserRegistry.instance) {
      UserRegistry.instance = new UserRegistry();
    }
    return UserRegistry.instance;
  }

  async load(): Promise<void> {
    const raw = await this.dataManager.loadData(USERS_DATA_PATH);
    this._users = raw;
  }

  async reload(): Promise<void> {
    await this.load();
  }

  get users(): User[] {
    return this._users;
  }

  get admins(): User[] {
    return this._users.filter(u => u.role === 'admin');
  }

  get count(): number {
    return this._users.length;
  }

  findByRole(role: string): User[] {
    return this._users.filter(u => u.role === role);
  }
}
