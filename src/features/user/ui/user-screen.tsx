import { UserUnderConstruction } from './user-under-construction';

export function UserScreen() {
  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-white">User</h1>
        <p className="mt-1 text-sm text-white/55">Configurações e informações do usuário.</p>
      </div>

      <UserUnderConstruction />
    </div>
  );
}
