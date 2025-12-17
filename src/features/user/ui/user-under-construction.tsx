import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UserUnderConstruction() {
  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Card className="border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.25)] text-white">
        <CardHeader>
          <CardTitle>Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-white/70">
          <p>Esta página ainda está em construção.</p>
          <p className="text-sm text-white/50">
            Em breve você verá aqui informações do perfil, preferências e segurança.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
