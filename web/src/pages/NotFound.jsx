import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <EmptyState
        icon={Compass}
        title="Página não encontrada"
        description="A página que você procura não existe ou foi movida."
        actionLabel="Voltar ao Dashboard"
        onAction={() => navigate("/")}
      />
    </div>
  );
}
