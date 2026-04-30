import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function BillingSuccess() {
  const { refresh, subscription } = useSubscription();
  const navigate = useNavigate();
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      await refresh();
      if (subscription?.status === "active" || attempts > 10) {
        clearInterval(interval);
        setWaiting(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center p-8 space-y-4">
          {waiting ? (
            <>
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
              <h1 className="text-2xl font-bold">Confirmando seu pagamento...</h1>
              <p className="text-muted-foreground">
                Isso leva alguns segundos. Boleto pode levar até 3 dias úteis para compensar.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
              <h1 className="text-2xl font-bold">Bem-vindo a bordo!</h1>
              <p className="text-muted-foreground">
                Seu acesso está liberado. Você receberá um e-mail de confirmação em instantes.
              </p>
              <Button className="w-full" onClick={() => navigate("/")}>
                Acessar plataforma
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
